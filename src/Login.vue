<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-box">
        <img src="./assets/logo.png" alt="Logo" class="shop-logo" @error="$event.target.style.display='none'">
        <h2>เข้าสู่ระบบ</h2>
        <p>ยินดีต้อนรับกลับสู่ร้านเรา</p>
      </div>

      <!-- กล่องแจ้งเตือนเมื่อเกิด Error -->
      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label>อีเมล หรือ ชื่อผู้ใช้</label>
          <input 
            type="text" 
            v-model="emailOrPhone" 
            placeholder="กรอกอีเมลหรือชื่อผู้ใช้" 
            :disabled="loading"
            required
          >
        </div>

        <div class="input-group">
          <label>รหัสผ่าน</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="กรอกรหัสผ่าน" 
            :disabled="loading"
            required
          >
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">กำลังเข้าสู่ระบบ...</span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>ยังไม่มีบัญชีใช่ไหม? <router-link to="/register">สมัครสมาชิก</router-link></p>
        <p style="margin-top: 10px;"><router-link to="/" class="back-home">← กลับหน้าแรก</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE } from './config/api';
import { authStore } from './store/authStore';

export default {
  data() {
    return {
      emailOrPhone: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  mounted() {
    if (this.$route.query.kicked === 'duplicate_session') {
      this.errorMessage = 'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว ระบบได้ทำการออกจากระบบโดยอัตโนมัติ';
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';

      try {
        // ส่งเฉพาะ username และ password (ห้ามใส่ email เด็ดขาด)
        const response = await axios.post(`${API_BASE}/auth/login`, {
          username: this.emailOrPhone,
          password: this.password
        });

        const token = response.data?.access_token || response.data?.token;
        const sessionId = response.data?.session_id;

        if (token) {
          let userProfileData = null;
          // ดึงข้อมูลโปรไฟล์ผู้ใช้จริงมาเก็บไว้
          try {
            const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            userProfileData = profileRes.data;
          } catch (profileErr) {
            if (response.data?.user) {
              userProfileData = response.data.user;
            }
          }

          authStore.setAuth(token, userProfileData, sessionId);

          alert('เข้าสู่ระบบสำเร็จ!');
          let redirect = this.$route.query.redirect;
          if (!redirect) {
            if (authStore.isAdmin) redirect = '/admin/dashboard';
            else if (authStore.isKitchen) redirect = '/kitchen/monitor';
            else if (authStore.isRider) redirect = '/rider';
            else redirect = '/';
          }
          this.$router.push(redirect);
        } else {
          throw new Error('ไม่พบข้อมูล Token ยืนยันตัวตน');
        }
      } catch (error) {
        console.error('เข้าสู่ระบบไม่สำเร็จ:', error);
        if (error.response && error.response.data) {
          const msg = error.response.data.message;
          this.errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else {
          this.errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f7f6f0; }
.auth-card { background: white; padding: 40px; border-radius: 24px; width: 420px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.logo-box { text-align: center; margin-bottom: 25px; }
.shop-logo { height: 50px; margin-bottom: 10px; }
.logo-box h2 { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 5px; }
.logo-box p { font-size: 13px; color: #777; }

.error-banner {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 15px;
  border: 1px solid #ffcdd2;
}

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.input-group input { padding: 12px 15px; border-radius: 12px; border: 1px solid #ddd; outline: none; font-size: 14px; font-family: inherit; }
.input-group input:focus { border-color: #557c61; }
.input-group input:disabled { background-color: #f5f5f5; cursor: not-allowed; }

.submit-btn { background: #557c61; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; font-family: inherit; transition: 0.2s; }
.submit-btn:hover { background: #405e49; }
.submit-btn:disabled { background-color: #a3b8aa; cursor: not-allowed; }

.auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.back-home { color: #888; font-weight: 400; }
</style>