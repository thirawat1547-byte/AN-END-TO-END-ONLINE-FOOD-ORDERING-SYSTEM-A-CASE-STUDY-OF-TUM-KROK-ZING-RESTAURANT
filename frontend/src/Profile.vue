<template>
  <div class="page-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

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
import axios from 'axios';
import { API_BASE } from './config/api';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { authStore } from './store/authStore';

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      isLoggedIn: false,
      showAddressDropdown: false,
      isEditing: false,
      userProfile: {
        username: '',
        name: 'ลูกค้าทั่วไป',
        phone: '',
        email: '',
        address: '',
        avatar: ''
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
  async mounted() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('access_token');

    // 1. ดึงข้อมูลโปรไฟล์จริงจาก Database ถ้ามี Token
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          const dbUser = res.data;
          this.userProfile = {
            username: dbUser.username || '',
            name: dbUser.username || 'ลูกค้าทั่วไป',
            phone: dbUser.phone_number || '',
            email: dbUser.email || '',
            address: dbUser.address || '',
            avatar: ''
          };
          localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
        }
      } catch (err) {
        console.warn('ดึงโปรไฟล์จาก Backend ไม่สำเร็จ:', err);
      }
    }

    // 2. ถ้าไม่มีข้อมูลจาก API ให้อ่านจาก localStorage
    if (!this.userProfile.username) {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
      }
    }

    this.editForm = { ...this.userProfile };
  },
  methods: {
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userProfile');
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
    async saveProfile() {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await axios.patch(`${API_BASE}/auth/profile`, {
            phone_number: this.editForm.phone,
            address: this.editForm.address,
            email: this.editForm.email
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('บันทึกลงฐานข้อมูลไม่สำเร็จ:', err);
        }
      }

      this.userProfile = { ...this.editForm };
      authStore.updateProfile(this.userProfile);
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