<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-box">
        <img src="./assets/logo.png" alt="Logo" class="shop-logo" @error="$event.target.style.display='none'">
        <h2>สมัครสมาชิก</h2>
        <p>สร้างบัญชีเพื่อสั่งความอร่อยส่งตรงถึงบ้านคุณ</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>ชื่อ - นามสกุล</label>
          <input type="text" v-model="form.name" placeholder="กรอกชื่อของคุณ" required>
        </div>

        <div class="input-group">
          <label>เบอร์โทรศัพท์</label>
          <input type="tel" v-model="form.phone" placeholder="เช่น 0891234567" required>
        </div>

        <div class="input-group">
          <label>ที่อยู่สำหรับจัดส่ง</label>
          <textarea v-model="form.address" placeholder="บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ..." rows="3" required></textarea>
        </div>

        <div class="input-group">
          <label>รหัสผ่าน</label>
          <input type="password" v-model="form.password" placeholder="ตั้งรหัสผ่าน" required>
        </div>

        <button type="submit" class="submit-btn">สมัครสมาชิก</button>
      </form>

      <div class="auth-footer">
        <p>มีบัญชีอยู่แล้วใช่ไหม? <router-link to="/login">เข้าสู่ระบบ</router-link></p>
        <p style="margin-top: 10px;"><router-link to="/" class="back-home">← กลับหน้าแรก</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        address: '',
        password: ''
      }
    }
  },
  methods: {
    handleRegister() {
      // บันทึกข้อมูลจำลองลง localStorage หรือฐานข้อมูลโปรเจกต์
      localStorage.setItem('userProfile', JSON.stringify(this.form));
      localStorage.setItem('isLoggedIn', 'true');
      alert('สมัครสมาชิกสำเร็จ!');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f7f6f0; padding: 20px 0; }
.auth-card { background: white; padding: 40px; border-radius: 24px; width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.logo-box { text-align: center; margin-bottom: 20px; }
.shop-logo { height: 50px; margin-bottom: 8px; }
.logo-box h2 { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 5px; }
.logo-box p { font-size: 13px; color: #777; }

.auth-form { display: flex; flex-direction: column; gap: 15px; }
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.input-group input, .input-group textarea { padding: 10px 14px; border-radius: 12px; border: 1px solid #ddd; outline: none; font-size: 13px; font-family: inherit; resize: none; }
.input-group input:focus, .input-group textarea:focus { border-color: #557c61; }

.submit-btn { background: #557c61; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; font-family: inherit; transition: 0.2s; }
.submit-btn:hover { background: #405e49; }

.auth-footer { text-align: center; margin-top: 18px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.back-home { color: #888; font-weight: 400; }
</style>