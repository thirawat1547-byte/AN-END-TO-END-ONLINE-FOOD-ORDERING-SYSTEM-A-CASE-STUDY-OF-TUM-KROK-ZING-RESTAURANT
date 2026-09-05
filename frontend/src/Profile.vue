<!-- ไฟล์ที่ 2: นำไปวางทับใน src/Profile.vue -->
<template>
  <div class="page-container">
    <header class="navbar">
      <div class="logo-section"><img src="./assets/logo.png" alt="Logo" class="logo-img"></div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item">ข้อเสนอ</router-link>
        <router-link to="/help" class="nav-item">ความช่วยเหลือ</router-link>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">🛒</button>
        <div class="profile-avatar active-profile">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Profile">
        </div>
      </div>
    </header>

    <div class="content-wrapper profile-center">
      <div class="profile-avatar-large">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" alt="User Profile">
      </div>

      <div class="profile-fields-container">
        <!-- ผูกข้อมูลจาก state เข้ามาแสดงผล -->
        <div class="profile-field-row">
          <span>{{ userProfile.name }}</span>
          <span class="edit-icon">✏️</span>
        </div>
        <div class="profile-field-row">
          <span>{{ userProfile.address }}</span>
          <span class="edit-icon">✏️</span>
        </div>
        <div class="profile-field-row">
          <span>{{ userProfile.phone }}</span>
          <span class="edit-icon">✏️</span>
        </div>
        <div class="profile-field-row">
          <span>{{ userProfile.email }}</span>
          <span class="edit-icon">✏️</span>
        </div>
        <div class="profile-field-row clickable" @click="$router.push('/history')">
          <span class="history-label">ประวัติคำสั่งซื้อ</span>
          <span class="history-icon">🕒</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userProfile: {
        name: 'คมชาญ หล่อวัน',
        phone: '091-020-7256',
        address: '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000',
        email: '6610122115057@pnru.ac.th'
      }
    }
  },
  mounted() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      // ถ้าเคยสมัครสมาชิกไว้ ให้นำข้อมูลนั้นมาทับค่าตั้งต้น
      this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.logo-img { height: 35px; }
.nav-menu { display: flex; gap: 30px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.profile-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 2px solid #557c61; cursor: pointer; }
.profile-avatar.active-profile { border: 2px solid #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.content-wrapper.profile-center { max-width: 800px; margin: 0 auto; width: 100%; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; gap: 35px; }

.profile-avatar-large { width: 220px; height: 220px; border-radius: 50%; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.08); border: 4px solid white; }
.profile-avatar-large img { width: 100%; height: 100%; object-fit: cover; }

.profile-fields-container { width: 100%; display: flex; flex-direction: column; gap: 15px; }
.profile-field-row { background: white; border-radius: 16px; padding: 18px 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02); font-size: 14px; color: #333; }
.profile-field-row.clickable { cursor: pointer; transition: 0.2s; }
.profile-field-row.clickable:hover { background: #faf9f5; }
.edit-icon, .history-icon { font-size: 16px; cursor: pointer; opacity: 0.7; }
</style>