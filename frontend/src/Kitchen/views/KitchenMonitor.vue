<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { socket } from '../../config/socket'

const activeTab = ref('incoming')
const incomingOrders = ref([])
const completedOrders = ref([])
const isLoading = ref(false)
const isSocketConnected = ref(socket.connected)
const newOrderNotification = ref(null)
let pollingTimer = null

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

// ฟังก์ชันดึงรายละเอียด/หมายเหตุที่ลูกค้าเลือก (ความเผ็ด, ไม่ใส่ผัก, โน้ตเพิ่มเติม)
const extractNote = (oi) => {
  if (oi.notes && typeof oi.notes === 'string' && oi.notes.trim()) {
    return oi.notes.trim()
  }
  if (oi.customization) {
    if (typeof oi.customization === 'string' && oi.customization.trim()) {
      return oi.customization.trim()
    }
    if (typeof oi.customization === 'object') {
      const parts = []
      if (oi.customization.spicy && oi.customization.spicy !== '-') {
        parts.push(`🔥 เผ็ด: ${oi.customization.spicy}`)
      }
      if (oi.customization.no_msg) {
        parts.push('🌿 ไม่ใส่ชูรส')
      }
      if (oi.customization.note) {
        parts.push(`💬 โน้ต: ${oi.customization.note}`)
      }
      return parts.join(' | ')
    }
  }
  return ''
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

  const items = (order.order_items || order.items || []).map((oi) => ({
    qty: oi.quantity,
    name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
    note: extractNote(oi)
  }))

  return {
    id: order.order_id,
    table: order.table?.table_number || order.table_id || (order.order_type === 'DELIVERY' ? 'เดลิเวอรี' : `ออเดอร์ #${order.order_id}`),
    orderType: order.order_type,
    time: `${diffMins} นาที`,
    timeStatus,
    status: order.status,
    completedAt: createdDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
    items
  }
}

// 1. ดึงข้อมูลรายการคำสั่งซื้อทั้งหมดจาก Backend
const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_BASE}/orders`)
    const allOrders = res.data || []

    const incoming = []
    const completed = []

    allOrders.forEach((o) => {
      const formatted = formatOrder(o)
      const st = (o.status || '').toUpperCase()
      if (['SERVED', 'READY', 'COMPLETED'].includes(st)) {
        completed.push(formatted)
      } else if (['PENDING', 'COOKING'].includes(st)) {
        incoming.push(formatted)
      }
    })

    incomingOrders.value = incoming
    completedOrders.value = completed
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลออเดอร์ห้องครัวได้:', err)
  }
}

// 2. ปรับสถานะเป็นเสิร์ฟแล้ว (Serve) -> ครัวปรุงเสร็จและนำไปเสิร์ฟที่โต๊ะ
const serveOrder = async (orderId) => {
  try {
    await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
      status: 'SERVED'
    })
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
  fetchOrders()
}

const onSocketConnect = () => {
  isSocketConnected.value = true
}

const onSocketDisconnect = () => {
  isSocketConnected.value = false
}

onMounted(() => {
  fetchOrders()

  // เชื่อมต่อ Event ของ Socket.io
  isSocketConnected.value = socket.connected
  socket.on('connect', onSocketConnect)
  socket.on('disconnect', onSocketDisconnect)
  socket.on('new_order', onNewOrderReceived)
  socket.on('order_status_updated', onOrderStatusChanged)

  // Polling สำรองทุก 30 วินาที เพื่อความเสถียรสูงสุด
  pollingTimer = setInterval(fetchOrders, 30000)
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
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
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
      
      <!-- Tab Switcher Bar -->
      <div style="display: flex; justify-content: flex-start;">
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
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div style="font-size: 20px; font-weight: 700; color: #3A332C;">
                  {{ order.table }}
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
              </div>
            </div>

            <!-- Serve Button -->
            <button
              @click="serveOrder(order.id)"
              style="width: 100%; padding: 14px 0; margin-top: 20px; border-radius: 18px; font-size: 15px; font-weight: 700; color: white; background-color: #4B7B61; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#3D6650'"
              onmouseout="this.style.backgroundColor='#4B7B61'"
            >
              <span style="font-size: 16px;">🍴</span>
              <span>เสิร์ฟ / ทำเสร็จแล้ว (Serve)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Completed Grid -->
      <div v-if="activeTab === 'completed'">
        <div v-if="completedOrders.length === 0" style="text-align: center; padding: 80px 0; color: #9CA3AF;">
          ยังไม่มีออเดอร์ที่เสร็จสิ้น
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px;">
          <div
            v-for="order in completedOrders"
            :key="order.id"
            style="background-color: rgba(243, 235, 221, 0.8); border-radius: 28px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; border: 1px solid #EBE1D0; box-sizing: border-box;"
          >
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 700; color: #3A332C;">{{ order.table }}</div>
                <span style="font-size: 12px; color: #6B7280;">เสร็จสิ้น {{ order.completedAt }}</span>
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