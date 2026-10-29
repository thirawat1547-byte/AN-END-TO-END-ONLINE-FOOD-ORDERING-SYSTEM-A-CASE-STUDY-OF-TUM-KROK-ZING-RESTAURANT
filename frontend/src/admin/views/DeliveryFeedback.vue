<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { API_BASE, assetUrl } from '../../config/api'
import { socket } from '../../config/socket'

// ================= รูปหลักฐานการจัดส่ง & รีวิวจากลูกค้า =================
const orders = ref([])
const summary = ref({ total_reviews: 0, average_rating: 0, total_proofs: 0, distribution: [] })
const isLoading = ref(false)
const loadError = ref('')
const activeTab = ref('all')
const ratingFilter = ref(0)
const searchQuery = ref('')
const previewOrder = ref(null)

const fetchFeedback = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    const res = await axios.get(`${API_BASE}/orders/admin/feedback`)
    orders.value = Array.isArray(res.data?.orders) ? res.data.orders : []
    summary.value = res.data?.summary || summary.value
  } catch (e) {
    loadError.value = 'โหลดข้อมูลรีวิวและรูปหลักฐานไม่สำเร็จ'
    console.warn('โหลดข้อมูลรีวิว/รูปหลักฐานไม่สำเร็จ:', e)
  } finally {
    isLoading.value = false
  }
}

const customerName = (o) => o.delivery?.customer_name || o.user?.username || 'ลูกค้าทั่วไป'
const riderName = (o) => o.delivery?.rider?.username || (o.delivery?.rider_id ? `ไรเดอร์ #${o.delivery.rider_id}` : '-')
const proofUrl = (o) => assetUrl(o.delivery?.proof_image_url)
const formatDate = (v) => (v ? new Date(v).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-')

const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return orders.value.filter((o) => {
    if (activeTab.value === 'reviews' && !o.rating) return false
    if (activeTab.value === 'proofs' && !o.delivery?.proof_image_url) return false
    if (activeTab.value === 'low' && !(o.rating && o.rating <= 2)) return false
    if (ratingFilter.value && o.rating !== ratingFilter.value) return false
    if (!q) return true
    return [String(o.order_id), customerName(o), riderName(o), o.review_comment || '']
      .some((s) => s.toLowerCase().includes(q))
  })
})

const maxDistribution = computed(() => Math.max(1, ...summary.value.distribution.map((d) => d.count)))
const lowRatingCount = computed(() => orders.value.filter((o) => o.rating && o.rating <= 2).length)

const tabs = computed(() => [
  { key: 'all', label: 'ทั้งหมด', count: orders.value.length },
  { key: 'reviews', label: 'มีรีวิว', count: summary.value.total_reviews },
  { key: 'proofs', label: 'มีรูปหลักฐาน', count: summary.value.total_proofs },
  { key: 'low', label: 'คะแนนต่ำ (1-2 ดาว)', count: lowRatingCount.value }
])

// อัปเดตทันทีเมื่อลูกค้ารีวิว หรือไรเดอร์ส่งงานสำเร็จพร้อมรูป
const handleRealtime = (payload) => {
  const st = (payload?.status || '').toUpperCase()
  if (payload?.rating !== undefined || st === 'COMPLETED') fetchFeedback()
}

onMounted(() => {
  fetchFeedback()
  socket.on('order_reviewed', handleRealtime)
  socket.on('order_status_updated', handleRealtime)
})

