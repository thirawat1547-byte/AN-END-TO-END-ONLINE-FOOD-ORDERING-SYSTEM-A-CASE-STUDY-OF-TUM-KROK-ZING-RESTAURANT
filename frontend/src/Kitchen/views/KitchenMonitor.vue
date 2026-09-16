<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'

const activeTab = ref('incoming')
const incomingOrders = ref([])
const completedOrders = ref([])
const isLoading = ref(false)
let pollingTimer = null

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
      if (['COMPLETED', 'READY'].includes(o.status)) {
        completed.push(formatted)
      } else if (['PENDING', 'COOKING', 'PAID'].includes(o.status)) {
        incoming.push(formatted)
      }
    })

    incomingOrders.value = incoming
    completedOrders.value = completed
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลออเดอร์ห้องครัวได้:', err)
  }
}

// 2. ปรับสถานะเป็นทำเสร็จแล้ว (Serve / Ready)
const serveOrder = async (orderId) => {
  try {
    await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
      status: 'COMPLETED'
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

onMounted(() => {
  fetchOrders()
  // เช็กออเดอร์ใหม่อัตโนมัติทุกๆ 5 วินาที
  pollingTimer = setInterval(fetchOrders, 5000)
})

onBeforeUnmount(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; min-height: 100%; background-color: #FAF8F5; font-family: sans-serif; user-select: none;">
    
    <!-- Top Header Bar -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 20px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">Kitchen Monitor</h1>
        <span style="font-size: 14px; opacity: 0.85;">จอแสดงผลห้องครัว</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

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