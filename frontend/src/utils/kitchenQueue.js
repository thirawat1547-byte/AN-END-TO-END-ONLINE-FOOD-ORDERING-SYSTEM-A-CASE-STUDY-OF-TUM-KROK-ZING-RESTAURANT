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

// rawStatus: สถานะจาก backend (PENDING / PAID / COOKING / ...)
export function isInKitchenQueue(order, rawStatus = order?.status) {
  return KITCHEN_STATUSES.includes(upper(rawStatus)) && !isAwaitingOnlinePayment(order)
}
