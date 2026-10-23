<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full h-[520px] shadow-2xl flex flex-col relative overflow-hidden">
      <!-- Chat Header -->
      <div class="p-3.5 bg-emerald-600 text-white flex items-center justify-between shadow-sm shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <div class="font-bold text-xs">คุณณัฐวุฒิ ใจดี (ลูกค้า)</div>
            <div class="text-[10px] text-emerald-100 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              <span>ออนไลน์ • ออเดอร์ตำครกซิ่ง</span>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="text-white/80 hover:text-white p-1">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages Stream -->
      <div class="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
        <div class="text-center my-1">
          <span class="bg-slate-200/80 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
            วันนี้ เริ่มการสนทนา
          </span>
        </div>

        <div 
          v-for="(msg, idx) in messages" 
          :key="idx"
          class="flex"
          :class="msg.sender === 'rider' ? 'justify-end' : 'justify-start'"
        >
          <div 
            class="max-w-[78%] rounded-2xl px-3 py-2 text-xs shadow-sm"
            :class="msg.sender === 'rider' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'"
          >
            <p>{{ msg.text }}</p>
            <span 
              class="text-[9px] block text-right mt-1"
              :class="msg.sender === 'rider' ? 'text-emerald-200' : 'text-slate-400'"
            >
              {{ msg.time }}
            </span>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <div class="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input 
          v-model="inputMessage" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="พิมพ์ข้อความถึงลูกค้า..."
          class="flex-1 text-xs bg-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button 
          @click="sendMessage"
          class="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition active:scale-95 shrink-0"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Send } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'send-message'])

const inputMessage = ref('')

const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  emit('send-message', inputMessage.value.trim())
  inputMessage.value = ''
}
</script>
