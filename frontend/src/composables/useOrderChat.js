import { ref, watch, onUnmounted } from 'vue'
import axios from 'axios'
import { API_BASE } from '../config/api'
import { socket } from '../config/socket'

// แชทระหว่างไรเดอร์และลูกค้าของออเดอร์เดียวกัน (ใช้ร่วมกันทั้งฝั่งไรเดอร์และฝั่งลูกค้า)
// orderIdRef: ref ของเลขออเดอร์ที่กำลังคุยอยู่, self: 'rider' หรือ 'customer'
export function useOrderChat(orderIdRef, self) {
  const messages = ref([])
  const unreadCount = ref(0)
  const isOpen = ref(false)
  const isSending = ref(false)

  const authHeaders = () => {
    const token = localStorage.getItem('access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const toTime = (value) =>
    new Date(value || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  const normalize = (m) => ({
    id: m.message_id,
    sender: m.sender,
    text: m.message,
    time: toTime(m.created_at)
  })

  const loadMessages = async () => {
    const orderId = orderIdRef.value
    if (!orderId) {
      messages.value = []
      return
    }
    try {
      const res = await axios.get(`${API_BASE}/orders/${orderId}/chat`, { headers: authHeaders() })
      messages.value = (res.data || []).map(normalize)
    } catch (err) {
      console.warn('โหลดข้อความแชทไม่สำเร็จ:', err?.response?.data?.message || err.message)
    }
  }

  const sendMessage = async (text) => {
    const orderId = orderIdRef.value
    const trimmed = (text || '').trim()
    if (!orderId || !trimmed || isSending.value) return false
    isSending.value = true
    try {
      const res = await axios.post(
        `${API_BASE}/orders/${orderId}/chat`,
        { sender: self, message: trimmed },
        { headers: authHeaders() }
      )
      appendIfNew(res.data)
      return true
    } catch (err) {
      console.warn('ส่งข้อความไม่สำเร็จ:', err?.response?.data?.message || err.message)
      return false
    } finally {
      isSending.value = false
    }
  }

  const appendIfNew = (raw) => {
    if (!raw || raw.message_id == null) return false
    if (messages.value.some((m) => m.id === raw.message_id)) return false
    messages.value.push(normalize(raw))
    return true
  }

  const handleIncoming = (raw) => {
    if (!raw || String(raw.order_id) !== String(orderIdRef.value)) return
    const added = appendIfNew(raw)
    if (added && raw.sender !== self && !isOpen.value) {
      unreadCount.value += 1
    }
  }

  const open = () => {
    isOpen.value = true
    unreadCount.value = 0
  }

  const close = () => {
    isOpen.value = false
  }

  socket.on('order_chat_message', handleIncoming)
  onUnmounted(() => socket.off('order_chat_message', handleIncoming))

  watch(
    orderIdRef,
    () => {
      unreadCount.value = 0
      loadMessages()
    },
    { immediate: true }
  )

  return { messages, unreadCount, isOpen, isSending, open, close, sendMessage, loadMessages }
}
