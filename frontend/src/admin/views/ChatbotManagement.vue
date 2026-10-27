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

    <!-- Top Gemini Navigation Bar (White Theme) -->
    <header class="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <!-- Left: Gemini Brand & Model Selector -->
      <div class="flex items-center gap-3">
        <!-- Gemini 4-Point Star Gradient Icon -->
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-xs">
          <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#geminiGrad)" />
              <defs>
                <linearGradient id="geminiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4285F4" />
                  <stop offset="0.5" stop-color="#9B72CF" />
                  <stop offset="1" stop-color="#2D5A43" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-semibold text-slate-900 tracking-tight">Gemini</h1>
            <span class="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              ผู้ช่วยร้านตำครกซิ่ง AI
            </span>
          </div>
        </div>

        <!-- Model Dropdown Pill -->
        <div class="relative hidden sm:block">
          <button 
            @click="showModelMenu = !showModelMenu"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 transition"
          >
            <span>{{ selectedModel }}</span>
            <span class="text-[10px] text-slate-500">▼</span>
          </button>

          <div 
            v-if="showModelMenu"
            @click="showModelMenu = false"
            class="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
          >
            <button 
              v-for="model in availableModels" 
              :key="model.id"
              @click="selectedModel = model.name"
              class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between"
              :class="selectedModel === model.name ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'"
            >
              <span>{{ model.name }}</span>
              <span v-if="selectedModel === model.name">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Center: Switcher Tabs -->
      <div class="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
        <button 
          @click="activeTab = 'chat'"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
          :class="activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>✨</span>
          <span>แชท Gemini AI</span>
        </button>

        <button 
          @click="activeTab = 'knowledge'"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
          :class="activeTab === 'knowledge' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📚</span>
          <span>คลังคำตอบ FAQ</span>
        </button>

        <button 
          @click="activeTab = 'stats'"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
          :class="activeTab === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📊</span>
          <span>สถิติ & สรุป</span>
        </button>
      </div>

      <!-- Right: Gemini Action Buttons (matching screenshot) -->
      <div class="flex items-center gap-2">
        <!-- Download App / Export Chat Button -->
        <button 
          @click="exportConversation"
          class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition"
          title="ส่งออกบทสนทนา"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>ดาวน์โหลดแอป/แชท</span>
        </button>

        
      </div>
    </header>

    <!-- TAB 1: GEMINI AI CHAT CANVAS (White Theme) -->
    <div 
      v-show="activeTab === 'chat'" 
      class="bg-white rounded-3xl border border-slate-200/80 shadow-sm relative flex flex-col overflow-hidden min-h-[calc(100vh-230px)] gemini-canvas"
    >
      <!-- STATE A: EMPTY / INITIAL VIEW ("เราจะเริ่มจากตรงไหนก่อนดี") -->
      <div 
        v-if="!hasUserStartedChat" 
        class="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10"
      >
        <!-- Center Gemini Heading -->
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-800 tracking-tight text-center mb-8 select-none">
          เราจะเริ่มจากตรงไหนก่อนดี
        </h2>

        <!-- Center Iconic Gemini Pill Input Bar -->
        <div class="w-full max-w-2xl bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.09)] px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-200">
          <!-- Plus (+) Icon Button -->
          <button 
            type="button" 
            @click="triggerSuggestionDropdown"
            class="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-light transition shrink-0"
            title="เพิ่มหัวข้อหรือคำถามด่วน"
          >
            +
          </button>

          <!-- Input Field -->
          <input 
            v-model="simInput"
            @keydown.enter.prevent="simSubmit"
            type="text" 
            placeholder="ถาม Gemini"
            class="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none min-w-0"
            :disabled="simIsTyping"
          />

          <!-- Right Controls inside Pill -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Model badge inside pill -->
            <button 
              type="button"
              @click="showModelMenu = !showModelMenu"
              class="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 px-3 py-1.5 rounded-full font-medium transition"
            >
              <span>Gemini อัตโนมัติ</span>
              <span class="text-[9px] text-slate-400">▼</span>
            </button>

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
              class="w-9 h-9 rounded-full bg-[#1e4d35] hover:bg-[#163a28] disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition text-sm shadow-xs"
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
            class="text-xs bg-white/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 px-3.5 py-2 rounded-2xl shadow-xs transition flex items-center gap-1.5"
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
                <div class="max-w-[85%] sm:max-w-[75%] bg-[#f0f4f9] text-slate-800 px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-xs">
                  <div class="whitespace-pre-wrap">{{ msg.text }}</div>
                  <div class="text-[10px] text-slate-400 text-right mt-1">{{ msg.time }}</div>
                </div>
              </div>

              <!-- Gemini Bot Message: Left-Aligned with Sparkle Logo -->
              <div v-else class="flex items-start gap-3.5">
                <!-- Gemini 4-Point Sparkle Icon -->
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-emerald-500 p-[1.5px] shrink-0 mt-0.5 shadow-xs">
                  <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#geminiGradMsg)" />
                      <defs>
                        <linearGradient id="geminiGradMsg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#4285F4" />
                          <stop offset="0.5" stop-color="#9B72CF" />
                          <stop offset="1" stop-color="#2D5A43" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <!-- Bot Response Body -->
                <div class="flex-1 space-y-2 max-w-[90%]">
                  <div class="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>น้องส้มตำ AI</span>
                    <span class="text-[10px] font-normal text-slate-400">• {{ msg.time }}</span>
                  </div>

                  <div 
                    class="text-sm text-slate-800 leading-relaxed space-y-1.5 gemini-text"
                    v-html="formatMessage(msg.text)"
                  ></div>

                  <!-- Bot Actions Footer (Copy, Read Aloud, Regenerate) -->
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
                      @click="showToast('คำตอบถูกต้อง', 'ขอบคุณสำหรับข้อเสนอแนะในการปรับปรุงโมเดลครับ', 'success')" 
                      title="คำตอบมีประโยชน์"
                      class="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition text-xs"
                    >
                      👍
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing Indicator (Gemini Shimmer) -->
            <div v-if="simIsTyping" class="flex items-start gap-3.5 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-emerald-500 p-[1.5px] shrink-0">
                <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <span class="text-xs animate-spin">✦</span>
                </div>
              </div>
              <div class="bg-slate-100/90 rounded-2xl px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span class="ml-1 text-slate-400 font-medium">Gemini กำลังคิดคำตอบ...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Docked Bottom Input Bar (matching screenshot) -->
        <div class="p-4 bg-gradient-to-t from-white via-white to-transparent pt-6 border-t border-slate-100/80">
          <div class="max-w-3xl mx-auto space-y-2">
            <div class="w-full bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.09)] px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-200">
              <!-- Plus (+) Icon Button -->
              <button 
                type="button" 
                @click="triggerSuggestionDropdown"
                class="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-light transition shrink-0"
                title="เลือกคำถามด่วน"
              >
                +
              </button>

              <!-- Input Field -->
              <input 
                v-model="simInput"
                @keydown.enter.prevent="simSubmit"
                type="text" 
                placeholder="ถาม Gemini"
                class="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none min-w-0"
                :disabled="simIsTyping"
              />

              <!-- Right Controls inside Pill -->
              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Model badge inside pill -->
                <button 
                  type="button"
                  @click="showModelMenu = !showModelMenu"
                  class="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 px-3 py-1.5 rounded-full font-medium transition"
                >
                  <span>Gemini อัตโนมัติ</span>
                  <span class="text-[9px] text-slate-400">▼</span>
                </button>

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
                  class="w-9 h-9 rounded-full bg-[#1e4d35] hover:bg-[#163a28] disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition text-sm shadow-xs"
                >
                  ➔
                </button>
              </div>
            </div>

            <!-- Disclaimer Notice -->
            <p class="text-[11px] text-center text-slate-400">
              Gemini อาจแสดงข้อมูลที่ไม่ถูกต้อง รวมถึงข้อมูลเกี่ยวกับร้านค้า โปรดตรวจสอบความถูกต้องอีกครั้ง
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: FAQ KNOWLEDGE BASE & BOT PERSONA -->
    <div v-show="activeTab === 'knowledge'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Persona Setting (5 cols) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>🎭</span> บุคลิกภาพและข้อมูลบอท (Bot Persona)
            </h2>
            <button @click="savePersona" class="text-xs bg-[#2d5a43] hover:bg-[#183324] text-white px-3 py-1.5 rounded-lg transition font-medium">
              บันทึกการตั้งค่า
            </button>
          </div>

          <div class="space-y-3">
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

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">ข้อความทักทายแรกเมื่อลูกค้าเปิดแชท</label>
              <textarea 
                v-model="botPersona.greeting" 
                rows="3" 
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-[#2d5a43] outline-none leading-relaxed"
              ></textarea>
            </div>

            <div>
              <span class="block text-xs font-semibold text-slate-600 mb-1.5">สไตล์การพูด:</span>
              <div class="flex flex-wrap gap-2">
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
        </div>

        <!-- FAQ Auto Reply Rules List (7 cols) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
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
          <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
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
                  <button @click="testFaqInChat(faq)" title="ส่งทดสอบในแชท Gemini" class="text-xs text-slate-400 hover:text-[#2d5a43] p-1">
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
    </div>

    <!-- TAB 3: STATS & OVERVIEW -->
    <div v-show="activeTab === 'stats'" class="space-y-6">
      <!-- Stats Overview Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
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

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
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

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
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

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
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

      <!-- Quick Toggle Bot Status Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-800">เปิด/ปิดระบบตอบกลับอัตโนมัติของร้าน</h3>
          <p class="text-xs text-slate-500 mt-0.5">เมื่อปิดชั่วคราว บอทจะไม่ส่งข้อความตอบลูกค้าในหน้าเดลิเวอรี่</p>
        </div>

        <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
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
    </div>

    <!-- Modal: Add New FAQ -->
    <div 
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
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

const activeTab = ref('chat') // 'chat' | 'knowledge' | 'stats'
const botEnabled = ref(true)
const showModal = ref(false)
const showModelMenu = ref(false)
const selectedModel = ref('Gemini 3.8 Flash')
const isListening = ref(false)

const availableModels = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (แนะนำ)' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-auto', name: 'Gemini อัตโนมัติ' }
]

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
  { icon: '💡', text: 'แนะนำเมนูขายดีประจำร้าน' },
  { icon: '📊', text: 'สรุปยอดขายและคำสั่งซื้อวันนี้' },
  { icon: '🛵', text: 'โปรโมชั่นเดลิเวอรี่และค่าจัดส่ง' },
  { icon: '🕒', text: 'ร้านเปิดกี่โมงและปิดกี่โมง' }
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

