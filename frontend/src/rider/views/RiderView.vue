<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 selection:bg-emerald-500 selection:text-white">
    <!-- Desktop helper banner & Quick actions -->
    <div class="w-full max-w-md hidden sm:flex items-center justify-between text-slate-400 text-xs mb-3 px-1">
      <div class="flex items-center gap-2">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-emerald-400 font-bold">โหมดไรเดอร์จัดส่งอาหาร</span>
        <span class="text-slate-600">|</span>
        <span class="text-slate-300">ร้านตำครกซิ่ง</span>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="fetchActiveOrders"
          title="รีเฟรชออเดอร์จริงจากระบบ"
          class="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 transition active:scale-95"
        >
          🔄 ซิงค์ออเดอร์
        </button>
        <router-link 
          to="/" 
          class="text-xs text-slate-400 hover:text-white transition"
        >
          หน้าร้าน ➔
        </router-link>
      </div>
    </div>

    <!-- Live vs Demo Order Notice Banner -->
    <div class="w-full max-w-md px-2 sm:px-0 mb-2">
      <div 
        class="rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-medium shadow-sm border"
        :class="isRealOrder ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200' : 'bg-amber-950/70 border-amber-600/50 text-amber-200'"
      >
        <div class="flex items-center gap-1.5">
          <span>{{ isRealOrder ? '🟢 ใช้ออเดอร์จริงจากฐานข้อมูล' : '🟡 ใช้ข้อมูลจำลอง (Demo Order)' }}</span>
          <span class="font-bold text-white">#{{ orderDisplayId }}</span>
        </div>
        <button 
          v-if="!isRealOrder" 
          @click="fetchActiveOrders" 
          class="text-[10px] underline text-amber-300 hover:text-white"
        >
          ดึงออเดอร์จริง
        </button>
        <button 
          v-else 
          @click="switchToDemo" 
          class="text-[10px] underline text-emerald-300 hover:text-white"
        >
          สลับเป็น Demo
        </button>
      </div>
    </div>

    <!-- Mobile Screen Frame Container -->
    <div class="w-full max-w-md bg-slate-100 min-h-screen sm:min-h-[850px] sm:max-h-[900px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] sm:border-slate-800">
      
      <!-- Simulated Camera Island / Notch on Desktop -->
      <div class="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-40"></div>

      <!-- Main Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto no-scrollbar pb-28">
        <!-- Header -->
        <RiderHeader 
          :current-step="currentStep" 
          :earnings="earnings" 
        />

        <!-- Active Step Context Banner -->
        <div class="px-4 pt-3">
          <div 
            class="rounded-xl p-3 flex items-center justify-between text-xs font-bold transition-all shadow-sm"
            :class="bannerStyle"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ bannerIcon }}</span>
              <div>
                <div class="text-slate-900 font-extrabold text-xs">{{ bannerTitle }}</div>
                <div class="text-slate-600 font-normal text-[11px] mt-0.5">{{ bannerSub }}</div>
              </div>
            </div>
            <span class="text-[10px] bg-white/80 px-2 py-1 rounded-lg border border-black/5">
              ขั้นตอน {{ currentStep + 1 }}/3
            </span>
          </div>
        </div>

        <!-- Content Body -->
        <main class="p-4 space-y-3.5">
          <!-- Step 0: Highlight Restaurant Card -->
          <div :class="{ 'ring-2 ring-orange-400 rounded-2xl': currentStep === 0 }">
            <RestaurantCard 
              :is-food-ready="isFoodReady"
              @toggle-food-ready="handleToggleFoodReady"
              @open-map="handleOpenMap"
            />
          </div>

          <!-- Order Food Checklist Card -->
          <OrderChecklist 
            :items="orderItems"
            @update-item="handleToggleItem"
            @toggle-all="handleToggleAll"
          />

          <!-- Step 1 or 2: Highlight Customer Destination Card -->
          <div :class="{ 'ring-2 ring-blue-500 rounded-2xl': currentStep >= 1 }">
            <CustomerCard 
              :customer="customerInfo"
              :unread-count="unreadChatCount"
              @open-chat="isChatOpen = true"
              @open-map="handleOpenMap"
              @send-quick-message="handleSendQuickMessage"
            />
          </div>

          <!-- Rider Safety Tips Banner -->
          <div class="bg-slate-200/60 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
            <span>🛡️</span>
            <span>ขับขี่ปลอดภัย สวมหมวกนิรภัย และปฏิบัติตามกฎจราจรเพื่อความปลอดภัยครับ</span>
          </div>
        </main>
      </div>

      <!-- Bottom Action Footer Bar -->
      <ActionFooter 
        :current-step="currentStep"
        :all-checked="isAllChecked"
        :checked-count="checkedCount"
        :total-count="orderItems.length"
        @next-step="handleNextStep"
        @open-help="handleOpenHelp"
        @show-photo-modal="isPhotoModalOpen = true"
      />

      <!-- Toast Notification -->
      <div 
        v-if="toastMessage" 
        class="fixed top-12 left-1/2 -translate-x-1/2 max-w-xs bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-xl z-50 flex items-center gap-2 border border-slate-700 animate-fade-in"
      >
        <span>💡</span>
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Modals -->
      <MapModal 
        :is-open="isMapOpen" 
        :map-data="activeMapData"
        @close="isMapOpen = false" 
      />

      <ChatModal 
        :is-open="isChatOpen"
        :messages="chatMessages"
        @close="isChatOpen = false"
        @send-message="handleUserChatMessage"
      />

      <PhotoProofModal 
        :is-open="isPhotoModalOpen"
        @close="isPhotoModalOpen = false"
        @confirm="handleConfirmDelivery"
      />

      <SuccessModal 
        :is-open="isSuccessOpen"
        @reset-flow="handleResetFlow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import API_BASE from '../../config/api'
