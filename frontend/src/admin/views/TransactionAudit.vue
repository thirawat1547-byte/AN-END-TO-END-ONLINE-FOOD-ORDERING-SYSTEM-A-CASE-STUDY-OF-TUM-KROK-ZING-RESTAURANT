<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { adminStore } from '../store/adminData'
import { API_BASE } from '../../config/api'
import { showSuccess, showError, showConfirm } from '../../utils/swal'

// ================= ตรวจสอบยอดโอนพร้อมเพย์ (แอดมินยืนยันเอง) =================
const pendingPromptPay = ref([])
const isLoadingPending = ref(false)
const verifyingId = ref(null)
let pendingTimer = null

const authHeaders = () => {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchPendingPromptPay = async () => {
  isLoadingPending.value = true
  try {
    const res = await axios.get(`${API_BASE}/transactions/promptpay/pending`, { headers: authHeaders() })
    pendingPromptPay.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.warn('โหลดรายการรอตรวจสอบยอดโอนไม่สำเร็จ:', e)
  } finally {
    isLoadingPending.value = false
  }
}

const formatBaht = (v) => Number(v || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const verifyTransfer = async (txn, approve) => {
  const amount = formatBaht(txn.amount)
  const title = approve ? 'ยืนยันว่าเงินเข้าแล้ว?' : 'ปฏิเสธรายการนี้?'
  const text = approve
    ? `ตรวจสอบในแอปธนาคารแล้วว่ามียอดโอน ฿${amount} ของออเดอร์ #${txn.order_id} เข้าบัญชีร้านจริง`
    : `ไม่พบยอดโอน ฿${amount} ของออเดอร์ #${txn.order_id} ในบัญชีร้าน — ระบบจะยกเลิกออเดอร์นี้และแจ้งครัวให้หยุดทำอาหาร`
  const result = await showConfirm(title, text)
  if (!result?.isConfirmed) return

  verifyingId.value = txn.transaction_id
  try {
    const res = await axios.patch(
      `${API_BASE}/transactions/${txn.transaction_id}/verify`,
      { approve },
      { headers: authHeaders() }
    )
    const detail = approve
      ? `ออเดอร์ #${txn.order_id}`
      : (res.data?.order_cancelled
          ? `ยกเลิกออเดอร์ #${txn.order_id} และแจ้งครัวแล้ว`
          : `ออเดอร์ #${txn.order_id} (ออเดอร์นี้จบไปแล้ว จึงไม่ได้ยกเลิก)`)
    await showSuccess(approve ? 'ยืนยันการชำระเงินแล้ว' : 'ปฏิเสธรายการแล้ว', detail)
    await fetchPendingPromptPay()
    if (typeof adminStore.fetchOrdersFromAPI === 'function') await adminStore.fetchOrdersFromAPI()
    if (typeof adminStore.fetchReceiptsFromView === 'function') await adminStore.fetchReceiptsFromView()
  } catch (e) {
    const msg = e.response?.data?.message || 'ไม่สามารถบันทึกผลการตรวจสอบได้'
    await showError('เกิดข้อผิดพลาด', Array.isArray(msg) ? msg.join(', ') : msg)
  } finally {
    verifyingId.value = null
  }
}

onMounted(() => {
  fetchPendingPromptPay()
  pendingTimer = setInterval(fetchPendingPromptPay, 15000) // รีเฟรชทุก 15 วินาที
})
onUnmounted(() => {
  if (pendingTimer) clearInterval(pendingTimer)
})

// ดึงข้อมูลออเดอร์และใบเสร็จจาก Database View ล่าสุดทันทีที่เปิดหน้าเว็บ
onMounted(async () => {
  if (typeof adminStore.fetchOrdersFromAPI === 'function') {
    await adminStore.fetchOrdersFromAPI()
  }
  if (typeof adminStore.fetchReceiptsFromView === 'function') {
    await adminStore.fetchReceiptsFromView()
  }
})

const selectedStatus = ref('All')
const searchQuery = ref('')
const selectedOrder = ref(null)
const slipModalUrl = ref(null)

const isCompletedOrder = (o) => {
  const pStatus = (o.payment_status || '').toUpperCase()
  const status = (o.status || '').toUpperCase()
  const rawStatus = (o.raw_status || '').toUpperCase()
  return pStatus === 'COMPLETED' || pStatus === 'PAID' || status === 'COMPLETED' || status === 'PAID' || rawStatus === 'PAID' || rawStatus === 'COMPLETED'
}

// แอดมินกด "ไม่พบยอด" (รายการโอนถูกปฏิเสธ) และยังไม่มีการชำระสำเร็จ
const isRejectedOrder = (o) => {
  return !isCompletedOrder(o) && (o.payment_status || '').toUpperCase() === 'REJECTED'
}

const isPendingOrder = (o) => {
  return !isCompletedOrder(o) && !isRejectedOrder(o)
}

const rejectedCount = computed(() => {
  return adminStore.orders.filter(o => isRejectedOrder(o)).length
})

const completedCount = computed(() => {
  return adminStore.orders.filter(o => isCompletedOrder(o)).length
})

const pendingCount = computed(() => {
  return adminStore.orders.filter(o => isPendingOrder(o)).length
})

const filteredOrders = computed(() => {
  return adminStore.orders.filter(o => {
    // 1. แสดงออเดอร์ตามสถานะหากอยู่หมวดหมู่นั้นๆ
    let matchStatus = true
    if (selectedStatus.value === 'Completed') {
      matchStatus = isCompletedOrder(o)
    } else if (selectedStatus.value === 'Pending') {
      matchStatus = isPendingOrder(o)
    } else if (selectedStatus.value === 'Rejected') {
      matchStatus = isRejectedOrder(o)
    }

    // 2. ค้นหาเฉพาะเลขที่ Order หรือช่องทางชำระ
    const q = (searchQuery.value || '').trim().toLowerCase()
    let matchSearch = true
    if (q) {
      const idStr = String(o.order_id || '').toLowerCase()
      const fullCode = `#ord-${idStr}`
      const ordCode = `ord-${idStr}`
      const hashId = `#${idStr}`
      const numOnly = q.replace(/[^0-9]/g, '')
      const payMethod = (o.payment_method || '').toLowerCase()
      const custName = (o.customer_name || '').toLowerCase()

      matchSearch = idStr.includes(q) ||
                    fullCode.includes(q) ||
                    ordCode.includes(q) ||
                    hashId.includes(q) ||
                    (numOnly !== '' && idStr.includes(numOnly)) ||
                    payMethod.includes(q) ||
                    custName.includes(q)
    }

    return matchStatus && matchSearch
  })
})

function viewSlip(url) {
  slipModalUrl.value = url
}

function viewOrderDetails(order) {
  selectedOrder.value = order
  console.log("📦 ข้อมูลออเดอร์ทั้งหมด:", order)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Print Only Official Header -->
    <div class="print-only hidden">
      <div style="border-bottom: 2px solid #183324; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: #183324; margin: 0;">ร้านตำครกซิ่ง - รายงานประวัติธุรกรรมและใบเสร็จรับเงิน</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">ข้อมูลเชื่อมโยงจากฐานข้อมูล TRANSACTION_RECEIPTS_VIEW</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #666;">
          <div>วันที่พิมพ์: {{ new Date().toLocaleString('th-TH') }}</div>
          <div>จำนวนรายการ: {{ filteredOrders.length }} รายการ</div>
        </div>
      </div>
    </div>

    <!-- Screen Header (ซ่อนเวลาพิมพ์) -->
    <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">ตรวจสอบการเงินและประวัติธุรกรรม (Transaction & Audit)</h1>
        <p class="text-xs text-slate-500">ข้อมูลเชื่อมต่อตรงจาก TRANSACTION_RECEIPTS_VIEW ในระบบฐานข้อมูล MySQL</p>
      </div>
      <div class="flex items-center gap-2">
        <a 
          :href="`${API_BASE}/reports/export-csv`"
          download="TumKrokZing_SalesReport.csv"
          class="px-3.5 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          title="ดาวน์โหลดไฟล์รายงาน Excel / CSV จากฐานข้อมูล"
        >
          <span>📊 ส่งออก Excel (CSV)</span>
        </a>
        <button 
          @click="adminStore.exportSalesPDF()"
          class="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          title="พิมพ์หรือบันทึกรายงานเป็นไฟล์ PDF"
        >
          <span>📄 บันทึกเป็น PDF</span>
        </button>
      </div>
    </div>

    <!-- รายการโอนพร้อมเพย์รอตรวจสอบ (ซ่อนเวลาพิมพ์) -->
    <div class="no-print bg-white p-4 rounded-2xl border-2 shadow-sm"
         :class="pendingPromptPay.length > 0 ? 'border-amber-300' : 'border-slate-200/80'">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📱</span> รอตรวจสอบยอดโอนพร้อมเพย์
            <span v-if="pendingPromptPay.length > 0" class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px]">
              {{ pendingPromptPay.length }}
            </span>
          </h2>
          <p class="text-xs text-slate-500">เปิดแอปธนาคารของร้าน เช็กว่ายอดเงินเข้าจริงก่อนกดยืนยัน</p>
        </div>
        <button @click="fetchPendingPromptPay" :disabled="isLoadingPending"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
          {{ isLoadingPending ? 'กำลังโหลด...' : '🔄 รีเฟรช' }}
        </button>
      </div>

      <div v-if="pendingPromptPay.length === 0" class="text-xs text-slate-400 py-2">
        ไม่มีรายการรอตรวจสอบ
      </div>

      <div v-else class="space-y-2">
        <div v-for="txn in pendingPromptPay" :key="txn.transaction_id"
             class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div class="text-xs text-slate-700 space-y-0.5">
            <div class="font-bold text-slate-900 text-sm">
              ออเดอร์ #{{ txn.order_id }}
              <span class="ml-1 text-[#2d5a43]">฿{{ formatBaht(txn.amount) }}</span>
            </div>
            <div>
              {{ txn.order?.table ? `โต๊ะ ${txn.order.table.table_number}` : 'เดลิเวอรี่/สั่งออนไลน์' }}
              <span v-if="txn.order?.delivery_phone"> · โทร {{ txn.order.delivery_phone }}</span>
              <span v-if="txn.order?.created_at"> · {{ new Date(txn.order.created_at).toLocaleString('th-TH') }}</span>
            </div>
            <div v-if="txn.order?.order_items?.length" class="text-slate-500">
              {{ txn.order.order_items.map(i => `${i.menu?.name || i.menu?.menu_name || 'เมนู'} x${i.quantity}`).join(', ') }}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button @click="verifyTransfer(txn, true)" :disabled="verifyingId === txn.transaction_id"
                    class="px-3 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white text-xs font-bold transition disabled:opacity-50">
              ✓ เงินเข้าแล้ว
            </button>
            <button @click="verifyTransfer(txn, false)" :disabled="verifyingId === txn.transaction_id"
                    class="px-3 py-2 rounded-xl bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50">
              ✕ ไม่พบยอด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar (ซ่อนเวลาพิมพ์) -->
    <div class="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
        <button 
          @click="selectedStatus = 'All'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'All' ? 'bg-[#183324] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ทั้งหมด ({{ adminStore.orders.length }})
        </button>
        <button 
          @click="selectedStatus = 'Completed'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Completed' ? 'bg-[#2d5a43] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ชำระแล้ว (Completed) ({{ completedCount }})
        </button>
        <button 
          @click="selectedStatus = 'Pending'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          รอชำระ (Pending) ({{ pendingCount }})
        </button>
        <button 
          @click="selectedStatus = 'Rejected'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Rejected' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ไม่พบยอดโอน ({{ rejectedCount }})
        </button>
      </div>

      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="ค้นหาเลข Order หรือช่องทางชำระ..."
          class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
        />
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
            <tr>
              <th class="p-4">รหัสออเดอร์ (ID)</th>
              <th class="p-4">วัน-เวลา</th>
              <th class="p-4">ประเภท/โต๊ะ</th>
              <th class="p-4">ช่องทางชำระเงิน</th>
              <th class="p-4">ส่วนลด</th>
              <th class="p-4">ยอดรวมสุทธิ</th>
              <th class="p-4">สถานะการชำระ</th>
              <th class="p-4 text-center no-print">สลิปโอน</th>
              <th class="p-4 text-right no-print">รายละเอียด</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="order in filteredOrders" 
              :key="order.order_id"
              class="hover:bg-slate-50/80 transition"
            >
              <td class="p-4 font-mono font-bold text-slate-900">#ORD-{{ order.order_id }}</td>
              <td class="p-4 text-slate-500">{{ order.created_at }}</td>
              <td class="p-4 font-medium">
                <span :class="order.order_type === 'In-store' ? 'text-amber-700' : 'text-blue-700'">
                  {{ order.order_type === 'In-store' ? `🍽️ ${order.table_id ? 'โต๊ะ T-0' + order.table_id : 'ทานที่ร้าน'}` : '🛵 สั่งกลับบ้าน' }}
                </span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  {{ order.payment_method }}
                </span>
              </td>
              <td class="p-4 text-amber-600 font-bold">
                {{ order.discount_applied > 0 ? `-฿${order.discount_applied}` : '-' }}
              </td>
              <td class="p-4 font-black text-sm text-slate-900">฿{{ order.total_price }}</td>
              <td class="p-4">
                <span 
                  :class="[
                    'px-2.5 py-1 rounded-md text-[10px] font-bold',
                    isCompletedOrder(order) ? 'bg-emerald-100 text-emerald-800' : (isRejectedOrder(order) ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800')
                  ]"
                >
                  {{ isCompletedOrder(order) ? '✅ ชำระแล้ว' : (isRejectedOrder(order) ? '❌ ไม่พบยอดโอน' : '⏳ รอชำระ') }}
                </span>
              </td>
              <td class="p-4 text-center no-print">
                <button 
                  v-if="order.payment_slip_url"
                  @click="viewSlip(order.payment_slip_url)"
                  class="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition"
                >
                  🖼️ ดูสลิป
                </button>
                <span v-else class="text-slate-300 text-[11px]">-</span>
              </td>
              <td class="p-4 text-right no-print">
                <button 
                  @click="viewOrderDetails(order)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                >
                  ดูบิล
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slip Viewer Modal -->
    <div v-if="slipModalUrl" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-sm text-slate-900">หลักฐานสลิปการโอนเงิน (Slip URL)</h3>
          <button @click="slipModalUrl = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img :src="slipModalUrl" alt="Payment Slip" class="w-full h-auto max-h-[380px] object-contain">
        </div>
        <button 
          @click="slipModalUrl = null"
          class="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>

    <!-- Order Receipt Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-base text-slate-900">ใบเสร็จ #ORD-{{ selectedOrder.order_id }}</h3>
            <p class="text-slate-400 text-[10px]">{{ selectedOrder.created_at }}</p>
          </div>
          <button @click="selectedOrder = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-2 max-h-60 overflow-y-auto">
          <!-- แสดงรายการอาหารที่มีอยู่จริง -->
          <div 
            v-for="(item, idx) in (selectedOrder.items || selectedOrder.cart_items || selectedOrder.products || [])" 
            :key="idx"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-50"
          >
            <div>
              <p class="font-bold text-slate-800">
                {{ item.menu_name || item.name || item.title || item.food_name || 'เมนูอาหาร' }} x{{ item.quantity || item.qty || 1 }}
              </p>
            </div>
            <span class="font-bold text-slate-900">฿{{ item.subtotal || ((item.price || 0) * (item.quantity || item.qty || 1)) }}</span>
          </div>

          <!-- กรณีออเดอร์ไม่มีข้อมูลรายการอาหารส่งมา ให้แสดงรายการจำลองตามยอดรวมสุทธิ -->
          <div v-if="!(selectedOrder.items || selectedOrder.cart_items || selectedOrder.products)?.length" class="p-3 rounded-lg bg-slate-50 text-center text-slate-500">
            <p class="font-bold">🍽️ ออเดอร์ทั่วไป (รายการรวม)</p>
            <p class="text-[10px] text-slate-400 mt-0.5">ยอดชำระสุทธิเต็มจำนวนตามบิล</p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 space-y-1">
          <div class="flex justify-between text-slate-500">
            <span>ส่วนลดโปรโมชัน ({{ selectedOrder.promo_code || '-' }}):</span>
            <span class="text-amber-600 font-bold">-฿{{ selectedOrder.discount_applied }}</span>
          </div>
          <div class="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-dashed">
            <span>ยอดรวมสุทธิ:</span>
            <span class="text-amber-600">฿{{ selectedOrder.total_price }}</span>
          </div>
        </div>

        <button 
          @click="selectedOrder = null"
          class="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  .print-only {
    display: block !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>