<script setup>
import { ref } from 'vue'
import { adminStore } from '../store/adminData'

const selectedTable = ref(null)

function getTableOrder(table) {
  if (!table.activeOrderId) return null
  return adminStore.orders.find(o => o.order_id === table.activeOrderId)
}

function openTableModal(table) {
  selectedTable.value = table
}

function changeStatus(table, newStatus) {
  adminStore.toggleTableStatus(table.table_id, newStatus)
}

function clearTable(table) {
  if (confirm(`คุณต้องการเช็คบิลและเคลียร์โต๊ะ ${table.table_number} หรือไม่?`)) {
    if (table.activeOrderId) {
      adminStore.updateOrderStatus(table.activeOrderId, 'Completed')
    }
    adminStore.toggleTableStatus(table.table_id, 'Empty')
    selectedTable.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">แผนผังและการจัดการโต๊ะอาหาร (Table Controller)</h1>
        <p class="text-xs text-slate-500">แสดงสถานะโต๊ะแบบเรียลไทม์ (ว่าง, กำลังทาน, รอเช็คบิล) ควบคุม QR Code ประจำโต๊ะ</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ว่าง: {{ adminStore.tables.filter(t => t.status === 'Empty').length }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> มีลูกค้า: {{ adminStore.tables.filter(t => t.status === 'Occupied').length }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> รอเช็คบิล: {{ adminStore.tables.filter(t => t.status === 'Billing').length }}
        </span>
      </div>
    </div>

    <!-- Table Grid Floor Plan -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="table in adminStore.tables" 
        :key="table.table_id"
        @click="openTableModal(table)"
        :class="[
          'bg-white rounded-2xl p-5 border-2 transition duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden',
          table.status === 'Empty' ? 'border-emerald-200 hover:border-emerald-400' :
          table.status === 'Occupied' ? 'border-red-300 ring-2 ring-red-100 hover:border-red-400' :
          'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
        ]"
      >
        <!-- Table Status Indicator Strip -->
        <div 
          :class="[
            'absolute top-0 inset-x-0 h-1.5',
            table.status === 'Empty' ? 'bg-emerald-500' :
            table.status === 'Occupied' ? 'bg-red-500' : 'bg-amber-500'
          ]"
        ></div>

        <div>
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs text-slate-400 font-bold">TABLE</span>
              <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ table.table_number }}</h3>
            </div>
            <span 
              :class="[
                'text-[10px] px-2.5 py-1 rounded-lg font-bold',
                table.status === 'Empty' ? 'bg-emerald-100 text-emerald-800' :
                table.status === 'Occupied' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              ]"
            >
              {{ table.status === 'Empty' ? '🟢 โต๊ะว่าง' : table.status === 'Occupied' ? '🔴 มีลูกค้า' : '🟡 รอชำระเงิน' }}
            </span>
          </div>

          <!-- Capacity & Seated Time -->
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>👥 รองรับ {{ table.capacity }} ที่นั่ง</span>
            <span v-if="table.status !== 'Empty'" class="font-bold text-slate-700">⏱️ {{ table.elapsedMinutes }} นาที</span>
          </div>

          <!-- Order Summary if active -->
          <div v-if="table.status !== 'Empty'" class="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>ออเดอร์ #ORD-{{ table.activeOrderId }}</span>
              <span class="font-black text-slate-900">฿{{ table.currentBill }}</span>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-amber-600 font-bold hover:underline">คลิกเพื่อดู / จัดการ →</span>
          <span class="text-slate-400 text-sm">📱 QR</span>
        </div>
      </div>
    </div>

    <!-- Table Details Modal -->
    <div v-if="selectedTable" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-base text-slate-900">จัดการโต๊ะ {{ selectedTable.table_number }}</h3>
            <p class="text-slate-400 text-[11px]">ความจุ: {{ selectedTable.capacity }} ที่นั่ง</p>
          </div>
          <button @click="selectedTable = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <!-- Quick Status Change Buttons -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">เปลี่ยนสถานะโต๊ะ:</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              @click="changeStatus(selectedTable, 'Empty')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Empty' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              ]"
            >
              ว่าง
            </button>
            <button 
              @click="changeStatus(selectedTable, 'Occupied')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Occupied' ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100'
              ]"
            >
              มีลูกค้า
            </button>
            <button 
              @click="changeStatus(selectedTable, 'Billing')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Billing' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              ]"
            >
              รอเช็คบิล
            </button>
          </div>
        </div>

        <!-- Order details if active -->
        <div v-if="getTableOrder(selectedTable)" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div class="flex justify-between font-bold text-slate-800">
            <span>รายการอาหารโต๊ะนี้ (#ORD-{{ selectedTable.activeOrderId }})</span>
            <span class="text-amber-600 font-black">฿{{ selectedTable.currentBill }}</span>
          </div>
          <div class="space-y-1 max-h-40 overflow-y-auto">
            <div 
              v-for="i in getTableOrder(selectedTable).items" 
              :key="i.menu_id"
              class="flex justify-between text-[11px] text-slate-600"
            >
              <span>{{ i.menu_name }} x{{ i.quantity }}</span>
              <span>฿{{ i.subtotal }}</span>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            v-if="selectedTable.status !== 'Empty'"
            @click="clearTable(selectedTable)"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow"
          >
            💳 ชำระเงิน & เคลียร์โต๊ะ
          </button>
          <div class="flex-1"></div>
          <button 
            @click="selectedTable = null"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
