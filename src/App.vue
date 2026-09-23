<script setup>
import { useRouter } from 'vue-router'
import { authStore } from './store/authStore'

const router = useRouter()

function handleAcknowledgeKick() {
  authStore.isSessionTerminatedModalOpen = false
  router.push('/login?kicked=duplicate_session')
}
</script>

<template>
  <div id="app-root">
    <router-view />

    <!-- 🛑 Modal แจ้งเตือนเมื่อตรวจพบการเข้าสู่ระบบจากเครื่องอื่นแบบ Real-time -->
    <div 
      v-if="authStore.isSessionTerminatedModalOpen" 
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 text-center space-y-5 animate-scale-up">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
          ⚠️
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-bold text-slate-900">ตรวจพบการเข้าสู่ระบบซ้ำซ้อน</h2>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ authStore.sessionTerminateMessage || 'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว ระบบได้ทำการออกจากระบบบนอุปกรณ์นี้โดยอัตโนมัติ เพื่อความปลอดภัย' }}
          </p>
        </div>

        <div class="pt-2">
          <button 
            @click="handleAcknowledgeKick"
            class="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-red-600/30 transition duration-150"
          >
            รับทราบและเข้าสู่ระบบใหม่
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>