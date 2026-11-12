<template>
  <section class="space-y-4">
    <!-- หัวข้อ + ตัวเลือกช่วงเวลา -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">💰 สรุปการเงิน</h2>
        <p class="text-[11px] text-slate-500">{{ rangeLabel }} • นับเฉพาะรายการชำระสำเร็จ</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- ช่วงเวลาตามวันที่ที่เลือกจากแถบด้านบนของหน้าภาพรวม -->
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold">ตามวันที่ที่เลือกด้านบน</span>
        <button @click="loadAll" :disabled="loading" title="รีเฟรชข้อมูล" class="px-3 py-1.5 rounded-lg border border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-50">
          {{ loading ? 'กำลังโหลด…' : '🔄' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">{{ error }}</p>

    <!-- การ์ดยอดเงินแยกช่องทาง -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="c in channelCards" :key="c.key" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>{{ c.icon }} {{ c.label }}</span>
          <span v-if="c.share !== null" class="font-bold" :style="{ color: c.color }">{{ c.share }}%</span>
        </div>
        <p class="text-xl font-black text-slate-900 mt-1">฿{{ money(c.value) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- กราฟสัดส่วน + รายช่วง -->
      <div class="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 class="text-xs font-bold text-slate-700 mb-2">สัดส่วนรายรับตามช่องทาง</h3>
          <div class="h-4 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              v-for="c in channelCards.slice(1)"
              :key="c.key"
              :style="{ width: (c.share || 0) + '%', backgroundColor: c.color }"
              :title="`${c.label} ${c.share}%`"
            ></div>
          </div>
          <div class="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-600">
            <span v-for="c in channelCards.slice(1)" :key="c.key" class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: c.color }"></span>{{ c.label }}
            </span>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-bold text-slate-700">รายรับ / กำไรสุทธิ รายช่วง</h3>
            <div class="flex gap-3 text-[11px] text-slate-500">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-[#2d5a43]"></span>รายรับ</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>กำไรสุทธิ</span>
            </div>
          </div>
          <p v-if="!breakdown.length" class="text-xs text-slate-400 py-6 text-center">ไม่มีข้อมูลในช่วงนี้</p>
          <div v-else class="flex items-end gap-1.5 h-40 overflow-x-auto pb-5 relative">
            <div
              v-for="b in breakdown"
              :key="b.period"
              class="flex-1 min-w-[22px] h-full flex flex-col justify-end items-center relative group"
            >
              <div class="w-full flex items-end justify-center gap-0.5 h-full">
                <div class="w-1/2 bg-[#2d5a43] rounded-t" :style="{ height: barHeight(b.revenue) }"></div>
                <div class="w-1/2 rounded-t" :class="b.net_profit >= 0 ? 'bg-amber-400' : 'bg-rose-400'" :style="{ height: barHeight(Math.abs(b.net_profit)) }"></div>
              </div>
              <span class="absolute -bottom-5 text-[9px] text-slate-400 whitespace-nowrap">{{ shortPeriod(b.period) }}</span>
              <div class="hidden group-hover:block absolute bottom-full mb-1 z-10 bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap">
                {{ b.period }}<br />รายรับ ฿{{ money(b.revenue) }}<br />กำไร ฿{{ money(b.net_profit) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- สรุปกำไรสุทธิ -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs space-y-2">
        <h3 class="font-bold text-slate-700">สรุปกำไรสุทธิ</h3>
        <div class="flex justify-between"><span>รายรับรวม</span><b class="text-slate-900">฿{{ money(fin.total_revenue) }}</b></div>
        <div class="flex justify-between text-rose-600"><span>− ค่าวัตถุดิบ</span><span>฿{{ money(fin.total_ingredients) }}</span></div>
        <div class="flex justify-between text-rose-600"><span>− ค่าไรเดอร์</span><span>฿{{ money(fin.total_rider_fee) }}</span></div>
        <div class="flex justify-between text-rose-600"><span>− ค่าน้ำมัน</span><span>฿{{ money(fin.total_fuel) }}</span></div>
        <div class="flex justify-between text-rose-600"><span>− ค่าธรรมเนียม Stripe</span><span>฿{{ money(fin.total_stripe_fee) }}</span></div>
        <div class="border-t border-slate-200 pt-2 flex justify-between items-baseline">
          <span class="font-bold">กำไรสุทธิ</span>
          <span class="text-xl font-black" :class="Number(fin.net_profit) >= 0 ? 'text-emerald-700' : 'text-rose-600'">฿{{ money(fin.net_profit) }}</span>
        </div>
        <p class="text-[10px] text-slate-400 text-right">อัตรากำไร {{ Number(fin.profit_margin_percentage || 0).toFixed(1) }}%</p>
      </div>
    </div>

    <!-- การ์ดรายจ่าย -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- ค่าไรเดอร์ -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <p class="text-slate-500 font-semibold">🛵 ค่าไรเดอร์รวม</p>
        <p class="text-xl font-black text-slate-900">฿{{ money(fin.total_rider_fee) }}</p>
        <p class="text-slate-500">{{ riderTotals.rounds }} รอบ • เงินสดค้างกับไรเดอร์ <b class="text-amber-700">฿{{ money(cashOutstanding) }}</b></p>
      </div>

      <!-- ค่าวัตถุดิบ -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div class="flex items-center justify-between">
          <p class="text-slate-500 font-semibold">🥬 ค่าวัตถุดิบ</p>
          <router-link to="/admin/inventory" class="text-[#2d5a43] font-bold hover:underline">สั่งเพิ่ม →</router-link>
        </div>
        <p class="text-xl font-black text-slate-900">฿{{ money(fin.total_ingredients) }}</p>
        <ul class="mt-2 space-y-1">
          <li v-for="p in purchases.slice(0, 4)" :key="p.purchase_id" class="flex justify-between text-slate-600">
            <span class="truncate">{{ p.ingredient_name }} {{ qty(p.quantity) }} {{ p.unit }}</span>
            <span class="shrink-0">฿{{ money(p.total_price) }}</span>
          </li>
          <li v-if="!purchases.length" class="text-slate-400">ยังไม่มีการสั่งซื้อในช่วงนี้</li>
        </ul>
      </div>

      <!-- ค่าน้ำมัน -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs space-y-2">
        <p class="text-slate-500 font-semibold">⛽ ค่าน้ำมันรถร้าน</p>
        <p class="text-xl font-black text-slate-900">฿{{ money(fin.total_fuel) }}</p>
        <p v-if="fuelSummary" class="text-slate-500">
          บันทึกแล้ว {{ fuelSummary.recorded_days }} วัน
          <template v-if="fuelSummary.unrecorded_days"> • ประมาณอัตโนมัติ {{ fuelSummary.unrecorded_days }} วัน</template>
        </p>
      </div>
    </div>

    <!-- รอยืนยันรับเงินสด -->
    <div class="bg-white rounded-2xl border shadow-sm text-xs" :class="pendingCash.length ? 'border-amber-300' : 'border-slate-200/80'">
      <div class="p-4 flex items-center justify-between gap-3">
        <h3 class="font-bold text-slate-800">
          💵 รอยืนยันรับเงินสดจากไรเดอร์
          <span v-if="pendingCash.length" class="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">{{ pendingCash.length }}</span>
        </h3>
        <span class="text-slate-500">รวม <b class="text-amber-700">฿{{ money(pendingCashTotal) }}</b></span>
      </div>
      <p v-if="!pendingCash.length" class="px-4 pb-4 text-slate-400">ไม่มีรายการรอยืนยัน</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="p-3">ออเดอร์</th>
              <th class="p-3">ไรเดอร์</th>
              <th class="p-3">นำส่งเมื่อ</th>
              <th class="p-3 text-right">ยอดเงินสด</th>
              <th class="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="d in pendingCash" :key="d.delivery_id">
              <td class="p-3 font-bold">#{{ d.order_id }}</td>
              <td class="p-3">{{ riderName(d.rider_id) }}</td>
              <td class="p-3 text-slate-500">{{ fmtDate(d.cash_submitted_at) }}</td>
              <td class="p-3 text-right font-bold">฿{{ money(d.cash_amount) }}</td>
              <td class="p-3 text-right whitespace-nowrap">
                <button @click="confirmCash(d)" :disabled="cashBusy" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50">ยืนยันรับเงิน</button>
                <button @click="rejectCash(d)" :disabled="cashBusy" class="ml-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 font-bold disabled:opacity-50">ปฏิเสธ</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ตารางรายไรเดอร์ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
      <h3 class="p-4 font-bold text-slate-800">🛵 สรุปรายไรเดอร์ ({{ rangeLabel }})</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="p-3">ไรเดอร์</th>
              <th class="p-3 text-right">จำนวนรอบ</th>
              <th class="p-3 text-right">ค่ารอบรวม</th>
              <th class="p-3 text-right">ค้างนำส่ง</th>
              <th class="p-3 text-right">รอยืนยัน</th>
              <th class="p-3 text-right">ยืนยันแล้ว</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in riders" :key="r.rider_id">
              <td class="p-3"><b>{{ r.rider_name }}</b> <span class="text-slate-400">{{ r.phone }}</span></td>
              <td class="p-3 text-right">{{ r.total_rounds }}</td>
              <td class="p-3 text-right font-bold">฿{{ money(r.total_fee) }}</td>
              <td class="p-3 text-right" :class="r.cash_pending ? 'text-amber-700 font-bold' : 'text-slate-400'">฿{{ money(r.cash_pending) }}</td>
              <td class="p-3 text-right" :class="r.cash_submitted ? 'text-blue-700 font-bold' : 'text-slate-400'">฿{{ money(r.cash_submitted) }}</td>
              <td class="p-3 text-right text-slate-600">฿{{ money(r.cash_confirmed) }}</td>
            </tr>
            <tr v-if="!riders.length"><td colspan="6" class="p-4 text-center text-slate-400">ยังไม่มีข้อมูลไรเดอร์</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { socket } from '../../config/socket'
import { showSuccess, showError, showConfirm } from '../../utils/swal'

// วันที่มาจากตัวเลือกวันที่ด้านบนของหน้าภาพรวม (AdminDashboard) เพื่อให้ทุกส่วนในหน้าเปลี่ยนพร้อมกัน
const props = defineProps({
  date: { type: String, default: '' }
})

const ymd = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
const todayStr = () => ymd(new Date())

const range = computed(() => {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(props.date) ? props.date : todayStr()
  return { from: day, to: day, group: 'day' }
})

const thaiDate = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
const rangeLabel = computed(() => {
  const { from, to } = range.value
  return from === to ? thaiDate(from) : `${thaiDate(from)} – ${thaiDate(to)}`
})

// ---------- ข้อมูล ----------
const loading = ref(false)
const error = ref('')
const fin = ref({})
const riders = ref([])
const deliveries = ref([])
const purchases = ref([])
const fuelSummary = ref(null)

const money = (v) => {
  const n = Number(v || 0)
  return n.toLocaleString('th-TH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })
}
const qty = (v) => Number(v || 0).toLocaleString('th-TH', { maximumFractionDigits: 2 })
const fmtDate = (d) => (d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-')
const errMsg = (err, fallback) => {
  const m = err?.response?.data?.message
  return (Array.isArray(m) ? m.join(', ') : m) || fallback
}

const breakdown = computed(() => fin.value.breakdown || [])
const maxBar = computed(() => Math.max(1, ...breakdown.value.map((b) => Math.max(Number(b.revenue || 0), Math.abs(Number(b.net_profit || 0))))))
const barHeight = (v) => `${Math.max(2, (Number(v || 0) / maxBar.value) * 100)}%`
const shortPeriod = (p) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return String(Number(p.slice(8, 10)))
  if (/^\d{4}-\d{2}$/.test(p)) return new Date(`${p}-01T00:00:00`).toLocaleDateString('th-TH', { month: 'short' })
  return p.replace(/^\d{4}-/, '')
}

const channelCards = computed(() => {
  const total = Number(fin.value.total_revenue || 0)
  const share = (v) => (total > 0 ? Math.round((Number(v || 0) / total) * 100) : 0)
  return [
    { key: 'total', label: 'ยอดรวม', icon: '💰', value: total, share: null, color: '#0f172a' },
    { key: 'card', label: 'บัตร', icon: '💳', value: fin.value.revenue_card, share: share(fin.value.revenue_card), color: '#6366f1' },
    { key: 'promptpay', label: 'พร้อมเพย์', icon: '📱', value: fin.value.revenue_promptpay, share: share(fin.value.revenue_promptpay), color: '#0ea5e9' },
    { key: 'cash', label: 'เงินสด', icon: '💵', value: fin.value.revenue_cash, share: share(fin.value.revenue_cash), color: '#f59e0b' }
  ]
})

const riderTotals = computed(() => ({ rounds: riders.value.reduce((s, r) => s + Number(r.total_rounds || 0), 0) }))
const riderName = (id) => riders.value.find((r) => r.rider_id === id)?.rider_name || `ไรเดอร์ #${id}`

// เงินสดที่ยังไม่ถึงมือร้าน (ค้างนำส่ง + รอยืนยัน) ทุกช่วงเวลา
const cashOf = (status) => deliveries.value.filter((d) => (d.cash_status || '').toUpperCase() === status)
const pendingCash = computed(() => cashOf('SUBMITTED'))
const pendingCashTotal = computed(() => pendingCash.value.reduce((s, d) => s + Number(d.cash_amount || 0), 0))
const cashOutstanding = computed(() =>
  [...cashOf('PENDING'), ...cashOf('SUBMITTED')].reduce((s, d) => s + Number(d.cash_amount || 0), 0)
)

const loadFinance = async () => {
  const { from, to, group } = range.value
  const [f, r, p, fs] = await Promise.allSettled([
    axios.get(`${API_BASE}/reports/finance`, { params: { from, to, group } }),
    axios.get(`${API_BASE}/reports/riders`, { params: { from, to } }),
    axios.get(`${API_BASE}/ingredients/purchases`, { params: { from, to } }),
    axios.get(`${API_BASE}/expenses/fuel/summary`, { params: { from, to } })
  ])
  if (f.status === 'fulfilled') fin.value = f.value.data || {}
  else error.value = errMsg(f.reason, 'โหลดรายงานการเงินไม่สำเร็จ')
  if (r.status === 'fulfilled') riders.value = Array.isArray(r.value.data) ? r.value.data : []
  if (p.status === 'fulfilled') purchases.value = Array.isArray(p.value.data) ? p.value.data : []
  if (fs.status === 'fulfilled') fuelSummary.value = fs.value.data || null
}

const loadCash = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/orders`, { params: { orderType: 'DELIVERY' } })
    deliveries.value = (Array.isArray(data) ? data : []).map((o) => o.delivery).filter(Boolean)
  } catch (e) {}
}

const loadAll = async () => {
  loading.value = true
  error.value = ''
  await Promise.all([loadFinance(), loadCash()])
  loading.value = false
}

const cashBusy = ref(false)
const confirmCash = async (d) => {
  const res = await showConfirm('ยืนยันรับเงินสด?', `ออเดอร์ #${d.order_id} • ${riderName(d.rider_id)} • ฿${money(d.cash_amount)}`)
  if (!res.isConfirmed) return
  cashBusy.value = true
  try {
    await axios.patch(`${API_BASE}/deliveries/${d.delivery_id}/cash/confirm`)
    await Promise.all([loadCash(), loadFinance()])
  } catch (err) {
    showError('ยืนยันไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    cashBusy.value = false
  }
}
const rejectCash = async (d) => {
  const res = await showConfirm('ปฏิเสธการนำส่ง?', `ยอดไม่ครบ — ออเดอร์ #${d.order_id} จะกลับเป็น "ค้างนำส่ง" ให้ไรเดอร์`)
  if (!res.isConfirmed) return
  cashBusy.value = true
  try {
    await axios.patch(`${API_BASE}/deliveries/${d.delivery_id}/cash/reject`)
    await Promise.all([loadCash(), loadFinance()])
  } catch (err) {
    showError('ปฏิเสธไม่สำเร็จ', errMsg(err, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    cashBusy.value = false
  }
}

// ไรเดอร์กดนำส่งเงิน -> แจ้งเตือนและโหลดรายการใหม่
const onCashSubmitted = (payload) => {
  loadCash()
  loadFinance()
  if (payload?.count) {
    showSuccess('ไรเดอร์แจ้งนำส่งเงินสด', `${riderName(payload.rider_id)} • ${payload.count} งาน • ฿${money(payload.total_cash_amount)}`)
  }
}
const onOrderUpdated = () => loadCash()

watch(range, () => {
  loading.value = true
  error.value = ''
  loadFinance().finally(() => (loading.value = false))
})

let timer = null
onMounted(() => {
  loadAll()
  socket.on('cash_submitted', onCashSubmitted)
  socket.on('order_status_updated', onOrderUpdated)
  timer = setInterval(loadCash, 30000)
})
onBeforeUnmount(() => {
  socket.off('cash_submitted', onCashSubmitted)
  socket.off('order_status_updated', onOrderUpdated)
  clearInterval(timer)
})
</script>
