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
          class="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 transition active:scale-95 flex items-center gap-1"
        >
          <span>🔄</span>
          <span>ซิงค์งาน</span>
        </button>
        <router-link 
          to="/" 
          class="text-xs text-slate-400 hover:text-white transition"
        >
          หน้าร้าน ➔
        </router-link>
      </div>
    </div>

    <!-- Live Status Pill / Info Bar -->
    <div class="w-full max-w-md px-2 sm:px-0 mb-2">
      <div 
        class="rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-medium shadow-sm border"
        :class="activeOrder ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200' : 'bg-slate-800/90 border-slate-700 text-slate-300'"
      >
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" :class="activeOrder ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'"></span>
          <span v-if="activeOrder">กำลังจัดส่งออเดอร์จริง: <b class="text-white">#{{ orderDisplayId }}</b></span>
          <span v-else>🟢 ระบบออนไลน์ • กำลังรอออเดอร์ที่ครัวทำเสร็จ</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-bold">รายได้ ฿{{ earnings.toFixed(2) }}</span>
          <button 
            v-if="!activeOrder" 
            @click="activateDemoOrder" 
            class="text-[10px] text-amber-300 hover:text-white underline ml-1"
          >
            จำลองออเดอร์
          </button>
          <button 
            v-else 
            @click="cancelCurrentTrip" 
            class="text-[10px] text-rose-300 hover:text-white underline ml-1"
          >
            สลับเป็นสแตนด์บาย
          </button>
        </div>
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
          :order-id="activeOrder ? orderDisplayId : 'เปิดรับงาน'"
        />

        <!-- ================= CASE 1: มีออเดอร์ที่กดรับแล้ว กำลังนำส่ง ================= -->
        <template v-if="activeOrder">
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
            <div :class="{ 'ring-2 ring-emerald-500 rounded-2xl': currentStep === 0 }">
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
                :unread-count="chat.unreadCount.value"
                @open-chat="chat.open()"
                @open-map="handleOpenMap"
                @send-quick-message="handleSendQuickMessage"
              />
            </div>

            <!-- Rider Safety Tips Banner -->
            <div class="bg-slate-200/60 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
              <span>🛡️</span>
              <span>ขับขี่ปลอดภัย สวมหมวกนิรภัย และส่งอาหารให้ถึงมือลูกค้าอย่างรวดเร็วครับ</span>
            </div>
          </main>
        </template>

        <!-- ================= CASE 2: สแตนด์บาย รอรับงาน (ยังไม่มีออเดอร์ที่รับ) ================= -->
        <template v-else>
          <div class="p-4 space-y-4">
            <!-- Standby Hero Card -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center flex flex-col items-center">
              <div class="relative w-20 h-20 flex items-center justify-center my-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
                <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-inner">
                  🛵
                </div>
              </div>

              <h3 class="text-base font-bold text-slate-800 mt-2">เปิดรับงานจัดส่งเดลิเวอรี</h3>
              <p class="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                ระบบกำลังรอให้ห้องครัวปรุงอาหารเสร็จ เมื่อในครัวกด <b class="text-emerald-700">"ทำเสร็จแล้ว"</b> ออเดอร์จะเด้งขึ้นมาให้คุณกดรับงานทันที!
              </p>

              <div class="mt-4 flex items-center gap-2 text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>เรดาร์ค้นหาออเดอร์พร้อมส่งกำลังทำงาน...</span>
              </div>
            </div>

            <!-- รายการออเดอร์ที่ครัวทำเสร็จแล้ว พร้อมส่ง (ถ้ามี) -->
            <div v-if="availableReadyOrders.length > 0" class="space-y-2.5">
              <div class="flex items-center justify-between px-1">
                <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>🍳</span>
                  <span>ออเดอร์ที่ครัวทำเสร็จแล้ว พร้อมส่ง ({{ availableReadyOrders.length }})</span>
                </h4>
                <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">กดรับได้เลย</span>
              </div>

              <div 
                v-for="order in availableReadyOrders" 
                :key="order.order_id"
                class="bg-white rounded-2xl p-4 shadow-sm border border-emerald-300 hover:border-emerald-500 transition relative overflow-hidden"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black text-slate-900">#TKZ-{{ order.order_id }}</span>
                      <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">ครัวทำเสร็จแล้ว</span>
                    </div>
                    <p class="text-[11px] text-slate-600 font-medium mt-1">
                      📍 ปลายทาง: {{ order.delivery_address || order.user?.address || 'ตามหมุดจัดส่งของลูกค้า' }}
                    </p>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      👤 ลูกค้า: {{ order.delivery?.customer_name || order.user?.username || 'ลูกค้าทั่วไป' }}
                    </p>
                  </div>

                  <div class="text-right">
                    <span class="text-xs font-extrabold text-emerald-700 block">+฿40.00</span>
                    <span class="text-[9px] text-slate-400">ค่ารอบ</span>
                  </div>
                </div>

                <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">
                    🍲 {{ order.order_items?.length || 1 }} รายการอาหาร (฿{{ Number(order.total_price).toLocaleString() }})
                  </span>

                  <button 
                    @click="handleClaimOrder(order)"
                    class="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>🛵</span>
                    <span>กดรับงานนี้</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- รายการออเดอร์ที่สั่งเข้ามา แต่ครัวยังทำไม่เสร็จ (กำลังปรุง) -->
            <div v-if="pendingKitchenOrders.length > 0" class="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200">
              <div class="flex items-center gap-2 text-xs font-bold text-amber-900">
                <span class="animate-spin text-sm">⏳</span>
                <span>กำลังปรุงในครัว {{ pendingKitchenOrders.length }} ออเดอร์ (ยังไม่ขึ้นให้รับ)</span>
              </div>
              <p class="text-[11px] text-amber-800/80 mt-1">
                มีลูกค้าสั่งอาหารเข้ามาแล้ว รอห้องครัวกดทำเสร็จแล้วระบบจะแจ้งเตือนให้คุณรับงานทันทีครับ
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom Action Footer Bar (เฉพาะตอนมีออเดอร์ที่รับแล้ว) -->
      <ActionFooter 
        v-if="activeOrder"
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

      <!-- ================= MODAL: แจ้งเตือนเมื่อครัวทำอาหารเสร็จและเด้งให้รับงาน ================= -->
      <div 
        v-if="incomingPromptOrder"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      >
        <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 animate-slide-up">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl animate-bounce">
                🛵
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">ครัวทำอาหารเสร็จแล้ว!</h3>
                <p class="text-[11px] text-emerald-600 font-bold">พร้อมส่งต่อให้ไรเดอร์นำส่งลูกค้า</p>
              </div>
            </div>
            <span class="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
              ค่ารอบ +฿40
            </span>
          </div>

          <!-- Order Info Box -->
          <div class="mt-4 bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">หมายเลขออเดอร์:</span>
              <span class="font-extrabold text-slate-800">#TKZ-{{ incomingPromptOrder.order_id }}</span>
            </div>

            <div class="flex items-start justify-between text-xs pt-1 border-t border-slate-200/60">
              <span class="text-slate-500 shrink-0">📍 จุดจัดส่ง:</span>
              <span class="font-bold text-slate-800 text-right ml-2 line-clamp-2">
                {{ incomingPromptOrder.delivery_address || incomingPromptOrder.user?.address || 'ตามหมุดที่ลูกค้าปักไว้' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span class="text-slate-500">👤 ลูกค้า:</span>
              <span class="font-medium text-slate-700">
                {{ incomingPromptOrder.delivery?.customer_name || incomingPromptOrder.user?.username || 'ลูกค้าเดลิเวอรี' }}
                (โทร {{ incomingPromptOrder.delivery_phone || incomingPromptOrder.user?.phone_number || '-' }})
              </span>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span class="text-slate-500">🍲 รายการอาหาร:</span>
              <span class="font-bold text-emerald-700">
                {{ incomingPromptOrder.order_items?.length || 1 }} รายการ • ฿{{ Number(incomingPromptOrder.total_price).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-2">
            <button 
              @click="incomingPromptOrder = null"
              class="flex-1 py-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              ปิดไว้ก่อน
            </button>
            <button 
              @click="handleClaimOrder(incomingPromptOrder)"
              class="flex-[2] py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <span>🛵</span>
              <span>กดรับออเดอร์ไปส่งลูกค้า</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <MapModal 
        :is-open="isMapOpen" 
        :map-data="activeMapData"
        @close="isMapOpen = false" 
      />

      <ChatModal
        :is-open="chat.isOpen.value"
        :messages="chat.messages.value"
        :customer-name="customerInfo.name"
        @close="chat.close()"
        @send-message="handleUserChatMessage"
      />

      <PhotoProofModal
        :is-open="isPhotoModalOpen"
        :address="customerInfo.address"
        :is-submitting="isUploadingProof"
        :error-message="proofError"
        @close="isPhotoModalOpen = false"
        @confirm="handleConfirmDelivery"
      />

      <SuccessModal
        :is-open="isSuccessOpen"
        :summary="deliverySummary"
        @reset-flow="handleResetFlow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import API_BASE from '../../config/api'
import { socket } from '../../config/socket'
import { authStore } from '../../store/authStore'
import { showSuccess, showWarning, showError } from '../../utils/swal'
import { useOrderChat } from '../../composables/useOrderChat'

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
const earnings = ref(40.00)
const isFoodReady = ref(true)

// Order States
const activeOrder = ref(null)
const isRealOrder = ref(false)
const realOrderId = ref(null)
const orderDisplayId = ref('TKZ-9482')

// รายการออเดอร์ที่ห้องครัวทำเสร็จแล้ว (READY) พร้อมให้ไรเดอร์กดรับ
const availableReadyOrders = ref([])
// รายการออเดอร์ที่เพิ่งสั่ง กำลังปรุงในครัว (PENDING / COOKING)
const pendingKitchenOrders = ref([])

// ป๊อปอัพแจ้งเตือนเมื่อครัวทำอาหารเสร็จ
const incomingPromptOrder = ref(null)

// Default items
const orderItems = ref([])
const checkedCount = computed(() => orderItems.value.filter(i => i.checked).length)
const isAllChecked = computed(() => orderItems.value.length > 0 && checkedCount.value === orderItems.value.length)

// Modal states
const isMapOpen = ref(false)
const isPhotoModalOpen = ref(false)
const isSuccessOpen = ref(false)
const toastMessage = ref('')
const isUploadingProof = ref(false)
const proofError = ref('')

// สรุปงานที่เพิ่งส่งสำเร็จ (แสดงในหน้าจัดส่งสำเร็จ) — คะแนนรีวิวจะอัปเดตเมื่อลูกค้ากดรีวิวจริง
const deliverySummary = ref(null)

const customerInfo = ref({
  name: 'ลูกค้าเดลิเวอรี',
  phone: '081-xxx-xxxx',
  address: 'ที่อยู่จัดส่ง',
  addressDetail: '',
  note: 'ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1',
  lat: 13.7570,
  lng: 100.5695,
  isRealGps: false
})

const activeMapData = ref({
  targetName: 'จุดส่งลูกค้า',
  customerCoord: [13.7570, 100.5695],
  distance: '2.8 กม.',
  eta: '10-15 นาที'
})

// แชทกับลูกค้าของออเดอร์ที่กำลังส่ง (เก็บในฐานข้อมูลและอัปเดตแบบเรียลไทม์)
const chat = useOrderChat(realOrderId, 'rider')

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
    case 1: return `นำส่งปลายทาง: ${customerInfo.value.address}`
    case 2: return 'วางอาหารที่จุดนัดหมายหรือส่งมอบต่อหน้าลูกค้า'
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

// เสียงแจ้งเตือนเมื่อครัวทำอาหารเสร็จ (Web Audio API Chime)
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.1)
      gain.gain.setValueAtTime(0.2, now + idx * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.1)
      osc.stop(now + idx * 0.1 + 0.3)
    })
  } catch (e) {
    console.warn('ไม่สามารถเล่นเสียงแจ้งเตือนได้:', e)
  }
}

