<template>
  <div class="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
    <!-- Section Title & Check All Action -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="font-bold text-sm text-slate-800">รายการอาหารที่ต้องรับ</h2>
          <span class="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {{ checkedCount }}/{{ items.length }} รายการ
          </span>
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5">กรุณาตรวจเช็คกับถุงอาหารร้านตำครกซิ่งก่อนออก</p>
      </div>

      <button 
        @click="toggleSelectAll" 
        class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg transition active:scale-95"
      >
        {{ isAllChecked ? 'ยกเลิกทั้งหมด' : 'ตรวจครบทั้งหมด' }}
      </button>
    </div>

    <!-- Items Checklist -->
    <div class="divide-y divide-slate-100">
      <div 
        v-for="item in items" 
        :key="item.id"
        @click="toggleItem(item.id)"
        class="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-slate-50/60 px-1 rounded-lg transition"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5">
            <input 
              type="checkbox" 
              :checked="item.checked"
              @click.stop="toggleItem(item.id)"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-800" :class="{ 'line-through text-slate-400': item.checked }">
                {{ item.name }}
              </span>
              <span class="text-xs font-black text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded">
                x{{ item.quantity }}
              </span>
            </div>
            <p v-if="item.detail" class="text-[11px] text-slate-500 italic mt-0.5">
              {{ item.detail }}
            </p>
          </div>
        </div>
        <div class="text-xs font-semibold text-slate-700">
          ฿{{ item.price }}
        </div>
      </div>
    </div>

    <!-- Customer Special Request Note -->
    <div class="mt-3 bg-amber-50/90 border border-amber-200/80 rounded-xl p-3">
      <div class="flex items-start gap-2">
        <span class="text-base leading-none">🌶️</span>
        <div>
          <div class="text-[11px] font-bold text-amber-900">หมายเหตุพิเศษจากลูกค้า:</div>
          <p class="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
            "ขอพริก 10 เม็ด แซ่บๆ ปลาร้าสุกไม่ใส่น้ำตาล ขอช้อนส้อม 3 ชุด และขอน้ำจิ้มแจ่วเพิ่ม 1 ถ้วยด้วยครับ ขอบคุณครับ"
          </p>
        </div>
      </div>
    </div>

    <!-- Payment Status Summary -->
    <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span class="text-slate-500 font-medium">การชำระเงิน:</span>
        <span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
          ชำระผ่านพร้อมเพย์แล้ว
        </span>
      </div>
      <div class="text-right">
        <span class="text-slate-400 text-[11px]">ยอดค่าอาหาร</span>
        <span class="text-slate-800 font-black ml-1 text-sm">฿600.00</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update-item', 'toggle-all'])

const checkedCount = computed(() => props.items.filter(i => i.checked).length)
const isAllChecked = computed(() => checkedCount.value === props.items.length)

const toggleItem = (id) => {
  emit('update-item', id)
}

const toggleSelectAll = () => {
  emit('toggle-all', !isAllChecked.value)
}
</script>
