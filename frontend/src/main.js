import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 1. นำเข้า router ที่เราเพิ่งสร้าง
import './style.css'

const app = createApp(App)

app.use(router) // 2. สั่งให้แอปใช้งาน router
app.mount('#app')