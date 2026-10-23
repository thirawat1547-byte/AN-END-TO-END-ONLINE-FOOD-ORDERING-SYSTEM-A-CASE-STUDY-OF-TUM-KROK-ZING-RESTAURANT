<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-bold text-sm text-slate-800">ถ่ายรูปหลักฐานการจัดส่ง</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Simulated Camera Viewfinder -->
      <div class="mt-4 bg-slate-900 rounded-2xl h-56 relative overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800">
        <div v-if="photoTaken" class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80')">
          <div class="absolute inset-0 bg-black/20 flex items-end p-3 text-white text-xs">
            <div class="bg-black/60 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
              <div>📍 คอนโด The Grand Rama 9 อาคาร B</div>
              <div class="text-[10px] text-emerald-300">ถ่ายเมื่อ: วันนี้ 12:58 น. (GPS ยืนยัน)</div>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-4">
          <Camera class="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-80" />
          <p class="text-xs text-slate-300 font-medium">วางถุงอาหารร้านตำครกซิ่งไว้ที่จุดส่ง</p>
          <p class="text-[10px] text-slate-500 mt-0.5">ให้เห็นป้ายห้องหรือโต๊ะวางพัสดุชัดเจน</p>
        </div>
      </div>

      <!-- Camera Capture Controls -->
      <div class="mt-4 flex gap-2">
        <button 
          v-if="!photoTaken"
          @click="takePhoto" 
          class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Camera class="w-4 h-4" />
          <span>กดถ่ายรูปหลักฐาน</span>
        </button>

        <template v-else>
          <button 
            @click="photoTaken = false" 
            class="py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs"
          >
            ถ่ายใหม่
          </button>
          <button 
            @click="confirmDelivery" 
            class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30"
          >
            <Check class="w-4 h-4" />
            <span>ยืนยันส่งมอบสำเร็จ</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Camera, Check } from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const photoTaken = ref(false)

const takePhoto = () => {
  photoTaken.value = true
}

const confirmDelivery = () => {
  photoTaken.value = false
  emit('confirm')
}
</script>
