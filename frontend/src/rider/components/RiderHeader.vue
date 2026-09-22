<template>
  <div class="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white pt-2 pb-4 px-4 shadow-md rounded-b-2xl">
    <!-- Simulated Smartphone Status Bar -->
    <div class="flex justify-between items-center text-xs font-semibold tracking-wider text-emerald-100 pb-2 mb-2 border-b border-emerald-400/30">
      <span>{{ currentTime }}</span>
      <div class="flex items-center gap-1.5">
        <Wifi class="w-3.5 h-3.5" />
        <Signal class="w-3.5 h-3.5" />
        <span class="text-[10px]">5G</span>
        <div class="flex items-center gap-0.5 ml-1">
          <span class="text-[10px]">98%</span>
          <BatteryMedium class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Rider Profile & Online Status -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-white/60">
            🛵
          </div>
          <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h2 class="font-bold text-sm tracking-wide">ไรเดอร์สมชาย (พนักงานร้าน)</h2>
            <span class="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded font-bold text-amber-300">ประจำร้านตำครกซิ่ง</span>
          </div>
          <div class="flex items-center gap-1 text-[11px] text-emerald-100">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
            <span>พนักงานจัดส่งของทางร้าน • มอเตอร์ไซค์</span>
          </div>
        </div>
      </div>

      <!-- Quick Earnings Badge -->
      <div class="bg-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 text-right">
        <div class="text-[10px] text-emerald-100 font-medium">ค่ารอบออเดอร์นี้</div>
        <div class="text-base font-extrabold text-white tracking-tight">฿{{ earnings }}</div>
      </div>
    </div>

    <!-- Order Tag & Progress Stepper -->
    <div class="mt-3 bg-black/15 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
      <div class="flex items-center justify-between text-xs mb-2">
        <div class="flex items-center gap-1.5">
          <span class="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[10px]">ด่วน</span>
          <span class="font-bold text-white tracking-wide">ออเดอร์ #TKZ-9482</span>
        </div>
        <span class="text-[11px] text-emerald-200 font-medium">{{ currentStepLabel }}</span>
      </div>

      <!-- 3-step Visual Progress Bar (In-house Rider starts at store) -->
      <div class="grid grid-cols-3 gap-2 items-center">
        <div 
          v-for="(step, idx) in steps" 
          :key="idx" 
          class="flex flex-col items-center gap-1"
        >
          <div 
            class="h-1.5 w-full rounded-full transition-all duration-300"
            :class="idx <= currentStep ? 'bg-amber-300 shadow-sm' : 'bg-white/25'"
          ></div>
          <span 
            class="text-[9px] font-medium leading-none whitespace-nowrap"
            :class="idx <= currentStep ? 'text-amber-200 font-bold' : 'text-emerald-200/60'"
          >
            {{ step }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Wifi, Signal, BatteryMedium } from 'lucide-vue-next'

const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 58.00
  }
})

const steps = ['ตรวจรับอาหาร', 'กำลังนำส่ง', 'ส่งมอบสำเร็จ']

const stepLabels = [
  '1/3 ตรวจรับอาหารที่ร้าน',
  '2/3 กำลังนำส่งลูกค้า',
  '3/3 ถึงจุดส่งปลายทาง'
]

const currentStepLabel = computed(() => stepLabels[props.currentStep] || 'กำลังดำเนินการ')

const currentTime = ref('12:45')
let timer = null

onMounted(() => {
  const updateTime = () => {
    const now = new Date()
    const hrs = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    currentTime.value = `${hrs}:${mins}`
  }
  updateTime()
  timer = setInterval(updateTime, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
