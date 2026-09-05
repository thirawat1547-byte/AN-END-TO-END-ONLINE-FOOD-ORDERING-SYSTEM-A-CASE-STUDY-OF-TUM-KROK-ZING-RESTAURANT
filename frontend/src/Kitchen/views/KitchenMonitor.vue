<script setup>
import { ref } from 'vue'

const activeTab = ref('incoming')

const incomingOrders = ref([
  {
    id: 'ORD-001',
    table: '15',
    time: '05:20',
    timeStatus: 'normal',
    items: [
      { name: 'กระเพราทะเล', qty: 2, note: 'ไม่เผ็ด' },
      { name: 'ไก่ทอด(ปีก)', qty: 1, note: '' },
    ],
  },
  {
    id: 'ORD-002',
    table: '08',
    time: '12:45',
    timeStatus: 'warning',
    items: [
      { name: 'ข้าวหมูกระเทียม', qty: 1, note: 'ไม่ใส่พริกไทย' },
      { name: 'ข้าวกระเพราหมู', qty: 3, note: '' },
    ],
  },
  {
    id: 'ORD-003',
    table: '22',
    time: '22:10',
    timeStatus: 'late',
    items: [
      { name: 'ข้าวผัดพริกแกง', qty: 4, note: '' },
      { name: 'ตำไทย', qty: 1, note: 'เผ็ดน้อย' },
      { name: 'ตำปูปูปลาร้า', qty: 2, note: '' },
    ],
  },
])

const completedOrders = ref([
  {
    id: 'ORD-000',
    table: '02',
    completedAt: '10:25 น.',
    items: [
      { name: 'ข้าวผัดปู', qty: 1, note: '' },
      { name: 'แกงเขียวหวานไก่', qty: 2, note: '' },
    ],
  },
])

const serveOrder = (orderId) => {
  const idx = incomingOrders.value.findIndex(o => o.id === orderId)
  if (idx !== -1) {
    const [order] = incomingOrders.value.splice(idx, 1)
    completedOrders.value.unshift({ 
      ...order, 
      completedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' 
    })
  }
}

const recallOrder = (orderId) => {
  const idx = completedOrders.value.findIndex(o => o.id === orderId)
  if (idx !== -1) {
    const [order] = completedOrders.value.splice(idx, 1)
    incomingOrders.value.unshift({ ...order, time: '00:00', timeStatus: 'normal' })
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; min-height: 100%; background-color: #FAF8F5; font-family: sans-serif; user-select: none;">
    
    <!-- Top Header Bar -->
    <header style="height: 64px; flex-shrink: 0; background-color: #4B7B61; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 22px; font-weight: 500; margin: 0;">Kitchen Monitor</h1>
        <span style="font-size: 14px; opacity: 0.85;">จอแสดงผลห้องครัว</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 20px; font-size: 18px; opacity: 0.9;">
        <span style="cursor: pointer;">🔔</span>
        <span style="cursor: pointer;">❓</span>
        <span style="cursor: pointer;">👤</span>
      </div>
    </header>

    <!-- Content Area -->
    <div style="padding: 32px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Tab Switcher Bar (การันตีปุ่มไม่เบี้ยว) -->
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
            ออเดอร์ใหม่ (Incoming)
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
            เสร็จสิ้น (Completed)
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
            style="background-color: #F3EBDD; border-radius: 28px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; justify-content: space-between; height: 500px; border: 1px solid #EBE1D0; box-sizing: border-box;"
          >
            <!-- Card Header -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div style="font-size: 20px; font-weight: 700; color: #3A332C;">
                  โต๊ะ {{ order.table }}
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
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div v-for="(item, i) in order.items" :key="i" style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="font-size: 22px; font-weight: 800; color: #70A584; min-width: 36px; line-height: 1;">
                    {{ item.qty }}x
                  </span>
                  
                  <div>
                    <div style="font-size: 16px; font-weight: 500; color: #332D27; line-height: 1.3;">
                      {{ item.name }}
                    </div>
                    <div v-if="item.note" style="margin-top: 6px;">
                      <span style="background-color: #FFFFFF; color: #B55A5A; font-size: 12px; padding: 3px 12px; border-radius: 9999px; border: 1px solid #FEE2E2; display: inline-block; font-weight: 500;">
                        {{ item.note }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Serve Button -->
            <button
              @click="serveOrder(order.id)"
              style="width: 100%; padding: 14px 0; border-radius: 18px; font-size: 15px; font-weight: 700; color: white; background-color: #4B7B61; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#3D6650'"
              onmouseout="this.style.backgroundColor='#4B7B61'"
            >
              <span style="font-size: 16px;">🍴</span>
              <span>เสิร์ฟ (Serve)</span>
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
            style="background-color: rgba(243, 235, 221, 0.8); border-radius: 28px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; height: 420px; border: 1px solid #EBE1D0; box-sizing: border-box;"
          >
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 700; color: #3A332C;">โต๊ะ {{ order.table }}</div>
                <span style="font-size: 12px; color: #6B7280;">เสร็จสิ้น {{ order.completedAt }}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div v-for="(item, i) in order.items" :key="i" style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="font-size: 16px; font-weight: 700; color: #70A584; min-width: 28px;">{{ item.qty }}x</span>
                  <div>
                    <div style="font-size: 14px; color: #332D27;">{{ item.name }}</div>
                    <div v-if="item.note" style="font-size: 11px; color: #9CA3AF;">({{ item.note }})</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="recallOrder(order.id)"
              style="width: 100%; padding: 12px 0; border-radius: 14px; font-size: 13px; font-weight: 600; color: #374151; background-color: rgba(255, 255, 255, 0.9); border: 1px solid #D1D5DB; cursor: pointer;"
            >
              🔄 ดึงออเดอร์กลับ
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>