onUnmounted(() => {
  socket.off('order_reviewed', handleRealtime)
  socket.off('order_status_updated', handleRealtime)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">รูปหลักฐานการจัดส่ง & รีวิวลูกค้า</h1>
        <p class="text-xs text-slate-500">รูปที่ไรเดอร์ถ่ายตอนส่งมอบ และคะแนนรีวิวที่ลูกค้าให้กับแต่ละออเดอร์</p>
      </div>
      <button
        @click="fetchFeedback"
        class="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl shadow-sm"
      >
        🔄 รีเฟรชข้อมูล
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="text-xs text-slate-500">คะแนนเฉลี่ย</div>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-3xl font-black text-amber-500">{{ summary.average_rating ? summary.average_rating.toFixed(2) : '-' }}</span>
          <span class="text-sm text-slate-400 mb-1">/ 5</span>
        </div>
        <div class="text-[11px] text-slate-500 mt-1">จาก {{ summary.total_reviews }} รีวิว</div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="text-xs text-slate-500 mb-2">การกระจายคะแนน</div>
        <div v-for="d in [...summary.distribution].reverse()" :key="d.star" class="flex items-center gap-2 text-[11px] mb-1">
          <button
            class="w-10 text-left font-semibold hover:text-amber-600"
            :class="ratingFilter === d.star ? 'text-amber-600' : 'text-slate-600'"
            @click="ratingFilter = ratingFilter === d.star ? 0 : d.star"
          >{{ d.star }} ★</button>
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" :style="{ width: `${(d.count / maxDistribution) * 100}%` }"></div>
          </div>
          <span class="w-6 text-right text-slate-500">{{ d.count }}</span>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="text-xs text-slate-500">รูปหลักฐานการจัดส่ง</div>
        <div class="text-3xl font-black text-[#2d5a43] mt-1">{{ summary.total_proofs }}</div>
        <div class="text-[11px] text-slate-500 mt-1">ออเดอร์ที่ไรเดอร์แนบรูปส่งมอบแล้ว</div>
        <div v-if="lowRatingCount > 0" class="mt-2 text-[11px] font-semibold text-rose-600">
          ⚠️ มี {{ lowRatingCount }} รีวิวคะแนนต่ำที่ควรตรวจสอบ
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-slate-100">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in tabs"
            :key="t.key"
            @click="activeTab = t.key"
            class="text-xs font-semibold px-3 py-1.5 rounded-full border transition"
            :class="activeTab === t.key ? 'bg-[#2d5a43] text-white border-[#2d5a43]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          >
            {{ t.label }} <span class="opacity-70">({{ t.count }})</span>
          </button>
          <button
            v-if="ratingFilter"
            @click="ratingFilter = 0"
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
          >
            {{ ratingFilter }} ★ ✕
          </button>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาเลขออเดอร์ / ลูกค้า / ไรเดอร์ / คำรีวิว"
          class="text-xs border border-slate-200 rounded-xl px-3 py-2 w-full lg:w-72 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div v-if="isLoading && orders.length === 0" class="p-10 text-center text-sm text-slate-500">กำลังโหลดข้อมูล...</div>
      <div v-else-if="loadError" class="p-10 text-center text-sm text-rose-600">{{ loadError }}</div>
      <div v-else-if="filteredOrders.length === 0" class="p-10 text-center text-sm text-slate-500">
        ยังไม่มีรายการที่ตรงกับตัวกรองนี้
      </div>

      <!-- Feedback Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        <div
          v-for="o in filteredOrders"
          :key="o.order_id"
          class="rounded-2xl border overflow-hidden flex flex-col"
          :class="o.rating && o.rating <= 2 ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-white'"
        >
          <button
            v-if="proofUrl(o)"
            class="block h-40 bg-slate-100 overflow-hidden"
            @click="previewOrder = o"
            title="ดูรูปขนาดเต็ม"
          >
            <img :src="proofUrl(o)" alt="รูปหลักฐานการจัดส่ง" class="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
          </button>
          <div v-else class="h-12 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">
            ไม่มีรูปหลักฐาน ({{ o.order_type === 'DELIVERY' ? 'ยังไม่ได้แนบ' : 'ไม่ใช่เดลิเวอรี' }})
          </div>

          <div class="p-4 flex-1 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-slate-900">#TKZ-{{ o.order_id }}</span>
              <span class="text-[10px] text-slate-500">{{ formatDate(o.delivery?.delivered_at || o.created_at) }}</span>
            </div>

            <div class="text-[11px] text-slate-600 space-y-0.5">
              <div>👤 ลูกค้า: <b>{{ customerName(o) }}</b></div>
              <div>🛵 ไรเดอร์: {{ riderName(o) }}</div>
              <div v-if="o.delivery_address" class="line-clamp-1">📍 {{ o.delivery_address }}</div>
              <div>💰 ยอด ฿{{ Number(o.total_price).toLocaleString() }}</div>
            </div>

            <div class="mt-auto pt-2 border-t border-slate-100">
              <template v-if="o.rating">
                <div class="flex items-center gap-1">
                  <span v-for="s in 5" :key="s" class="text-base" :class="s <= o.rating ? 'text-amber-400' : 'text-slate-200'">★</span>
                  <span class="text-[10px] text-slate-400 ml-1">{{ formatDate(o.reviewed_at) }}</span>
                </div>
                <p v-if="o.review_comment" class="text-[11px] text-slate-700 mt-1 whitespace-pre-line">"{{ o.review_comment }}"</p>
              </template>
              <p v-else class="text-[11px] text-slate-400">ลูกค้ายังไม่ได้รีวิว</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full-size Photo Preview -->
    <div
      v-if="previewOrder"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      @click.self="previewOrder = null"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div class="text-sm font-bold text-slate-800">
            รูปหลักฐาน #TKZ-{{ previewOrder.order_id }} • {{ customerName(previewOrder) }}
          </div>
          <button class="text-slate-400 hover:text-slate-600 text-lg" @click="previewOrder = null">✕</button>
        </div>
        <img :src="proofUrl(previewOrder)" alt="รูปหลักฐานการจัดส่ง" class="w-full max-h-[75vh] object-contain bg-slate-900" />
        <div class="px-4 py-2 text-[11px] text-slate-500 flex justify-between">
          <span>ส่งมอบเมื่อ {{ formatDate(previewOrder.delivery?.delivered_at) }} โดย {{ riderName(previewOrder) }}</span>
          <a :href="proofUrl(previewOrder)" target="_blank" rel="noopener" class="text-emerald-700 font-semibold hover:underline">เปิดไฟล์ต้นฉบับ ↗</a>
        </div>
      </div>
    </div>
  </div>
</template>
