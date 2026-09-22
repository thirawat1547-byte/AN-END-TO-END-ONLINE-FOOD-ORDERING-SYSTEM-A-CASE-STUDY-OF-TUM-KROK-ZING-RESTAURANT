<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-box">
        <img src="./assets/logo.png" alt="Logo" class="shop-logo" @error="$event.target.style.display='none'">
        <h2>สมัครสมาชิก</h2>
        <p>สร้างบัญชีเพื่อสั่งความอร่อยส่งตรงถึงบ้านคุณ</p>
      </div>

<<<<<<< HEAD
      <!-- ป้ายแจ้งเตือนข้อกำหนด -->
      <div class="requirement-banner">
        <div class="req-title">📌 ข้อกำหนดการสมัคร:</div>
        <ul>
          <li><strong>เบอร์โทรศัพท์:</strong> ห้ามใช้เบอร์ซ้ำกับบัญชีที่เคยสมัครในระบบ</li>
          <li><strong>ที่อยู่จัดส่ง:</strong> ต้องระบุรายละเอียดให้ครบถ้วนทุกช่อง (บังคับใส่ทุกช่อง <span class="req-star">*</span>)</li>
        </ul>
      </div>

=======
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
      <!-- กล่องแจ้งเตือนข้อผิดพลาด -->
      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

<<<<<<< HEAD
      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        
        <!-- ===== ส่วนที่ 1: ข้อมูลส่วนตัว & การติดต่อ ===== -->
        <div class="form-section-title">
          <span>1. ข้อมูลส่วนตัว</span>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ชื่อจริง <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.firstName" 
              placeholder="เช่น มานี" 
              required
              :disabled="loading"
            >
          </div>
          <div class="input-group">
            <label>นามสกุล <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.lastName" 
              placeholder="เช่น มีนา" 
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="input-group">
          <label>อีเมล <span class="req-star">*</span></label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="เช่น manee@designilcode.com" 
=======
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>ชื่อผู้ใช้ (Username) <span class="req-star">*</span></label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="สำหรับใช้ล็อกอิน เช่น user01" 
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
            required
            :disabled="loading"
          >
        </div>

        <div class="input-group">
<<<<<<< HEAD
          <label>โทรศัพท์ <span class="req-star">*</span></label>
          <div class="phone-input-wrapper">
            <input 
              type="tel" 
              v-model="form.phone" 
              placeholder="เช่น 0854443333" 
              maxlength="10"
              @input="onPhoneInput"
              @blur="checkPhoneDuplicate"
              required
              :disabled="loading"
              :class="{
                'input-valid': phoneStatus === 'available',
                'input-invalid': phoneStatus === 'duplicate' || phoneStatus === 'invalid_format'
              }"
            >
            <span v-if="phoneLoading" class="phone-status-indicator loading-spin">🔄</span>
            <span v-else-if="phoneStatus === 'available'" class="phone-status-indicator text-success">✓</span>
            <span v-else-if="phoneStatus === 'duplicate' || phoneStatus === 'invalid_format'" class="phone-status-indicator text-danger">✕</span>
          </div>
          <!-- ข้อความสถานะเบอร์โทรศัพท์ -->
          <div v-if="phoneMessage" :class="['field-feedback', phoneStatus === 'available' ? 'feedback-success' : 'feedback-danger']">
            {{ phoneMessage }}
          </div>
          <small class="field-hint" v-else>กรุณากรอกเบอร์มือถือ 10 หลัก (ระบบจะตรวจสอบไม่ให้ซ้ำกับบัญชีเดิม)</small>
        </div>

        <!-- ===== ส่วนที่ 2: ที่อยู่จัดส่งเดลิเวอรี่ ===== -->
        <div class="form-section-title">
          <span>2. ที่อยู่จัดส่งโดยละเอียด</span>
        </div>

        <div class="input-group">
          <label>ที่อยู่ (บ้านเลขที่, ซอย, ถนน) <span class="req-star">*</span></label>
          <textarea 
            v-model="form.address" 
            placeholder="เช่น 99 ซ.ศูนย์วิจัย 7 ถ.เพชรบุรีตัดใหม่" 
            rows="2"
            required
=======
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
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
            :disabled="loading"
          ></textarea>
        </div>

