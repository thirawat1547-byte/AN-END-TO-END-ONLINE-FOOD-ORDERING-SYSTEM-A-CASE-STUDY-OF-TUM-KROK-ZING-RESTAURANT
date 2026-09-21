<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode'
import { API_BASE } from '../../config/api'

const route = useRoute()
const router = useRouter()

const paramValue = computed(() => route.params.tableId || route.params.id || 'T-01')

const tableData = ref({
  id: paramValue.value,
  table_id: null,
  status: 'ว่าง (AVAILABLE)',
  time: '-',
  staff: 'พนักงานหน้าร้าน',
  customers: 0,
})

const orders = ref([])
const activeOrderIds = ref([])
const qrCodeDataUrl = ref('')
const paymentQrDataUrl = ref('')
const stripePaymentIntent = ref(null)
const qrTab = ref('payment') // 'payment' | 'order'
const promptpayNumber = ref('081-234-5678')
const promptpayName = ref('ร้านตำครกซิ่ง (นายธีรวัฒน์ แสนคำเฮียง)')

// คำนวณรหัส CRC16 สำหรับ PromptPay EMVCo
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// สร้างสตริง Payload PromptPay ตามมาตรฐาน EMVCo / ธนาคารแห่งประเทศไทย
function generatePromptPayPayload(target, amount) {
  const cleanTarget = String(target || '0812345678').replace(/[^0-9]/g, '');
  const targetType = cleanTarget.length >= 13 ? '02' : '01';
  let formattedTarget = cleanTarget;
  if (targetType === '01') {
    formattedTarget = '0066' + cleanTarget.replace(/^0/, '');
  }
  const targetTag = targetType + String(formattedTarget.length).padStart(2, '0') + formattedTarget;
  const aid = '0016A000000677010111';
  const merchantInfo = aid + targetTag;
  const merchantTag = '29' + String(merchantInfo.length).padStart(2, '0') + merchantInfo;
  
  let payload = '000201' + '010212' + merchantTag + '5802TH' + '5303764';
  if (amount !== undefined && amount !== null && Number(amount) > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  }
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

// หา tableId ตัวเลขสำหรับหน้าสั่งอาหารของลูกค้า (เช่น T-01 -> 1, T-02 -> 2)
const numericTableId = computed(() => {
  if (tableData.value.table_id) return tableData.value.table_id
  const match = String(tableData.value.id || paramValue.value).replace(/\D/g, '')
  return Number(match) || 1
})

const orderUrl = computed(() => {
  const origin = window.location.origin
  return `${origin}/table/${numericTableId.value}`
})

// ฟังก์ชันสร้าง QR Code สแกนสั่งอาหาร
const generateQr = async () => {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(orderUrl.value, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1B3828',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('สร้าง QR Code ไม่สำเร็จ:', err)
  }
}

// ฟังก์ชันสร้าง QR Code ชำระเงิน (PromptPay / Stripe Payment)
const generatePaymentQr = async () => {
  if (netTotal.value <= 0) {
    paymentQrDataUrl.value = ''
    return
  }
  try {
    // 1. เรียกสร้าง Stripe Intent ฝั่ง Backend (ถ้ามี orderId)
    if (activeOrderIds.value.length > 0) {
      const orderId = activeOrderIds.value[0]
      axios.post(`${API_BASE}/transactions/stripe/create-intent/${orderId}`)
        .then(res => {
          stripePaymentIntent.value = res.data
        })
        .catch(() => {})
    }

    // 2. สร้าง PromptPay QR Code ตามมาตรฐาน EMVCo พร้อมระบุยอดเงินสุทธิ
    const payload = generatePromptPayPayload(promptpayNumber.value, netTotal.value)
    paymentQrDataUrl.value = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#003B70', // สีน้ำเงินพร้อมเพย์มาตรฐาน
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('สร้าง QR ชำระเงินไม่สำเร็จ:', err)
  }
}

// ฟังก์ชันดึงรายละเอียดโต๊ะและออเดอร์ของโต๊ะนี้
const fetchTableDetail = async () => {
  try {
    const [tablesRes, ordersRes] = await Promise.all([
      axios.get(`${API_BASE}/tables`),
      axios.get(`${API_BASE}/orders`)
    ])

    const dbTables = tablesRes.data || []
    const allOrders = ordersRes.data || []

    const currentParam = String(paramValue.value || '').trim()
    const cleanParam = currentParam.replace(/[\s_\-]/g, '').toUpperCase()
    const targetTable = dbTables.find(t => {
      const cleanNum = String(t.table_number || '').replace(/[\s_\-]/g, '').toUpperCase()
      const cleanId = String(t.table_id || '').toUpperCase()
      return cleanNum === cleanParam || cleanId === cleanParam || `T${cleanId}` === cleanParam || `T0${cleanId}` === cleanParam
    }) || dbTables[0]

    if (targetTable) {
      tableData.value.id = targetTable.table_number || `T-0${targetTable.table_id}`
      tableData.value.table_id = targetTable.table_id

      // สร้าง QR Code ตามโต๊ะ
      await generateQr()

      // ค้นหาออเดอร์ที่ยังดำเนินอยู่ของโต๊ะนี้ (PENDING, COOKING, READY, SERVED)
      const tableOrders = allOrders.filter(o => 
        (o.table_id === targetTable.table_id || o.table?.table_number === targetTable.table_number) &&
        ['PENDING', 'COOKING', 'READY', 'SERVED'].includes((o.status || '').toUpperCase())
      )

      activeOrderIds.value = tableOrders.map(o => o.order_id)

      if (tableOrders.length > 0) {
        tableData.value.status = 'กำลังทาน (OCCUPIED)'
        const firstOrder = tableOrders[tableOrders.length - 1]
        tableData.value.time = new Date(firstOrder.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
        tableData.value.customers = targetTable.capacity || 4

        // รวมรายการอาหารจากออเดอร์ที่ค้างอยู่ของโต๊ะนี้
        const itemsList = []
        tableOrders.forEach(ord => {
          (ord.order_items || []).forEach((oi, idx) => {
            let noteStr = oi.notes || ''
            if (!noteStr && oi.customization) {
              if (typeof oi.customization === 'string') noteStr = oi.customization
              else if (typeof oi.customization === 'object') {
                const parts = []
                if (oi.customization.spicy && oi.customization.spicy !== '-') parts.push(`เผ็ด: ${oi.customization.spicy}`)
                if (oi.customization.no_msg) parts.push('ไม่ใส่ชูรส')
                if (oi.customization.note) parts.push(oi.customization.note)
                noteStr = parts.join(' | ')
              }
            }

            itemsList.push({
              id: `${ord.order_id}-${oi.order_item_id || idx}`,
              name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
              qty: Number(oi.quantity),
              price: Number(oi.unit_price || oi.menu?.price || 0),
              note: noteStr || '-',
              status: ['READY', 'SERVED', 'COMPLETED'].includes((ord.status || '').toUpperCase()) ? 'served' : 'cooking'
            })
          })
        })
        orders.value = itemsList
        await generatePaymentQr()
        if (netTotal.value > 0) {
          qrTab.value = 'payment'
        }
      } else {
        tableData.value.status = 'ว่าง (AVAILABLE)'
        tableData.value.time = '-'
        tableData.value.customers = 0
        orders.value = []
        paymentQrDataUrl.value = ''
        qrTab.value = 'order'
      }

      // โหลดจำนวนลูกค้าที่บันทึกไว้ในระบบ (ถ้ามี)
      const guestKey = `table_guests_${tableData.value.table_id || paramValue.value}`
      const savedGuests = localStorage.getItem(guestKey)
      if (savedGuests && Number(savedGuests) > 0) {
        tableData.value.customers = Number(savedGuests)
      } else if (tableData.value.status.includes('OCCUPIED') || tableData.value.status.includes('กำลังทาน')) {
        tableData.value.customers = tableData.value.customers || 2
      }
    }
  } catch (err) {
    console.error('โหลดรายละเอียดโต๊ะไม่สำเร็จ:', err)
  }
}

onMounted(() => {
  fetchTableDetail()
})

const subtotal = computed(() => {
  return orders.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
})
const discount = computed(() => 0.00)
const netTotal = computed(() => subtotal.value - discount.value)

const changeCustomers = (delta) => {
  tableData.value.customers = Math.max(0, tableData.value.customers + delta)
  const guestKey = `table_guests_${tableData.value.table_id || paramValue.value}`
  localStorage.setItem(guestKey, String(tableData.value.customers))
}

const setCustomers = (num) => {
  tableData.value.customers = num
  const guestKey = `table_guests_${tableData.value.table_id || paramValue.value}`
  localStorage.setItem(guestKey, String(num))
}

const toggleTableStatus = async () => {
  const isOccupied = tableData.value.status.includes('OCCUPIED') || tableData.value.status.includes('กำลังทาน')
  const newStatus = isOccupied ? 'AVAILABLE' : 'OCCUPIED'

  try {
    if (tableData.value.table_id) {
      await axios.patch(`${API_BASE}/tables/${tableData.value.table_id}/status`, { status: newStatus })
    }
    const guestKey = `table_guests_${tableData.value.table_id || paramValue.value}`
    if (newStatus === 'AVAILABLE') {
      localStorage.removeItem(guestKey)
      tableData.value.status = 'ว่าง (AVAILABLE)'
      tableData.value.customers = 0
    } else {
      if (tableData.value.customers <= 0) {
        tableData.value.customers = 2
      }
      localStorage.setItem(guestKey, String(tableData.value.customers))
      tableData.value.status = 'กำลังทาน (OCCUPIED)'
      tableData.value.time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    }
  } catch (err) {
    console.error('ไม่สามารถเปลี่ยนสถานะโต๊ะได้:', err)
    alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะโต๊ะ')
  }
}

const isPaying = ref(false)

const confirmPayment = async () => {
  if (isPaying.value) return
  isPaying.value = true

  try {
    const targetTableId = tableData.value.table_id

    // ดึงรายการออเดอร์ทั้งหมดเพื่อปิดบิลให้ครบถ้วน
    const ordersRes = await axios.get(`${API_BASE}/orders`).catch(() => ({ data: [] }))
    const allOrders = ordersRes.data || []

    const currentParam = String(paramValue.value || '').trim()
    const cleanParam = currentParam.replace(/[\s_\-]/g, '').toUpperCase()

    const targetOrders = allOrders.filter(o => {
      const matchId = targetTableId && (o.table_id === targetTableId || o.table?.table_id === targetTableId)
      const matchNum = o.table?.table_number && (String(o.table.table_number).replace(/[\s_\-]/g, '').toUpperCase() === cleanParam)
      return (matchId || matchNum) && (o.status || '').toUpperCase() !== 'CANCELLED'
    })

    const orderIdsToPay = targetOrders.length > 0 
      ? targetOrders.map(o => o.order_id)
      : activeOrderIds.value

    for (const orderId of orderIdsToPay) {
      // ปรับสถานะ Transaction เป็น COMPLETED และ Order เป็น PAID
      await axios.post(`${API_BASE}/transactions/stripe/confirm-test/${orderId}`).catch(() => {
        return axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: 'PAID' })
      })
    }

    // ปรับสถานะโต๊ะเป็น AVAILABLE (ว่าง) เพื่อจบบริการ
    if (targetTableId) {
      await axios.patch(`${API_BASE}/tables/${targetTableId}/status`, { status: 'AVAILABLE' }).catch(() => {})
    }

    tableData.value.status = 'ว่าง (AVAILABLE)'
    orders.value = []
    activeOrderIds.value = []

    // นำทางกลับหน้าผังโต๊ะอาหาร
    router.push('/kitchen/manage')
  } catch (err) {
    console.error('ชำระเงินไม่สำเร็จ:', err)
    if (tableData.value.table_id) {
      await axios.patch(`${API_BASE}/tables/${tableData.value.table_id}/status`, { status: 'AVAILABLE' }).catch(() => {})
    }
    router.push('/kitchen/manage')
  } finally {
    isPaying.value = false
  }
}

