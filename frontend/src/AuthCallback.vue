<template>
  <div class="callback-container">
    <div class="callback-card">
      <div v-if="status === 'loading'" class="state-box">
        <div class="spinner"></div>
        <h2>กำลังยืนยันตัวตน...</h2>
        <p>กรุณารอสักครู่ ระบบกำลังพาคุณเข้าสู่ระบบ</p>
      </div>

      <div v-else-if="status === 'success'" class="state-box success">
        <div class="icon-circle success-icon">✓</div>
        <h2>เข้าสู่ระบบสำเร็จ!</h2>
        <p>ยินดีต้อนรับสู่ระบบร้านตำครกซิ่ง กำลังนำทาง...</p>
      </div>

      <div v-else class="state-box error">
        <div class="icon-circle error-icon">✕</div>
        <h2>เข้าสู่ระบบไม่สำเร็จ</h2>
        <p class="error-msg">{{ errorMessage }}</p>
        <button @click="goToLogin" class="retry-btn">กลับหน้าเข้าสู่ระบบ</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE } from './config/api';
import { authStore } from './store/authStore';

export default {
  name: 'AuthCallback',
  data() {
    return {
      status: 'loading', // 'loading' | 'success' | 'error'
      errorMessage: ''
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || this.$route.query.token;
    const error = urlParams.get('error') || this.$route.query.error;

    if (error) {
      this.status = 'error';
      const decoded = decodeURIComponent(error);
      if (decoded.includes('cancelled') || decoded === 'google_cancelled' || decoded === 'facebook_cancelled' || decoded === 'line_cancelled') {
        this.errorMessage = 'การเข้าสู่ระบบผ่าน Social Account ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      } else if (decoded.includes('redirect_uri_mismatch')) {
        this.errorMessage = 'ข้อผิดพลาด: Callback URL ไม่ตรงกับที่ลงทะเบียนไว้ กรุณาแจ้งผู้ดูแลระบบ';
      } else if (decoded.includes('invalid_client')) {
        this.errorMessage = 'ข้อผิดพลาด: Client ID/Secret ไม่ถูกต้อง กรุณาแจ้งผู้ดูแลระบบ';
      } else {
        this.errorMessage = `เข้าสู่ระบบไม่สำเร็จ: ${decoded}`;
      }
      return;
    }

    if (!token) {
      this.status = 'error';
      this.errorMessage = 'ไม่พบ Token การยืนยันตัวตนจากเซิร์ฟเวอร์';
      return;
    }

    try {
      const name = urlParams.get('name') || this.$route.query.name;
      const avatar = urlParams.get('avatar') || this.$route.query.avatar;
      const email = urlParams.get('email') || this.$route.query.email;

      // 1. ดึงข้อมูล Profile ของผู้ใช้งานจาก Token
      let userProfile = null;
      try {
        const res = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        userProfile = res.data;
      } catch (err) {
        console.warn('Could not fetch latest profile, falling back to minimal token storage', err);
      }

      // ผสานข้อมูล Social เข้ากับ userProfile ให้ครบถ้วน (ชื่อจริง, รูปโปรไฟล์, อีเมล)
      const mergedProfile = {
        ...(userProfile || {}),
        name: (name && name.trim()) ? decodeURIComponent(name.trim()) : (userProfile?.name || userProfile?.username || 'ลูกค้าทั่วไป'),
        avatar: (avatar && avatar.trim()) ? decodeURIComponent(avatar.trim()) : (userProfile?.avatar || ''),
        email: userProfile?.email || ((email && email.trim()) ? decodeURIComponent(email.trim()) : '')
      };

      // 2. บันทึก Token และข้อมูลลง authStore
      authStore.setAuth(token, mergedProfile);
      this.status = 'success';

      // 3. กำหนดทิศทางการ Redirect ตามบทบาทผู้ใช้งาน
      setTimeout(() => {
        let redirect = this.$route.query.redirect;
        if (!redirect) {
          if (authStore.isAdmin) redirect = '/admin/dashboard';
          else if (authStore.isKitchen) redirect = '/kitchen/monitor';
          else if (authStore.isRider) redirect = '/rider';
          else redirect = '/';
        }
        this.$router.push(redirect);
      }, 700);
    } catch (err) {
      console.error('Callback error:', err);
      this.status = 'error';
      this.errorMessage = 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลเข้าสู่ระบบ';
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Prompt', sans-serif;
}

.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f6f0;
  padding: 20px;
}

.callback-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  width: 420px;
  max-width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.state-box h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px;
}

.state-box p {
  font-size: 14px;
  color: #666;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #557c61;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto;
}

.success-icon {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-icon {
  background-color: #ffebee;
  color: #c62828;
}

.error-msg {
  color: #c62828 !important;
  margin-top: 6px;
}

.retry-btn {
  margin-top: 20px;
  background: #557c61;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.retry-btn:hover {
  background: #405e49;
}
</style>
