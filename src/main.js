import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import './style.css'
import { authStore } from './store/authStore'
import { initGlobalAlertInterceptor } from './utils/swal'

// เปิดใช้งานระบบ Popup สวยงาม แทน browser alert() ทั่วทั้งระบบ
initGlobalAlertInterceptor()

// ดักจับการตอบกลับจาก Backend เพื่อตรวจจับเมื่อถูกเตะออกจากระบบทันที (Real-time Kickout)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || ''
      if (typeof msg === 'string' && msg.includes('SESSION_TERMINATED')) {
        authStore.handleSessionTerminated(
          '⚠️ บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว ระบบได้ทำการออกจากระบบโดยอัตโนมัติ เพื่อความปลอดภัย'
        )
      }
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')