import { authStore } from '../../store/authStore'

import RiderHeader from '../components/RiderHeader.vue'
import RestaurantCard from '../components/RestaurantCard.vue'
import OrderChecklist from '../components/OrderChecklist.vue'
import CustomerCard from '../components/CustomerCard.vue'
import ActionFooter from '../components/ActionFooter.vue'
import MapModal from '../components/MapModal.vue'
import ChatModal from '../components/ChatModal.vue'
import PhotoProofModal from '../components/PhotoProofModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

// Delivery Workflow Steps:
// 0: ตรวจรับอาหารที่ร้าน
// 1: กำลังนำส่งให้ลูกค้า
// 2: ถึงจุดส่งแล้ว ถ่ายรูปยืนยัน
const currentStep = ref(0)
const earnings = ref(58.00)
const isFoodReady = ref(true)

// Order State
const isRealOrder = ref(false)
const realOrderId = ref(null)
const orderDisplayId = ref('TKZ-9482')

// Default Demo items
const demoOrderItems = [
  { id: 1, name: 'ส้มตำปูปลาร้าพริกแห้ง (เผ็ดลืมผัว)', quantity: 2, price: 140, checked: true, detail: 'พริก 10 เม็ด ปลาร้าต้มสุก กลิ่นหอมนัว' },
  { id: 2, name: 'ไก่ย่างเขาสวนกวางสูตรเด็ด (ครึ่งตัว)', quantity: 1, price: 120, checked: true, detail: 'หนังกรอบ เนื้อนุ่ม พร้อมน้ำจิ้มแจ่วมะขาม' },
  { id: 3, name: 'คอหมูย่างกระทะร้อน จิ้มแจ่ว', quantity: 1, price: 110, checked: true, detail: 'หมูนุ่มติดมันแทรก หมักเครื่องเทศหอมกรุ่น' },
  { id: 4, name: 'ต้มแซ่บกระดูกหมูอ่อนใบกะเพรา', quantity: 1, price: 130, checked: true, detail: 'หมูตุ๋นเปื่อยนุ่ม น้ำซุปแซ่บจี๊ดถึงใจ' },
  { id: 5, name: 'ข้าวเหนียวเขี้ยวงู (ห่อใบตอง)', quantity: 4, price: 60, checked: true, detail: 'นึ่งร้อนๆ หอมนุ่มเม็ดสวย' },
  { id: 6, name: 'แคบหมูโบราณไร้มันสูตรกรอบ', quantity: 2, price: 40, checked: true, detail: 'กรอบไม่อมน้ำมัน ทานคู่ส้มตำฟินๆ' }
]