<<<<<<< HEAD
        <div class="form-row">
          <div class="input-group">
            <label>แขวง / ตำบล <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.subdistrict" 
              placeholder="เช่น บางกะปิ" 
              required
              :disabled="loading"
            >
          </div>
          <div class="input-group">
            <label>เขต / อำเภอ <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.district" 
              placeholder="เช่น ห้วยขวาง" 
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>จังหวัด <span class="req-star">*</span></label>
            <select v-model="form.province" required :disabled="loading" class="form-select">
              <option v-for="prov in provinceList" :key="prov" :value="prov">{{ prov }}</option>
            </select>
          </div>
          <div class="input-group">
            <label>รหัสไปรษณีย์ <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.postalCode" 
              placeholder="เช่น 10310" 
              maxlength="5"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="input-group">
          <label>ประเทศ <span class="req-star">*</span></label>
          <select v-model="form.country" required :disabled="loading" class="form-select">
            <option value="ไทย">ไทย</option>
          </select>
        </div>

        <!-- ===== ส่วนที่ 3: ข้อมูลบัญชีเข้าใช้งาน ===== -->
        <div class="form-section-title">
          <span>3. บัญชีสำหรับเข้าสู่ระบบ</span>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ชื่อผู้ใช้ (Username) <span class="req-star">*</span></label>
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="เช่น user01" 
              required
              :disabled="loading"
            >
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
        </div>

        <div class="input-group">
          <label>ยืนยันรหัสผ่าน <span class="req-star">*</span></label>
          <input 
            type="password" 
            v-model="form.confirmPassword" 
            placeholder="กรอกรหัสผ่านอีกครั้ง" 
=======
        <div class="input-group">
          <label>รหัสผ่าน <span class="req-star">*</span></label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="อย่างน้อย 4 ตัวอักษร" 
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
            required
            :disabled="loading"
          >
        </div>

<<<<<<< HEAD
        <button type="submit" class="submit-btn" :disabled="loading || phoneLoading || phoneStatus === 'duplicate'">
=======
        <button type="submit" class="submit-btn" :disabled="loading">
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
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

<<<<<<< HEAD
const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม',
  'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด',
  'ตาก', 'นครนายก', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
  'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
  'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด',
  'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ',
  'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรสงคราม', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
  'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

