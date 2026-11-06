<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { getInitial, getStoredUserName } from '../../utils/avatar'
import { socket } from '../../config/socket'
import { useSocketStore } from '../../store/socketStore'
import { showWarning } from '../../utils/swal'
import { isInKitchenQueue } from '../../utils/kitchenQueue'

// แสดงตัวอักษรย่อของผู้ใช้ที่ล็อกอินอยู่แทนรูปโปรไฟล์
const kitchenUserName = getStoredUserName()
const kitchenUserInitial = getInitial(kitchenUserName)

const socketStore = useSocketStore()
const activeTab = ref('incoming')
const incomingOrders = ref([])
const completedOrders = ref([])
const isLoading = ref(false)
const isSocketConnected = computed(() => Boolean(socketStore.isConnected || (socket && socket.connected)))
const newOrderNotification = ref(null)
const selectedFilter = ref('today') // 'today' | 'all' (รีเซ็ตทุกวันเป็นค่าเริ่มต้น)
let pollingTimer = null

const todayDateLabel = computed(() => {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date())
})

const changeFilter = (filterType) => {
  selectedFilter.value = filterType
  fetchOrders()
}
// ฟังก์ชันจำลองเสียงกระดิ่งแจ้งเตือนออเดอร์ใหม่ (Web Audio API)
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // โน้ตที่ 1 (D5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.2, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.25)

    // โน้ตที่ 2 (A5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.15)
    gain2.gain.setValueAtTime(0.25, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.45)
  } catch (e) {
    console.warn('ไม่สามารถเล่นเสียงแจ้งเตือนได้:', e)
  }
}

// จัดการ Event เมื่อมีออเดอร์ใหม่ส่งมาจาก Backend ผ่าน WebSocket
const onNewOrderReceived = (order) => {
  console.log('⚡ [KDS Real-time] มีออเดอร์ใหม่เข้ามา:', order)
  playChime()
  fetchOrders()

  const orderNum = order?.order_id || order?.id || ''
  const tableLabel = order?.table?.table_number ? ` (โต๊ะ ${order.table.table_number})` : ''
  newOrderNotification.value = `🔔 มีคำสั่งซื้อใหม่ #${orderNum}${tableLabel} เข้ามาแล้ว!`

  setTimeout(() => {
    newOrderNotification.value = null
  }, 5000)
}

const onOrderStatusChanged = (order) => {
  console.log('⚡ [KDS Real-time] สถานะออเดอร์เปลี่ยนแปลง:', order)
  // ออเดอร์ที่ครัวกำลังรอทำ/กำลังทำ ถูกยกเลิก (เช่น แอดมินตรวจแล้วไม่พบยอดโอน) -> แจ้งให้หยุดทำทันที
  const isCancelled = String(order?.status || '').toUpperCase() === 'CANCELLED'
  const wasInKitchen = incomingOrders.value.some(o => String(o.order_id ?? o.id) === String(order?.order_id))
  if (isCancelled && wasInKitchen) {
    showWarning(
      `ออเดอร์ #${order.order_id} ถูกยกเลิก`,
      'ไม่ต้องทำอาหารออเดอร์นี้ต่อ (เช่น ร้านตรวจแล้วไม่พบยอดโอนเงิน)',
      { confirmButtonText: 'รับทราบ' }
    )
  }
  fetchOrders()
}

const onSocketConnect = () => {
  socketStore.isConnected = true
}

const onSocketDisconnect = () => {
  socketStore.isConnected = false
}
// ฟังก์ชันดึงรายละเอียด/หมายเหตุและท็อปปิ้งที่ลูกค้าเลือก
const extractNote = (oi) => {
  const parts = []

  // ดึงตัวเลือกและท็อปปิ้งจาก ORDER_ITEM_OPTIONS (ถ้ามี)
  if (oi.order_item_options && Array.isArray(oi.order_item_options) && oi.order_item_options.length > 0) {
    const optLabels = oi.order_item_options.map(o => o.option_name).join(', ')
    parts.push(`✨ ${optLabels}`)
  }

  if (oi.notes && typeof oi.notes === 'string' && oi.notes.trim()) {
    parts.push(oi.notes.trim())
  }
  if (oi.customization) {
    if (typeof oi.customization === 'string' && oi.customization.trim()) {
      parts.push(oi.customization.trim())
    } else if (typeof oi.customization === 'object') {
      if (oi.customization.spicy && oi.customization.spicy !== '-') {
        parts.push(`🔥 เผ็ด: ${oi.customization.spicy}`)
      }
      if (oi.customization.no_msg) {
        parts.push('🌿 ไม่ใส่ชูรส')
      }
      if (oi.customization.note) {
        parts.push(`💬 โน้ต: ${oi.customization.note}`)
      }
    }
  }
  return parts.join(' | ')
}