const orderItems = ref([...demoOrderItems])

const checkedCount = computed(() => orderItems.value.filter(i => i.checked).length)
const isAllChecked = computed(() => checkedCount.value === orderItems.value.length)

// Modal states
const isMapOpen = ref(false)
const isChatOpen = ref(false)
const isPhotoModalOpen = ref(false)
const isSuccessOpen = ref(false)
const toastMessage = ref('')
const unreadChatCount = ref(1)

const customerInfo = ref({
  name: 'คุณณัฐวุฒิ ใจดี',
  phone: '081-992-8811',
  address: 'คอนโด The Grand Rama 9 (อาคาร B)',
  addressDetail: 'ชั้น 14 ห้อง 1408 • แขวงห้วยขวาง เขตห้วยขวาง กทม.',
  note: '📦 ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1',
  lat: 13.7570,
  lng: 100.5695,
  isRealGps: false
})

const activeMapData = ref({
  targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
  customerCoord: [13.7570, 100.5695],
  distance: '3.2 กม.',
  eta: '12 นาที'
})

// Chat messages
const chatMessages = ref([
  { sender: 'customer', text: 'สวัสดีครับ ฝากหยิบช้อนส้อมกับน้ำจิ้มแจ่วเพิ่มให้ด้วยนะครับ', time: '12:44' },
  { sender: 'rider', text: 'รับทราบครับ ทางร้านตำครกซิ่งจัดช้อนส้อมและน้ำจิ้มแจ่วเพิ่มให้เรียบร้อยครับ', time: '12:45' }
])

// Banner dynamics based on step
const bannerTitle = computed(() => {
  switch (currentStep.value) {
    case 0: return 'ตรวจรับอาหารที่ร้าน "ตำครกซิ่ง" (พนักงานประจำร้าน)'
    case 1: return 'กำลังนำส่งให้ลูกค้า'
    case 2: return 'ถึงจุดส่งแล้ว • รอส่งมอบและบันทึกภาพ'
    default: return 'กำลังดำเนินการ'
  }
})

const bannerSub = computed(() => {
  switch (currentStep.value) {
    case 0: return 'เช็คความถูกต้องและจำนวนกล่องอาหารให้ครบก่อนออกเดินทาง'
    case 1: return 'ระยะทาง 3.2 กม. • คาดว่าจะถึงใน 12 นาที'
    case 2: return 'วางอาหารที่ล็อบบี้หรือส่งมอบต่อหน้าลูกค้า'
    default: return ''
  }
})

const bannerIcon = computed(() => {
  switch (currentStep.value) {
    case 0: return '🥣'
    case 1: return '🛵'
    case 2: return '🏢'
    default: return '📋'
  }
})

const bannerStyle = computed(() => {
  switch (currentStep.value) {
    case 0: return 'bg-orange-50 border border-orange-200 text-orange-950'
    case 1: return 'bg-blue-50 border border-blue-200 text-blue-950'
    case 2: return 'bg-emerald-50 border border-emerald-200 text-emerald-950'
    default: return 'bg-slate-100'
  }
})

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2800)
}

