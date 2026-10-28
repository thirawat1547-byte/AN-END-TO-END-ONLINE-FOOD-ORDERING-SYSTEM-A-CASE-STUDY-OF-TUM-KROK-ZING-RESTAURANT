<template>
  <div class="space-y-4 font-sans">
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

    <!-- NONG SOMTUM AI CHAT CANVAS (WHITE THEME) -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm relative flex flex-col overflow-hidden min-h-[calc(100vh-140px)] somtum-canvas">
      
      <!-- Top Subtle Control Bar inside Canvas -->
      <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-20 bg-white/70 backdrop-blur-xs">
        <!-- Left: น้องส้มตำ AI Brand & Live Status -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2d5a43] via-[#3f634b] to-[#557c61] text-white flex items-center justify-center text-lg shadow-sm">
            🤖
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="text-sm font-bold text-slate-800 tracking-tight">น้องส้มตำ AI</h1>
              <span class="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-1.5 py-0.5 rounded font-bold">BOT</span>
              <span class="text-[10px] text-emerald-600 font-medium hidden sm:inline">• ✨ Gemini AI</span>
            </div>
            <p class="text-[11px] text-slate-400">ผู้ช่วยอัจฉริยะประจำร้านตำครกซิ่ง ตอบทันใจ 24 ชม.</p>
          </div>
        </div>

        <!-- Right: Actions (FAQ Knowledge Base modal & Reset chat) -->
        <div class="flex items-center gap-2">
          <!-- Button: Open FAQ Knowledge Base -->
          <button 
            @click="showKnowledgeModal = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#2d5a43] border border-slate-200 hover:border-emerald-200 text-xs font-medium transition shadow-2xs"
            title="จัดการคลังคำตอบ FAQ และบุคลิกบอท"
          >
            <span>📚</span>
            <span class="hidden sm:inline">คลังคำตอบ FAQ</span>
          </button>

          <!-- Button: Clear/Reset Chat -->
          <button 
            v-if="hasUserStartedChat"
            @click="resetChat"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs font-medium transition shadow-2xs"
            title="เริ่มบทสนทนาใหม่"
          >
            <span>🔄</span>
            <span class="hidden sm:inline">เริ่มคุยใหม่</span>
          </button>
        </div>
      </div>

      <!-- STATE A: EMPTY / INITIAL VIEW ("เราจะเริ่มจากตรงไหนก่อนดี") -->
      <div 
        v-if="!hasUserStartedChat" 
        class="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10"
      >
        <!-- Center Bot Avatar -->
        <div class="relative mb-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#2d5a43] via-[#3f634b] to-[#557c61] text-white flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-white">
            🤖
          </div>
          <span class="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
        </div>

        <!-- Center Heading (Gemini style) -->
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight text-center mb-2 select-none">
          เราจะเริ่มจากตรงไหนก่อนดี
        </h2>

        <!-- Subtitle -->
        <p class="text-xs sm:text-sm text-slate-500 text-center mb-8 flex items-center justify-center gap-1.5">
          <span>ถามข้อมูลร้าน เมนูอาหาร ยอดขาย หรือปรึกษาน้องส้มตำ AI ได้เลยค่ะ 🌶️</span>
          <span class="text-emerald-700 font-semibold">• ✨ ขับเคลื่อนโดย Gemini AI</span>
        </p>

        <!-- Center Iconic Pill Input Bar (น้องส้มตำ AI Theme) -->
        <div class="w-full max-w-2xl bg-white rounded-full shadow-[0_4px_24px_rgba(45,90,67,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200 hover:border-emerald-300 focus-within:border-[#2d5a43] focus-within:shadow-[0_8px_30px_rgba(45,90,67,0.12)] px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-200">
          <!-- Plus (+) Icon Button -->
          <button 
            type="button" 
            @click="triggerSuggestionDropdown"
            class="w-9 h-9 rounded-full hover:bg-emerald-50 text-[#2d5a43] flex items-center justify-center text-xl font-light transition shrink-0"
            title="สุ่มคำถามยอดนิยม"
          >
            +
          </button>

          <!-- Input Field -->
          <input 
            v-model="simInput"
            @keydown.enter.prevent="simSubmit"
            type="text" 
            placeholder="พิมพ์ถามน้องส้มตำ AI..."
            class="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none min-w-0"
            :disabled="simIsTyping"
          />

          <!-- Right Controls inside Pill -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Bot Pill Badge -->
            <div class="flex items-center gap-1 text-[11px] sm:text-xs text-[#2d5a43] bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium">
              <span>🤖 น้องส้มตำ AI</span>
            </div>

            <!-- Microphone Button -->
            <button 
              type="button"
              @click="toggleMic"
              :class="isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'hover:bg-slate-100 text-slate-500'"
              class="w-9 h-9 rounded-full flex items-center justify-center transition"
              title="พิมพ์ด้วยเสียง"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>

            <!-- Send Button -->
            <button 
              type="button"
              @click="simSubmit"
              :disabled="!simInput.trim() || simIsTyping"
              class="w-9 h-9 rounded-full bg-[#2d5a43] hover:bg-[#183324] disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition text-sm shadow-xs active:scale-95"
            >
              ➔
            </button>
          </div>
        </div>

        <!-- Suggestion Chips Row -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
          <button 
            v-for="chip in quickChips" 
            :key="chip.text"
            @click="simSendPrompt(chip.text)"
            class="text-xs bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-[#2d5a43] border border-slate-200/90 hover:border-emerald-300 px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <span>{{ chip.icon }}</span>
            <span>{{ chip.text }}</span>
          </button>
        </div>
      </div>

      <!-- STATE B: ACTIVE CONVERSATION STREAM -->
      <div 
        v-else 
        class="flex-1 flex flex-col justify-between overflow-hidden relative z-10"
      >
        <!-- Scrollable Messages Container -->
        <div ref="simContainer" class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          <div class="max-w-3xl mx-auto space-y-6">
            <!-- Messages Loop -->
            <div 
              v-for="(msg, i) in simMessages" 
              :key="i"
              class="space-y-2 animate-fade-in"
            >
              <!-- User Message: Right-Aligned Bubble -->
              <div v-if="msg.sender === 'user'" class="flex justify-end">
                <div class="max-w-[85%] sm:max-w-[75%] bg-[#f0f4f9] text-slate-800 px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-xs border border-slate-200/60">
                  <div class="whitespace-pre-wrap">{{ msg.text }}</div>
                  <div class="text-[10px] text-slate-400 text-right mt-1">{{ msg.time }}</div>
                </div>
              </div>

              <!-- Bot Message: Left-Aligned with Cute 🤖 Avatar -->
              <div v-else class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2d5a43] via-[#3f634b] to-[#557c61] text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm border border-emerald-200">
                  🤖
                </div>

                <!-- Bot Response Body -->
                <div class="flex-1 space-y-2 max-w-[90%]">
                  <div class="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>น้องส้มตำ AI</span>
                    <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">BOT</span>
                    <span class="text-[10px] font-normal text-slate-400">• {{ msg.time }}</span>
                  </div>

                  <div 
                    class="text-sm text-slate-800 leading-relaxed space-y-1.5 somtum-text"
                    v-html="formatMessage(msg.text)"
                  ></div>

                  <!-- Bot Actions Footer (Copy, Read Aloud, Helpful) -->
                  <div class="flex items-center gap-1 pt-1 text-slate-400">
                    <button 
                      @click="copyMessage(msg.text)" 
                      title="คัดลอกข้อความ"
                      class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition text-xs flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button 
                      @click="speakMessage(msg.text)" 
                      title="อ่านออกเสียง"
                      class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition text-xs"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>

                    <button 
                      @click="showToast('คำตอบถูกต้อง', 'ขอบคุณสำหรับข้อเสนอแนะในการปรับปรุงคำตอบค่ะ', 'success')" 
                      title="คำตอบมีประโยชน์"
                      class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition text-xs"
                    >
                      👍
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing Indicator (น้องส้มตำ AI Thinking) -->
            <div v-if="simIsTyping" class="flex items-start gap-3.5 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shrink-0 border border-emerald-300">
                🤖
              </div>
              <div class="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-1.5 h-1.5 bg-[#2d5a43] rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-[#3f634b] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span class="ml-1 text-slate-500 font-medium">น้องส้มตำ AI กำลังค้นหาคำตอบ...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Docked Bottom Input Bar -->
        <div class="p-4 bg-gradient-to-t from-white via-white to-transparent pt-6 border-t border-slate-100">
          <div class="max-w-3xl mx-auto space-y-2">
            <div class="w-full bg-white rounded-full shadow-[0_4px_24px_rgba(45,90,67,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200 hover:border-emerald-300 focus-within:border-[#2d5a43] focus-within:shadow-[0_8px_30px_rgba(45,90,67,0.12)] px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-200">
              <!-- Plus (+) Icon Button -->
              <button 
                type="button" 
                @click="triggerSuggestionDropdown"
                class="w-9 h-9 rounded-full hover:bg-emerald-50 text-[#2d5a43] flex items-center justify-center text-xl font-light transition shrink-0"
                title="เลือกคำถามด่วน"
              >
                +
              </button>

              <!-- Input Field -->
              <input 
                v-model="simInput"
                @keydown.enter.prevent="simSubmit"
                type="text" 
                placeholder="พิมพ์ถามน้องส้มตำ AI..."
                class="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none min-w-0"
                :disabled="simIsTyping"
              />

              <!-- Right Controls inside Pill -->
              <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex items-center gap-1 text-[11px] sm:text-xs text-[#2d5a43] bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium">
                  <span>🤖 น้องส้มตำ AI</span>
                </div>

                <!-- Microphone Button -->
                <button 
                  type="button"
                  @click="toggleMic"
                  :class="isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'hover:bg-slate-100 text-slate-500'"
                  class="w-9 h-9 rounded-full flex items-center justify-center transition"
                  title="พิมพ์ด้วยเสียง"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>

                <!-- Send Button -->
                <button 
                  type="button"
                  @click="simSubmit"
                  :disabled="!simInput.trim() || simIsTyping"
                  class="w-9 h-9 rounded-full bg-[#2d5a43] hover:bg-[#183324] disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition text-sm shadow-xs active:scale-95"
                >
                  ➔
                </button>
              </div>
            </div>

            <!-- Disclaimer Notice -->
            <p class="text-[11px] text-center text-slate-400">
              ⚡ น้องส้มตำ AI ขับเคลื่อนโดย Google Gemini AI • ข้อมูลและคำตอบอิงจากร้านตำครกซิ่ง
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: KNOWLEDGE BASE & FAQ MANAGEMENT -->
    <div 
      v-if="showKnowledgeModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">📚</span>
            <div>
              <h3 class="text-sm font-bold text-slate-800">คลังคำตอบอัตโนมัติ & บุคลิกบอท (Knowledge Base)</h3>
              <p class="text-xs text-slate-500">จัดการคำตอบที่น้องส้มตำ AI จะใช้ตอบลูกค้าโดยอัตโนมัติ</p>
            </div>
          </div>
          <button @click="showKnowledgeModal = false" class="text-slate-400 hover:text-slate-600 text-lg w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition">
            ✕
          </button>
        </div>

        <!-- Modal Content: Persona + FAQ List -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <!-- Persona Config -->
          <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <h4 class="text-xs font-bold text-[#2d5a43] flex items-center gap-1.5">
              <span>🎭</span> บุคลิกภาพน้องส้มตำ AI
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อที่แสดง</label>
                <input v-model="botPersona.name" type="text" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">สโลแกน</label>
                <input v-model="botPersona.title" type="text" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none" />
              </div>
            </div>
          </div>

          <!-- FAQ List Header -->
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-800">รายการคำถามที่พบบ่อย ({{ faqList.length }} ข้อ)</h4>
            <button 
              @click="openAddFaqModal"
              class="text-xs bg-[#2d5a43] hover:bg-[#183324] text-white px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1"
            >
              <span>➕</span> เพิ่มคำถาม-คำตอบ
            </button>
          </div>

          <!-- FAQ Cards -->
          <div class="space-y-2.5">
            <div 
              v-for="(faq, idx) in faqList" 
              :key="idx"
              class="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition bg-white space-y-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                    Q{{ idx + 1 }}
                  </span>
                  <span class="text-xs font-bold text-slate-800">{{ faq.question }}</span>
                  <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {{ faq.category }}
                  </span>
                </div>
                <button @click="removeFaq(idx)" title="ลบ" class="text-xs text-slate-400 hover:text-red-500 p-1">
                  🗑️
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-1">
                <span class="text-[10px] text-slate-400">คีย์เวิร์ด:</span>
                <span 
                  v-for="kw in faq.keywords" 
                  :key="kw"
                  class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
                >
                  #{{ kw }}
                </span>
              </div>

              <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                <span class="font-semibold text-emerald-800">ตอบ:</span> {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button @click="showKnowledgeModal = false" class="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2d5a43] hover:bg-[#183324] text-white transition">
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>

    <!-- SUB-MODAL: ADD NEW FAQ -->
    <div 
      v-if="showModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-800">เพิ่มคำถาม-คำตอบอัตโนมัติ</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">หมวดหมู่</label>
            <select v-model="newFaq.category" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none">
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="เมนูอาหาร">เมนูอาหาร</option>
              <option value="เวลาทำการ">เวลาทำการ</option>
              <option value="เดลิเวอรี">เดลิเวอรี</option>
              <option value="โปรโมชัน">โปรโมชัน</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">หัวข้อคำถาม</label>
            <input 
              type="text" 
              v-model="newFaq.question" 
              placeholder="เช่น มีเมนูเจไหม?" 
              class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">คีย์เวิร์ดตรวจจับ (คั่นด้วยจุลภาค ,)</label>
            <input 
              type="text" 
              v-model="newFaq.keywordsStr" 
              placeholder="เช่น เจ, มังสวิรัติ, vegan" 
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
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { API_BASE } from '../../config/api.js'

const showKnowledgeModal = ref(false)
const showModal = ref(false)
const isListening = ref(false)
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

const botPersona = ref({
  name: 'น้องส้มตำ AI',
  title: 'ผู้ช่วยร้านตำครกซิ่ง • ตอบทันใจ',
  greeting: 'สวัสดีค่ะคุณลูกค้า! ยินดีต้อนรับสู่ร้านตำครกซิ่งค่ะ 🌶️✨ มีอะไรให้ช่วยแนะนำเมนูหรือสอบถามข้อมูลร้านได้เลยนะคะ',
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

const quickChips = [
  { icon: '📊', text: 'สรุปยอดขายและคำสั่งซื้อวันนี้' },
  { icon: '⚠️', text: 'ตรวจสอบวัตถุดิบที่ใกล้หมดสต็อก' },
  { icon: '🍳', text: 'ดูสถานะออเดอร์ในครัว KDS ตอนนี้' },
  { icon: '🪑', text: 'ตรวจสอบผังโต๊ะอาหารว่ามีโต๊ะว่างกี่โต๊ะ' }
]

const newFaq = ref({
  category: 'ทั่วไป',
  question: '',
  keywordsStr: '',
  answer: ''
})

const ADMIN_CHAT_STORAGE_KEY = 'tumkrokzing_admin_sim_chat'

const getTodayDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getSimTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const simMessages = ref([])

// ตรวจสอบว่ามีผู้ใช้เริ่มคุยแล้วหรือไม่ (ถ้ายังไม่มี ให้แสดงหน้าทักทาย "เราจะเริ่มจากตรงไหนก่อนดี")
const hasUserStartedChat = computed(() => {
  return simMessages.value.some(m => m.sender === 'user')
})

// โหลดประวัติประจำวัน
const loadDailySimChat = () => {
  try {
    const raw = localStorage.getItem(ADMIN_CHAT_STORAGE_KEY)
    if (!raw) return false

    const data = JSON.parse(raw)
    const today = getTodayDateString()

    if (data && data.date === today && Array.isArray(data.messages) && data.messages.length > 0) {
      simMessages.value = data.messages
      return true
    } else {
      localStorage.removeItem(ADMIN_CHAT_STORAGE_KEY)
      simMessages.value = []
      return false
    }
  } catch {
    localStorage.removeItem(ADMIN_CHAT_STORAGE_KEY)
    simMessages.value = []
    return false
  }
}

// บันทึกประวัติประจำวัน
const saveDailySimChat = () => {
  try {
    const today = getTodayDateString()
    const payload = {
      date: today,
      messages: simMessages.value
    }
    localStorage.setItem(ADMIN_CHAT_STORAGE_KEY, JSON.stringify(payload))
  } catch (err) {
    console.error('Error saving admin sim chat history:', err)
  }
}

onMounted(() => {
  loadDailySimChat()
})

// บันทึกอัตโนมัติเมื่อมีข้อความใหม่
watch(
  simMessages,
  () => {
    saveDailySimChat()
  },
  { deep: true }
)

const resetChat = () => {
  simMessages.value = []
  simInput.value = ''
  saveDailySimChat()
  showToast('เริ่มแชทใหม่', 'พร้อมสำหรับการสนทนากับน้องส้มตำ AI แล้วค่ะ', 'success')
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
  showToast('เพิ่มคำถามสำเร็จ', 'บันทึกคำถาม-คำตอบเข้าสู่ Knowledge Base แล้วค่ะ', 'success')
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

const simSendPrompt = (prompt) => {
  simInput.value = prompt
  simSubmit()
}

const triggerSuggestionDropdown = () => {
  const suggestions = [
    'สรุปยอดขายและคำสั่งซื้อวันนี้ให้หน่อย',
    'มีวัตถุดิบตัวไหนใกล้หมดสต็อกบ้าง ต้องสั่งซื้อเพิ่มไหม',
    'สถานะออเดอร์ในครัว KDS ตอนนี้มีค้างอยู่กี่ออเดอร์',
    'ผังโต๊ะอาหารตอนนี้มีโต๊ะว่างกี่โต๊ะ',
    'สรุปภาพรวมการดำเนินงานของร้านตอนนี้ให้หน่อย'
  ]
  const random = suggestions[Math.floor(Math.random() * suggestions.length)]
  simInput.value = random
}

// ไมโครโฟน
const toggleMic = () => {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRec) {
    showToast('เบราว์เซอร์ไม่รองรับ', 'เบราว์เซอร์นี้ไม่รองรับการพิมพ์ด้วยเสียง', 'warning')
    return
  }

  if (isListening.value) {
    isListening.value = false
    return
  }

  try {
    const recognition = new SpeechRec()
    recognition.lang = 'th-TH'
    recognition.interimResults = false

    recognition.onstart = () => {
      isListening.value = true
      showToast('กำลังฟัง...', 'กรุณาพูดข้อความที่ต้องการถามน้องส้มตำ AI ได้เลยค่ะ', 'success')
    }

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      simInput.value = (simInput.value ? simInput.value + ' ' : '') + text
      isListening.value = false
    }

    recognition.onerror = () => {
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }

    recognition.start()
  } catch {
    isListening.value = false
  }
}

const copyMessage = (text) => {
  const clean = text.replace(/<[^>]*>?/gm, '')
  navigator.clipboard?.writeText(clean)
  showToast('คัดลอกสำเร็จ', 'คัดลอกข้อความลงในคลิปบอร์ดแล้วค่ะ', 'success')
}

const speakMessage = (text) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text.replace(/<[^>]*>?/gm, '')
  const utter = new SpeechSynthesisUtterance(clean)
  utter.lang = 'th-TH'
  window.speechSynthesis.speak(utter)
}

const formatMessage = (text) => {
  if (!text) return ''
  return text
    .replace(/^###\s*(.+)$/gm, '<div class="font-bold text-[#1e4d35] text-sm mt-2 mb-0.5">$1</div>')
    .replace(/^##\s*(.+)$/gm, '<div class="font-bold text-[#163a28] text-base mt-2 mb-1">$1</div>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/^\*\s+(.+)$/gm, '<div class="flex gap-1.5 my-0.5"><span class="text-[#2d5a43] shrink-0 font-bold">•</span><span>$1</span></div>')
    .replace(/^---+$/gm, '<hr class="border-slate-200 my-1.5">')
    .replace(/\n/g, '<br>')
}

const simSubmit = async () => {
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

  let botReply = ''
  try {
    const historyPayload = simMessages.value.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text.replace(/<[^>]*>?/gm, '')
    }))

    const res = await fetch(`${API_BASE}/chatbot/admin-ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, history: historyPayload })
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.reply) {
        botReply = data.reply
      }
    }
  } catch {
    // fallback
  }

  if (!botReply) {
    const lower = q.toLowerCase()
    const matchedFaq = faqList.value.find(f => 
      f.keywords.some(k => lower.includes(k.toLowerCase())) || lower.includes(f.question.toLowerCase())
    )

    if (matchedFaq) {
      botReply = matchedFaq.answer
    } else if (lower.includes('ยอดขาย') || lower.includes('ขายได้') || lower.includes('รายได้') || lower.includes('เงิน')) {
      botReply = '📊 <b>สรุปยอดขายร้านตำครกซิ่ง:</b> ยอดขายสะสมทั้งหมด <b>฿2,510</b> (รวม 33 ออเดอร์) ระบบพร้อมเปิดรับออเดอร์ตลอดวันค่ะ 📈'
    } else if (lower.includes('วัตถุดิบ') || lower.includes('สต็อก') || lower.includes('หมด')) {
      botReply = '⚠️ <b>แจ้งเตือนสต็อกวัตถุดิบ:</b> ตรวจพบ <b>พริกป่น</b> คงเหลือ 1 กก. (ต่ำกว่าเกณฑ์ 1.5 กก.) แนะนำให้สั่งซื้อเพิ่มทันทีค่ะ 🌶️'
    } else if (lower.includes('โต๊ะ') || lower.includes('ที่นั่ง') || lower.includes('ผัง')) {
      botReply = '🪑 <b>ผังโต๊ะอาหาร:</b> ปัจจุบันมีโต๊ะว่างพร้อมให้บริการทั้งหมด 5 โต๊ะ (T-01 ถึง T-05) ค่ะ'
    } else if (lower.includes('ครัว') || lower.includes('kds') || lower.includes('ออเดอร์') || lower.includes('ปรุง')) {
      botReply = '🍳 <b>จอครัว KDS:</b> ขณะนี้ไม่มีออเดอร์ค้างในห้องครัว ทุกออเดอร์ปรุงและเสิร์ฟเรียบร้อยค่ะ ✨'
    } else if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hello')) {
      botReply = 'สวัสดีค่ะผู้จัดการ! หนูน้องส้มตำ AI พร้อมช่วยรายงานยอดขาย เช็กสต็อกวัตถุดิบ และดูสถานะร้านให้ค่ะ 😊🌶️'
    } else {
      botReply = `น้องส้มตำ AI กำลังประมวลผลข้อมูลเกี่ยวกับ "<b>${q}</b>" ให้ผู้จัดการค่ะ สามารถสอบถามเรื่องยอดขาย สต็อก หรือออเดอร์ในครัวได้ตลอดเลยนะคะ 🌶️✨`
    }
  }

  setTimeout(() => {
    simIsTyping.value = false
    simMessages.value.push({
      sender: 'bot',
      text: botReply,
      time: getSimTime()
    })
    scrollSimToBottom()
  }, 400)
}
</script>

<style scoped>
/* น้องส้มตำ AI White Theme Canvas with Soft Mint/Emerald Ambient Aura */
.somtum-canvas {
  background: radial-gradient(ellipse 65% 55% at 50% 48%, rgba(220, 252, 231, 0.45) 0%, rgba(240, 253, 244, 0.28) 40%, #ffffff 75%);
}

.somtum-text :deep(b) {
  color: #1e4d35;
  font-weight: 600;
}

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
