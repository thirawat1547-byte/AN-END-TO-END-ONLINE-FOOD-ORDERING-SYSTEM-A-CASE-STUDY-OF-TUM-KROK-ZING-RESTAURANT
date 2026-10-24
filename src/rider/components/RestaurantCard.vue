<template>
  <div class="bg-white rounded-2xl p-4 shadow-card border border-slate-100 transition-all">
    <!-- Header with Store Badge -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl bg-white border border-orange-200 flex items-center justify-center p-1 shadow-sm ring-2 ring-orange-100 shrink-0 overflow-hidden">
          <img :src="logoImg" alt="โลโก้ร้านตำครกซิ่ง" class="w-full h-full object-contain" />
        </div>
        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <span>⭐</span> 4.9 (1.4k รีวิว)
            </span>
            <span class="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-1.5 py-0.5 rounded-md">
              ร้านยอดนิยม
            </span>
          </div>
          <h1 class="text-base font-extrabold text-slate-800 tracking-tight mt-0.5">
            ตำครกซิ่ง
          </h1>
          <p class="text-[11px] text-slate-500">สาขาต้นตำรับ แซ่บสะเดิด (ส้มตำ-ไก่ย่าง)</p>
        </div>
      </div>

      <!-- Status Tag: In-house store employee -->
      <div class="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 border border-emerald-200 shrink-0">
        <Store class="w-3.5 h-3.5 text-emerald-600" />
        <span>พนักงานร้าน</span>
      </div>
    </div>

    <!-- Kitchen Status Banner -->
    <div class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/70 rounded-xl p-2.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
        </span>
        <div class="text-xs">
          <span class="font-bold text-orange-950">สถานะครัว:</span>
          <span class="text-orange-800 ml-1">
            {{ isFoodReady ? '✅ อาหารปรุงเสร็จแล้ว พร้อมรับ!' : '🔥 กำลังตำและย่าง (เหลือ ~2 นาที)' }}
          </span>
        </div>
      </div>
      <button 
        @click="toggleFoodReady" 
        class="text-[10px] text-orange-700 underline font-medium hover:text-orange-900"
      >
        {{ isFoodReady ? 'ย้อนสถานะ' : 'จำลองอาหารเสร็จ' }}
      </button>
    </div>

    <!-- Address & Route Details -->
    <div class="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl">
      <MapPin class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="font-medium text-slate-700">จุดรับ: ร้านตำครกซิ่ง ซ.รามคำแหง 24 แยก 14</p>
        <p class="text-[11px] text-emerald-700 mt-0.5 font-medium">📍 ประจำการที่หน้าร้าน • รอรับอาหารจากครัวแล้วออกไปส่งทันที</p>
      </div>
    </div>

    <!-- Store Contact & Map Action Buttons -->
    <div class="grid grid-cols-2 gap-2 mt-3">
      <a 
        href="tel:0897728899" 
        class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95"
      >
        <PhoneCall class="w-3.5 h-3.5 text-emerald-600" />
        <span>ติดต่อในครัว</span>
      </a>

      <button 
        @click="openMapModal" 
        class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
      >
        <Compass class="w-3.5 h-3.5" />
        <span>ดูแผนที่เส้นทางส่ง</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { MapPin, PhoneCall, Compass, Store } from 'lucide-vue-next'
import logoImg from '../../assets/logo.png'

const props = defineProps({
  isFoodReady: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-food-ready', 'open-map'])

const toggleFoodReady = () => {
  emit('toggle-food-ready')
}

const openMapModal = () => {
  emit('open-map', {
    targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
    distance: '3.2 กม.',
    eta: '12 นาที'
  })
}
</script>