const formatClock = (d) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'

const PAY_CHANNEL_LABEL = { CARD: 'บัตร', PROMPTPAY: 'พร้อมเพย์', STRIPE: 'Stripe', CASH: 'เงินสด' }

// สถานะชำระเงินจากรายการ TRANSACTIONS ของออเดอร์ (tone ใช้เลือกสีป้าย)
const getPaymentInfo = (order) => {
  const txns = Array.isArray(order.transaction) ? order.transaction : []
  const channelOf = (t) => PAY_CHANNEL_LABEL[String(t?.payment_method || '').toUpperCase()] || t?.payment_method || ''
  const paid = txns.find(t => String(t.payment_status || '').toUpperCase() === 'COMPLETED')
  if (paid) return { label: `ชำระแล้ว • ${channelOf(paid)}`, tone: 'paid' }

  const latest = txns[txns.length - 1]
  if (latest && /cash/i.test(latest.payment_method || '')) {
    return { label: 'เก็บเงินปลายทาง (เงินสด)', tone: 'cash' }
  }
  if (latest && String(latest.payment_status || '').toUpperCase() === 'PENDING') {
    return { label: `รอชำระ • ${channelOf(latest)}`, tone: 'pending' }
  }
  if (order.table_id) return { label: 'ยังไม่ชำระ (จ่ายตอนเช็คบิล)', tone: 'pending' }
  return { label: 'ยังไม่ชำระ', tone: 'pending' }
}

// แปลงรูปแบบออเดอร์จาก Backend เข้า Component
const formatOrder = (order) => {
  const createdDate = new Date(order.created_at)
  const now = new Date()
  const diffMins = Math.max(0, Math.floor((now - createdDate) / (1000 * 60)))

  // จัดการสถานะสีของเวลา
  let timeStatus = 'normal'
  if (diffMins > 20) {
    timeStatus = 'danger'
  } else if (diffMins > 10) {
    timeStatus = 'warning'
  }

  // ออเดอร์ที่ไม่มีรายการอาหารจะส่ง items ว่าง แล้วหน้าจอแสดง "ไม่มีรายการอาหาร"
  const items = (order.order_items || order.items || []).map((oi) => ({
    qty: oi.quantity || 1,
    name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
    note: extractNote(oi)
  }))

  const customerName =
    order.delivery?.customer_name || order.user?.username || (order.table_id ? '' : 'ลูกค้าหน้าร้าน')
  const landmark = order.delivery_landmark || order.delivery?.delivery_landmark || ''
  // เวลาเสร็จใช้เวลาที่ครัวกดเสร็จจริง ถ้าไม่มี (ออเดอร์เก่า) ใช้เวลาอัปเดตล่าสุด
  const doneDate = order.cooked_at ? new Date(order.cooked_at) : (order.updated_at ? new Date(order.updated_at) : createdDate)

  return {
    id: order.order_id,
    // ไม่มีโต๊ะ = สั่งผ่านเว็บออนไลน์ ถือเป็นเดลิเวอรีทุกกรณี
    table: order.table?.table_number ? `โต๊ะ ${order.table.table_number}` : '🛵 เดลิเวอรี',
    customerName,
    orderType: order.order_type,
    time: `รอ ${diffMins} นาที`,
    timeStatus,
    orderedAt: formatClock(createdDate),
    status: order.status,
    totalPrice: Number(order.total_price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    payment: getPaymentInfo(order),
    orderNote: (order.order_notes || '').trim(),
    landmark,
    completedAt: formatClock(doneDate),
    items
  }
}

// 1. ดึงข้อมูลรายการคำสั่งซื้อจาก Backend (กรองเฉพาะวันนี้เป็นค่าเริ่มต้น เพื่อรีเซ็ตหน้าจอทุกวัน)
const fetchOrders = async () => {
  try {
    const url = selectedFilter.value === 'today' ? `${API_BASE}/orders?date=today` : `${API_BASE}/orders`
    const res = await axios.get(url)
    const allOrders = res.data || []

    const incoming = []
    const completed = []

    const todayDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())

    allOrders.forEach((o) => {
      // ตรวจสอบเพิ่มเติมหากเปิดโหมดวันนี้ เพื่อความแม่นยำสูงสุด
      if (selectedFilter.value === 'today' && o.created_at) {
        const orderDateStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(o.created_at))
        if (orderDateStr !== todayDateStr) {
          return // ข้ามออเดอร์ของวันก่อนหน้า
        }
      }

      const formatted = formatOrder(o)
      const st = (o.status || '').toUpperCase()
      if (['SERVED', 'READY', 'COMPLETED'].includes(st)) {
        completed.push(formatted)
      } else if (isInKitchenQueue(o)) {
        // PENDING / PAID / COOKING — เดลิเวอรีจ่ายออนไลน์ต้องจ่ายสำเร็จก่อนถึงจะขึ้นคิว
        incoming.push(formatted)
      }
    })

    incomingOrders.value = incoming
    completedOrders.value = completed
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลออเดอร์ห้องครัวได้:', err)
  }
}

