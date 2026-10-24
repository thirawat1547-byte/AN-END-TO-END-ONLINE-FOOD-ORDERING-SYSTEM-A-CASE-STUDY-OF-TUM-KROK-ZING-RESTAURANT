<template>
  <div class="space-y-6">
    <!-- Floating Toast Notification -->
    <transition name="fade">
      <div 
        v-if="toast.show" 
        class="fixed bottom-6 right-6 z-[9999] bg-white border rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3 animate-fade-in max-w-sm"
        :class="toast.type === 'success' ? 'border-emerald-300' : 'border-amber-300'"
      >
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          :class="toast.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
        >
          {{ toast.type === 'success' ? '✓' : '⚠️' }}
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-800">{{ toast.title }}</h4>
          <p class="text-[11px] text-slate-500 leading-tight mt-0.5">{{ toast.message }}</p>
        </div>
      </div>
    </transition>

    <!-- Header Page Title -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-[#2d5a43] text-white flex items-center justify-center text-2xl shadow-md">
          🤖
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-800">จัดการแชทบอท AI ประจำร้าน</h1>
            <span class="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Mock Mode (UI Only)
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            ตั้งค่าผู้ช่วยอัจฉริยะ ตอบคำถามลูกค้า แนะนำเมนูอาหาร และจัดการข้อความอัตโนมัติ 24 ชม.
          </p>
        </div>
      </div>

      <!-- Quick Toggle Bot Status -->
      <div class="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
        <span class="text-xs font-medium text-slate-600">สถานะแชทบอท:</span>
        <button 
          @click="toggleBotStatus"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            botEnabled ? 'bg-[#2d5a43]' : 'bg-slate-300'
          ]"
        >
          <span 
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
              botEnabled ? 'translate-x-5' : 'translate-x-0'
            ]"
          />
        </button>
        <span class="text-xs font-bold" :class="botEnabled ? 'text-emerald-700' : 'text-slate-500'">
          {{ botEnabled ? 'เปิดทำงาน' : 'ปิดชั่วคราว' }}
        </span>
      </div>
    </div>

    <!-- Stats Overview Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">ข้อความตอบกลับวันนี้</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">168 <span class="text-xs font-normal text-slate-400">ข้อความ</span></h3>
          <span class="inline-flex items-center text-[11px] text-emerald-600 font-medium mt-1">
            ↑ +24% เทียบกับเมื่อวาน
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
          💬
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">ความเร็วตอบกลับเฉลี่ย</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">0.6 <span class="text-xs font-normal text-slate-400">วินาที</span></h3>
          <span class="inline-flex items-center text-[11px] text-emerald-600 font-medium mt-1">
            ⚡ รวดเร็วทันใจ
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
          ⏱️
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">ความพึงพอใจลูกค้า</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">98.5%</h3>
          <span class="inline-flex items-center text-[11px] text-emerald-600 font-medium mt-1">
            ⭐ เรตติ้ง 4.9/5
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
          ⭐
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">คำถามที่ตอบแทนแอดมิน</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">91.2%</h3>
          <span class="inline-flex items-center text-[11px] text-emerald-600 font-medium mt-1">
            🎯 ลดภาระแอดมิน
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
          🛡️
        </div>
      </div>
    </div>

    <!-- Main Content Layout (2 Columns: Config/FAQs & Live Bot Preview) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Bot Persona & FAQ Table (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Persona Setting -->
        <div class="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>🎭</span> บุคลิกภาพและข้อมูลบอท (Bot Persona)
            </h2>
            <button @click="savePersona" class="text-xs bg-[#2d5a43] hover:bg-[#183324] text-white px-3 py-1.5 rounded-lg transition font-medium">
              บันทึกการตั้งค่า
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">ชื่อที่แสดงของบอท</label>
              <input 
                type="text" 
                v-model="botPersona.name" 
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-[#2d5a43] outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">ตำแหน่ง / สโลแกน</label>
              <input 
                type="text" 
                v-model="botPersona.title" 
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-[#2d5a43] outline-none" 
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">ข้อความทักทายแรกเมื่อลูกค้าเปิดแชท</label>
            <textarea 
              v-model="botPersona.greeting" 
              rows="3" 
              class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-[#2d5a43] outline-none leading-relaxed"
            ></textarea>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs font-semibold text-slate-600">สไตล์การพูด:</span>
            <div class="flex gap-2">
              <button 
                v-for="tone in tones" 
                :key="tone.id"
                @click="botPersona.tone = tone.id"
                :class="[
                  'text-xs px-3 py-1.5 rounded-xl border transition',
                  botPersona.tone === tone.id 
                    ? 'bg-[#2d5a43] text-white border-[#2d5a43] font-medium' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                ]"
              >
                {{ tone.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- FAQ Auto Reply Rules List -->
        <div class="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📚</span> คลังคำตอบอัตโนมัติ (FAQ Knowledge Base)
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">บอทจะเลือกคำตอบเหล่านี้โดยอัตโนมัติเมื่อพบคีย์เวิร์ดของลูกค้า</p>
            </div>

            <button 
              @click="openAddFaqModal"
              class="text-xs bg-emerald-50 hover:bg-emerald-100 text-[#2d5a43] font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
            >
              <span>➕</span> เพิ่มคำถาม-คำตอบ
            </button>
          </div>

          <!-- FAQ Items -->
          <div class="space-y-2.5">
            <div 
              v-for="(faq, idx) in faqList" 
              :key="idx"
              class="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition bg-slate-50/50 space-y-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                    Q{{ idx + 1 }}
                  </span>
                  <span class="text-xs font-bold text-slate-800">{{ faq.question }}</span>
                  <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {{ faq.category }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <button @click="testFaqInSimulator(faq)" title="ทดสอบในเครื่องจำลอง" class="text-xs text-slate-400 hover:text-[#2d5a43] p-1">
                    ▶️
                  </button>
                  <button @click="removeFaq(idx)" title="ลบ" class="text-xs text-slate-400 hover:text-red-500 p-1">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Keyword pills -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] text-slate-400">คีย์เวิร์ดตรวจจับ:</span>
                <span 
                  v-for="kw in faq.keywords" 
                  :key="kw"
                  class="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                >
                  #{{ kw }}
                </span>
              </div>

              <!-- Reply snippet -->
              <p class="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/70 leading-relaxed">
                <span class="font-semibold text-emerald-800">ตอบ:</span> {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Bot Simulator (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm flex flex-col h-[650px]">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 class="text-sm font-bold text-slate-800">เครื่องจำลองการสนทนา (Live Simulator)</h2>
            </div>
            <button @click="resetSimulator" class="text-xs text-slate-400 hover:text-slate-600 transition">
              รีเซ็ตแชท
            </button>
          </div>

          <!-- Simulator Screen Area -->
          <div class="flex-1 bg-slate-50/70 rounded-2xl border border-slate-200/80 my-3 p-3 flex flex-col overflow-hidden">
            <!-- Simulated header -->
            <div class="bg-[#2d5a43] text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-xs mb-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  🤖
                </div>
                <div>
                  <div class="text-xs font-bold leading-tight">{{ botPersona.name }}</div>
                  <div class="text-[10px] text-emerald-100/70 leading-none">{{ botPersona.title }}</div>
                </div>
              </div>
              <span class="text-[9px] bg-emerald-400/20 text-emerald-200 px-1.5 py-0.5 rounded font-mono">ONLINE</span>
            </div>

            <!-- Simulated Messages List -->
            <div ref="simContainer" class="flex-1 overflow-y-auto space-y-2.5 px-1 pr-2">
              <div 
                v-for="(msg, i) in simMessages" 
                :key="i"
                class="flex items-end gap-1.5"
                :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div 
                  v-if="msg.sender === 'bot'" 
                  class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center shrink-0 border border-emerald-200"
                >
                  🤖
                </div>

                <div 
                  class="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-2xs"
                  :class="msg.sender === 'user' 
                    ? 'bg-[#2d5a43] text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'"
                >
                  <div v-html="msg.text"></div>
                  <div 
                    class="text-[9px] mt-1 text-right"
                    :class="msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'"
                  >
                    {{ msg.time }}
                  </div>
                </div>
              </div>

              <!-- Typing indicator in simulator -->
              <div v-if="simIsTyping" class="flex items-center gap-1.5">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center border border-emerald-200">
                  🤖
                </div>
                <div class="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 rounded-bl-none flex items-center gap-1">
                  <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                  <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>

            <!-- Quick click test pills -->
            <div class="pt-2 border-t border-slate-200/60 mt-1">
              <div class="text-[10px] text-slate-400 mb-1 font-medium">กดเพื่อลองส่ง:</div>
              <div class="flex flex-wrap gap-1">
                <button 
                  v-for="pill in simQuickPrompts" 
                  :key="pill"
                  @click="simSendPrompt(pill)"
                  class="text-[10px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#2d5a43] border border-slate-200 px-2 py-0.5 rounded-lg transition"
                >
                  {{ pill }}
                </button>
              </div>
            </div>
          </div>

          <!-- Simulator Input Box -->
          <form @submit.prevent="simSubmit" class="flex items-center gap-2 pt-1">
            <input 
              type="text" 
              v-model="simInput" 
              placeholder="ทดสอบพิมพ์ข้อความ..." 
              class="flex-1 bg-slate-100 focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#2d5a43] outline-none transition"
              :disabled="simIsTyping"
            />
            <button 
              type="submit" 
              :disabled="!simInput.trim() || simIsTyping"
              class="px-4 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs transition shadow-sm"
            >
              ส่ง
            </button>
          </form>
        </div>
      </div>

    </div>

    <!-- Modal: Add / Edit FAQ -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-sm text-slate-800">➕ เพิ่มคำถาม-คำตอบอัตโนมัติ</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">หมวดหมู่</label>
            <select v-model="newFaq.category" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none">
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="เมนูอาหาร">เมนูอาหาร</option>
              <option value="เวลาทำการ">เวลาทำการ</option>
              <option value="เดลิเวอรี">เดลิเวอรี & ค่าส่ง</option>
              <option value="โปรโมชัน">โปรโมชัน & คูปอง</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">หัวข้อคำถาม</label>
            <input 
              type="text" 
              v-model="newFaq.question" 
              placeholder="เช่น มีเมนูมังสวิรัติไหม?" 
              class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">คีย์เวิร์ดตรวจจับ (คั่นด้วยจุลภาค)</label>
            <input 
              type="text" 
              v-model="newFaq.keywordsStr" 
              placeholder="เช่น เจ, มังสวิรัติ, มัง, vegetarian" 
              class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">ข้อความตอบกลับของบอท</label>
            <textarea 
              v-model="newFaq.answer" 
              rows="3" 
              placeholder="ใส่คำตอบที่บอทจะส่งให้ลูกค้า..."
              class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button @click="showModal = false" class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
            ยกเลิก
          </button>
          <button @click="saveNewFaq" class="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2d5a43] hover:bg-[#183324] text-white shadow-sm">
            บันทึกคำตอบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const botEnabled = ref(true)
const showModal = ref(false)
const simInput = ref('')
const simIsTyping = ref(false)
const simContainer = ref(null)

const toast = ref({
  show: false,
  title: '',
  message: '',
  type: 'success'
})

const showToast = (title, message = '', type = 'success') => {
  toast.value = { show: true, title, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

const tones = [
  { id: 'friendly', label: '😊 เป็นกันเอง สนุกสนาน' },
  { id: 'polite', label: '👔 สุภาพ ทางการ' },
  { id: 'spicy', label: '🌶️ แซ่บนัว สไตล์อีสาน' }
]

const botPersona = ref({
  name: 'น้องส้มตำ AI',
  title: 'ผู้ช่วยร้านตำครกซิ่ง • ตอบทันใจ',
  greeting: 'สวัสดีครับคุณลูกค้า! ยินดีต้อนรับสู่ร้านตำครกซิ่งครับ 🌶️✨ มีอะไรให้ผมช่วยแนะนำเมนู หรือสอบถามข้อมูลร้านได้เลยครับ',
  tone: 'spicy'
})

const faqList = ref([
  {
    category: 'เมนูอาหาร',
    question: 'เมนูแนะนำยอดฮิตมีอะไรบ้าง?',
    keywords: ['เมนู', 'แนะนำ', 'ขายดี', 'อร่อย', 'signature'],
    answer: 'เมนูยอดนิยมของร้านเราคือ ส้มตำปูปลาร้าพริกแห้ง ข้าวกะเพราหมูสับกระทะร้อน ปีกไก่ทอดสมุนไพร และยำวุ้นเส้นรวมมิตรครับ 🌶️'
  },
  {
    category: 'เวลาทำการ',
    question: 'ร้านเปิด-ปิดกี่โมง?',
    keywords: ['เวลา', 'เปิด', 'ปิด', 'กี่โมง', 'วันไหน'],
    answer: 'ร้านตำครกซิ่งเปิดบริการทุกวันเวลา 10:00 - 21:00 น. ครับ ลูกค้าสามารถสั่งล่วงหน้าได้ตลอดเวลาเลยครับ 🍽️'
  },
  {
    category: 'เดลิเวอรี',
    question: 'ค่าจัดส่งคิดอย่างไรและมีส่งฟรีไหม?',
    keywords: ['ส่ง', 'เดลิ', 'ค่าส่ง', 'ส่งฟรี', 'ไรเดอร์'],
    answer: 'เรามีบริการจัดส่งผ่านไรเดอร์ประจำร้าน รวดเร็วทันใจ พร้อมโปรโมชั่นพิเศษ ส่งฟรีเมื่อสั่งครบ ฿300 ขึ้นไปครับ 🛵💨'
  },
  {
    category: 'โปรโมชัน',
    question: 'มีส่วนลดหรือโปรโมชั่นอะไรบ้างตอนนี้?',
    keywords: ['โปร', 'ลด', 'คูปอง', 'promotion', 'แถม'],
    answer: 'มีทั้งคูปองลด 10% สำหรับสมาชิกใหม่ และโปรโมชั่นซื้อคู่สุดคุ้ม สามารถกดดูที่แท็บโปรโมชั่นในหน้าหลักได้เลยครับ 🎉'
  }
])

const newFaq = ref({
  category: 'ทั่วไป',
  question: '',
  keywordsStr: '',
  answer: ''
})

const getSimTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const simMessages = ref([
  {
    sender: 'bot',
    text: botPersona.value.greeting,
    time: getSimTime()
  }
])

const simQuickPrompts = [
  'เมนูแนะนำมีอะไรบ้าง',
  'ร้านเปิดกี่โมง',
  'ค่าจัดส่งเท่าไหร่',
  'สวัสดีครับ'
]

const toggleBotStatus = () => {
  botEnabled.value = !botEnabled.value
  showToast(
    botEnabled.value ? 'เปิดใช้งานแชทบอทแล้ว' : 'ปิดการทำงานชั่วคราวแล้ว',
    botEnabled.value ? 'ลูกค้าในหน้าร้านสามารถแชทพูดคุยกับบอทได้ตามปกติ' : 'บอทจะไม่ตอบคำถามอัตโนมัติในหน้าร้าน',
    botEnabled.value ? 'success' : 'warning'
  )
}

const savePersona = () => {
  showToast('บันทึกข้อมูลสำเร็จ', 'อัปเดตข้อมูลบุคลิกและข้อความทักทายของบอทเรียบร้อยแล้ว', 'success')
}

const openAddFaqModal = () => {
  newFaq.value = {
    category: 'ทั่วไป',
    question: '',
    keywordsStr: '',
    answer: ''
  }
  showModal.value = true
}

const saveNewFaq = () => {
  if (!newFaq.value.question.trim() || !newFaq.value.answer.trim()) {
    showToast('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกหัวข้อคำถามและข้อความตอบกลับ', 'warning')
    return
  }

  const kws = newFaq.value.keywordsStr
    ? newFaq.value.keywordsStr.split(',').map(s => s.trim()).filter(Boolean)
    : [newFaq.value.question.slice(0, 4)]

  faqList.value.push({
    category: newFaq.value.category,
    question: newFaq.value.question,
    keywords: kws,
    answer: newFaq.value.answer
  })

  showModal.value = false
  showToast('เพิ่มคำถามสำเร็จ', 'เพิ่มกฎการตอบคำถามอัตโนมัติเข้าสู่ Knowledge Base แล้ว', 'success')
}

const removeFaq = (idx) => {
  faqList.value.splice(idx, 1)
  showToast('ลบรายการสำเร็จ', 'นำคำถามออกจากระบบเรียบร้อย', 'success')
}

const scrollSimToBottom = () => {
  nextTick(() => {
    if (simContainer.value) {
      simContainer.value.scrollTop = simContainer.value.scrollHeight
    }
  })
}

const resetSimulator = () => {
  simMessages.value = [
    {
      sender: 'bot',
      text: botPersona.value.greeting,
      time: getSimTime()
    }
  ]
}

const testFaqInSimulator = (faq) => {
  simSendPrompt(faq.question)
}

const simSendPrompt = (prompt) => {
  simInput.value = prompt
  simSubmit()
}

const simSubmit = () => {
  const q = simInput.value.trim()
  if (!q) return

  simMessages.value.push({
    sender: 'user',
    text: q,
    time: getSimTime()
  })
  simInput.value = ''
  scrollSimToBottom()

  simIsTyping.value = true
  setTimeout(() => {
    simIsTyping.value = false
    
    // Match against FAQ list keywords
    const lower = q.toLowerCase()
    const matchedFaq = faqList.value.find(f => 
      f.keywords.some(k => lower.includes(k.toLowerCase())) || lower.includes(f.question.toLowerCase())
    )

    let reply = ''
    if (matchedFaq) {
      reply = matchedFaq.answer
    } else if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hello')) {
      reply = 'สวัสดีครับ! มีอะไรให้ผู้ช่วยร้านตำครกซิ่งช่วยดูแลสอบถามได้เลยนะครับ 😊'
    } else {
      reply = `น้องส้มตำเข้าใจว่าคุณถามเกี่ยวกับ "${q}" กำลังตรวจสอบข้อมูลในระบบให้ครับ หรือคุณสามารถเลือกดูเมนูจากหน้าหลักได้เลยครับ 🌶️`
    }

    simMessages.value.push({
      sender: 'bot',
      text: reply,
      time: getSimTime()
    })
    scrollSimToBottom()
  }, 600)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