// ตั้งค่าข้อมูลออเดอร์จริงเข้าสู่หน้าจอจัดส่ง
const setActiveOrderFromData = (order, delivery = null) => {
  if (!order) return
  isRealOrder.value = true
  realOrderId.value = order.order_id
  orderDisplayId.value = `TKZ-${order.order_id}`
  activeOrder.value = order
  localStorage.setItem('rider_active_order_id', String(order.order_id))

  const deliv = delivery || order.delivery
  const usr = order.user

  let pinnedGps = null
  try {
    pinnedGps = JSON.parse(localStorage.getItem('latest_order_gps') || '{}')
  } catch (e) {}

  const cName = deliv?.customer_name || usr?.name || usr?.username || pinnedGps?.name || 'คุณลูกค้า'
  const cPhone = deliv?.customer_phone || order.delivery_phone || usr?.phone_number || pinnedGps?.phone || '081-xxx-xxxx'
  const cAddress = deliv?.delivery_address || order.delivery_address || usr?.address || pinnedGps?.address || 'ตามหมุดที่ลูกค้าปักไว้'
  const cNote = order.order_notes || 'ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1'

  let cLat = Number(deliv?.customer_lat) || Number(pinnedGps?.lat) || 13.7570
  let cLng = Number(deliv?.customer_lng) || Number(pinnedGps?.lng) || 100.5695
  const isRealGps = !!((deliv?.customer_lat && deliv?.customer_lng) || (pinnedGps?.lat && pinnedGps?.lng))

  customerInfo.value = {
    name: cName,
    phone: cPhone,
    address: cAddress,
    addressDetail: cAddress.length > 25 ? cAddress : 'จุดจัดส่งตามที่ลูกค้าระบุในระบบ',
    note: cNote,
    lat: cLat,
    lng: cLng,
    isRealGps
  }

  activeMapData.value = {
    targetName: cAddress,
    customerCoord: [cLat, cLng],
    distance: deliv?.distance_km ? `${Number(deliv.distance_km).toFixed(1)} กม.` : '2.8 กม.',
    eta: '10-15 นาที'
  }

  if (order.order_items && order.order_items.length > 0) {
    orderItems.value = order.order_items.map((item, index) => {
      let optStr = ''
      if (item.order_item_options && item.order_item_options.length > 0) {
        optStr = item.order_item_options.map(o => o.option_name).join(', ')
      }
      const noteStr = [item.notes, optStr].filter(Boolean).join(' | ')

      return {
        id: item.order_item_id || index + 1,
        name: item.menu?.menu_name || item.name || 'รายการอาหารตามสั่ง',
        quantity: item.quantity || 1,
        price: Number(item.unit_price || item.price || 0) * (item.quantity || 1),
        detail: noteStr || item.menu?.description || 'ปรุงสดใหม่ตามมาตรฐานร้าน',
        checked: true
      }
    })
  } else {
    orderItems.value = [
      {
        id: 1,
        name: `รายการอาหารออเดอร์ #${order.order_id}`,
        quantity: 1,
        price: Number(order.total_price || 0),
        detail: 'อาหารปรุงเสร็จแล้วจากห้องครัว',
        checked: true
      }
    ]
  }

  isFoodReady.value = true
  if (order.status === 'IN_DELIVERY' || deliv?.delivery_status === 'DELIVERING') {
    currentStep.value = 1
  } else {
    currentStep.value = 0
  }
}