// 2. ปรับสถานะเป็นเสิร์ฟแล้ว (Serve) -> หากเป็นเดลิเวอรีปรับเป็น READY เพื่อแจ้งเตือนไรเดอร์ทันที
const serveOrder = async (orderId, orderType) => {
  try {
    const targetStatus = orderType === 'DELIVERY' ? 'READY' : 'SERVED'
    await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
      status: targetStatus
    })
    try {
      localStorage.setItem(`kds_served_${orderId}`, new Date().toISOString())
    } catch (e) {}
    await fetchOrders()
  } catch (err) {
    console.error('ไม่สามารถอัปเดตสถานะออเดอร์ได้:', err)
    alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
  }
}

// 3. ดึงออเดอร์กลับไปปรุงใหม่ (Pending)
const recallOrder = async (orderId) => {
  try {
    await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
      status: 'PENDING'
    })
    await fetchOrders()
  } catch (err) {
    console.error('ไม่สามารถดึงออเดอร์กลับได้:', err)
    alert('เกิดข้อผิดพลาดในการดึงออเดอร์กลับ')
  }
}



onMounted(() => {
  fetchOrders()

  // เชื่อมต่อ Event ของ Socket.io และซิงค์สถานะผ่าน Pinia Store
  socketStore.ensureConnection()
  if (socket && socket.connected) {
    socketStore.isConnected = true
  }
  socket.on('connect', onSocketConnect)
  socket.on('disconnect', onSocketDisconnect)
  socket.on('new_order', onNewOrderReceived)
  socket.on('order_status_updated', onOrderStatusChanged)

  // Polling สำรองทุก 10 วินาที เพื่อความเสถียรสูงสุด
  pollingTimer = setInterval(fetchOrders, 10000)
})

