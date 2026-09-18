<template>
  <div class="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
    <!-- Customer Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm ring-2 ring-blue-50">
          👤
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="font-bold text-xs text-slate-800">คุณณัฐวุฒิ ใจดี</h3>
            <span class="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">ลูกค้าประจำ</span>
          </div>
          <p class="text-[11px] text-slate-500">โทร 081-992-8811</p>
        </div>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-slate-400 block">ระยะทางส่ง</span>
        <span class="text-xs font-black text-slate-700">3.2 กม. (~12 นาที)</span>
      </div>
    </div>

    <!-- Drop-off Destination -->
    <div class="mt-3 bg-slate-50 p-2.5 rounded-xl flex items-start gap-2.5 text-xs">
      <Building2 class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="font-bold text-slate-800">คอนโด The Grand Rama 9 (อาคาร B)</p>
        <p class="text-slate-600 mt-0.5">ชั้น 14 ห้อง 1408 • แขวงห้วยขวาง เขตห้วยขวาง กทม.</p>
        <div class="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md font-medium inline-flex">
          <span>📦 ฝากไว้ที่โต๊ะพนักงานส่งอาหารล็อบบี้ชั้น 1</span>
        </div>
      </div>
    </div>

    <!-- Quick Communication & Navigation -->
    <div class="grid grid-cols-3 gap-2 mt-3">
      <a 
        href="tel:0819928811"
        class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95"
      >
        <Phone class="w-3.5 h-3.5 text-blue-600" />
        <span>โทรหาลูกค้า</span>
      </a>

      <button 
        @click="openChatModal"
        class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95 relative"
      >
        <MessageSquare class="w-3.5 h-3.5 text-emerald-600" />
        <span>แชท</span>
        <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
          {{ unreadCount }}
        </span>
      </button>

      <button 
        @click="openMapModal"
        class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
      >
        <Compass class="w-3.5 h-3.5" />
        <span>นำทางส่ง</span>
      </button>
    </div>

    <!-- Quick canned message triggers -->
    <div class="mt-3 pt-2.5 border-t border-slate-100">
      <div class="text-[10px] text-slate-400 mb-1.5 font-medium">ส่งข้อความด่วน:</div>
      <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button 
          v-for="(msg, idx) in quickMessages" 
          :key="idx"
          @click="sendQuickMessage(msg)"
          class="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition active:scale-95"
        >
          {{ msg }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Phone, MessageSquare, Compass, Building2 } from 'lucide-vue-next'

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 1
  }
})

const quickMessages = [
  '👨‍🍳 ทางร้านตำครกซิ่งกำลังแพ็คอาหารพร้อมส่งครับ',
  '💨 พนักงานร้านรับอาหารแล้ว กำลังรีบขับไปส่งครับ',
  '🛵 เดินทางประมาณ 12 นาทีถึงคอนโดครับ',
  '🏢 ถึงโต๊ะส่งอาหารล็อบบี้คอนโดแล้วครับ'
]

const emit = defineEmits(['open-chat', 'open-map', 'send-quick-message'])

const openChatModal = () => emit('open-chat')
const openMapModal = () => emit('open-map', {
  targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
  distance: '3.2 กิโลเมตร',
  eta: '12 นาที'
})

const sendQuickMessage = (msg) => {
  emit('send-quick-message', msg)
}
</script>