// ไรเดอร์กดรับงานออเดอร์
const handleClaimOrder = async (orderToClaim) => {
  if (!orderToClaim || !orderToClaim.order_id) return
  try {
    const token = localStorage.getItem('access_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    let res = null
    try {
      res = await axios.post(`${API_BASE}/orders/${orderToClaim.order_id}/claim-delivery`, {}, { headers })
    } catch (apiErr) {
      console.warn('API claim-delivery fallback:', apiErr)
    }

    const claimedData = res?.data?.order || orderToClaim
    const deliveryData = res?.data?.delivery || claimedData.delivery

    setActiveOrderFromData(claimedData, deliveryData)
    incomingPromptOrder.value = null

    await showSuccess(
      'รับออเดอร์สำเร็จ!',
      `ออเดอร์ <b>#TKZ-${claimedData.order_id}</b><br><span style="color:#64748b;font-size:13px;">ดึงข้อมูลที่อยู่ลูกค้าและรายการอาหารเข้ามาเรียบร้อยแล้ว</span>`
    )
  } catch (err) {
    console.error('ไม่สามารถรับออเดอร์ได้:', err)
    setActiveOrderFromData(orderToClaim, orderToClaim.delivery)
    incomingPromptOrder.value = null
  }
}

// ดึงข้อมูลออเดอร์จาก Backend
const fetchActiveOrders = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // 1. ดึงรายได้สะสมของไรเดอร์ (ถ้ามี)
    try {
      const earnRes = await axios.get(`${API_BASE}/orders/rider/earnings`, { headers })
      if (earnRes.data?.total_earnings !== undefined) {
        earnings.value = Number(earnRes.data.total_earnings)
      }
    } catch (e) {}

    // 2. ดึงออเดอร์เดลิเวอรี่ทั้งหมด
    const res = await axios.get(`${API_BASE}/orders?orderType=DELIVERY`, { headers })
    const allDeliveryOrders = res.data || []

    const savedActiveId = localStorage.getItem('rider_active_order_id')

    // ถ้ามีออเดอร์ที่ไรเดอร์เคยรับไว้แล้วและยังไม่จบ
    if (savedActiveId) {
      const active = allDeliveryOrders.find(o => String(o.order_id) === String(savedActiveId) && !['COMPLETED', 'CANCELLED'].includes(o.status))
      if (active) {
        setActiveOrderFromData(active)
        return
      } else {
        localStorage.removeItem('rider_active_order_id')
        activeOrder.value = null
      }
    }

    // กรองแยก: ออเดอร์ที่ครัวทำเสร็จแล้ว (READY / SERVED) vs กำลังปรุง (PENDING / COOKING)
    const readyList = []
    const pendingList = []

    allDeliveryOrders.forEach(o => {
      const st = (o.status || '').toUpperCase()
      if (['READY', 'SERVED'].includes(st)) {
        readyList.push(o)
      } else if (['PENDING', 'COOKING'].includes(st)) {
        pendingList.push(o)
      }
    })

    availableReadyOrders.value = readyList
    pendingKitchenOrders.value = pendingList

    // หากไม่มีออเดอร์ที่รับอยู่ ให้คงหน้าจอไว้ที่ Standby เพื่อรอครัวกดเสร็จ
    if (!savedActiveId) {
      activeOrder.value = null
      isRealOrder.value = false
      realOrderId.value = null
    }
  } catch (error) {
    console.warn('โหลดออเดอร์ไม่สำเร็จ:', error)
  }
}

