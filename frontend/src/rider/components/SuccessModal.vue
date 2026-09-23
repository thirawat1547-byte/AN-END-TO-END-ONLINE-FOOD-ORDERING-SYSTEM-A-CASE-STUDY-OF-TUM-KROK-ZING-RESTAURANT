<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden animate-scale-up border border-emerald-100">
      <!-- Confetti / Success Header Decor -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100 rounded-full opacity-50 blur-xl"></div>
      <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100 rounded-full opacity-50 blur-xl"></div>

      <!-- Icon -->
      <div class="relative w-20 h-20 mx-auto mb-3">
        <div class="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-100 animate-bounce">
          🎉
        </div>
      </div>

      <h2 class="text-xl font-black text-slate-900 mt-2">จัดส่งอาหารสำเร็จ!</h2>
      <p class="text-xs text-slate-500 mt-1">
        ส่งมอบความแซ่บจากร้าน <span class="text-orange-600 font-bold">ตำครกซิ่ง</span> เรียบร้อย
      </p>

      <!-- Earnings Box -->
      <div class="mt-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 rounded-2xl p-4 border border-emerald-200/80">
        <div class="text-xs text-emerald-800 font-medium">รายได้ออเดอร์นี้</div>
        <div class="text-3xl font-black text-emerald-700 tracking-tight my-1">
          ฿58.00
        </div>
        <div class="text-[11px] text-emerald-600 flex items-center justify-center gap-2 pt-1 border-t border-emerald-200/60 mt-1">
          <span>ค่ารอบ: ฿45.00</span>
          <span>•</span>
          <span class="font-bold text-amber-700">ทิปลูกค้า: ฿13.00 ⭐</span>
        </div>
      </div>

      <!-- Delivery Performance Stats -->
      <div class="grid grid-cols-3 gap-2 mt-3 text-left">
        <div class="bg-slate-50 p-2 rounded-xl text-center">
          <span class="text-[10px] text-slate-400 block">ระยะทางรวม</span>
          <span class="text-xs font-bold text-slate-700">4.05 กม.</span>
        </div>
        <div class="bg-slate-50 p-2 rounded-xl text-center">
          <span class="text-[10px] text-slate-400 block">เวลาที่ใช้</span>
          <span class="text-xs font-bold text-slate-700">16 นาที</span>
        </div>
        <div class="bg-slate-50 p-2 rounded-xl text-center">
          <span class="text-[10px] text-slate-400 block">คะแนนรีวิว</span>
          <span class="text-xs font-bold text-amber-600">⭐ 5.0</span>
        </div>
      </div>

      <!-- Customer Feedback Comment -->
      <div class="mt-3 bg-amber-50/60 p-2.5 rounded-xl text-left border border-amber-100">
        <div class="flex items-center gap-1 text-[11px] font-bold text-amber-900">
          <span>💬 ความคิดเห็นจากลูกค้า:</span>
        </div>
        <p class="text-[11px] text-amber-800 italic mt-0.5">
          "ส่งไวมากครับ ไก่ย่างยังอุ่นๆ ส้มตำรสแซ่บสะใจ ไรเดอร์สุภาพมากครับ 👍"
        </p>
      </div>

      <!-- Action Button -->
      <button 
        @click="$emit('reset-flow')"
        class="w-full mt-5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition duration-150 active:scale-98"
      >
        🛵 รับงานออเดอร์ถัดไป
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['reset-flow'])
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
.animate-scale-up {
  animation: scaleUp 0.25s ease-out;
}
</style>
