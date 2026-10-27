<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans">
    <!-- 1. Floating Circular Chatbot Launcher Button -->
    <transition name="fade">
      <button
        v-if="!isOpen"
        @click="toggleChat"
        title="คุยกับผู้ช่วยร้านตำครกซิ่ง"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#3f634b] via-[#557c61] to-[#719b7d] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group border-2 border-white/80"
      >
        <!-- Pulse radar ring -->
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#557c61] opacity-40"></span>
        
        <!-- Bot Icon -->
        <span class="text-2xl sm:text-3xl filter drop-shadow">🤖</span>

        <!-- Green Online Status Dot -->
        <span class="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
          <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
        </span>

        <!-- Tooltip Label on Hover (Desktop) -->
        <div class="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:group-hover:flex items-center gap-1.5 bg-slate-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg pointer-events-none backdrop-blur-sm border border-slate-700">
          <span>💬 แชทกับน้องส้มตำ AI</span>
        </div>
      </button>
    </transition>

    <!-- 2. Chatbot Window Popup -->
    <transition name="chat-popup">
      <div 
        v-if="isOpen"
        class="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden backdrop-blur-xl"
      >
        <!-- Chat Header -->
        <div class="bg-gradient-to-r from-[#2e4d3a] via-[#3f634b] to-[#557c61] text-white p-4 flex items-center justify-between shadow-md">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#3f634b] rounded-full"></span>
            </div>

            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-sm tracking-wide">น้องส้มตำ AI</h3>
                <span class="text-[9px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-medium">BOT</span>
              </div>
              <p class="text-[11px] text-emerald-100/80">
                ผู้ช่วยร้านตำครกซิ่ง •
                <span :class="geminiReady ? 'text-emerald-300' : 'text-yellow-300'">
                  {{ geminiReady ? '✨ Gemini AI' : '⚡ ตอบทันใจ' }}
                </span>
              </p>
            </div>
          </div>

          <!-- Header Controls -->
          <div class="flex items-center gap-1">
            <button 
              @click="clearChat" 
              title="ล้างการสนทนา"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              🔄
            </button>
            <button 
              @click="toggleChat" 
              title="ปิดหน้าต่างแชท"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Chat Messages Container -->
        <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfbf7]">
          <!-- Timestamp banner -->
          <div class="text-center my-1">
            <span class="text-[10px] text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full font-medium">
              วันนี้ • ให้บริการตลอด 24 ชม.
            </span>
          </div>

          <!-- Message bubbles -->
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            class="flex items-end gap-2"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- Bot avatar icon -->
            <div 
              v-if="msg.sender === 'bot'" 
              class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs shrink-0 border border-emerald-200"
            >
              🤖
            </div>

            <!-- Message bubble -->
            <div 
              class="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm"
              :class="msg.sender === 'user' 
                ? 'bg-[#557c61] text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'"
            >
              <div v-html="formatMessage(msg.text)"></div>
              <div 
                class="text-[9px] mt-1 text-right"
                :class="msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'"
              >
                {{ msg.time }}
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs border border-emerald-200">
              🤖
            </div>
            <div class="bg-white px-3 py-2 rounded-2xl border border-slate-200 rounded-bl-none flex items-center gap-1 shadow-sm">
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>

          <!-- Quick Suggestion Pills -->
          <div v-if="currentSuggestions.length > 0 && !isTyping" class="pt-2">
            <div class="text-[10px] text-slate-400 mb-1.5 font-medium px-1">คำถามยอดนิยม:</div>
            <div class="flex flex-wrap gap-1.5">
              <button 
                v-for="(pill, idx) in currentSuggestions" 
                :key="idx"
                @click="sendSuggestion(pill)"
                class="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#3f634b] border border-slate-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-xl transition shadow-xs text-left"
              >
                {{ pill }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <form @submit.prevent="handleSendMessage" class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input 
            type="text" 
            v-model="inputMessage" 
            placeholder="พิมพ์ข้อความสอบถามที่นี่..." 
            class="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs px-3.5 py-2.5 rounded-2xl border border-transparent focus:border-[#557c61] outline-none transition text-slate-800 placeholder-slate-400"
            :disabled="isTyping"
          />

          <button 
            type="submit" 
            :disabled="!inputMessage.trim() || isTyping"
            class="w-10 h-10 rounded-2xl bg-[#557c61] hover:bg-[#405e49] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition shadow-md shrink-0 active:scale-95"
          >
            <span>➤</span>
          </button>
        </form>

        <!-- Micro Footer branding -->
        <div class="bg-slate-50 py-1 text-center border-t border-slate-100/60">
          <span class="text-[9px] text-slate-400 font-medium">
            {{ geminiReady ? '✨ ขับเคลื่อนโดย Google Gemini AI' : '⚡ ขับเคลื่อนโดย TumKrokZing AI Assistant' }}
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { API_BASE } from '../config/api.js'

const CHATBOT_API = `${API_BASE}/chatbot`

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const geminiReady = ref(false)
const chatHistory = ref([])

const defaultSuggestions = [
  'เมนูขายดีแนะนำ',
  'ร้านเปิดกี่โมง?',
  'มีโปรค่าจัดส่งไหม?',
  'ร้านตั้งอยู่ที่ไหน?',
]
const currentSuggestions = ref(defaultSuggestions)

const getTimeString = () => {
  const d = new Date()
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const messages = ref([
  {
    sender: 'bot',
    text: 'สวัสดีค่ะ! ยินดีต้อนรับสู่ร้านตำครกซิ่งค่ะ 🌶️✨<br>หนูคือน้องส้มตำ AI ผู้ช่วยประจำร้าน มีอะไรให้ช่วยแนะนำเมนูหรือสอบถามข้อมูลร้านได้เลยนะคะ',
    time: getTimeString()
  }
])

onMounted(async () => {
  try {
    const res = await fetch(`${CHATBOT_API}/health`)
    if (res.ok) {
      const data = await res.json()
      geminiReady.value = data.geminiConfigured && data.aiClientReady
    }
  } catch {
    geminiReady.value = false
  }

  try {
    const res = await fetch(`${CHATBOT_API}/suggested-questions`)
    if (res.ok) {
      const data = await res.json()
      if (data.questions && data.questions.length > 0) {
        currentSuggestions.value = data.questions
      }
    }
  } catch {
    currentSuggestions.value = defaultSuggestions
  }
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

const clearChat = () => {
  chatHistory.value = []
  currentSuggestions.value = defaultSuggestions
  messages.value = [
    {
      sender: 'bot',
      text: 'ล้างการสนทนาเรียบร้อยแล้วค่ะ มีอะไรสอบถามเรื่องเมนูหรือบริการของร้านได้เลยนะคะ! 🌶️',
      time: getTimeString()
    }
  ]
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatMessage = (text) => {
  return text
    // Headers ### → bold+underline style
    .replace(/^###\s*(.+)$/gm, '<div class="font-semibold text-[#3f634b] mt-2 mb-0.5">$1</div>')
    .replace(/^##\s*(.+)$/gm, '<div class="font-bold text-[#2e4d3a] mt-2 mb-1">$1</div>')
    // **bold**
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // * bullet → รายการ
    .replace(/^\*\s+(.+)$/gm, '<div class="flex gap-1 my-0.5"><span class="text-[#557c61] shrink-0">•</span><span>$1</span></div>')
    // --- ขีดคั่น
    .replace(/^---+$/gm, '<hr class="border-slate-200 my-1">')
    // newline
    .replace(/\n/g, '<br>')
}

const sendToGemini = async (userMessage) => {
  try {
    const body = {
      message: userMessage,
      history: chatHistory.value,
    }
    const res = await fetch(`${CHATBOT_API}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    chatHistory.value.push(
      { role: 'user', text: userMessage },
      { role: 'model', text: data.reply }  // Backend DTO ใช้ 'model' ไม่ใช่ 'bot'
    )
    if (chatHistory.value.length > 20) {
      chatHistory.value = chatHistory.value.slice(-20)
    }
    if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
      currentSuggestions.value = data.suggestedQuestions
    }
    return data.reply
  } catch (err) {
    console.error('Chatbot API error:', err)
    return getFallbackReply(userMessage)
  }
}

const getFallbackReply = (query) => {
  const lower = query.toLowerCase()
  if (lower.includes('เมนู') || lower.includes('แนะนำ') || lower.includes('ขายดี')) {
    return 'เมนูแนะนำของร้าน ได้แก่ ส้มตำปูปลาร้า, คอหมูย่าง, ไก่ย่าง และต้มแซ่บค่ะ 🌶️'
  }
  if (lower.includes('เวลา') || lower.includes('เปิด') || lower.includes('ปิด')) {
    return 'ร้านตำครกซิ่งเปิดทุกวัน 10:00 - 21:30 น. ค่ะ'
  }
  if (lower.includes('ส่ง') || lower.includes('เดลิ') || lower.includes('โปร')) {
    return 'มีโปรโมชั่นพิเศษดูได้ที่แท็บโปรโมชั่นเลยค่ะ 🎉'
  }
  return 'ขออภัยด้วยนะคะ น้องส้มตำ AI ช่วยได้แค่เรื่องเมนูและบริการของร้านตำครกซิ่งเท่านั้นค่ะ มีเมนูไหนสนใจไหมคะ? 🌶️'
}

const sendSuggestion = async (text) => {
  await sendMessage(text)
}

const sendMessage = async (text) => {
  const query = text.trim()
  if (!query) return

  messages.value.push({ sender: 'user', text: query, time: getTimeString() })
  scrollToBottom()
  isTyping.value = true
  currentSuggestions.value = []

  const botReply = await sendToGemini(query)

  isTyping.value = false
  messages.value.push({ sender: 'bot', text: botReply, time: getTimeString() })
  scrollToBottom()
}

const handleSendMessage = async () => {
  const query = inputMessage.value.trim()
  if (!query) return
  inputMessage.value = ''
  await sendMessage(query)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.chat-popup-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-popup-leave-active {
  transition: all 0.2s ease-in;
}
.chat-popup-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.chat-popup-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
