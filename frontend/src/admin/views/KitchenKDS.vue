<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { adminStore } from '../store/adminData'

let kdsPollTimer = null

onMounted(async () => {
  if (typeof adminStore.fetchOrdersFromAPI === 'function') {
    await adminStore.fetchOrdersFromAPI()
  }
  // ซิงค์คำสั่งซื้อใหม่เข้าจอ KDS อัตโนมัติทุกๆ 4 วินาที
  kdsPollTimer = setInterval(() => {
    if (typeof adminStore.fetchOrdersFromAPI === 'function') {
      adminStore.fetchOrdersFromAPI()
    }
  }, 4000)
})

onBeforeUnmount(() => {
  if (kdsPollTimer) {
    clearInterval(kdsPollTimer)
  }
})

// ดึงออเดอร์ทั้งหมดมาแสดงใน KDS เพื่อให้เห็นตั๋วทันที (หรือกรองเฉพาะที่กำลังทำ)
const activeOrders = computed(() => {
  // ถ้าอยากให้แสดงทุกออเดอร์ตัวอย่างที่มี ให้คืนค่า adminStore.orders ได้เลยครับ
  return adminStore.orders
})

const totalDishesInKitchen = computed(() => {
  return activeOrders.value.reduce((sum, o) => {
    if (!o.items || !Array.isArray(o.items)) return sum
    return sum + o.items.reduce((s, i) => s + Number(i.quantity || 0), 0)
  }, 0)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Green Theme -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#183324] text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-emerald-700/40 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl shadow-inner">
          🍳
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-white">
              หน้าจอห้องครัว (Kitchen Display System - KDS)
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40 animate-pulse">
              LIVE MONITOR
            </span>
          </div>
          <p class="text-xs text-emerald-200/70 mt-0.5">
            โหมดสำหรับแอดมิน: ดูความเคลื่อนไหว จำนวนออเดอร์ และรายการเมนูที่กำลังทำในครัว (โหมดดูอย่างเดียว)
          </p>
        </div>
      </div>

      <!-- Quick Metrics Pill -->
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="px-3.5 py-1.5 rounded-xl bg-[#244633] text-emerald-200 font-semibold text-xs border border-emerald-600/40 flex items-center gap-1.5">
          <span>📋 กำลังทำ:</span>
          <b class="text-white text-sm">{{ activeOrders.length }}</b> ออเดอร์
        </span>
        <span class="px-3.5 py-1.5 rounded-xl bg-[#244633] text-emerald-200 font-semibold text-xs border border-emerald-600/40 flex items-center gap-1.5">
          <span>🍽️ รวม:</span>
          <b class="text-white text-sm">{{ totalDishesInKitchen }}</b> จาน
        </span>
      </div>
    </div>

    <!-- Admin Notice Bar -->
    <div class="flex items-center gap-2.5 p-3 rounded-xl bg-[#2d5a43]/10 border border-[#2d5a43]/30 text-xs text-[#244633]">
      <span class="text-base">ℹ️</span>
      <span>
        <b>คำชี้แจงระบบ:</b> หน้านี้เป็น <b>โหมดดูอย่างเดียว (View Only)</b> สำหรับแอดมินตรวจสอบคิวอาหารในครัว พนักงานครัวจะเป็นผู้กดเปลี่ยนสถานะอาหารตามลำดับการปรุง
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="activeOrders.length === 0" class="bg-white rounded-2xl p-12 text-center border border-emerald-100 shadow-sm space-y-3">
      <span class="text-5xl">🎉</span>
      <h3 class="text-lg font-bold text-slate-800">ไม่มีออเดอร์ค้างในครัว!</h3>
      <p class="text-xs text-slate-400">รายการอาหารทั้งหมดปรุงเสร็จและเสิร์ฟถึงมือลูกค้าเรียบร้อยแล้ว</p>
    </div>

    <!-- KDS Tickets Cards Grid (View Only) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="order in activeOrders" 
        :key="order.order_id"
        class="bg-white rounded-2xl border-2 border-emerald-200/80 shadow-md flex flex-col justify-between overflow-hidden"
      >
        <!-- Ticket Header -->
        <div 
          :class="[
            'p-4 text-white flex items-center justify-between',
            order.status === 'Pending' ? 'bg-[#3b6b50]' :
            order.status === 'Cooking' ? 'bg-[#244633]' : 'bg-[#183324]'
          ]"
        >
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-85 text-emerald-100">
              {{ order.order_type === 'In-store' ? '🍽️ ทานในร้าน' : '🛍️ สั่งกลับบ้าน (Takeaway)' }}
            </span>
            <h2 class="text-2xl font-black tracking-tight text-white mt-0.5">
              {{ order.table_id ? 'โต๊ะ T-0' + order.table_id : 'สั่งกลับบ้าน' }}
            </h2>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">#ORD-{{ order.order_id }}</span>
            <p class="text-[10px] opacity-85 mt-1 text-emerald-100">สั่งเมื่อ: {{ order.created_at ? order.created_at.slice(11, 16) : '' }} น.</p>
          </div>
        </div>

        <!-- Ticket Body (Items List) -->
        <div class="p-4 flex-1 space-y-3">
          <div 
            v-for="item in order.items" 
            :key="item.menu_id"
            class="p-3 rounded-xl bg-[#f7f6f0] border border-[#e5e1cf]"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-bold text-sm text-slate-900 leading-snug">{{ item.menu_name }}</span>
              <span class="px-2 py-0.5 rounded-lg bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                x{{ item.quantity }}
              </span>
            </div>

            <!-- Customizations / Notes -->
            <div v-if="item.customization" class="mt-2 space-y-1 text-xs">
              <div v-if="item.customization.spicy && item.customization.spicy !== '-'" class="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold inline-block mr-1 text-[11px]">
                🔥 {{ item.customization.spicy }}
              </div>
              <div v-if="item.customization.no_msg" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold inline-block mr-1 text-[11px]">
                🌿 ไม่ใส่ชูรส
              </div>
              <div v-if="item.customization.note" class="text-[11px] text-slate-700 italic bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                💬 หมายเหตุ: <b>{{ item.customization.note }}</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Ticket Status (View-Only Indicator, No click action) -->
        <div class="p-4 pt-3 bg-[#f7f6f0] border-t border-[#e5e1cf]">
          <div 
            :class="[
              'w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border shadow-sm',
              order.status === 'Pending' ? 'bg-amber-100/80 text-amber-900 border-amber-300' :
              order.status === 'Cooking' ? 'bg-blue-100/80 text-blue-900 border-blue-300' :
              'bg-emerald-100 text-emerald-900 border-emerald-300'
            ]"
          >
            <span v-if="order.status === 'Pending'">⏳ สถานะ: รอคิวปรุงอาหาร</span>
            <span v-else-if="order.status === 'Cooking'">🍳 สถานะ: กำลังปรุงอาหารในครัว</span>
            <span v-else>✅ สถานะ: ปรุงเสร็จแล้ว พร้อมเสิร์ฟ</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>