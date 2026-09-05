<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-box">
        <img src="./assets/logo.png" alt="Logo" class="shop-logo" @error="$event.target.style.display='none'">
        <h2>เข้าสู่ระบบ</h2>
        <p>ยินดีต้อนรับกลับสู่ร้านเรา</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label>อีเมล หรือ เบอร์โทรศัพท์</label>
          <input type="text" v-model="emailOrPhone" placeholder="กรอกอีเมลหรือเบอร์โทร" required>
        </div>

        <div class="input-group">
          <label>รหัสผ่าน</label>
          <input type="password" v-model="password" placeholder="กรอกรหัสผ่าน" required>
        </div>

        <button type="submit" class="submit-btn">เข้าสู่ระบบ</button>
      </form>

      <div class="auth-footer">
        <p>ยังไม่มีบัญชีใช่ไหม? <router-link to="/register">สมัครสมาชิก</router-link></p>
        <p style="margin-top: 10px;"><router-link to="/" class="back-home">← กลับหน้าแรก</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      emailOrPhone: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // จำลองการล็อกอินสำเร็จ บันทึกลง localStorage
      localStorage.setItem('isLoggedIn', 'true');
      alert('เข้าสู่ระบบสำเร็จ!');
      this.$router.push('/');
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

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.input-group input { padding: 12px 15px; border-radius: 12px; border: 1px solid #ddd; outline: none; font-size: 14px; font-family: inherit; }
.input-group input:focus { border-color: #557c61; }

.submit-btn { background: #557c61; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; font-family: inherit; transition: 0.2s; }
.submit-btn:hover { background: #405e49; }

.auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.back-home { color: #888; font-weight: 400; }
</style>