// ตรวจสอบว่าผู้ใช้เริ่มบทสนทนาแล้วหรือยัง (ถ้ายังไม่มีข้อความ หรือมีแต่บอททักทายแรก ให้โชว์หน้า "เราจะเริ่มจากตรงไหนก่อนดี")
const hasUserStartedChat = computed(() => {
  return simMessages.value.some(m => m.sender === 'user')
})

// โหลดประวัติการแชทจำลองประจำวัน (ถ้าวันเดิมยังคงอยู่ ถ้าเปลี่ยนวันจะล้างออก)
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

// บันทึกประวัติการแชทจำลองประจำวัน
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

// บันทึกประวัติการแชทของวันนั้นโดยอัตโนมัติเมื่อมีข้อความใหม่
watch(
  simMessages,
  () => {
    saveDailySimChat()
  },
  { deep: true }
)

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

// เริ่มต้นบทสนทนาใหม่
const startNewChat = () => {
  simMessages.value = []
  simInput.value = ''
  saveDailySimChat()
  showToast('เริ่มแชทใหม่', 'พร้อมสำหรับการสนทนาใหม่แล้วครับ', 'success')
}

const testFaqInChat = (faq) => {
  activeTab.value = 'chat'
  simSendPrompt(faq.question)
}

const simSendPrompt = (prompt) => {
  simInput.value = prompt
  simSubmit()
}