// Fetch Active Delivery Orders from Live Backend API
const fetchActiveOrders = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // ดึงออเดอร์ที่เป็น DELIVERY
    const res = await axios.get(`${API_BASE}/orders?orderType=DELIVERY`, { headers })
    const orders = res.data || []
    
    // ค้นหาออเดอร์ที่กำลังดำเนินการ (COOKING, READY, หรือ IN_DELIVERY)
    const active = orders.find(o => ['READY', 'COOKING', 'IN_DELIVERY', 'PENDING'].includes(o.status)) || orders[0]
    
    // ดึงพิกัดที่ปักหมุดไว้ล่าสุดจากระบบสั่งซื้อ (ถ้ามี)
    let pinnedGps = null
    try {
      pinnedGps = JSON.parse(localStorage.getItem('latest_order_gps') || '{}')
    } catch (e) {}

    if (active && active.order_id) {
      isRealOrder.value = true
      realOrderId.value = active.order_id
      orderDisplayId.value = `TKZ-${active.order_id}`
      
      // อัปเดตข้อมูลลูกค้าและพิกัด GPS จริงจากออเดอร์
      if (active.user) {
        customerInfo.value.name = active.user.username || active.user.name || customerInfo.value.name
        customerInfo.value.phone = active.user.phone_number || active.user.phone || customerInfo.value.phone
        customerInfo.value.address = active.user.address || customerInfo.value.address
      }

      if (pinnedGps && pinnedGps.lat && pinnedGps.lng) {
        customerInfo.value.lat = Number(pinnedGps.lat)
        customerInfo.value.lng = Number(pinnedGps.lng)
        customerInfo.value.isRealGps = true
        if (pinnedGps.address) customerInfo.value.address = pinnedGps.address
        if (pinnedGps.name) customerInfo.value.name = pinnedGps.name
        if (pinnedGps.phone) customerInfo.value.phone = pinnedGps.phone
      }

      activeMapData.value = {
        targetName: customerInfo.value.address,
        customerCoord: [customerInfo.value.lat, customerInfo.value.lng],
        distance: '3.2 กม.',
        eta: '12 นาที'
      }

      // แปลงรายการอาหาร
      if (active.order_items && active.order_items.length > 0) {
        orderItems.value = active.order_items.map((item, index) => ({
          id: item.order_item_id || index + 1,
          name: item.menu?.menu_name || 'อาหารจานอร่อย',
          quantity: item.quantity || 1,
          price: Number(item.unit_price) * (item.quantity || 1),
          detail: item.notes || item.menu?.description || 'ปรุงสดใหม่ตามมาตรฐานร้าน',
          checked: true
        }))
      }

      // ตรวจสอบสถานะอาหารจากครัว
      isFoodReady.value = active.status === 'READY' || active.status === 'IN_DELIVERY'

      // กำหนด Step ตามสถานะจริง
      if (active.status === 'IN_DELIVERY') {
        currentStep.value = 1
      } else if (active.status === 'READY' || active.status === 'COOKING' || active.status === 'PENDING') {
        currentStep.value = 0
      }

      showToast(`✅ เชื่อมต่อออเดอร์จริง #${active.order_id} สำเร็จ!`)
    } else {
      switchToDemo()
      showToast('ℹ️ ยังไม่มีออเดอร์เดลิเวอรี่ค้างในระบบ (เปิดโหมดจำลอง Demo)')
    }
  } catch (error) {
    console.warn('ดึงออเดอร์จริงไม่สำเร็จ ใช้โหมด Demo:', error)
    switchToDemo()
  }
}

const switchToDemo = () => {
  isRealOrder.value = false
  realOrderId.value = null
  orderDisplayId.value = 'TKZ-9482'
  orderItems.value = [...demoOrderItems]
  isFoodReady.value = true
  currentStep.value = 0
  customerInfo.value = {
    name: 'คุณณัฐวุฒิ ใจดี',
    phone: '081-992-8811',
    address: 'คอนโด The Grand Rama 9 (อาคาร B)',
    addressDetail: 'ชั้น 14 ห้อง 1408 • แขวงห้วยขวาง เขตห้วยขวาง กทม.',
    note: '📦 ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1',
    lat: 13.7570,
    lng: 100.5695,
    isRealGps: false
  }
  activeMapData.value = {
    targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
    customerCoord: [13.7570, 100.5695],
    distance: '3.2 กม.',
    eta: '12 นาที'
  }
}