export default {
  data() {
    return {
      provinceList: THAI_PROVINCES,
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        subdistrict: '',
        district: '',
        province: 'กรุงเทพมหานคร',
        postalCode: '',
        country: 'ไทย',
        username: '',
        password: '',
        confirmPassword: ''
      },
      phoneLoading: false,
      phoneStatus: null, // null | 'checking' | 'available' | 'duplicate' | 'invalid_format'
      phoneMessage: '',
      phoneDebounceTimer: null,
=======
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
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
      loading: false,
      errorMessage: ''
    };
  },
  mounted() {
    // เคลียร์เซสชันเดิมออกเสมอเมื่อเปิดหน้าสมัครสมาชิก เพื่อไม่ให้ติดสิทธิ์ของบัญชีเดิม
    authStore.logout(false);
  },
  methods: {
<<<<<<< HEAD
    onPhoneInput() {
      // อนุญาตเฉพาะตัวเลข
      this.form.phone = this.form.phone.replace(/[^0-9]/g, '');
      this.phoneStatus = null;
      this.phoneMessage = '';

      if (this.phoneDebounceTimer) {
        clearTimeout(this.phoneDebounceTimer);
      }

      if (this.form.phone.length === 10) {
        this.phoneDebounceTimer = setTimeout(() => {
          this.checkPhoneDuplicate();
        }, 350);
      }
    },

    async checkPhoneDuplicate() {
      const cleanPhone = (this.form.phone || '').trim().replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        this.phoneStatus = null;
        this.phoneMessage = '';
        return;
      }

      if (cleanPhone.length < 9 || cleanPhone.length > 10 || !cleanPhone.startsWith('0')) {
        this.phoneStatus = 'invalid_format';
        this.phoneMessage = '⚠️ รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0)';
        return;
      }

      this.phoneLoading = true;
      try {
        const res = await axios.get(`${API_BASE}/auth/check-phone`, {
          params: { phone: cleanPhone }
        });

        if (res.data && res.data.available) {
          this.phoneStatus = 'available';
          this.phoneMessage = '✓ เบอร์โทรศัพท์นี้สามารถใช้งานได้';
        } else {
          this.phoneStatus = 'duplicate';
          this.phoneMessage = '❌ เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว กรุณาใช้เบอร์อื่น';
        }
      } catch (err) {
        console.warn('ไม่สามารถตรวจสอบเบอร์โทรศัพท์ได้:', err);
        // หากต่อ API ไม่ได้ ให้ fallback อนุญาตไปก่อน เพื่อไม่ให้ผู้ใช้ติดค้าง
        this.phoneStatus = null;
        this.phoneMessage = '';
      } finally {
        this.phoneLoading = false;
      }
    },

    async handleRegister() {
      this.errorMessage = '';

      // 1. ตรวจสอบการกรอกข้อมูลให้ครบถ้วนทุกช่อง (บังคับใส่ทุกช่องตามข้อกำหนด)
      const requiredFields = [
        { val: this.form.firstName, label: 'ชื่อจริง' },
        { val: this.form.lastName, label: 'นามสกุล' },
        { val: this.form.email, label: 'อีเมล' },
        { val: this.form.phone, label: 'โทรศัพท์' },
        { val: this.form.address, label: 'ที่อยู่' },
        { val: this.form.subdistrict, label: 'แขวง / ตำบล' },
        { val: this.form.district, label: 'เขต / อำเภอ' },
        { val: this.form.province, label: 'จังหวัด' },
        { val: this.form.postalCode, label: 'รหัสไปรษณีย์' },
        { val: this.form.country, label: 'ประเทศ' },
        { val: this.form.username, label: 'ชื่อผู้ใช้ (Username)' },
        { val: this.form.password, label: 'รหัสผ่าน' }
      ];

      for (const field of requiredFields) {
        if (!field.val || !String(field.val).trim()) {
          this.errorMessage = `กรุณากรอก "${field.label}" ให้เรียบร้อย (บังคับใส่ทุกช่อง)`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 2. ตรวจสอบรูปแบบอีเมล
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email.trim())) {
        this.errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลของคุณ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. ตรวจสอบเบอร์โทรศัพท์ (ห้ามใส่เบอร์ซ้ำ และต้องมี 9-10 หลัก)
      const cleanPhone = this.form.phone.trim().replace(/[^0-9]/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 10 || !cleanPhone.startsWith('0')) {
        this.errorMessage = 'เบอร์โทรศัพท์ต้องมี 9-10 หลัก และขึ้นต้นด้วย 0';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (this.phoneStatus === 'duplicate') {
        this.errorMessage = 'เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว กรุณาใช้เบอร์โทรศัพท์อื่น';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. ตรวจสอบรหัสไปรษณีย์ 5 หลัก
      if (!/^\d{5}$/.test(this.form.postalCode.trim())) {
        this.errorMessage = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 5. ตรวจสอบรหัสผ่าน
      if (this.form.password.length < 4) {
        this.errorMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      this.loading = true;

      try {
        // รวมที่อยู่ฉบับสมบูรณ์สำหรับจัดส่งเดลิเวอรี่
        const fullAddress = `${this.form.address.trim()} แขวง/ตำบล${this.form.subdistrict.trim()} เขต/อำเภอ${this.form.district.trim()} จ.${this.form.province.trim()} ${this.form.postalCode.trim()} ประเทศ${this.form.country.trim()}`.substring(0, 255);

        const payload = {
          username: this.form.username.trim(),
          password: this.form.password,
          phone_number: cleanPhone,
          email: this.form.email.trim(),
          address: fullAddress
=======
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
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
        };

        // เคลียร์เซสชันเดิมก่อนสร้างบัญชีใหม่
        authStore.logout(false);

<<<<<<< HEAD
        // 1. ส่งข้อมูลสมัครสมาชิกไปยัง Backend API
=======
        // 1. บันทึกบัญชีผู้ใช้ลงฐานข้อมูล MySQL จริงผ่าน Backend API
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
        const regRes = await axios.post(`${API_BASE}/auth/register`, payload);

        // 2. ล็อกอินอัตโนมัติเพื่อรับ JWT access_token ของบัญชีใหม่นี้
        try {
          const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            username: payload.username,
            password: payload.password
          });

          const token = loginRes.data?.access_token || loginRes.data?.token;
          const userObj = loginRes.data?.user || regRes.data || {};
          const sessionId = loginRes.data?.session_id;

          if (token) {
<<<<<<< HEAD
            const userProfile = {
              user_id: userObj.user_id,
              username: payload.username,
              name: `${this.form.firstName.trim()} ${this.form.lastName.trim()}`,
              firstName: this.form.firstName.trim(),
              lastName: this.form.lastName.trim(),
              phone: cleanPhone,
              address: fullAddress,
              detailAddress: this.form.address.trim(),
              subdistrict: this.form.subdistrict.trim(),
              district: this.form.district.trim(),
              province: this.form.province.trim(),
              postalCode: this.form.postalCode.trim(),
              country: this.form.country.trim(),
              email: payload.email,
=======
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
              user_id: userObj.user_id,
              username: payload.username,
              name: this.form.name || payload.username,
              phone: payload.phone_number || userObj.phone_number || '',
              address: this.form.address || userObj.address || '',
              email: payload.email || userObj.email || '',
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
              role: 'CUSTOMER'
            };

            authStore.setAuth(token, userProfile, sessionId);
          } else {
            throw new Error('ไม่พบ Token');
          }
        } catch (loginErr) {
          console.warn('Auto-login หลังสมัครไม่สำเร็จ:', loginErr);
          alert('🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณครับ');
          this.$router.push('/login');
          return;
        }

<<<<<<< HEAD
        alert('🎉 สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!');
=======
        alert('🎉 สมัครสมาชิกและเข้าสู่ระบบด้วยบัญชีใหม่สำเร็จ!');
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
        this.$router.push('/');
      } catch (error) {
        console.error('สมัครสมาชิกไม่สำเร็จ:', error);
        if (error.response && error.response.data) {
          const msg = error.response.data.message;
          this.errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else {
          this.errorMessage = 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง';
        }
<<<<<<< HEAD
        window.scrollTo({ top: 0, behavior: 'smooth' });
=======
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
<<<<<<< HEAD
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }

.auth-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  background-color: #f7f6f0; 
  padding: 30px 15px; 
}

.auth-card { 
  background: white; 
  padding: 36px 36px; 
  border-radius: 24px; 
  width: 520px; 
  max-width: 100%;
  box-shadow: 0 6px 25px rgba(0,0,0,0.06); 
}

.logo-box { text-align: center; margin-bottom: 16px; }
.shop-logo { height: 50px; margin-bottom: 8px; }
.logo-box h2 { font-size: 24px; font-weight: 600; color: #333; margin-bottom: 4px; }
.logo-box p { font-size: 13.5px; color: #777; }

.requirement-banner {
  background-color: #fff9e6;
  border-left: 4px solid #fbc02d;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  color: #5d4037;
  margin-bottom: 18px;
}
.req-title { font-weight: 600; margin-bottom: 4px; color: #bf360c; }
.requirement-banner ul { padding-left: 18px; margin: 0; }
.requirement-banner li { margin-bottom: 2px; }
=======
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f7f6f0; padding: 20px 0; }
.auth-card { background: white; padding: 36px 40px; border-radius: 24px; width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.logo-box { text-align: center; margin-bottom: 18px; }
.shop-logo { height: 48px; margin-bottom: 8px; }
.logo-box h2 { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 4px; }
.logo-box p { font-size: 13px; color: #777; }
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656

.error-banner {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
<<<<<<< HEAD
  margin-bottom: 16px;
  border: 1px solid #ffcdd2;
  font-weight: 500;
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }

.form-section-title {
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-bottom: -2px;
  font-size: 13.5px;
  font-weight: 600;
  color: #557c61;
  border-bottom: 1px dashed #d7e2d9;
  padding-bottom: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.input-group { display: flex; flex-direction: column; gap: 4px; position: relative; }
.input-group label { font-size: 13px; font-weight: 500; color: #444; }
.req-star { color: #d32f2f; font-weight: bold; margin-left: 2px; }

.input-group input, 
.input-group textarea,
.form-select { 
  padding: 10px 14px; 
  border-radius: 10px; 
  border: 1px solid #ddd; 
  outline: none; 
  font-size: 13px; 
  font-family: inherit; 
  resize: none; 
  transition: border-color 0.2s;
  background-color: #fafafa;
}

.input-group input:focus, 
.input-group textarea:focus,
.form-select:focus { 
  border-color: #557c61; 
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(85, 124, 97, 0.15);
}

.input-group input:disabled, 
.input-group textarea:disabled,
.form-select:disabled { 
  background-color: #f5f5f5; 
  cursor: not-allowed; 
}

/* Phone validation styles */
.phone-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.phone-input-wrapper input {
  width: 100%;
  padding-right: 36px;
}
.phone-status-indicator {
  position: absolute;
  right: 12px;
  font-size: 14px;
  font-weight: bold;
}
.text-success { color: #2e7d32; }
.text-danger { color: #c62828; }
.loading-spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

.input-valid {
  border-color: #2e7d32 !important;
  background-color: #f1f8e9 !important;
}
.input-invalid {
  border-color: #c62828 !important;
  background-color: #ffebee !important;
}

.field-feedback {
  font-size: 11.5px;
  font-weight: 500;
  margin-top: 2px;
}
.feedback-success { color: #2e7d32; }
.feedback-danger { color: #c62828; }
.field-hint { font-size: 11.5px; color: #888; margin-top: 2px; }

.submit-btn { 
  background: #557c61; 
  color: white; 
  border: none; 
  padding: 13px; 
  border-radius: 12px; 
  font-size: 15px; 
  font-weight: 600; 
  cursor: pointer; 
  margin-top: 10px; 
  font-family: inherit; 
  transition: 0.2s; 
  box-shadow: 0 3px 8px rgba(85, 124, 97, 0.25);
}
.submit-btn:hover { background: #405e49; }
.submit-btn:disabled { 
  background-color: #b0bec5; 
  cursor: not-allowed; 
  box-shadow: none;
}

.auth-footer { text-align: center; margin-top: 18px; font-size: 13px; color: #666; }
.auth-footer a { color: #557c61; font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
=======
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
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
.back-home { color: #888; font-weight: 400; }
</style>