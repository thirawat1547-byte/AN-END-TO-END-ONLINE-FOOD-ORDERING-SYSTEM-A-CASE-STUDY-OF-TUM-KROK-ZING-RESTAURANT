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

      <!-- ส่วนแบ่งและปุ่มเข้าสู่ระบบด้วย Social Accounts -->
      <div class="divider-box">
        <span class="divider-line"></span>
        <span class="divider-text">หรือเข้าสู่ระบบด้วย</span>
        <span class="divider-line"></span>
      </div>

      <div class="social-login-group">
        <!-- ปุ่ม LINE Login -->
        <button type="button" class="social-btn line-btn" @click="loginWithSocial('line')" :disabled="loading">
          <svg class="social-icon" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          <span>เข้าสู่ระบบด้วย LINE</span>
        </button>

        <!-- ปุ่ม Google Login -->
        <button type="button" class="social-btn google-btn" @click="loginWithSocial('google')" :disabled="loading">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>เข้าสู่ระบบด้วย Google</span>
        </button>

        <!-- ปุ่ม Facebook Login -->
        <button type="button" class="social-btn facebook-btn" @click="loginWithSocial('facebook')" :disabled="loading">
          <svg class="social-icon" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>เข้าสู่ระบบด้วย Facebook</span>
        </button>
      </div>

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
    const error = this.$route.query.error;
    if (error) {
      if (error === 'google_cancelled' || error === 'facebook_cancelled' || error === 'line_cancelled') {
        this.errorMessage = 'คุณได้ยกเลิกการเข้าสู่ระบบผ่าน Social Account';
      } else {
        this.errorMessage = decodeURIComponent(error);
      }
    }
  },
  methods: {
    loginWithSocial(provider) {
      this.loading = true;
      // นำทางเบราว์เซอร์ไปยัง NestJS OAuth Endpoint
      window.location.href = `${API_BASE}/auth/${provider}`;
    },
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
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f7f6f0; padding: 20px; }
.auth-card { background: white; padding: 36px 32px; border-radius: 24px; width: 420px; max-width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
.logo-box { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-bottom: 22px; }
.shop-logo { display: block; height: 60px; width: auto; object-fit: contain; margin: 0 auto 12px auto; }
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

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.input-group input { padding: 12px 15px; border-radius: 12px; border: 1px solid #ddd; outline: none; font-size: 14px; font-family: inherit; transition: border-color 0.2s; }
.input-group input:focus { border-color: #557c61; }
.input-group input:disabled { background-color: #f5f5f5; cursor: not-allowed; }

.submit-btn { background: #557c61; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 6px; font-family: inherit; transition: 0.2s; }
.submit-btn:hover { background: #405e49; }
.submit-btn:disabled { background-color: #a3b8aa; cursor: not-allowed; }

/* เส้นคั่น Social Login */
.divider-box {
  display: flex;
  align-items: center;
  margin: 22px 0 16px;
  gap: 12px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}
.divider-text {
  font-size: 12px;
  color: #888;
  font-weight: 400;
  white-space: nowrap;
}

/* กลุ่มปุ่ม Social Login */
.social-login-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-family: inherit;
}
.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* ปุ่ม LINE */
.line-btn {
  background-color: #06C755;
  color: #ffffff;
}
.line-btn:hover:not(:disabled) {
  background-color: #05b04b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.25);
}

/* ปุ่ม Google */
.google-btn {
  background-color: #ffffff;
  color: #3c4043;
  border-color: #dadce0;
}
.google-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #c6c9cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ปุ่ม Facebook */
.facebook-btn {
  background-color: #1877F2;
  color: #ffffff;
}
.facebook-btn:hover:not(:disabled) {
  background-color: #1465cf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.25);
}

.auth-footer { text-align: center; margin-top: 22px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.back-home { color: #888; font-weight: 400; }
</style>