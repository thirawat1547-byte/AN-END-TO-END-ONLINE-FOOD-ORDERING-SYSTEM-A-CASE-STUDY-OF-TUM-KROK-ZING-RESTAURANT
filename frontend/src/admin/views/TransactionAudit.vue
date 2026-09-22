<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminStore } from '../store/adminData'
import { API_BASE } from '../../config/api'

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

<<<<<<< HEAD
const isCompletedOrder = (o) => {
  const pStatus = (o.payment_status || '').toUpperCase()
  const status = (o.status || '').toUpperCase()
  const rawStatus = (o.raw_status || '').toUpperCase()
  return pStatus === 'COMPLETED' || pStatus === 'PAID' || status === 'COMPLETED' || status === 'PAID' || rawStatus === 'PAID' || rawStatus === 'COMPLETED'
}

const isPendingOrder = (o) => {
  return !isCompletedOrder(o)
}

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
    }

    // 2. ค้นหาเฉพาะเลขที่ Order อย่างเดียว
    const q = (searchQuery.value || '').trim().toLowerCase()
    let matchSearch = true
    if (q) {
      const idStr = String(o.order_id || '').toLowerCase()
      const fullCode = `#ord-${idStr}`
      const ordCode = `ord-${idStr}`
      const hashId = `#${idStr}`
      const numOnly = q.replace(/[^0-9]/g, '')

      matchSearch = idStr.includes(q) ||
                    fullCode.includes(q) ||
                    ordCode.includes(q) ||
                    hashId.includes(q) ||
                    (numOnly !== '' && idStr.includes(numOnly))
    }

=======
const filteredOrders = computed(() => {
  return adminStore.orders.filter(o => {
    const matchStatus = selectedStatus.value === 'All' || o.payment_status === selectedStatus.value
    const matchSearch = String(o.order_id).includes(searchQuery.value) || 
                        (o.payment_method || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        (o.customer_name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
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
<<<<<<< HEAD
          ชำระแล้ว (Completed) ({{ completedCount }})
=======
          ชำระแล้ว (Completed)
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
        </button>
        <button 
          @click="selectedStatus = 'Pending'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
<<<<<<< HEAD
          รอชำระ (Pending) ({{ pendingCount }})
=======
          รอชำระ (Pending)
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
        </button>
      </div>

      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery"
<<<<<<< HEAD
          placeholder="ค้นหาเลข Order (เช่น 27 หรือ #ORD-27)..."
=======
          placeholder="ค้นหา Order ID หรือ ช่องทางชำระ..."
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
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
<<<<<<< HEAD
                    isCompletedOrder(order) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ isCompletedOrder(order) ? '✅ ชำระแล้ว' : '⏳ รอชำระ' }}
=======
                    order.payment_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ order.payment_status === 'Completed' ? '✅ ชำระแล้ว' : '⏳ รอชำระ' }}
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
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