const printPaymentBillSlip = () => {
  if (orders.value.length === 0) {
    alert('โต๊ะนี้ยังไม่มีรายการอาหารค้างชำระครับ')
    return
  }

  const printWindow = window.open('', '_blank', 'width=450,height=760')
  if (!printWindow) return

  const itemsRows = orders.value.map(item => `
    <tr>
      <td style="text-align: left; padding: 4px 0; font-size: 12px;">
        <div style="font-weight: 600; color: #111827;">${item.name}</div>
        ${item.note && item.note !== '-' ? `<small style="color: #6b7280; font-size: 11px;">(${item.note})</small>` : ''}
      </td>
      <td style="text-align: center; padding: 4px 6px; font-weight: 600; font-size: 12px;">${item.qty}</td>
      <td style="text-align: right; padding: 4px 0; font-weight: 600; font-size: 12px;">฿${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('')

  const nowStr = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) + ' น.'

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>ใบแจ้งยอดชำระเงิน - โต๊ะ ${tableData.value.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body {
          font-family: 'Sarabun', 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          text-align: center;
          padding: 14px 10px;
          margin: 0;
          color: #111827;
          background: #fff;
        }
        .brand { font-size: 20px; font-weight: 900; color: #336846; }
        .sub { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        .bill-title { font-size: 18px; font-weight: 800; color: #111827; margin: 8px 0 4px 0; }
        .meta { display: flex; justify-content: space-between; font-size: 11px; margin: 6px 0; border-bottom: 1px dashed #d1d5db; padding-bottom: 6px; color: #4b5563; }
        .item-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        .item-table th { border-bottom: 1px solid #111827; padding: 4px 0; font-size: 11px; }
        .divider { border-top: 1px dashed #9ca3af; margin: 8px 0; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #111827; padding: 6px 0; }
        .qr-card { margin-top: 10px; padding: 12px; border: 2px solid #003B70; border-radius: 14px; background: #fafafa; }
        .badge-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; }
        .promptpay-badge { background: #003B70; color: white; padding: 3px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; }
        .stripe-badge { background: #635bff; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px; }
        .qr-img { width: 190px; height: 190px; display: block; margin: 6px auto; border: 1px solid #e5e7eb; border-radius: 8px; }
        .footer { font-size: 10px; color: #6b7280; margin-top: 12px; border-top: 1px dashed #d1d5db; padding-top: 8px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="brand">🌶️ ร้านตำครกซิ่ง</div>
      <div class="sub">TUMKROKZING RESTAURANT</div>
      <div class="bill-title">ใบแจ้งยอดชำระเงิน (โต๊ะ ${tableData.value.id})</div>
      <div class="meta">
        <span>วันที่: ${nowStr}</span>
        <span>พนักงาน: ${tableData.value.staff}</span>
      </div>
      <table class="item-table">
        <thead>
          <tr>
            <th style="text-align: left;">รายการ</th>
            <th style="text-align: center; width: 30px;">จน.</th>
            <th style="text-align: right; width: 65px;">รวม</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="divider"></div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #4b5563;">
        <span>ยอดรวม (Subtotal)</span>
        <span>฿${subtotal.value.toLocaleString()}</span>
      </div>
      <div class="total-row">
        <span>ยอดสุทธิ (Total)</span>
        <span>฿${netTotal.value.toLocaleString()}</span>
      </div>
      <div class="qr-card">
        <div class="badge-row">
          <span class="promptpay-badge">พร้อมเพย์ PromptPay</span>
          <span class="stripe-badge">Stripe</span>
        </div>
        <div style="font-size: 11px; color: #374151; font-weight: 600;">สแกนเพื่อชำระเงินยอด ฿${netTotal.value.toLocaleString()}</div>
        <img class="qr-img" src="${paymentQrDataUrl.value || qrCodeDataUrl.value}" alt="Payment QR" />
        <div style="font-size: 11px; color: #1f2937; font-weight: 700; margin-top: 4px;">
          ${promptpayName.value}<br/>
          <span style="font-family: monospace; font-size: 12px; color: #003B70;">พร้อมเพย์: ${promptpayNumber.value}</span>
        </div>
      </div>
      <div class="footer">
        สแกนผ่านแอปธนาคารได้ทุกธนาคาร (SCB, KBank, BBL, KTB ฯลฯ)<br/>
        ขอบคุณที่ใช้บริการร้านตำครกซิ่งครับ / ค่ะ
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 200);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const forceClear = async () => {
  if (confirm(`ยืนยันการบังคับปิดโต๊ะ ${tableData.value.id}? ออเดอร์ของโต๊ะนี้จะถูกเสร็จสิ้น`)) {
    try {
      for (const orderId of activeOrderIds.value) {
        await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: 'PAID' }).catch(() => {})
      }
      if (tableData.value.table_id) {
        await axios.patch(`${API_BASE}/tables/${tableData.value.table_id}/status`, { status: 'AVAILABLE' }).catch(() => {})
      }
      tableData.value.status = 'ว่าง (AVAILABLE)'
      orders.value = []
      activeOrderIds.value = []
      router.push('/kitchen/manage')
    } catch (e) {
      router.push('/kitchen/manage')
    }
  }
}

const printQrSlip = () => {
  const printWindow = window.open('', '_blank', 'width=450,height=640')
  if (!printWindow) return
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR สั่งอาหาร - โต๊ะ ${tableData.value.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body {
          font-family: 'Sarabun', 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          text-align: center;
          padding: 16px 12px;
          margin: 0;
          color: #111827;
          background: #fff;
        }
        .brand { font-size: 22px; font-weight: 800; color: #336846; letter-spacing: -0.5px; }
        .sub { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        .table-box {
          border: 2px solid #111827;
          background: #f9fafb;
          border-radius: 12px;
          padding: 8px 18px;
          display: inline-block;
          font-size: 26px;
          font-weight: 900;
          margin: 12px 0 6px 0;
        }
        .instruction { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
        .qr-img { width: 220px; height: 220px; display: block; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; }
        .url-text { font-size: 11px; color: #6b7280; word-break: break-all; margin-top: 8px; font-family: monospace; }
        .divider { border-top: 1px dashed #9ca3af; margin: 14px 0 10px 0; }
        .footer { font-size: 11px; color: #6b7280; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="brand">🌶️ ร้านตำครกซิ่ง</div>
      <div class="sub">TUMKROKZING RESTAURANT</div>
      <div class="table-box">โต๊ะ ${tableData.value.id}</div>
      <div class="instruction">📱 สแกน QR Code เพื่อสั่งอาหาร</div>
      <img class="qr-img" src="${qrCodeDataUrl.value}" alt="QR Code" />
      <div class="url-text">${orderUrl.value}</div>
      <div class="divider"></div>
      <div class="footer">
        สแกนผ่านกล้องโทรศัพท์ หรือ LINE เพื่อเลือกเมนูสั่งอาหารได้ทันที<br/>
        ขอบคุณที่ใช้บริการครับ / ค่ะ
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 200);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const copyOrderLink = async () => {
  try {
    await navigator.clipboard.writeText(orderUrl.value)
    alert(`คัดลอกลิงก์สั่งอาหารโต๊ะ ${tableData.value.id} สำเร็จ:\n${orderUrl.value}`)
  } catch (e) {
    prompt('ลิงก์สั่งอาหารโต๊ะนี้:', orderUrl.value)
  }
}

const openOrderPage = () => {
  window.open(orderUrl.value, '_blank')
}

const goBack = () => {
  router.push('/kitchen/tables')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Top Bar Header -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button 
          @click="goBack"
          style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 8px; transition: background-color 0.2s;"
          title="กลับหน้าจัดการโต๊ะ"
        >
          ←
        </button>
        <h1 style="font-size: 20px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">รายละเอียดโต๊ะอาหาร</h1>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Main Body Content -->
    <main style="flex: 1; overflow-y: auto; padding: 32px;">
      <div style="max-width: 1152px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Table Header Banner -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin: 0; font-family: serif;">โต๊ะ {{ tableData.id }}</h1>
              <span style="background-color: #DCE7DF; color: #48785A; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #48785A; display: inline-block;"></span>
                {{ tableData.status }}
              </span>
              <!-- Toggle Open/Close Button -->
              <button
                @click="toggleTableStatus"
                :style="{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: (tableData.status.includes('OCCUPIED') || tableData.status.includes('กำลังทาน')) ? '#FEE2E2' : '#48785A',
                  color: (tableData.status.includes('OCCUPIED') || tableData.status.includes('กำลังทาน')) ? '#B91C1C' : '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }"
              >
                <span>{{ (tableData.status.includes('OCCUPIED') || tableData.status.includes('กำลังทาน')) ? '⚪' : '🟢' }}</span>
                <span>{{ (tableData.status.includes('OCCUPIED') || tableData.status.includes('กำลังทาน')) ? 'ปิดโต๊ะ (ตั้งเป็นว่าง)' : 'เปิดโต๊ะ (Check In)' }}</span>
              </button>
            </div>
            <p style="font-size: 12px; color: #6B7280; margin: 6px 0 0 0;">
              เปิดโต๊ะ: {{ tableData.time }} | พนักงานรับออเดอร์: {{ tableData.staff }}
            </p>
          </div>

          <!-- Action Header Buttons -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button 
              @click="printPaymentBillSlip" 
              style="display: flex; align-items: center; gap: 6px; background-color: #003B70; color: white; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: none; transition: all 0.2s;"
              title="พิมพ์ใบเรียกเก็บเงินพร้อมเพย์ & Stripe"
            >
              <span>🧾</span> พิมพ์ QR จ่ายเงิน (บิล)
            </button>
            <button @click="printQrSlip" style="display: flex; align-items: center; gap: 6px; background-color: white; border: 1.5px solid #48785A; color: #48785A; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
              <span>📱</span> พิมพ์ QR สั่งอาหาร
            </button>
            <button @click="confirmPayment" style="display: flex; align-items: center; gap: 8px; background-color: #48785A; color: white; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: none; transition: background-color 0.2s;">
              <span>💳</span> ยืนยันการชำระเงิน
            </button>
          </div>
        </div>

        <!-- Main Details Grid (2 Columns Layout) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left Column (Diners & Ordered Items) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Diners Control Card -->
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 20px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                <div>
                  <p style="font-size: 11px; font-weight: 700; color: #4B5563; letter-spacing: 0.5px; margin: 0;">จำนวนลูกค้า (DINERS)</p>
                  <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                    <button
                      @click="changeCustomers(-1)"
                      style="width: 34px; height: 34px; border-radius: 10px; background-color: white; border: 1px solid #D1D5DB; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    >-</button>
                    <span style="font-size: 22px; font-weight: 800; color: #111827; min-width: 32px; text-align: center;">{{ tableData.customers }}</span>
                    <span style="font-size: 14px; font-weight: 600; color: #4B5563;">คน</span>
                    <button
                      @click="changeCustomers(1)"
                      style="width: 34px; height: 34px; border-radius: 10px; background-color: white; border: 1px solid #D1D5DB; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    >+</button>
                  </div>
                </div>

                <!-- Force Clear Button -->
                <button
                  @click="forceClear"
                  style="display: flex; align-items: center; gap: 8px; border: 1px solid #FCA5A5; color: #DC2626; background-color: rgba(254,226,226,0.5); padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background-color 0.2s;"
                >
                  <span>🗑</span> เคลียร์ / ปิดโต๊ะ (Clear Table)
                </button>
              </div>

              <!-- Quick Diners Presets -->
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; border-top: 1px solid rgba(209,213,219,0.5); padding-top: 10px;">
                <span style="font-size: 12px; font-weight: 600; color: #6B7280; margin-right: 4px;">กดเลือกจำนวนคนด่วน:</span>
                <button
                  v-for="num in [1, 2, 3, 4, 6, 8]"
                  :key="num"
                  @click="setCustomers(num)"
                  :style="{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: tableData.customers === num ? '1.5px solid #48785A' : '1px solid #D1D5DB',
                    backgroundColor: tableData.customers === num ? '#E8F3EC' : 'white',
                    color: tableData.customers === num ? '#48785A' : '#374151',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }"
                >
                  {{ num }} คน
                </button>
              </div>
            </div>

            <!-- Ordered Items Card -->
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 20px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.4);">
                <p style="font-size: 11px; font-weight: 700; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">รายการอาหารที่สั่ง (ORDERED ITEMS)</p>
                <span style="font-size: 12px; color: #4B5563; background-color: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 8px; font-weight: 500; border: 1px solid rgba(209,213,219,0.5);">
                  ทั้งหมด {{ orders.length }} รายการ
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <div v-if="orders.length === 0" style="text-align: center; padding: 40px 0; color: #9CA3AF; font-size: 13px;">
                  ยังไม่มีรายการสั่งอาหารสำหรับโต๊ะนี้
                </div>
                <div
                  v-else
                  v-for="item in orders"
                  :key="item.id"
                  style="background-color: #FAF9F5; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                >
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-family: serif; font-weight: 700; font-size: 18px; color: #111827; width: 24px; text-align: center;">{{ item.qty }}x</span>
                    <div>
                      <h4 style="font-weight: 700; font-size: 14px; color: #1F2937; margin: 0;">{{ item.name }}</h4>
                      <p style="font-size: 12px; color: #9CA3AF; margin: 2px 0 0 0;">หมายเหตุ: {{ item.note }}</p>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 16px;">
                    <!-- Status Badges -->
                    <span
                      v-if="item.status === 'served'"
                      style="background-color: #C2E3C8; color: #226830; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 4px;"
                    >
                      ✓ เสิร์ฟแล้ว
                    </span>
                    <span
                      v-else-if="item.status === 'cooking'"
                      style="background-color: #C5D8F6; color: #1D51A3; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 4px;"
                    >
                      ♨ กำลังทำ
                    </span>

                    <!-- Item Price -->
                    <span style="font-weight: 700; font-size: 14px; color: #1F2937; width: 64px; text-align: right;">฿{{ (item.price * item.qty).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (Bill Summary & QR Code) -->
          <div>
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-direction: column; justify-content: space-between; min-height: 480px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              
              <div>
                <!-- Card Header -->
                <div style="display: flex; align-items: center; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.6);">
                  <span style="font-size: 16px;">📋</span>
                  <h3 style="font-size: 11px; font-weight: 700; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">สรุปค่าอาหาร (BILL SUMMARY)</h3>
                </div>

                <!-- Price Breakdown -->
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px 0; font-size: 12px; font-weight: 500; color: #4B5563; border-bottom: 1px solid rgba(209,213,219,0.6);">
                  <div style="display: flex; justify-content: space-between;">
                    <span>ยอดรวม (Subtotal)</span>
                    <span style="font-weight: 700; color: #111827;">฿{{ subtotal.toLocaleString() }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>ส่วนลด (Discount) 0%</span>
                    <span style="font-weight: 700; color: #111827;">฿{{ discount.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Total Amount -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0;">
                  <span style="font-family: serif; font-weight: 700; font-size: 16px; color: #111827;">ยอดสุทธิ<br/><span style="font-size: 11px; font-family: sans-serif; font-weight: 400; color: #6B7280;">(Total)</span></span>
                  <span style="font-family: serif; font-weight: 700; font-size: 24px; color: #336846;">฿{{ netTotal.toLocaleString() }}</span>
                </div>

                <!-- Tabs: Switch between Payment QR (PromptPay/Stripe) and Order QR -->
                <div style="display: flex; background: #E5E7EB; border-radius: 12px; padding: 3px; margin-top: 14px; gap: 4px;">
                  <button
                    type="button"
                    @click="qrTab = 'payment'"
                    :style="qrTab === 'payment' ? 'background: #003B70; color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'background: transparent; color: #4B5563;'"
                    style="flex: 1; padding: 7px 4px; border: none; border-radius: 9px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px;"
                  >
                    <span>🧾</span> QR ชำระเงิน (Stripe/พร้อมเพย์)
                  </button>
                  <button
                    type="button"
                    @click="qrTab = 'order'"
                    :style="qrTab === 'order' ? 'background: #48785A; color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'background: transparent; color: #4B5563;'"
                    style="flex: 1; padding: 7px 4px; border: none; border-radius: 9px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px;"
                  >
                    <span>📱</span> QR สั่งอาหาร
                  </button>
                </div>

                <!-- 1. Payment QR Tab (Stripe / PromptPay) -->
                <div v-if="qrTab === 'payment'" style="display: flex; flex-direction: column; align-items: center; padding-top: 14px;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="background: #003B70; color: white; padding: 3px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px;">PromptPay</span>
                    <span style="background: #635bff; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">Stripe</span>
                  </div>

                  <div style="font-size: 12px; font-weight: 700; color: #1F2937; margin-bottom: 8px;">
                    ยอดที่ต้องชำระ: <span style="color: #003B70; font-size: 16px;">฿{{ netTotal.toLocaleString() }}</span>
                  </div>

                  <div style="padding: 10px; background-color: white; border-radius: 16px; border: 2px solid #003B70; box-shadow: 0 4px 12px rgba(0,59,112,0.08); display: flex; justify-content: center; align-items: center;">
                    <img v-if="paymentQrDataUrl" :src="paymentQrDataUrl" :alt="`QR ชำระเงิน โต๊ะ ${tableData.id}`" style="width: 160px; height: 160px; display: block;" />
                    <div v-else style="width: 160px; height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9CA3AF; font-size: 11px; padding: 8px; text-align: center;">
                      <span>ยังไม่มียอดค้างชำระ</span>
                      <small style="margin-top: 4px;">เมื่อมีรายการสั่งอาหารจะแสดง QR สำหรับชำระเงินทันที</small>
                    </div>
                  </div>

                  <div style="font-size: 11px; color: #4B5563; text-align: center; margin-top: 8px; line-height: 1.3;">
                    <div style="font-weight: 600;">{{ promptpayName }}</div>
                    <span style="font-family: monospace; color: #003B70; font-weight: 700;">พร้อมเพย์: {{ promptpayNumber }}</span>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 14px;">
                    <button 
                      @click="confirmPayment"
                      :disabled="isPaying"
                      type="button"
                      style="width: 100%; padding: 13px 16px; background-color: #336846; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 2px 6px rgba(51,104,70,0.3); transition: all 0.2s;"
                    >
                      <span>💳</span> {{ isPaying ? 'กำลังบันทึกชำระเงิน...' : 'ยืนยันรับเงิน & ปิดโต๊ะ (จบบริการ)' }}
                    </button>
                    <button 
                      @click="printPaymentBillSlip"
                      type="button"
                      style="width: 100%; padding: 10px 8px; background-color: #003B70; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: background-color 0.2s;"
                      title="พิมพ์ใบเรียกเก็บเงินพร้อม QR ให้ลูกค้านำไปสแกนจ่าย"
                    >
                      <span>🖨️</span> พิมพ์ใบแจ้งหนี้ / QR จ่ายเงิน
                    </button>
                  </div>
                </div>

                <!-- 2. Ordering QR Tab -->
                <div v-else style="display: flex; flex-direction: column; align-items: center; padding-top: 14px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1F2937; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>📱</span> QR สแกนสั่งอาหาร (โต๊ะ {{ tableData.id }})
                  </div>

                  <div style="padding: 10px; background-color: white; border-radius: 16px; border: 1.5px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; justify-content: center; align-items: center;">
                    <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" :alt="`QR Code โต๊ะ ${tableData.id}`" style="width: 160px; height: 160px; display: block;" />
                    <div v-else style="width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 12px;">
                      กำลังสร้าง QR...
                    </div>
                  </div>

                  <div style="font-size: 11px; color: #6B7280; margin-top: 8px; font-family: monospace; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 6px; border: 1px solid #E5E7EB; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" :title="orderUrl">
                    {{ orderUrl }}
                  </div>

                  <!-- Quick Action Buttons for QR -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 12px;">
                    <button 
                      @click="printQrSlip"
                      type="button"
                      style="padding: 9px 8px; background-color: white; border: 1px solid #D1D5DB; border-radius: 10px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                      title="พิมพ์ใบ QR เปิดโต๊ะยื่นให้ลูกค้า"
                    >
                      <span>🖨️</span> พิมพ์ใบ QR
                    </button>
                    <button 
                      @click="copyOrderLink"
                      type="button"
                      style="padding: 9px 8px; background-color: white; border: 1px solid #D1D5DB; border-radius: 10px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                      title="คัดลอกลิงก์หน้าสั่งอาหาร"
                    >
                      <span>📋</span> คัดลอกลิงก์
                    </button>
                  </div>
                  <button 
                    @click="openOrderPage"
                    type="button"
                    style="width: 100%; padding: 8px; background-color: rgba(72,120,90,0.1); border: 1px solid rgba(72,120,90,0.3); border-radius: 8px; font-size: 12px; font-weight: 600; color: #336846; cursor: pointer; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;"
                  >
                    <span>🌐</span> เปิดหน้าสั่งอาหาร (ทดลองสั่ง)
                  </button>
                </div>
              </div>

              <!-- Print Action Button at Bottom -->
              <button 
                v-if="qrTab === 'order'"
                @click="printQrSlip"
                style="background-color: #48785A; width: 100%; padding: 12px; color: white; font-weight: 700; font-size: 13px; border-radius: 12px; border: none; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;"
              >
                <span>🖨️ พิมพ์ใบเปิดโต๊ะ / QR สั่งอาหาร</span>
              </button>

            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>