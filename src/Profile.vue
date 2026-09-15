<template>
  <div class="page-container">
    
    <!-- วาง Header มาตรฐาน -->
    <header class="navbar">
      <!-- กลุ่มซ้าย: โลโก้ + เมนู -->
      <div class="nav-left-group">
        <img src="./assets/logo.png" alt="Logo" class="logo-img" @click="$router.push('/')">
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">ค้นหา</router-link>
          <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
          <router-link to="/history" class="nav-item">ประวัติคำสั่งซื้อ</router-link>
          <router-link to="/promotions" class="nav-item">โปรโมชั่น</router-link>
          <router-link to="/help" class="nav-item">ช่วยเหลือ</router-link>
        </nav>
      </div>
      
      <!-- ดันขวา -->
      <div class="header-spacer"></div>

      <!-- กลุ่มขวา: แจ้งเตือน + ตะกร้า + โปรไฟล์ -->
      <div class="header-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn" @click="$router.push('/')" v-if="$route.path !== '/'">🛒</button>
        <div class="auth-links" v-if="!isLoggedIn">
          <router-link to="/login" class="login-text">เข้าสู่ระบบ</router-link>
          <router-link to="/register" class="reg-text">สมัครสมาชิก</router-link>
        </div>
        <div class="auth-links" v-else>
          <button class="logout-btn" @click="logout">ออกจากระบบ</button>
          <div class="profile-avatar" @click="$router.push('/profile')">
            <img :src="userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'" alt="Profile">
          </div>
        </div>
      </div>
    </header>

    <div class="content-wrapper profile-center">
      <div class="profile-avatar-large">
        <img :src="userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'" alt="User Profile">
      </div>
      
      <div class="profile-header">
        <h2>บัญชีของฉัน</h2>
        <button v-if="!isEditing" class="edit-btn-top" @click="toggleEdit">✏️ แก้ไขโปรไฟล์</button>
      </div>

      <div class="profile-fields-container">
        
        <!-- รูปโปรไฟล์ -->
        <div class="profile-field-row" v-if="isEditing" :class="{ 'editing': isEditing }">
          <div class="field-label">ลิงก์รูปโปรไฟล์</div>
          <div class="field-content">
            <input type="text" v-model="editForm.avatar" class="edit-input" placeholder="วาง URL รูปภาพที่นี่">
          </div>
        </div>

        <div class="profile-field-row" :class="{ 'editing': isEditing }">
          <div class="field-label">ชื่อ-นามสกุล</div>
          <div class="field-content">
            <span v-if="!isEditing">{{ userProfile.name }}</span>
            <input v-else type="text" v-model="editForm.name" class="edit-input" placeholder="กรอกชื่อ-นามสกุล">
          </div>
        </div>
        
        <div class="profile-field-row" :class="{ 'editing': isEditing }">
          <div class="field-label">เบอร์โทรศัพท์</div>
          <div class="field-content">
            <span v-if="!isEditing">{{ userProfile.phone }}</span>
            <input v-else type="text" v-model="editForm.phone" class="edit-input" placeholder="กรอกเบอร์โทรศัพท์">
          </div>
        </div>

        <div class="profile-field-row" :class="{ 'editing': isEditing }">
          <div class="field-label">อีเมล</div>
          <div class="field-content">
            <span v-if="!isEditing">{{ userProfile.email }}</span>
            <input v-else type="email" v-model="editForm.email" class="edit-input" placeholder="กรอกอีเมล">
          </div>
        </div>
        
        <div class="profile-field-row address-row" :class="{ 'editing': isEditing }">
          <div class="field-label">ที่อยู่จัดส่งหลัก</div>
          <div class="field-content">
            <span v-if="!isEditing" class="address-text">{{ userProfile.address }}</span>
            <textarea v-else v-model="editForm.address" class="edit-textarea" placeholder="กรอกที่อยู่สำหรับจัดส่งอาหาร" rows="3"></textarea>
          </div>
        </div>

        <div class="action-buttons" v-if="isEditing">
          <button class="cancel-profile-btn" @click="cancelEdit">ยกเลิก</button>
          <button class="save-profile-btn" @click="saveProfile">บันทึกข้อมูล</button>
        </div>

        <div class="profile-field-row clickable" @click="$router.push('/history')" v-if="!isEditing">
          <div class="history-left">
            <span class="history-icon">🧾</span>
            <span class="history-label">ประวัติคำสั่งซื้อของฉัน</span>
          </div>
          <span class="history-arrow">➔</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      showAddressDropdown: false,
      isEditing: false,
      userProfile: {
        name: 'คมชาญ หล่อวัน',
        phone: '091-020-7256',
        email: '6610122115057@pnru.ac.th',
        address: '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000',
        avatar: '' // กำหนดตัวแปรสำหรับเก็บรูป
      },
      editForm: {}
    }
  },
  computed: {
    displayAddress() {
      if (!this.isLoggedIn) return 'ตลาดปากเกร็ด';
      if (this.userProfile && this.userProfile.address) {
        let addr = this.userProfile.address;
        return addr.length > 20 ? addr.substring(0, 20) + '...' : addr;
      }
      return 'กรุณาเพิ่มที่อยู่';
    }
  },
  mounted() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
    }
    this.editForm = { ...this.userProfile };
  },
  methods: {
    logout() {
      localStorage.removeItem('isLoggedIn');
      this.isLoggedIn = false;
      this.$router.push('/');
    },
    toggleEdit() {
      this.editForm = { ...this.userProfile }; 
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.editForm = { ...this.userProfile }; 
    },
    saveProfile() {
      if (!this.editForm.name || !this.editForm.phone || !this.editForm.address) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนด้วยครับ');
        return;
      }
      this.userProfile = { ...this.editForm };
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
      this.isEditing = false;
      alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

/* NAVBAR STYLES */
.navbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; gap: 15px; }
.logo-img { height: 40px; }
.nav-menu { display: flex; gap: 20px; white-space: nowrap; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { color: #557c61; }
.nav-item.router-link-exact-active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.search-box { position: relative; width: 220px; z-index: 10; }
.search-box input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 20px; border: 1px solid #e0dfd5; background: #fff; font-size: 13px; color: #333; outline: none; position: relative; z-index: 11; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #888; z-index: 12; }

.location-wrapper { position: relative; display: inline-block; z-index: 20; }
.location-box { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #444; background: #f1ede1; padding: 6px 12px; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.2s; border: 1px solid transparent; }
.location-box:hover { background: #e8e4d5; border-color: #d6d2c4; }
.loc-icon { color: #557c61; }
.dropdown-arrow { font-size: 10px; color: #777; margin-left: 3px; transition: transform 0.3s ease; }
.dropdown-arrow.arrow-up { transform: rotate(180deg); color: #557c61; }

.address-dropdown-menu { position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: white; border: 1px solid #e5e2d5; border-radius: 16px; padding: 15px 20px; width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; cursor: default; }
.address-dropdown-menu::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: white; border-left: 1px solid #e5e2d5; border-top: 1px solid #e5e2d5; }
.addr-title { font-size: 13px; font-weight: 600; color: #557c61; margin-bottom: 6px; }
.addr-full-text { font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 12px; word-wrap: break-word; background: #faf9f5; padding: 10px; border-radius: 8px; }
.addr-edit-btn { width: 100%; background: white; border: 1px solid #557c61; color: #557c61; padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; font-family: inherit; }
.addr-edit-btn:hover { background: #f4faeb; }

.header-actions { display: flex; align-items: center; gap: 15px; white-space: nowrap; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.auth-links { display: flex; gap: 12px; font-size: 13px; font-weight: 600; align-items: center; }
.login-text { color: #557c61; text-decoration: none; }
.reg-text { color: #333; text-decoration: none; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: inherit; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 1px solid transparent; margin-left: 10px; }
.profile-avatar:hover { border-color: #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* PROFILE CONTENT STYLES */
.content-wrapper.profile-center { max-width: 700px; margin: 0 auto; width: 100%; padding: 50px 20px; display: flex; flex-direction: column; align-items: center; gap: 25px; }

.profile-avatar-large { width: 150px; height: 150px; border-radius: 50%; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 4px solid white; position: relative; background: #e5e2d5; }
.profile-avatar-large img { width: 100%; height: 100%; object-fit: cover; }

.profile-header { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; margin-bottom: 10px;}
.profile-header h2 { font-size: 24px; color: #333; font-weight: 600; }
.edit-btn-top { background: white; border: 1px solid #557c61; color: #557c61; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; font-family: inherit;}
.edit-btn-top:hover { background: #f4faeb; }

.profile-fields-container { width: 100%; display: flex; flex-direction: column; gap: 15px; }
.profile-field-row { background: white; border-radius: 16px; padding: 20px 25px; display: flex; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.02); transition: 0.3s; border: 1px solid transparent;}
.profile-field-row.editing { border-color: #e5e2d5; background: #faf9f5; box-shadow: none; }

.field-label { width: 140px; font-size: 14px; font-weight: 600; color: #666; flex-shrink: 0; }
.field-content { flex-grow: 1; font-size: 15px; color: #333; }

.address-row { align-items: flex-start; }
.address-text { line-height: 1.5; display: block; }

.edit-input { width: 100%; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; color: #333; background: white; padding: 10px 15px; outline: none; transition: 0.2s;}
.edit-input:focus { border-color: #557c61; box-shadow: 0 0 0 3px rgba(85, 124, 97, 0.1); }

.edit-textarea { width: 100%; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; color: #333; background: white; padding: 10px 15px; outline: none; transition: 0.2s; resize: vertical;}
.edit-textarea:focus { border-color: #557c61; box-shadow: 0 0 0 3px rgba(85, 124, 97, 0.1); }

.action-buttons { display: flex; gap: 15px; margin-top: 10px; }
.cancel-profile-btn { flex: 1; background: white; color: #666; border: 1px solid #ddd; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit;}
.cancel-profile-btn:hover { background: #f2f2f2; }
.save-profile-btn { flex: 2; background: #557c61; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit;}
.save-profile-btn:hover { background: #405e49; }

.profile-field-row.clickable { cursor: pointer; margin-top: 15px; justify-content: space-between; border: 1px solid #e0dfd5; background: #fdfbf7; }
.profile-field-row.clickable:hover { background: #f4faeb; border-color: #557c61; }
.history-left { display: flex; align-items: center; gap: 12px; }
.history-icon { font-size: 20px; }
.history-label { font-size: 15px; font-weight: 600; color: #557c61; }
.history-arrow { color: #557c61; font-weight: bold; }

.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.nav-left-group { display: flex; align-items: center; gap: 30px; } /* โค้ดสำคัญ: บังคับให้อยู่แถวเดียวกัน */
.logo-img { height: 40px; cursor: pointer; display: block; }
.nav-menu { display: flex; align-items: center; gap: 20px; white-space: nowrap; margin-top: 5px; }
</style>