const handleToggleFoodReady = async () => {
  isFoodReady.value = !isFoodReady.value
  if (isRealOrder.value && realOrderId.value) {
    try {
      const newStatus = isFoodReady.value ? 'READY' : 'COOKING'
      await axios.patch(`${API_BASE}/orders/${realOrderId.value}/status`, { status: newStatus })
      showToast(`เปลี่ยนสถานะครัวเป็น: ${newStatus}`)
    } catch (e) {
      console.error(e)
    }
  }
}

const handleToggleItem = (id) => {
  const item = orderItems.value.find(i => i.id === id)
  if (item) {
    item.checked = !item.checked
  }
}

const handleToggleAll = (state) => {
  orderItems.value.forEach(i => i.checked = state)
  showToast(state ? 'ตรวจครบทุกรายการแล้ว' : 'ยกเลิกการตรวจทั้งหมด')
}

const handleNextStep = async () => {
  if (currentStep.value === 0) {
    currentStep.value = 1
    showToast('🛵 รับอาหารครบแล้ว! เริ่มเดินทางไปส่งลูกค้า')
    // ส่ง API อัปเดตสถานะเป็น IN_DELIVERY ไปยัง Backend
    if (isRealOrder.value && realOrderId.value) {
      try {
        await axios.patch(`${API_BASE}/orders/${realOrderId.value}/status`, { status: 'IN_DELIVERY' })
        showToast('📡 อัปเดตสถานะ: ไรเดอร์กำลังเดินทางนำส่ง (IN_DELIVERY)')
      } catch (err) {
        console.error('อัปเดตสถานะไม่สำเร็จ:', err)
      }
    }
  } else if (currentStep.value === 1) {
    currentStep.value = 2
    showToast('🏢 ถึงจุดส่งปลายทางแล้ว กรุณาถ่ายรูปส่งมอบ')
  }
}

const handleConfirmDelivery = async () => {
  isPhotoModalOpen.value = false
  isSuccessOpen.value = true
  // ส่ง API อัปเดตสถานะเป็น COMPLETED หรือ DELIVERED ไปยัง Backend
  if (isRealOrder.value && realOrderId.value) {
    try {
      await axios.patch(`${API_BASE}/orders/${realOrderId.value}/status`, { status: 'COMPLETED' })
      showToast('🎉 อัปเดตสถานะออเดอร์ในฐานข้อมูล: จัดส่งสำเร็จเรียบร้อย!')
    } catch (err) {
      console.error('อัปเดตสถานะไม่สำเร็จ:', err)
    }
  }
}

const handleResetFlow = () => {
  isSuccessOpen.value = false
  currentStep.value = 0
  orderItems.value.forEach(i => i.checked = true)
  showToast('พร้อมรับงานออเดอร์ใหม่ของร้านตำครกซิ่ง!')
  fetchActiveOrders()
}

const handleOpenMap = (data) => {
  if (data) {
    activeMapData.value = {
      ...data,
      customerCoord: data.customerCoord || [customerInfo.value.lat, customerInfo.value.lng]
    }
  }
  isMapOpen.value = true
}

const handleSendQuickMessage = (msg) => {
  chatMessages.value.push({
    sender: 'rider',
    text: msg,
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  })
  showToast('ส่งข้อความสำเร็จ: ' + msg)
}

const handleUserChatMessage = (msg) => {
  chatMessages.value.push({
    sender: 'rider',
    text: msg,
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  })
  unreadChatCount.value = 0
}

const handleOpenHelp = () => {
  showToast('ศูนย์ช่วยเหลือไรเดอร์: โทรด่วน 02-018-XXXX')
}

onMounted(() => {
  fetchActiveOrders()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
</style>