// ตรวจจับเมื่อมีออเดอร์ที่ครัวเพิ่งทำเสร็จเข้ามา
const handleIncomingKitchenOrder = (order) => {
  if (!order || order.order_type !== 'DELIVERY') return
  const st = (order.status || '').toUpperCase()

  // เงื่อนไขหัวใจสำคัญ: ถ้าครัวกดทำเสร็จแล้ว (READY หรือ SERVED) และไรเดอร์ยังว่างอยู่
  if (['READY', 'SERVED'].includes(st)) {
    if (!activeOrder.value) {
      playChime()
      incomingPromptOrder.value = order
    }
    fetchActiveOrders()
  } else if (['COMPLETED', 'CANCELLED'].includes(st)) {
    if (activeOrder.value && activeOrder.value.order_id === order.order_id) {
      localStorage.removeItem('rider_active_order_id')
      activeOrder.value = null
    }
    fetchActiveOrders()
  } else {
    // กรณีเพิ่งสั่งใหม่ (PENDING) -> จะไม่เด้งให้รับ แต่จะอัปเดตสถิติว่ามีของรอปรุง
    fetchActiveOrders()
  }
}

const cancelCurrentTrip = () => {
  localStorage.removeItem('rider_active_order_id')
  activeOrder.value = null
  isRealOrder.value = false
  realOrderId.value = null
  currentStep.value = 0
  showToast('สลับเข้าสู่โหมดสแตนด์บาย')
  fetchActiveOrders()
}

