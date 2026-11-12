// กฎว่าออเดอร์ไหนพร้อมให้ครัวทำ (ใช้ร่วมกันระหว่างจอครัวของพนักงานและของแอดมิน)
//  - ทานที่ร้าน: เข้าคิวทันที (จ่ายตอนเช็คบิล)
//  - เดลิเวอรีเงินสด: เข้าคิวทันที (เก็บเงินปลายทาง)
//  - เดลิเวอรีจ่ายออนไลน์ (บัตร / พร้อมเพย์): เข้าคิวเมื่อจ่ายสำเร็จแล้วเท่านั้น
//    ถ้าไม่จ่ายภายใน 15 นาที backend ยกเลิกออเดอร์ให้เอง ครัวจึงไม่ต้องทำอาหารที่ยังไม่ได้รับเงิน

const upper = (v) => String(v || '').toUpperCase()

const KITCHEN_STATUSES = ['PENDING', 'PAID', 'COOKING']

export function isAwaitingOnlinePayment(order) {
  if (upper(order?.order_type) !== 'DELIVERY') return false
  const txns = Array.isArray(order?.transaction) ? order.transaction : []
  if (txns.some((t) => upper(t.payment_status) === 'COMPLETED')) return false
  if (txns.some((t) => upper(t.payment_method) === 'CASH')) return false
  return true
}

// ทานที่ร้าน: มีโต๊ะ หรือ order_type เป็น DINE_IN
export function isDineIn(order) {
  return Boolean(order?.table_id) || upper(order?.order_type) === 'DINE_IN'
}

// ทานที่ร้านสถานะ PAID = เช็คบิลแล้ว (หลังเสิร์ฟ) ถือว่าครัวทำเสร็จแล้ว
// PAID ที่ต้องเข้าคิวครัวมีเฉพาะเดลิเวอรีที่จ่ายออนไลน์สำเร็จแต่ยังไม่ได้เริ่มทำ
export function isDineInPaid(order, rawStatus = order?.status) {
  return upper(rawStatus) === 'PAID' && isDineIn(order)
}

// rawStatus: สถานะจาก backend (PENDING / PAID / COOKING / ...)
export function isInKitchenQueue(order, rawStatus = order?.status) {
  if (isDineInPaid(order, rawStatus)) return false
  return KITCHEN_STATUSES.includes(upper(rawStatus)) && !isAwaitingOnlinePayment(order)
}
