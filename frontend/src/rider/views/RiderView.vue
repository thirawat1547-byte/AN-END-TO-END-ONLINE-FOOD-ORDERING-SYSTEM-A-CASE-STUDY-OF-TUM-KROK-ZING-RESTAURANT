<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <!-- Header -->
    <header class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <img :src="logoImg" alt="ตำครกซิ่ง" class="w-10 h-10 rounded-full bg-white p-0.5 object-contain shrink-0" />
          <div class="min-w-0">
            <h1 class="font-extrabold leading-tight truncate">ไรเดอร์ • ตำครกซิ่ง</h1>
            <p class="text-xs text-emerald-100 truncate">{{ riderName }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="refresh"
            :disabled="loading"
            class="text-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl transition disabled:opacity-50"
          >
            {{ loading ? 'กำลังโหลด…' : '🔄 รีเฟรช' }}
          </button>
          <router-link to="/" class="text-xs text-emerald-100 hover:text-white">หน้าร้าน</router-link>
        </div>
      </div>

      <!-- Tabs -->
      <nav class="max-w-3xl mx-auto px-4 flex gap-1 text-sm font-bold">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="tab = t.key"
          class="px-3 py-2 rounded-t-xl transition flex items-center gap-1.5"
          :class="tab === t.key ? 'bg-slate-100 text-emerald-700' : 'text-emerald-50 hover:bg-white/10'"
        >
          <span>{{ t.label }}</span>
          <span
            v-if="t.badge"
            class="text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center"
            :class="tab === t.key ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'"
          >{{ t.badge }}</span>
        </button>
      </nav>
    </header>

    <main class="max-w-3xl mx-auto p-4 space-y-4">
      <p v-if="loadError" class="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-3">{{ loadError }}</p>

      <!-- ================= งานพร้อมส่ง ================= -->
      <template v-if="tab === 'available'">
        <div v-if="myJob" class="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-xl p-3 flex items-center justify-between gap-2">
          <span>คุณกำลังส่งออเดอร์ <b>#{{ myJob.order_id }}</b> อยู่ ส่งให้เสร็จก่อนจึงจะรับงานใหม่ได้</span>
          <button @click="tab = 'mine'" class="text-xs font-bold underline shrink-0">ไปที่งานของฉัน</button>
        </div>

        <section>
          <h2 class="text-sm font-bold text-slate-700 mb-2">🍳 ครัวทำเสร็จแล้ว รอไรเดอร์รับ ({{ available.length }})</h2>
          <div v-if="available.length === 0" class="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            ยังไม่มีออเดอร์ที่ครัวทำเสร็จ เมื่อครัวกด "เสร็จ" ออเดอร์จะขึ้นที่นี่ทันที
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <article
              v-for="o in available"
              :key="o.order_id"
              class="bg-white rounded-2xl border border-emerald-300 p-4 flex flex-col gap-2 shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-black">#{{ o.order_id }}</p>
                  <p class="text-[11px] text-emerald-700 font-bold">พร้อมส่ง • {{ timeAgo(o.updated_at) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-extrabold text-emerald-700"><span class="num">{{ feeText(o.delivery) }}</span></p>
                  <p class="text-[10px] text-slate-400">ค่ารอบ • {{ distanceText(o) }}</p>
                </div>
              </div>
              <p v-if="feeBreakdown(o.delivery)" class="text-[11px] text-emerald-800 bg-emerald-50 rounded-lg px-2 py-1">💰 {{ feeBreakdown(o.delivery) }}</p>
              <p class="text-sm text-slate-700 line-clamp-2">📍 {{ addressOf(o) }}</p>
              <p v-if="landmarkOf(o)" class="text-xs text-slate-500 line-clamp-1">🏷️ จุดสังเกต: {{ landmarkOf(o) }}</p>
              <p class="text-xs text-slate-500">
                👤 {{ customerOf(o) }} • {{ itemCount(o) }} ชิ้น • <span class="num">฿{{ money(o.total_price) }}</span>
                <span v-if="isCash(o)" class="text-amber-700 font-bold"> • เก็บเงินสด</span>
              </p>
              <div class="mt-auto pt-2 flex gap-2">
                <button @click="detailOrder = o" class="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50">
                  ดูรายละเอียด
                </button>
                <button
                  @click="claim(o)"
                  :disabled="!!myJob || busy"
                  class="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  🛵 รับงาน
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="awaitingPayment.length">
          <h2 class="text-sm font-bold text-slate-700 mb-2">💳 ครัวทำเสร็จแล้ว แต่รอร้านยืนยันการชำระเงิน ({{ awaitingPayment.length }}) — ยังรับไม่ได้</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <article
              v-for="o in awaitingPayment"
              :key="o.order_id"
              class="bg-white/70 rounded-2xl border border-slate-300 p-3 flex items-center justify-between gap-2"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold">#{{ o.order_id }} <span class="text-[11px] font-medium text-slate-500">{{ paymentWaitLabel(o) }}</span></p>
                <p class="text-xs text-slate-500 truncate">📍 {{ addressOf(o) }}</p>
              </div>
              <button @click="detailOrder = o" class="shrink-0 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                ดู
              </button>
            </article>
          </div>
        </section>

        <section v-if="cooking.length">
          <h2 class="text-sm font-bold text-slate-700 mb-2">⏳ กำลังปรุงในครัว ({{ cooking.length }}) — ยังรับไม่ได้</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <article
              v-for="o in cooking"
              :key="o.order_id"
              class="bg-white/70 rounded-2xl border border-amber-200 p-3 flex items-center justify-between gap-2"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold">#{{ o.order_id }} <span class="text-[11px] font-medium text-amber-700">{{ statusLabel(o.status) }}</span></p>
                <p class="text-xs text-slate-500 truncate">📍 {{ addressOf(o) }}</p>
              </div>
              <button @click="detailOrder = o" class="shrink-0 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                ดู
              </button>
            </article>
          </div>
        </section>
      </template>

      <!-- ================= งานของฉัน ================= -->
      <template v-else-if="tab === 'mine'">
        <div v-if="!myJob" class="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          ยังไม่มีงานที่รับไว้
          <button @click="tab = 'available'" class="block mx-auto mt-2 text-emerald-700 font-bold underline">ดูงานที่พร้อมส่ง</button>
        </div>

        <template v-else>
          <!-- ขั้นตอนการส่ง -->
          <section class="bg-white rounded-2xl border border-slate-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-black">ออเดอร์ #{{ myJob.order_id }}</h2>
                <p class="text-xs text-slate-500">ค่ารอบ <span class="num">{{ feeText(myJob.delivery, false) }}</span> • {{ distanceText(myJob) }}</p>
                <p v-if="feeBreakdown(myJob.delivery)" class="text-[11px] text-emerald-700">{{ feeBreakdown(myJob.delivery) }}</p>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-lg" :class="isDelivering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'">
                {{ isDelivering ? 'กำลังนำส่ง' : 'รอรับอาหารที่ร้าน' }}
              </span>
            </div>
            <ol class="mt-3 grid grid-cols-3 gap-2 text-[11px] font-bold text-center">
              <li v-for="(s, i) in steps" :key="s" class="space-y-1">
                <div class="h-1.5 rounded-full" :class="i <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200'"></div>
                <span :class="i <= stepIndex ? 'text-emerald-700' : 'text-slate-400'">{{ s }}</span>
              </li>
            </ol>
          </section>

          <OrderDetail :order="myJob" />

          <button
            @click="chat.open()"
            class="w-full py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm hover:bg-slate-50 relative"
          >
            💬 แชทกับลูกค้า
            <span v-if="chat.unreadCount.value" class="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px]">
              {{ chat.unreadCount.value }}
            </span>
          </button>

          <!-- Action buttons -->
          <div class="sticky bottom-0 -mx-4 px-4 py-3 bg-slate-100/95 backdrop-blur border-t border-slate-200 flex gap-2">
            <template v-if="!isDelivering">
              <button @click="release" :disabled="busy" class="px-4 py-3 rounded-2xl border border-rose-200 text-rose-700 bg-white text-sm font-bold disabled:opacity-50">
                คืนงาน
              </button>
              <button @click="pickUp" :disabled="busy" class="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50">
                📦 รับอาหารแล้ว • เริ่มนำส่ง
              </button>
            </template>
            <button
              v-else
              @click="isPhotoModalOpen = true"
              :disabled="busy"
              class="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50"
            >
              ✅ ส่งสำเร็จ (ถ่ายรูปยืนยัน)
            </button>
          </div>
        </template>
      </template>

      <!-- ================= รายได้ ================= -->
      <template v-else>
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="s in periodStats" :key="s.label" class="bg-white rounded-2xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500">{{ s.label }}</p>
            <p class="text-2xl font-black" :class="s.accent ? 'text-emerald-700' : ''"><span class="num">฿{{ money(s.earnings) }}</span></p>
            <p class="text-xs text-slate-500">{{ s.trips }} รอบ</p>
          </div>
        </section>

        <!-- เงินสดที่ต้องนำส่งร้าน -->
        <section class="bg-white rounded-2xl border p-4 space-y-3" :class="cashPending.length ? 'border-amber-300' : 'border-slate-200'">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-bold">💵 เงินสดที่ต้องนำส่งร้าน</h2>
              <p class="text-2xl font-black text-amber-700"><span class="num">฿{{ money(cashPendingTotal) }}</span></p>
              <p class="text-xs text-slate-500">
                ค้างนำส่ง {{ cashPending.length }} งาน
                <template v-if="cashSubmittedTotal"> • รอแอดมินยืนยัน <span class="num">฿{{ money(cashSubmittedTotal) }}</span></template>
              </p>
            </div>
            <button
              v-if="cashPending.length"
              @click="submitCash"
              :disabled="busy || !selectedCashIds.length"
              class="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold disabled:bg-slate-300"
            >
              นำส่งเงินแล้ว ({{ selectedCashIds.length }})
            </button>
          </div>
          <p v-if="!cashTrips.length" class="text-sm text-slate-500">ยังไม่มีงานเก็บเงินสด</p>
          <div v-if="cashPending.length" class="flex items-center gap-2 text-xs">
            <button @click="toggleAllCash" class="font-bold text-amber-700 underline">
              {{ allCashSelected ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด' }}
            </button>
            <span class="text-slate-400">เลือกงานที่นำเงินส่งร้านแล้ว</span>
          </div>
          <ul class="divide-y divide-slate-100 -mx-4">
            <li v-for="t in cashTrips" :key="t.delivery_id" class="px-4 py-2 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                class="w-4 h-4 accent-amber-500"
                :disabled="cashStatusOf(t) !== 'PENDING'"
                :checked="selectedCashIds.includes(t.delivery_id)"
                @change="toggleCash(t.delivery_id)"
              />
              <div class="min-w-0 flex-1">
                <p class="font-bold">#{{ t.order_id }} <span class="font-normal text-slate-500">{{ t.customer_name }}</span></p>
                <p class="text-xs text-slate-500">{{ formatDate(t.delivered_at) }}</p>
              </div>
              <span class="num font-bold">฿{{ money(t.cash_amount) }}</span>
              <span class="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg" :class="cashBadge(t).cls">{{ cashBadge(t).text }}</span>
            </li>
          </ul>
        </section>
        <section class="bg-white rounded-2xl border border-slate-200">
          <h2 class="text-sm font-bold p-4 pb-2">ประวัติการส่ง</h2>
          <p v-if="!earnings.trips.length" class="px-4 pb-4 text-sm text-slate-500">ยังไม่มีประวัติการส่ง</p>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in earnings.trips.slice(0, 50)" :key="t.delivery_id" class="px-4 py-2.5 flex justify-between gap-3 text-sm">
              <div class="min-w-0">
                <p class="font-bold">
                  #{{ t.order_id }} <span class="font-normal text-slate-500">{{ t.customer_name }}</span>
                  <span v-if="Number(t.distance_km) > 0" class="font-normal text-slate-400">• {{ Number(t.distance_km).toFixed(1) }} กม.</span>
                </p>
                <p class="text-xs text-slate-500 truncate">{{ formatDate(t.delivered_at) }} • {{ t.delivery_address }}</p>
                <p v-if="feeBreakdown(t)" class="text-[11px] text-slate-400">{{ feeBreakdown(t) }}</p>
              </div>
              <span class="shrink-0 font-bold text-emerald-700"><span class="num">+฿{{ money(t.rider_fee) }}</span></span>
            </li>
          </ul>
        </section>
      </template>
    </main>

    <!-- รายละเอียดออเดอร์ (ก่อนรับงาน) -->
    <div v-if="detailOrder" class="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center" @click.self="detailOrder = null">
      <div class="bg-slate-100 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black">ออเดอร์ #{{ detailOrder.order_id }}</h3>
            <p class="text-xs text-slate-500">{{ statusLabel(detailOrder.status) }} • สั่งเมื่อ {{ formatDate(detailOrder.created_at) }}</p>
          </div>
          <button @click="detailOrder = null" class="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-500">✕</button>
        </div>
        <OrderDetail :order="detailOrder" />
        <button
          v-if="isClaimable(detailOrder)"
          @click="claim(detailOrder)"
          :disabled="!!myJob || busy"
          class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:bg-slate-300"
        >
          🛵 รับงานนี้ (<span class="num">{{ feeText(detailOrder.delivery) }}</span>)
        </button>
        <p v-if="isClaimable(detailOrder) && feeBreakdown(detailOrder.delivery)" class="text-center text-xs text-emerald-700">
          {{ feeBreakdown(detailOrder.delivery) }}
        </p>
        <p v-else-if="isAwaitingPayment(detailOrder)" class="text-center text-xs text-slate-600 font-bold">
          รอร้านยืนยันการชำระเงิน — รับงานได้เมื่อร้านยืนยันยอดแล้ว
        </p>
        <p v-else class="text-center text-xs text-amber-700 font-bold">ครัวยังทำไม่เสร็จ — รับงานได้เมื่อครัวกดเสร็จแล้ว</p>
      </div>
    </div>

    <ChatModal
      :is-open="chat.isOpen.value"
      :messages="chat.messages.value"
      :customer-name="myJob ? customerOf(myJob) : ''"
      @close="chat.close()"
      @send-message="sendChat"
    />

    <PhotoProofModal
      :is-open="isPhotoModalOpen"
      :address="myJob ? addressOf(myJob) : ''"
      :is-submitting="busy"
      :error-message="proofError"
      @close="isPhotoModalOpen = false"
      @confirm="confirmDelivered"
    />

    <SuccessModal :is-open="!!deliverySummary" :summary="deliverySummary" @reset-flow="closeSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import API_BASE from '../../config/api'
import { socket } from '../../config/socket'
import { authStore } from '../../store/authStore'
import { showSuccess, showError, showWarning, showConfirm } from '../../utils/swal'
import { useOrderChat } from '../../composables/useOrderChat'
import logoImg from '../../assets/logo.png'

import OrderDetail from '../components/OrderDetail.vue'
import ChatModal from '../components/ChatModal.vue'
import PhotoProofModal from '../components/PhotoProofModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

const tab = ref('available')
const loading = ref(false)
const busy = ref(false)
const loadError = ref('')

const available = ref([])
const cooking = ref([])
const awaitingPayment = ref([])
const myJob = ref(null)
const earnings = ref({ total_trips: 0, total_earnings: 0, trips: [] })

const detailOrder = ref(null)
const isPhotoModalOpen = ref(false)
const proofError = ref('')
const deliverySummary = ref(null)

const riderName = computed(() => {
  const p = authStore.userProfile || {}
  return p.name || p.username || 'พนักงานจัดส่ง'
})

const tabs = computed(() => [
  { key: 'available', label: 'งานพร้อมส่ง', badge: available.value.length },
  { key: 'mine', label: 'งานของฉัน', badge: myJob.value ? 1 : 0 },
  { key: 'earnings', label: 'รายได้', badge: 0 }
])

const steps = ['รับงานแล้ว', 'กำลังนำส่ง', 'ส่งสำเร็จ']
const isDelivering = computed(() => myJob.value?.delivery?.delivery_status === 'DELIVERING')
const stepIndex = computed(() => (isDelivering.value ? 1 : 0))

// ค่าตั้งค่าสูตรค่ารอบจากร้าน (ใช้แสดงที่มาของรายได้เท่านั้น ยอดจริงมาจาก API)
const feeSettings = ref(null)

const sumTrips = (trips) => ({ trips: trips.length, earnings: trips.reduce((s, t) => s + Number(t.rider_fee || 0), 0) })
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const periodStats = computed(() => {
  const trips = earnings.value.trips.filter((t) => t.delivered_at)
  const today = startOfDay()
  const week = new Date(today)
  week.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // เริ่มสัปดาห์วันจันทร์
  const month = new Date(today.getFullYear(), today.getMonth(), 1)
  const since = (from) => trips.filter((t) => new Date(t.delivered_at) >= from)
  return [
    { label: 'วันนี้', accent: true, ...sumTrips(since(today)) },
    { label: 'สัปดาห์นี้', ...sumTrips(since(week)) },
    { label: 'เดือนนี้', ...sumTrips(since(month)) },
    { label: 'ทั้งหมด', trips: earnings.value.total_trips, earnings: earnings.value.total_earnings }
  ]
})

// ---------- เงินสดที่ต้องนำส่งร้าน ----------
const cashStatusOf = (t) => (t.cash_status || 'NONE').toUpperCase()
const cashTrips = computed(() => earnings.value.trips.filter((t) => cashStatusOf(t) !== 'NONE'))
const cashPending = computed(() => cashTrips.value.filter((t) => cashStatusOf(t) === 'PENDING'))
const cashPendingTotal = computed(() => cashPending.value.reduce((s, t) => s + Number(t.cash_amount || 0), 0))
const cashSubmittedTotal = computed(() =>
  cashTrips.value.filter((t) => cashStatusOf(t) === 'SUBMITTED').reduce((s, t) => s + Number(t.cash_amount || 0), 0)
)
const selectedCashIds = ref([])
const allCashSelected = computed(() => cashPending.value.length > 0 && selectedCashIds.value.length === cashPending.value.length)
const toggleCash = (id) => {
  selectedCashIds.value = selectedCashIds.value.includes(id)
    ? selectedCashIds.value.filter((x) => x !== id)
    : [...selectedCashIds.value, id]
}
const toggleAllCash = () => {
  selectedCashIds.value = allCashSelected.value ? [] : cashPending.value.map((t) => t.delivery_id)
}
const cashBadge = (t) => ({
  PENDING: { text: 'ค้างนำส่ง', cls: 'bg-amber-100 text-amber-800' },
  SUBMITTED: { text: 'รอแอดมินยืนยัน', cls: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { text: 'รับแล้ว', cls: 'bg-emerald-100 text-emerald-800' }
}[cashStatusOf(t)] || { text: cashStatusOf(t), cls: 'bg-slate-100 text-slate-600' })

// ---------- helpers ----------
// จำนวนเต็มแสดงไม่มีทศนิยม, มีเศษแสดง 2 ตำแหน่งเสมอ (62.80 ไม่ใช่ 62.8)
const money = (v) => {
  const n = Number(v || 0)
  const digits = Number.isInteger(n) ? 0 : 2
  return n.toLocaleString('th-TH', { minimumFractionDigits: digits, maximumFractionDigits: 2 })
}
const addressOf = (o) => o.delivery?.delivery_address || o.delivery_address || o.user?.address || '-'
const landmarkOf = (o) => o.delivery?.delivery_landmark || o.delivery_landmark || ''
const customerOf = (o) => o.delivery?.customer_name || o.user?.username || 'ลูกค้าเดลิเวอรี'
// ยอดค่ารอบจาก API เท่านั้น (ไม่มีค่าสำรองตายตัว)
const feeText = (d, plus = true) => {
  if (d?.rider_fee === undefined || d?.rider_fee === null) return '-'
  return `${plus ? '+' : ''}฿${money(d.rider_fee)}`
}
// ที่มาของรายได้ เช่น "ค่าออเดอร์ ฿15 + ระยะ 4.2 กม. ฿10 = ฿25"
const feeBreakdown = (d) => {
  if (!d || d.rider_fee === undefined || d.rider_fee === null) return ''
  const fee = Number(d.rider_fee)
  const km = Number(d.distance_km) || 0
  const base = feeSettings.value ? Number(feeSettings.value.base_rider_fee) : NaN
  if (!Number.isFinite(base) || base > fee) {
    return km > 0 ? `ระยะ ${km.toFixed(1)} กม. = ฿${money(fee)}` : ''
  }
  const extra = fee - base
  return `ค่าออเดอร์ ฿${money(base)} + ระยะ ${km.toFixed(1)} กม. ฿${money(extra)} = ฿${money(fee)}`
}
const distanceText = (o) => {
  const km = Number(o.delivery?.distance_km)
  return km > 0 ? `~${km.toFixed(1)} กม.` : 'ไม่มีพิกัด GPS'
}
const itemCount = (o) => (o.order_items || []).reduce((s, i) => s + (i.quantity || 1), 0)
const isAwaitingPayment = (o) => awaitingPayment.value.some((a) => a.order_id === o.order_id)
const isClaimable = (o) => available.value.some((a) => a.order_id === o.order_id)
const paymentWaitLabel = (o) => {
  const t = (o.transaction || []).slice(-1)[0]
  if (!t) return 'ยังไม่มีข้อมูลการชำระเงิน'
  if ((t.payment_status || '').toUpperCase() === 'REJECTED') return 'การชำระเงินถูกปฏิเสธ'
  return `${t.payment_method} • รอตรวจสอบยอด`
}
const isCash = (o) => {
  const t = (o.transaction || []).slice(-1)[0]
  return t && /cash/i.test(t.payment_method || '') && (t.payment_status || '').toUpperCase() !== 'COMPLETED'
}
const statusLabel = (s) => ({
  PENDING: 'รอครัวรับออเดอร์',
  PAID: 'ชำระแล้ว รอปรุง',
  COOKING: 'กำลังปรุง',
  READY: 'ครัวทำเสร็จแล้ว',
  SERVED: 'ครัวทำเสร็จแล้ว',
  IN_DELIVERY: 'กำลังนำส่ง',
  COMPLETED: 'ส่งสำเร็จ'
}[(s || '').toUpperCase()] || s)
const formatDate = (d) => (d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-')
const timeAgo = (d) => {
  if (!d) return ''
  const min = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000))
  if (min < 1) return 'เมื่อสักครู่'
  if (min < 60) return `${min} นาทีที่แล้ว`
  if (min < 1440) return `${Math.floor(min / 60)} ชม.ที่แล้ว`
  return `${Math.floor(min / 1440)} วันที่แล้ว`
}
const errMsg = (err, fallback) => {
  const m = err?.response?.data?.message
  return Array.isArray(m) ? m.join(', ') : m || fallback
}

const chatOrderId = computed(() => myJob.value?.order_id || null)
const chat = useOrderChat(chatOrderId, 'rider')

// ---------- data ----------
const playChime = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    ;[523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + i * 0.12
      osc.frequency.setValueAtTime(f, t)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch (e) {}
}

const fetchJobs = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/orders/rider/jobs`)
    const prevIds = new Set(available.value.map((o) => o.order_id))
    const hasNew = (data.available || []).some((o) => !prevIds.has(o.order_id))
    if (hasNew && initialized && !data.mine) playChime()

    available.value = data.available || []
    cooking.value = data.cooking || []
    awaitingPayment.value = data.awaiting_payment || []
    myJob.value = data.mine || null
    if (detailOrder.value) {
      detailOrder.value = [...available.value, ...awaitingPayment.value, ...cooking.value].find((o) => o.order_id === detailOrder.value.order_id) || detailOrder.value
    }
    loadError.value = ''
  } catch (err) {
    loadError.value = errMsg(err, 'โหลดงานจัดส่งไม่สำเร็จ')
  }
}

const fetchEarnings = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/orders/rider/earnings`)
    earnings.value = { total_trips: data.total_trips || 0, total_earnings: data.total_earnings || 0, trips: data.trips || [] }
    // ตัดงานที่ไม่ใช่สถานะค้างนำส่งออกจากรายการที่เลือกไว้
    const pendingIds = new Set(cashPending.value.map((t) => t.delivery_id))
    selectedCashIds.value = selectedCashIds.value.filter((id) => pendingIds.has(id))
  } catch (e) {}
}

const fetchFeeSettings = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/settings`)
    feeSettings.value = data
  } catch (e) {}
}

const submitCash = async () => {
  const ids = [...selectedCashIds.value]
  if (!ids.length) return
  const total = cashPending.value.filter((t) => ids.includes(t.delivery_id)).reduce((s, t) => s + Number(t.cash_amount || 0), 0)
  const res = await showConfirm('ยืนยันนำส่งเงินสด?', `นำส่งเงินสด ${ids.length} งาน ยอดรวม ฿${money(total)} ให้ร้าน`)
  if (!res.isConfirmed) return
  busy.value = true
  try {
    await axios.patch(`${API_BASE}/deliveries/cash/submit`, { delivery_ids: ids })
    selectedCashIds.value = []
    await fetchEarnings()
    showSuccess('แจ้งนำส่งเงินแล้ว', 'รอแอดมินยืนยันรับเงิน')
  } catch (err) {
    showError('นำส่งเงินไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
    await fetchEarnings()
  } finally {
    busy.value = false
  }
}

let initialized = false
const refresh = async () => {
  loading.value = true
  await Promise.all([fetchJobs(), fetchEarnings(), feeSettings.value ? null : fetchFeeSettings()])
  loading.value = false
  initialized = true
}

// ---------- actions ----------
const claim = async (order) => {
  busy.value = true
  try {
    await axios.post(`${API_BASE}/orders/${order.order_id}/claim-delivery`)
    detailOrder.value = null
    await fetchJobs()
    tab.value = 'mine'
    showSuccess('รับงานสำเร็จ', `ออเดอร์ #${order.order_id} — ไปรับอาหารที่ครัวได้เลย`)
  } catch (err) {
    showWarning('รับงานไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
    await fetchJobs()
  } finally {
    busy.value = false
  }
}

const release = async () => {
  if (!myJob.value) return
  const res = await showConfirm('คืนงานนี้?', `ออเดอร์ #${myJob.value.order_id} จะกลับไปให้ไรเดอร์คนอื่นรับ`)
  if (!res.isConfirmed) return
  busy.value = true
  try {
    await axios.post(`${API_BASE}/orders/${myJob.value.order_id}/release-delivery`)
    await fetchJobs()
    tab.value = 'available'
  } catch (err) {
    showError('คืนงานไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    busy.value = false
  }
}

const pickUp = async () => {
  busy.value = true
  try {
    await axios.patch(`${API_BASE}/orders/${myJob.value.order_id}/delivery-status`, { status: 'PICKED_UP' })
    await fetchJobs()
  } catch (err) {
    showError('อัปเดตสถานะไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    busy.value = false
  }
}

// อัปโหลดรูปหลักฐาน -> แนบ URL ไปกับสถานะ DELIVERED (ลูกค้าเห็นรูปในหน้าติดตามออเดอร์)
const confirmDelivered = async (photoFile) => {
  const job = myJob.value
  if (!job) return
  busy.value = true
  proofError.value = ''
  try {
    const form = new FormData()
    form.append('file', photoFile)
    const up = await axios.post(`${API_BASE}/orders/${job.order_id}/delivery-proof`, form)
    const proofUrl = up.data?.url || null
    await axios.patch(`${API_BASE}/orders/${job.order_id}/delivery-status`, { status: 'DELIVERED', proof_image_url: proofUrl })

    const deliv = job.delivery || {}
    deliverySummary.value = {
      orderId: job.order_id,
      fee: Number(deliv.rider_fee || 0),
      distanceKm: Number(deliv.distance_km) || null,
      minutes: deliv.assigned_at ? Math.max(1, Math.round((Date.now() - new Date(deliv.assigned_at).getTime()) / 60000)) : null,
      proofUrl,
      rating: null,
      comment: ''
    }
    isPhotoModalOpen.value = false
    await refresh()
  } catch (err) {
    proofError.value = errMsg(err, 'ยืนยันการส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  } finally {
    busy.value = false
  }
}

const closeSuccess = () => {
  deliverySummary.value = null
  tab.value = 'available'
}

const sendChat = async (msg) => {
  const ok = await chat.sendMessage(msg)
  if (!ok) showWarning('ส่งข้อความไม่สำเร็จ', 'กรุณาลองใหม่')
}

// ลูกค้ารีวิวออเดอร์ที่เพิ่งส่ง -> แสดงคะแนนในหน้าส่งสำเร็จ
const onOrderReviewed = (review) => {
  if (!review || !deliverySummary.value || String(review.order_id) !== String(deliverySummary.value.orderId)) return
  deliverySummary.value = { ...deliverySummary.value, rating: review.rating, comment: review.review_comment || '' }
}

const onOrderEvent = (order) => {
  if (!order || (order.order_type && order.order_type !== 'DELIVERY')) return
  fetchJobs()
}

let pollTimer = null
onMounted(() => {
  refresh()
  socket.on('order_status_updated', onOrderEvent)
  socket.on('new_order', onOrderEvent)
  socket.on('order_reviewed', onOrderReviewed)
  // สำรองกรณี WebSocket หลุด
  pollTimer = setInterval(fetchJobs, 15000)
})

onUnmounted(() => {
  socket.off('order_status_updated', onOrderEvent)
  socket.off('new_order', onOrderEvent)
  socket.off('order_reviewed', onOrderReviewed)
  clearInterval(pollTimer)
})
</script>