const triggerSuggestionDropdown = () => {
  const suggestions = [
    'เมนูแนะนำยอดฮิตประจำร้าน',
    'ตรวจสอบโปรโมชั่นเดลิเวอรี่',
    'อัตราค่าส่งและระยะทางบริการ',
    'เปิดทำการกี่โมงถึงกี่โมง'
  ]
  const random = suggestions[Math.floor(Math.random() * suggestions.length)]
  simInput.value = random
}

// Speech Recognition (ไมโครโฟน)
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
      showToast('กำลังฟัง...', 'กรุณาพูดข้อความที่ต้องการถาม', 'success')
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

// คัดลอกข้อความ
const copyMessage = (text) => {
  const clean = text.replace(/<[^>]*>?/gm, '')
  navigator.clipboard?.writeText(clean)
  showToast('คัดลอกสำเร็จ', 'คัดลอกข้อความลงในคลิปบอร์ดแล้ว', 'success')
}

// อ่านออกเสียง (TTS)
const speakMessage = (text) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text.replace(/<[^>]*>?/gm, '')
  const utter = new SpeechSynthesisUtterance(clean)
  utter.lang = 'th-TH'
  window.speechSynthesis.speak(utter)
}

// ส่งออกบทสนทนา
const exportConversation = () => {
  if (simMessages.value.length === 0) {
    showToast('ไม่มีประวัติการแชท', 'ยังไม่มีข้อความสำหรับส่งออก', 'warning')
    return
  }

  const exportText = simMessages.value
    .map(m => `[${m.time}] ${m.sender === 'user' ? 'Admin' : 'Gemini AI'}: ${m.text.replace(/<[^>]*>?/gm, '')}`)
    .join('\n\n')

  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tumkrokzing-gemini-chat-${getTodayDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  showToast('ส่งออกสำเร็จ', 'ดาวน์โหลดไฟล์บทสนทนาเรียบร้อยแล้ว', 'success')
}

// แปลง Markdown ให้สวยงาม
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

// ส่งข้อความถาม Gemini AI
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

  // 1. ลองเรียก Gemini Backend API
  let botReply = ''
  try {
    const historyPayload = simMessages.value.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text.replace(/<[^>]*>?/gm, '')
    }))

    const res = await fetch(`${API_BASE}/chatbot/ask`, {
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
    // หากเชื่อมต่อเครือข่ายไม่ได้ ให้ใช้ Fallback Rule
  }

  // 2. หากไม่มีคำตอบจาก API ให้ตรวจจับผ่าน Knowledge Base FAQ
  if (!botReply) {
    const lower = q.toLowerCase()
    const matchedFaq = faqList.value.find(f => 
      f.keywords.some(k => lower.includes(k.toLowerCase())) || lower.includes(f.question.toLowerCase())
    )

    if (matchedFaq) {
      botReply = matchedFaq.answer
    } else if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hello')) {
      botReply = 'สวัสดีค่ะ! มีอะไรให้น้องส้มตำ AI ช่วยดูแลหรือสอบถามข้อมูลร้านตำครกซิ่งได้เลยนะคะ 😊'
    } else if (lower.includes('เมนู') || lower.includes('แนะนำ')) {
      botReply = 'เมนูแนะนำยอดฮิตของร้านตำครกซิ่ง ได้แก่: <br>1. <b>ส้มตำปูปลาร้าพริกแห้ง</b> (แซ่บนัวถึงใจ)<br>2. <b>ข้าวกะเพราหมูสับกระทะร้อน</b><br>3. <b>ปีกไก่ทอดสมุนไพรกรอบ</b><br>4. <b>ยำวุ้นเส้นรวมมิตรทะเล</b> ค่ะ 🌶️'
    } else if (lower.includes('ยอดขาย') || lower.includes('ขายดี')) {
      botReply = 'สรุปยอดขายวันนี้เบื้องต้น: ยอดขายรวมประมาณ <b>฿14,250</b> (32 ออเดอร์) เมนูขายดีอันดับ 1 คือ <b>ส้มตำปูปลาร้า</b> ค่ะ 📈'
    } else {
      botReply = `น้องส้มตำเข้าใจว่าคุณถามเกี่ยวกับ "<b>${q}</b>" ตอนนี้ข้อมูลระบบพร้อมให้บริการ หรือสามารถสอบถามรายละเอียดโปรโมชั่นและเมนูเด็ดได้ตลอดเลยค่ะ 🌶️✨`
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
/* Gemini Canvas White Ambient Aura (Light Theme) */
.gemini-canvas {
  background: radial-gradient(ellipse 65% 55% at 50% 48%, rgba(219, 234, 254, 0.42) 0%, rgba(220, 252, 231, 0.3) 40%, rgba(255, 255, 255, 0) 75%), #ffffff;
}

.gemini-text :deep(b) {
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