const activateDemoOrder = () => {
  const mockOrder = {
    order_id: 9482,
    order_type: 'DELIVERY',
    status: 'READY',
    total_price: 250,
    delivery_address: 'คอนโด The Grand Rama 9 (อาคาร B) ชั้น 14 ห้อง 1408',
    delivery_phone: '081-992-8811',
    order_notes: 'ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1',
    user: {
      username: 'คุณณัฐวุฒิ ใจดี',
      phone_number: '081-992-8811',
      address: 'คอนโด The Grand Rama 9 (อาคาร B)'
    },
    order_items: [
      { order_item_id: 1, quantity: 2, unit_price: 70, notes: 'พริก 10 เม็ด ปลาร้าสุก', menu: { menu_name: 'ส้มตำปูปลาร้า' } },
      { order_item_id: 2, quantity: 1, unit_price: 110, notes: 'หนังกรอบ น้ำจิ้มแจ่ว', menu: { menu_name: 'ไก่ย่างสูตรเด็ด' } }
    ]
  }
  handleClaimOrder(mockOrder)
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
    if (isRealOrder.value && realOrderId.value) {
      try {
        const token = localStorage.getItem('access_token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        await axios.patch(`${API_BASE}/orders/${realOrderId.value}/delivery-status`, { status: 'PICKED_UP' }, { headers })
      } catch (err) {
        try {
          await axios.patch(`${API_BASE}/orders/${realOrderId.value}/status`, { status: 'IN_DELIVERY' })
        } catch (e) {}
      }
    }
  } else if (currentStep.value === 1) {
    currentStep.value = 2
    showToast('🏢 ถึงจุดส่งปลายทางแล้ว กรุณาถ่ายรูปส่งมอบ')
  }
}

