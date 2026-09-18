<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 selection:bg-emerald-500 selection:text-white">
    <!-- Desktop helper banner -->
    <div class="hidden sm:flex items-center gap-3 text-slate-400 text-xs mb-3">
      <span class="flex h-2 w-2 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>มุมมองจำลองหน้าจอมือถือพนักงานจัดส่งประจำร้าน (In-house Rider)</span>
      <span class="text-slate-600">|</span>
      <span class="text-emerald-400 font-medium">ร้าน: ตำครกซิ่ง</span>
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
              @toggle-food-ready="isFoodReady = !isFoodReady"
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
import { ref, computed } from 'vue'
import RiderHeader from './components/RiderHeader.vue'
import RestaurantCard from './components/RestaurantCard.vue'
import OrderChecklist from './components/OrderChecklist.vue'
import CustomerCard from './components/CustomerCard.vue'
import ActionFooter from './components/ActionFooter.vue'
import MapModal from './components/MapModal.vue'
import ChatModal from './components/ChatModal.vue'
import PhotoProofModal from './components/PhotoProofModal.vue'
import SuccessModal from './components/SuccessModal.vue'

// Current Step (พนักงานประจำร้านตำครกซิ่ง):
// 0: อยู่ที่ร้าน ตรวจสอบและรับอาหารจากครัว
// 1: กำลังนำส่งให้ลูกค้าที่คอนโด The Grand Rama 9
// 2: ถึงคอนโดแล้ว รอส่งมอบ/ถ่ายรูปยืนยัน
const currentStep = ref(0)
const earnings = ref(58.00)
const isFoodReady = ref(true)

// Menu items from "ตำครกซิ่ง"
const orderItems = ref([
  { id: 1, name: 'ส้มตำปูปลาร้าพริกแห้ง (เผ็ดลืมผัว)', quantity: 2, price: 140, checked: true, detail: 'พริก 10 เม็ด ปลาร้าต้มสุก กลิ่นหอมนัว' },
  { id: 2, name: 'ไก่ย่างเขาสวนกวางสูตรเด็ด (ครึ่งตัว)', quantity: 1, price: 120, checked: true, detail: 'หนังกรอบ เนื้อนุ่ม พร้อมน้ำจิ้มแจ่วมะขาม' },
  { id: 3, name: 'คอหมูย่างกระทะร้อน จิ้มแจ่ว', quantity: 1, price: 110, checked: true, detail: 'หมูนุ่มติดมันแทรก หมักเครื่องเทศหอมกรุ่น' },
  { id: 4, name: 'ต้มแซ่บกระดูกหมูอ่อนใบกะเพรา', quantity: 1, price: 130, checked: true, detail: 'หมูตุ๋นเปื่อยนุ่ม น้ำซุปแซ่บจี๊ดถึงใจ' },
  { id: 5, name: 'ข้าวเหนียวเขี้ยวงู (ห่อใบตอง)', quantity: 4, price: 60, checked: true, detail: 'นึ่งร้อนๆ หอมนุ่มเม็ดสวย' },
  { id: 6, name: 'แคบหมูโบราณไร้มันสูตรกรอบ', quantity: 2, price: 40, checked: true, detail: 'กรอบไม่อมน้ำมัน ทานคู่ส้มตำฟินๆ' }
])

const checkedCount = computed(() => orderItems.value.filter(i => i.checked).length)
const isAllChecked = computed(() => checkedCount.value === orderItems.value.length)

// Modal states
const isMapOpen = ref(false)
const isChatOpen = ref(false)
const isPhotoModalOpen = ref(false)
const isSuccessOpen = ref(false)
const toastMessage = ref('')
const unreadChatCount = ref(1)

const activeMapData = ref({
  targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
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
    case 1: return 'กำลังนำส่งให้ "คุณณัฐวุฒิ" (คอนโด The Grand Rama 9)'
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
  }, 2500)
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

const handleNextStep = () => {
  if (currentStep.value === 0) {
    currentStep.value = 1
    showToast('🛵 รับอาหารครบแล้ว! เริ่มเดินทางไปคอนโด The Grand Rama 9')
  } else if (currentStep.value === 1) {
    currentStep.value = 2
    showToast('🏢 ถึงจุดส่งปลายทางแล้ว กรุณาถ่ายรูปส่งมอบ')
  }
}

const handleConfirmDelivery = () => {
  isPhotoModalOpen.value = false
  isSuccessOpen.value = true
}

const handleResetFlow = () => {
  isSuccessOpen.value = false
  currentStep.value = 0
  orderItems.value.forEach(i => i.checked = true)
  showToast('พร้อมรับงานออเดอร์ใหม่ของร้านตำครกซิ่ง!')
}

const handleOpenMap = (data) => {
  activeMapData.value = data
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
</script>