onBeforeUnmount(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
  socket.off('connect', onSocketConnect)
  socket.off('disconnect', onSocketDisconnect)
  socket.off('new_order', onNewOrderReceived)
  socket.off('order_status_updated', onOrderStatusChanged)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; min-height: 100%; background-color: #FAF8F5; font-family: sans-serif; user-select: none;">
    
    <!-- Top Header Bar -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 20px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">Kitchen Monitor</h1>
        <span style="font-size: 14px; opacity: 0.85;">จอแสดงผลห้องครัว</span>
        <span 
          :style="{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            backgroundColor: isSocketConnected ? 'rgba(74, 222, 128, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            color: isSocketConnected ? '#BBF7D0' : '#FECACA',
            border: `1px solid ${isSocketConnected ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
          }"
        >
          <span 
            :style="{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isSocketConnected ? '#4ADE80' : '#EF4444'
            }"
          ></span>
          {{ isSocketConnected ? 'Live Socket.io' : 'Connecting...' }}
        </span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <span :title="kitchenUserName || 'ผู้ใช้งาน'" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #fff;">{{ kitchenUserInitial }}</span>
        </button>
      </div>
    </header>

    <!-- Real-time New Order Banner -->
    <div 
      v-if="newOrderNotification" 
      style="background: linear-gradient(90deg, #F59E0B, #EAB308); color: white; padding: 12px 24px; font-weight: 600; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px;"
    >
      <span style="animation: bounce 1s infinite;">🔔</span>
      <span>{{ newOrderNotification }}</span>
    </div>

    <!-- Content Area -->
    <div style="padding: 32px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Tab Switcher Bar & Date Filter Controls -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="background-color: #F3EBDD; padding: 6px; border-radius: 9999px; display: inline-flex; gap: 6px; border: 1px solid #EBE1D0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
          <button
            @click="activeTab = 'incoming'"
            :style="{
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'incoming' ? '#4B7B61' : 'transparent',
              color: activeTab === 'incoming' ? '#FFFFFF' : '#5C5246'
            }"
          >
            ออเดอร์ใหม่ (Incoming: {{ incomingOrders.length }})
          </button>
          
          <button
            @click="activeTab = 'completed'"
            :style="{
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'completed' ? '#4B7B61' : 'transparent',
              color: activeTab === 'completed' ? '#FFFFFF' : '#5C5246'
            }"
          >
            เสร็จสิ้น (Completed: {{ completedOrders.length }})
          </button>
        </div>

        <!-- Date Filter Toggle (รีเซ็ตออเดอร์เป็นวันๆ ไป) -->
        <div style="display: inline-flex; align-items: center; gap: 6px; background-color: #F3EBDD; padding: 5px 8px; border-radius: 9999px; border: 1px solid #EBE1D0; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
          <span style="font-size: 13px; font-weight: 500; color: #5C5246; margin-left: 6px; display: flex; align-items: center; gap: 4px;">
            <span>📅</span>
            <span>คิวอาหาร:</span>
          </span>
          <button
            @click="changeFilter('today')"
            :style="{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: selectedFilter === 'today' ? '#4B7B61' : 'transparent',
              color: selectedFilter === 'today' ? '#FFFFFF' : '#5C5246'
            }"
          >
            วันนี้ ({{ todayDateLabel }})
          </button>
          <button
            @click="changeFilter('all')"
            :style="{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              backgroundColor: selectedFilter === 'all' ? '#4B7B61' : 'transparent',
              color: selectedFilter === 'all' ? '#FFFFFF' : '#5C5246'
            }"
          >
            ประวัติทั้งหมด
          </button>
        </div>
      </div>

      <!-- Incoming Grid -->
      <div v-if="activeTab === 'incoming'">
        <div v-if="incomingOrders.length === 0" style="text-align: center; padding: 80px 0; color: #9CA3AF;">
          ไม่มีออเดอร์ค้างอยู่
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px;">
          <!-- Order Card -->
          <div
            v-for="order in incomingOrders"
            :key="order.id"
            style="background-color: #F3EBDD; border-radius: 28px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; justify-content: space-between; min-height: 440px; border: 1px solid #EBE1D0; box-sizing: border-box;"
          >
            <!-- Card Header -->
            <div>
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
                <div style="min-width: 0;">
                  <div class="kds-order-no">#{{ order.id }}</div>
                  <div style="font-size: 20px; font-weight: 700; color: #3A332C;">
                    {{ order.table }}
                  </div>
                  <div v-if="order.customerName" class="kds-customer">👤 {{ order.customerName }}</div>
                </div>

                <div
                  :style="{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: order.timeStatus === 'normal' ? '#4B7B61' : order.timeStatus === 'warning' ? '#C29753' : '#B33939'
                  }"
                >
                  <span style="font-size: 11px;">⏱</span>
                  <span>{{ order.time }}</span>
                </div>
              </div>

              <div class="kds-meta">
                <span>🕒 สั่ง {{ order.orderedAt }}</span>
                <span>💰 ฿{{ order.totalPrice }}</span>
                <span class="kds-pay" :class="`kds-pay--${order.payment.tone}`">{{ order.payment.label }}</span>
              </div>
              <div v-if="order.orderNote || order.landmark" class="kds-notes">
                <div v-if="order.orderNote">📝 {{ order.orderNote }}</div>
                <div v-if="order.landmark">📍 จุดสังเกต: {{ order.landmark }}</div>
              </div>

              <!-- Item List -->
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div v-for="(item, i) in order.items" :key="i" style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="font-size: 20px; font-weight: 800; color: #70A584; min-width: 32px; line-height: 1;">
                    {{ item.qty }}x
                  </span>
                  
                  <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 700; color: #2B2621; line-height: 1.35;">
                      {{ item.name }}
                    </div>
                    <div v-if="item.note" style="margin-top: 6px;">
                      <span style="background-color: #FEF3C7; color: #92400E; font-size: 12px; padding: 4px 10px; border-radius: 8px; border: 1px solid #FDE68A; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; line-height: 1.3;">
                        <span>📌</span>
                        <span>{{ item.note }}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="!order.items || order.items.length === 0" style="padding: 16px; background-color: rgba(0,0,0,0.03); border-radius: 12px; color: #78716C; text-align: center; font-size: 14px;">
                  📋 ไม่มีรายการอาหาร (ยอด ฿{{ order.totalPrice || '-' }})
                </div>
              </div>
            </div>

            <!-- Serve Button -->
            <button
              @click="serveOrder(order.id, order.orderType)"
              style="width: 100%; padding: 14px 0; margin-top: 20px; border-radius: 18px; font-size: 15px; font-weight: 700; color: white; background-color: #4B7B61; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#3D6650'"
              onmouseout="this.style.backgroundColor='#4B7B61'"
            >
              <span style="font-size: 16px;">{{ order.orderType === 'DELIVERY' ? '🛵' : '🍴' }}</span>
              <span>{{ order.orderType === 'DELIVERY' ? 'ครัวทำเสร็จแล้ว • แจ้งไรเดอร์' : 'เสิร์ฟ / ทำเสร็จแล้ว (Serve)' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Completed Grid -->
      <div v-if="activeTab === 'completed'">
        <div v-if="completedOrders.length === 0" style="text-align: center; padding: 80px 0; color: #9CA3AF;">
          ยังไม่มีออเดอร์ที่เสร็จสิ้น{{ selectedFilter === 'today' ? 'ในวันนี้' : '' }}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px;">
          <div
            v-for="order in completedOrders"
            :key="order.id"
            style="background-color: rgba(243, 235, 221, 0.8); border-radius: 28px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; border: 1px solid #EBE1D0; box-sizing: border-box;"
          >
            <div>
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
                <div style="min-width: 0;">
                  <div class="kds-order-no">#{{ order.id }}</div>
                  <div style="font-size: 18px; font-weight: 700; color: #3A332C;">{{ order.table }}</div>
                  <div v-if="order.customerName" class="kds-customer">👤 {{ order.customerName }}</div>
                </div>
                <span style="font-size: 12px; color: #6B7280; white-space: nowrap;">เสร็จสิ้น {{ order.completedAt }}</span>
              </div>

              <div class="kds-meta">
                <span>🕒 สั่ง {{ order.orderedAt }}</span>
                <span>💰 ฿{{ order.totalPrice }}</span>
                <span class="kds-pay" :class="`kds-pay--${order.payment.tone}`">{{ order.payment.label }}</span>
              </div>
              <div v-if="order.orderNote || order.landmark" class="kds-notes">
                <div v-if="order.orderNote">📝 {{ order.orderNote }}</div>
                <div v-if="order.landmark">📍 จุดสังเกต: {{ order.landmark }}</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div v-for="(item, i) in order.items" :key="i" style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="font-size: 16px; font-weight: 700; color: #70A584; min-width: 28px;">{{ item.qty }}x</span>
                  <div style="flex: 1;">
                    <div style="font-size: 15px; font-weight: 600; color: #332D27;">{{ item.name }}</div>
                    <div v-if="item.note" style="margin-top: 4px;">
                      <span style="font-size: 11px; color: #78350F; background-color: #FEF3C7; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 3px; font-weight: 500;">
                        <span>📌</span>
                        <span>{{ item.note }}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="!order.items || order.items.length === 0" style="padding: 16px; background-color: rgba(0,0,0,0.03); border-radius: 12px; color: #78716C; text-align: center; font-size: 14px;">
                  📋 ไม่มีรายการอาหาร (ยอด ฿{{ order.totalPrice || '-' }})
                </div>
              </div>
            </div>

            <button
              @click="recallOrder(order.id)"
              style="width: 100%; padding: 12px 0; margin-top: 16px; border-radius: 14px; font-size: 13px; font-weight: 600; color: #374151; background-color: rgba(255, 255, 255, 0.9); border: 1px solid #D1D5DB; cursor: pointer;"
            >
              🔄 ดึงออเดอร์กลับ
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.kds-order-no {
  font-size: 13px;
  font-weight: 800;
  color: #4B7B61;
  letter-spacing: 0.3px;
}
.kds-customer {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  color: #5C5246;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kds-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5C5246;
}
.kds-pay {
  padding: 2px 10px;
  border-radius: 9999px;
  border: 1px solid transparent;
}
.kds-pay--paid {
  background-color: #DCFCE7;
  color: #166534;
  border-color: #BBF7D0;
}
.kds-pay--cash {
  background-color: #FFEDD5;
  color: #9A3412;
  border-color: #FED7AA;
}
.kds-pay--pending {
  background-color: #FEE2E2;
  color: #991B1B;
  border-color: #FECACA;
}
.kds-notes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #FFFBEB;
  border: 1px dashed #FCD34D;
  color: #78350F;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}
</style>