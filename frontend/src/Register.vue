<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-box">
        <img src="./assets/logo.png" alt="Logo" class="shop-logo" @error="$event.target.style.display='none'">
        <h2>สมัครสมาชิก</h2>
        <p>สร้างบัญชีเพื่อสั่งความอร่อยส่งตรงถึงบ้านคุณ</p>
      </div>

      <!-- กล่องแจ้งเตือนข้อผิดพลาด -->
      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>ชื่อผู้ใช้ (Username) <span class="req-star">*</span></label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="สำหรับใช้ล็อกอิน เช่น user01" 
            required
            :disabled="loading"
          >
        </div>

        <div class="input-group">
          <label>ชื่อ - นามสกุล</label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="เช่น สมชาย ใจดี" 
            :disabled="loading"
          >
        </div>

        <div class="input-group">
          <label>เบอร์โทรศัพท์</label>
          <input 
            type="tel" 
            v-model="form.phone" 
            placeholder="เช่น 0891234567" 
            :disabled="loading"
          >
        </div>

        <div class="input-group">
          <label>อีเมล (ถ้ามี)</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="เช่น somchai@example.com" 
            :disabled="loading"
          >
        </div>

        <div class="input-group">
          <label>ที่อยู่สำหรับจัดส่ง</label>
          <textarea 
            v-model="form.address" 
            placeholder="บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ..." 
            rows="2"
            :disabled="loading"
          ></textarea>
        </div>

        <div class="input-group">
          <label>รหัสผ่าน <span class="req-star">*</span></label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="อย่างน้อย 4 ตัวอักษร" 
            required
            :disabled="loading"
          >
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">กำลังสร้างบัญชี...</span>
          <span v-else>สมัครสมาชิก</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>มีบัญชีอยู่แล้วใช่ไหม? <router-link to="/login">เข้าสู่ระบบ</router-link></p>
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
      form: {
        username: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      this.errorMessage = '';

      // Validate
      if (!this.form.username || !this.form.password) {
        this.errorMessage = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
        this.loading = false;
        return;
      }

      try {
        const payload = {
          username: this.form.username.trim(),
          password: this.form.password,
          phone_number: this.form.phone.trim() || undefined,
          email: this.form.email.trim() || undefined
        };

        // 1. บันทึกบัญชีผู้ใช้ลงฐานข้อมูล MySQL จริงผ่าน Backend API
        await axios.post(`${API_BASE}/auth/register`, payload);

        // 2. ล็อกอินอัตโนมัติเพื่อรับ JWT access_token
        try {
          const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            username: payload.username,
            password: payload.password
          });

          const token = loginRes.data?.access_token || loginRes.data?.token;
          if (token) {
            // 3. ถ้ามีที่อยู่ ให้อัปเดตลง Database
            if (this.form.address && this.form.address.trim()) {
              try {
                await axios.patch(`${API_BASE}/auth/profile`, {
                  address: this.form.address.trim()
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              } catch (addrErr) {
                console.warn('บันทึกที่อยู่ไม่สำเร็จ:', addrErr);
              }
            }

            const userProfile = {
              username: payload.username,
              name: this.form.name || payload.username,
              phone: payload.phone_number || '',
              address: this.form.address || '',
              email: payload.email || ''
            };
            const sessionId = loginRes.data?.session_id;
            authStore.setAuth(token, userProfile, sessionId);
          }
        } catch (loginErr) {
          console.warn('Auto-login หลังสมัครไม่สำเร็จ:', loginErr);
        }

        alert('🎉 สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!');
        this.$router.push('/');
      } catch (error) {
        console.error('สมัครสมาชิกไม่สำเร็จ:', error);
        if (error.response && error.response.data) {
          const msg = error.response.data.message;
          this.errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else {
          this.errorMessage = 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง';
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
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f7f6f0; padding: 20px 0; }
.auth-card { background: white; padding: 36px 40px; border-radius: 24px; width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.logo-box { text-align: center; margin-bottom: 18px; }
.shop-logo { height: 48px; margin-bottom: 8px; }
.logo-box h2 { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 4px; }
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

.auth-form { display: flex; flex-direction: column; gap: 13px; }
.input-group { display: flex; flex-direction: column; gap: 4px; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.req-star { color: #d32f2f; font-weight: bold; }
.input-group input, .input-group textarea { padding: 10px 14px; border-radius: 12px; border: 1px solid #ddd; outline: none; font-size: 13px; font-family: inherit; resize: none; }
.input-group input:focus, .input-group textarea:focus { border-color: #557c61; }
.input-group input:disabled, .input-group textarea:disabled { background-color: #f5f5f5; cursor: not-allowed; }

.submit-btn { background: #557c61; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; font-family: inherit; transition: 0.2s; }
.submit-btn:hover { background: #405e49; }
.submit-btn:disabled { background-color: #a3b8aa; cursor: not-allowed; }

.auth-footer { text-align: center; margin-top: 16px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.back-home { color: #888; font-weight: 400; }
</style>