// อัปโหลดรูปหลักฐานไปเก็บที่ Backend (uploads/delivery-proofs) แล้วแนบ URL ไปกับสถานะ DELIVERED
// ลูกค้าจะเห็นรูปนี้ในหน้าติดตามออเดอร์และประวัติคำสั่งซื้อ
const handleConfirmDelivery = async (photoFile) => {
  const token = localStorage.getItem('access_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  let proofUrl = null

  if (isRealOrder.value && realOrderId.value) {
    isUploadingProof.value = true
    proofError.value = ''
    try {
      const form = new FormData()
      form.append('file', photoFile)
      const uploadRes = await axios.post(`${API_BASE}/orders/${realOrderId.value}/delivery-proof`, form, { headers })
      proofUrl = uploadRes.data?.url || null
    } catch (err) {
      const msg = err?.response?.data?.message
      proofError.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      isUploadingProof.value = false
      return
    }

    try {
      await axios.patch(
        `${API_BASE}/orders/${realOrderId.value}/delivery-status`,
        { status: 'DELIVERED', proof_image_url: proofUrl },
        { headers }
      )
    } catch (err) {
      try {
        await axios.patch(`${API_BASE}/orders/${realOrderId.value}/status`, { status: 'COMPLETED' })
      } catch (e) {}
    }
    isUploadingProof.value = false
  }

  const deliv = activeOrder.value?.delivery
  const fee = Number(deliv?.rider_fee || 40)
  deliverySummary.value = {
    orderId: realOrderId.value,
    fee,
    distanceKm: deliv?.distance_km ? Number(deliv.distance_km) : null,
    minutes: deliv?.assigned_at ? Math.max(1, Math.round((Date.now() - new Date(deliv.assigned_at).getTime()) / 60000)) : null,
    proofUrl,
    rating: null,
    comment: ''
  }

  isPhotoModalOpen.value = false
  isSuccessOpen.value = true
  earnings.value += fee
  localStorage.removeItem('rider_active_order_id')
}

// ลูกค้ากดรีวิวออเดอร์ที่ไรเดอร์เพิ่งส่ง -> แสดงคะแนนจริงในหน้าจัดส่งสำเร็จ
const handleOrderReviewed = (review) => {
  if (!review || !deliverySummary.value) return
  if (String(review.order_id) !== String(deliverySummary.value.orderId)) return
  deliverySummary.value = {
    ...deliverySummary.value,
    rating: review.rating,
    comment: review.review_comment || ''
  }
}

const handleResetFlow = () => {
  isSuccessOpen.value = false
  deliverySummary.value = null
  currentStep.value = 0
  activeOrder.value = null
  isRealOrder.value = false
  realOrderId.value = null
  localStorage.removeItem('rider_active_order_id')
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

const handleSendQuickMessage = async (msg) => {
  const ok = await chat.sendMessage(msg)
  showToast(ok ? 'ส่งข้อความสำเร็จ: ' + msg : 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่')
}

const handleUserChatMessage = async (msg) => {
  const ok = await chat.sendMessage(msg)
  if (!ok) showToast('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่')
}

const handleOpenHelp = () => {
  showToast('ศูนย์ช่วยเหลือไรเดอร์: โทรด่วน 02-018-XXXX')
}

let pollInterval = null

onMounted(() => {
  fetchActiveOrders()

  // ฟังเหตุการณ์ผ่าน WebSocket แบบ Real-time
  socket.on('order_status_updated', handleIncomingKitchenOrder)
  socket.on('new_order', handleIncomingKitchenOrder)
  socket.on('order_reviewed', handleOrderReviewed)

  // Polling สำรองทุก 4 วินาทีเพื่อความแม่นยำสูง
  pollInterval = setInterval(fetchActiveOrders, 4000)
})

onUnmounted(() => {
  socket.off('order_status_updated', handleIncomingKitchenOrder)
  socket.off('new_order', handleIncomingKitchenOrder)
  socket.off('order_reviewed', handleOrderReviewed)
  if (pollInterval) clearInterval(pollInterval)
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
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
