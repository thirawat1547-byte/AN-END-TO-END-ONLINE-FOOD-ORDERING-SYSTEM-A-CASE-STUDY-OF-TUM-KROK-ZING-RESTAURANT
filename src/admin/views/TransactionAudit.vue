<script setup>
import { ref, computed } from 'vue'
import { adminStore } from '../store/adminData'

const selectedStatus = ref('All')
const searchQuery = ref('')
const selectedOrder = ref(null)
const slipModalUrl = ref(null)

const filteredOrders = computed(() => {
  return adminStore.orders.filter(o => {
    const matchStatus = selectedStatus.value === 'All' || o.payment_status === selectedStatus.value
    const matchSearch = String(o.order_id).includes(searchQuery.value) || 
                        o.customer_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        o.payment_method.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

function viewSlip(url) {
  slipModalUrl.value = url
}

function viewOrderDetails(order) {
  selectedOrder.value = order
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">ตรวจสอบการเงินและประวัติธุรกรรม (Transaction & Audit)</h1>
        <p class="text-xs text-slate-500">ตรวจสอบหลักฐานการโอนเงิน สลิป QR Code ยอดรวมสุทธิ และรายงานทางบัญชี</p>
      </div>
      <button 
        @click="adminStore.exportSalesCSV()"
        class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
      >
        <span>📥 ดาวน์โหลดไฟล์รายงาน (Export CSV)</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
        <button 
          @click="selectedStatus = 'All'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ทั้งหมด ({{ adminStore.orders.length }})
        </button>
        <button 
          @click="selectedStatus = 'Completed'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ชำระแล้ว (Completed)
        </button>
        <button 
          @click="selectedStatus = 'Pending'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          รอชำระ (Pending)
        </button>
      </div>

      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="ค้นหา Order ID หรือ ลูกค้า..."
          class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
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
              <th class="p-4">ลูกค้า</th>
              <th class="p-4">ช่องทางชำระเงิน</th>
              <th class="p-4">ส่วนลด</th>
              <th class="p-4">ยอดรวมสุทธิ</th>
              <th class="p-4">สถานะการชำระ</th>
              <th class="p-4 text-center">สลิปโอน</th>
              <th class="p-4 text-right">รายละเอียด</th>
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
              <td class="p-4 font-medium text-slate-800">{{ order.customer_name }}</td>
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
                    order.payment_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ order.payment_status === 'Completed' ? '✅ ชำระแล้ว' : '⏳ รอชำระ' }}
                </span>
              </td>
              <td class="p-4 text-center">
                <button 
                  v-if="order.payment_slip_url"
                  @click="viewSlip(order.payment_slip_url)"
                  class="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition"
                >
                  🖼️ ดูสลิป
                </button>
                <span v-else class="text-slate-300 text-[11px]">-</span>
              </td>
              <td class="p-4 text-right">
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
          <div 
            v-for="item in selectedOrder.items" 
            :key="item.menu_id"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-50"
          >
            <div>
              <p class="font-bold text-slate-800">{{ item.menu_name }} x{{ item.quantity }}</p>
              <p v-if="item.customization?.spicy" class="text-[10px] text-amber-700">
                • {{ item.customization.spicy }} {{ item.customization.no_msg ? '• ไม่ใส่ชูรส' : '' }}
              </p>
            </div>
            <span class="font-bold text-slate-900">฿{{ item.subtotal }}</span>
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
