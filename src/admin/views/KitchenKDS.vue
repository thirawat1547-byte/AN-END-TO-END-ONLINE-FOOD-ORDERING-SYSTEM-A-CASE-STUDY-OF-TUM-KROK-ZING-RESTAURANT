<script setup>
import { computed } from 'vue'
import { adminStore } from '../store/adminData'

const activeOrders = computed(() => {
  return adminStore.orders.filter(o => ['Pending', 'Cooking', 'Ready'].includes(o.status))
})

function advanceStatus(order) {
  if (order.status === 'Pending') {
    adminStore.updateOrderStatus(order.order_id, 'Cooking')
  } else if (order.status === 'Cooking') {
    adminStore.updateOrderStatus(order.order_id, 'Ready')
  } else if (order.status === 'Ready') {
    adminStore.updateOrderStatus(order.order_id, 'Served')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl">
          🍳
        </div>
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            หน้าจอในครัว (Kitchen Display System - KDS)
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 animate-pulse">
              LIVE TICKET
            </span>
          </h1>
          <p class="text-xs text-slate-400">รับรายการสั่งอาหาร ปรุงตามหมายเหตุ และอัปเดตสถานะให้ลูกค้าเห็นทันที</p>
        </div>
      </div>

      <!-- Live sound alert toggle -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input type="checkbox" v-model="adminStore.storeSettings.soundAlertKDS" class="rounded text-amber-500">
          <span>🔊 เปิดเสียงเตือนเมื่อมีออเดอร์ใหม่</span>
        </label>
        <span class="px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs border border-slate-700">
          กำลังรอทำ: {{ activeOrders.length }} ออเดอร์
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="activeOrders.length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
      <span class="text-4xl">🎉</span>
      <h3 class="text-base font-bold text-slate-800">ไม่มีออเดอร์ค้างในครัว!</h3>
      <p class="text-xs text-slate-400">รายการอาหารทั้งหมดปรุงเสร็จและเสิร์ฟถึงมือลูกค้าเรียบร้อยแล้ว</p>
    </div>

    <!-- KDS Tickets Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="order in activeOrders" 
        :key="order.order_id"
        :class="[
          'bg-white rounded-2xl border-2 transition-all shadow-md flex flex-col justify-between overflow-hidden',
          order.status === 'Pending' ? 'border-blue-400 ring-2 ring-blue-100' :
          order.status === 'Cooking' ? 'border-amber-500 ring-2 ring-amber-100' :
          'border-emerald-500 ring-2 ring-emerald-100'
        ]"
      >
        <!-- Ticket Header -->
        <div 
          :class="[
            'p-4 text-white flex items-center justify-between',
            order.status === 'Pending' ? 'bg-blue-600' :
            order.status === 'Cooking' ? 'bg-amber-600' : 'bg-emerald-600'
          ]"
        >
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {{ order.order_type === 'In-store' ? 'DINE-IN ทานในร้าน' : 'TAKEAWAY กลับบ้าน' }}
            </span>
            <h2 class="text-2xl font-black">
              {{ order.table_id ? 'โต๊ะ T-0' + order.table_id : 'สั่งกลับบ้าน' }}
            </h2>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold">#ORD-{{ order.order_id }}</span>
            <p class="text-[10px] opacity-80">{{ order.created_at.slice(11, 16) }} น.</p>
          </div>
        </div>

        <!-- Ticket Body (Items List) -->
        <div class="p-4 flex-1 space-y-3">
          <div 
            v-for="item in order.items" 
            :key="item.menu_id"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-bold text-sm text-slate-900">{{ item.menu_name }}</span>
              <span class="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                x{{ item.quantity }}
              </span>
            </div>

            <!-- Customization Warnings in Red/Amber for Kitchen! -->
            <div v-if="item.customization" class="mt-1.5 space-y-1 text-xs">
              <div v-if="item.customization.spicy && item.customization.spicy !== '-'" class="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold inline-block mr-1 text-[11px]">
                🔥 {{ item.customization.spicy }}
              </div>
              <div v-if="item.customization.no_msg" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold inline-block mr-1 text-[11px]">
                🌿 ไม่ใส่ผงชูรส
              </div>
              <div v-if="item.customization.note" class="text-[11px] text-slate-700 italic bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                💬 หมายเหตุ: <b>{{ item.customization.note }}</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Ticket Action Button -->
        <div class="p-4 pt-2 bg-slate-50 border-t border-slate-100">
          <button 
            @click="advanceStatus(order)"
            :class="[
              'w-full py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2',
              order.status === 'Pending' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' :
              order.status === 'Cooking' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
              'bg-slate-900 hover:bg-slate-800 text-white'
            ]"
          >
            <span v-if="order.status === 'Pending'">🍳 เริ่มปรุงอาหาร (Cooking)</span>
            <span v-else-if="order.status === 'Cooking'">✅ ปรุงเสร็จแล้ว (Ready)</span>
            <span v-else>🍽️ เสิร์ฟถึงโต๊ะแล้ว (Served)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
