// ชำระเงินบิลโต๊ะ (ทานที่ร้าน): พร้อมเพย์ผ่าน Stripe หรือเงินสด
// ใช้ร่วมกันระหว่างหน้า TableController (แอดมิน) และ TableDetail (ครัว/แคชเชียร์)
import axios from 'axios'
import { API_BASE } from '../config/api'
import { isCardPaymentEnabled, loadStripe } from './stripe'

export const isStripePromptPayEnabled = isCardPaymentEnabled

const ACTIVE_STATUSES = ['PENDING', 'PAID', 'COOKING', 'READY', 'SERVED']

const isOrderPaid = (o) =>
  (o.transaction || []).some((t) => String(t.payment_status || '').toUpperCase() === 'COMPLETED')

// ออเดอร์ของโต๊ะที่ยังไม่ได้ชำระ (ยอด > 0)
export async function fetchUnpaidTableOrders(tableId, tableNumber) {
  const { data } = await axios.get(`${API_BASE}/orders`, { params: tableId ? { tableId } : {} })
  return (Array.isArray(data) ? data : []).filter(
    (o) =>
      (o.table_id === tableId || (tableNumber !== undefined && o.table?.table_number === tableNumber)) &&
      ACTIVE_STATUSES.includes(String(o.status || '').toUpperCase()) &&
      !isOrderPaid(o) &&
      Number(o.total_price || 0) > 0
  )
}

const errText = (err, fallback) => {
  const m = err?.response?.data?.message || err?.message
  return (Array.isArray(m) ? m.join(', ') : m) || fallback
}

// ให้ Stripe แสดง QR พร้อมเพย์บนจอพนักงานให้ลูกค้าสแกน (ทีละออเดอร์)
// onProgress(index, total, order) ใช้แสดงความคืบหน้า
export async function payOrdersWithStripePromptPay(orders, { onProgress } = {}) {
  const stripe = await loadStripe()
  const paid = []
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i]
    onProgress?.(i, orders.length, order)
    const { data } = await axios.post(`${API_BASE}/transactions/stripe/create-intent/${order.order_id}`)
    if (!data?.clientSecret) throw new Error('ไม่ได้รับข้อมูลการชำระเงินจากเซิร์ฟเวอร์')

    const result = await stripe.confirmPromptPayPayment(data.clientSecret, {
      payment_method: { billing_details: { email: `table-order${order.order_id}@tumkrokzing.duckdns.org` } }
    })
    if (result.error) {
      const e = new Error(result.error.message || 'QR หมดอายุหรือปิดหน้าต่างก่อนชำระ')
      e.paidOrders = paid
      throw e
    }
    const status = result.paymentIntent?.status
    if (status !== 'succeeded' && status !== 'processing') {
      const e = new Error('ยังไม่ได้ชำระเงิน — QR อาจหมดอายุหรือปิดหน้าต่างก่อนจ่าย')
      e.paidOrders = paid
      throw e
    }
    if (status === 'succeeded') {
      // webhook ของ Stripe จะอัปเดตให้อีกทาง ถ้าเรียกตรงนี้ไม่สำเร็จ
      await axios
        .post(`${API_BASE}/transactions/stripe/confirm/${order.order_id}`, { paymentIntentId: result.paymentIntent.id })
        .catch((err) => console.warn('บันทึกผลพร้อมเพย์ไม่สำเร็จ (รอ webhook):', err))
    }
    paid.push(order)
  }
  return paid
}

// รับเงินสดที่โต๊ะ: บันทึกเป็น CASH สถานะ COMPLETED ทุกออเดอร์
export async function payOrdersWithCash(orders) {
  for (const order of orders) {
    await axios.post(`${API_BASE}/transactions`, {
      order_id: order.order_id,
      amount: Number(order.total_price || 0),
      payment_method: 'CASH',
      payment_status: 'COMPLETED'
    })
  }
}

export { errText as paymentErrorText }
