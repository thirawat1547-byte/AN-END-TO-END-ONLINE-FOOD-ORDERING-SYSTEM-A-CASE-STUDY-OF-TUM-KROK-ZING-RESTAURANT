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

      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <!-- ชื่อผู้ใช้ (Username) -->
        <div class="input-group">
          <label>ชื่อผู้ใช้ (Username) <span class="req-star">*</span></label>
          <div class="phone-input-wrapper">
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="สำหรับใช้ล็อกอิน เช่น user01" 
              @input="onUsernameInput"
              @blur="checkUsernameDuplicate"
              required
              :disabled="loading"
              :class="{
                'input-valid': usernameStatus === 'available',
                'input-invalid': usernameStatus === 'duplicate' || usernameStatus === 'invalid_format'
              }"
            >
            <span v-if="usernameLoading" class="phone-status-indicator loading-spin">🔄</span>
            <span v-else-if="usernameStatus === 'available'" class="phone-status-indicator text-success">✓</span>
            <span v-else-if="usernameStatus === 'duplicate' || usernameStatus === 'invalid_format'" class="phone-status-indicator text-danger">✕</span>
          </div>
          <div v-if="usernameMessage" :class="['field-feedback', usernameStatus === 'available' ? 'feedback-success' : 'feedback-danger']">
            {{ usernameMessage }}
          </div>
          <small class="field-hint" v-else>ใช้สำหรับล็อกอิน (ห้ามซ้ำกับในระบบ)</small>
        </div>

        <!-- ชื่อ - นามสกุล -->
        <div class="input-group">
          <label>ชื่อ - นามสกุล <span class="req-star">*</span></label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="เช่น สมชาย ใจดี" 
            required
            :disabled="loading"
          >
        </div>

        <!-- เบอร์โทรศัพท์ (บังคับครบ 10 หลัก) -->
        <div class="input-group">
          <label>เบอร์โทรศัพท์ <span class="req-star">*</span></label>
          <div class="phone-input-wrapper">
            <input 
              type="tel" 
              v-model="form.phone" 
              placeholder="เช่น 0891234567" 
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
          <div v-if="phoneMessage" :class="['field-feedback', phoneStatus === 'available' ? 'feedback-success' : 'feedback-danger']">
            {{ phoneMessage }}
          </div>
        </div>

        <!-- อีเมล (บังคับเฉพาะ @gmail.com หรือ @hotmail.com และห้ามซ้ำ) -->
        <div class="input-group">
          <label>อีเมล <span class="req-star">*</span></label>
          <div class="phone-input-wrapper">
            <input 
              type="email" 
              v-model="form.email" 
              placeholder="เช่น somchai@gmail.com หรือ somchai@hotmail.com" 
              @input="onEmailInput"
              @blur="checkEmailDuplicate"
              required
              :disabled="loading"
              :class="{
                'input-valid': emailStatus === 'available',
                'input-invalid': emailStatus === 'duplicate' || emailStatus === 'invalid_format'
              }"
            >
            <span v-if="emailLoading" class="phone-status-indicator loading-spin">🔄</span>
            <span v-else-if="emailStatus === 'available'" class="phone-status-indicator text-success">✓</span>
            <span v-else-if="emailStatus === 'duplicate' || emailStatus === 'invalid_format'" class="phone-status-indicator text-danger">✕</span>
          </div>
          <div v-if="emailMessage" :class="['field-feedback', emailStatus === 'available' ? 'feedback-success' : 'feedback-danger']">
            {{ emailMessage }}
          </div>
          <small class="field-hint" v-else>รองรับเฉพาะ @gmail.com หรือ @hotmail.com (ห้ามซ้ำกับในระบบ)</small>
        </div>

        <!-- ที่อยู่สำหรับจัดส่ง (บ้านเลขที่, ซอย, ถนน) -->
        <div class="input-group">
          <label>ที่อยู่ (บ้านเลขที่, ซอย, ถนน) <span class="req-star">*</span></label>
          <textarea 
            v-model="form.address" 
            placeholder="บ้านเลขที่, ซอย, ถนน..." 
            rows="2"
            required
            :disabled="loading"
          ></textarea>
        </div>

        <!-- แขวง / ตำบล และ เขต / อำเภอ -->
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

        <!-- จังหวัด และ รหัสไปรษณีย์ -->
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
              @input="onPostalInput"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <!-- รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) -->
        <div class="input-group">
          <label>รหัสผ่าน <span class="req-star">*</span></label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="อย่างน้อย 6 ตัวอักษร" 
            required
            :disabled="loading"
          >
        </div>

        <button type="submit" class="submit-btn" :disabled="loading || usernameLoading || phoneLoading || emailLoading || usernameStatus === 'duplicate' || phoneStatus === 'duplicate' || emailStatus === 'duplicate'">
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
        username: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        subdistrict: '',
        district: '',
        province: 'กรุงเทพมหานคร',
        postalCode: '',
        password: ''
      },
      usernameLoading: false,
      usernameStatus: null, // 'available' | 'duplicate' | 'invalid_format' | null
      usernameMessage: '',
      usernameDebounceTimer: null,
      phoneLoading: false,
      phoneStatus: null, // 'available' | 'duplicate' | 'invalid_format' | null
      phoneMessage: '',
      phoneDebounceTimer: null,
      emailLoading: false,
      emailStatus: null, // 'available' | 'duplicate' | 'invalid_format' | null
      emailMessage: '',
      emailDebounceTimer: null,
      loading: false,
      errorMessage: ''
    };
  },
  mounted() {
    // เคลียร์เซสชันเดิมออกเสมอเมื่อเปิดหน้าสมัครสมาชิก เพื่อไม่ให้ติดสิทธิ์ของบัญชีเดิม
    authStore.logout(false);
  },
  methods: {
    onUsernameInput() {
      this.usernameStatus = null;
      this.usernameMessage = '';

      if (this.usernameDebounceTimer) {
        clearTimeout(this.usernameDebounceTimer);
      }

      const cleanUsername = (this.form.username || '').trim();
      if (cleanUsername.length >= 3) {
        this.usernameDebounceTimer = setTimeout(() => {
          this.checkUsernameDuplicate();
        }, 350);
      }
    },

    async checkUsernameDuplicate() {
      const cleanUsername = (this.form.username || '').trim();
      if (!cleanUsername) {
        this.usernameStatus = null;
        this.usernameMessage = '';
        return;
      }

      if (cleanUsername.length < 3) {
        this.usernameStatus = 'invalid_format';
        this.usernameMessage = '⚠️ ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
        return;
      }

      this.usernameLoading = true;
      try {
        const res = await axios.get(`${API_BASE}/auth/check-username`, {
          params: { username: cleanUsername }
        });

        if (res.data && res.data.available) {
          this.usernameStatus = 'available';
          this.usernameMessage = '✓ ชื่อผู้ใช้นี้สามารถใช้งานได้';
        } else {
          this.usernameStatus = 'duplicate';
          this.usernameMessage = '❌ ชื่อผู้ใช้นี้ถูกใช้งานในระบบแล้ว กรุณาใช้ชื่ออื่น';
        }
      } catch (err) {
        console.warn('ไม่สามารถตรวจสอบชื่อผู้ใช้ได้:', err);
        this.usernameStatus = null;
        this.usernameMessage = '';
      } finally {
        this.usernameLoading = false;
      }
    },

    onPhoneInput() {
      // อนุญาตเฉพาะตัวเลข สูงสุด 10 หลัก
      this.form.phone = this.form.phone.replace(/\D/g, '').slice(0, 10);
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

    onPostalInput() {
      // อนุญาตเฉพาะตัวเลข สูงสุด 5 หลัก
      this.form.postalCode = this.form.postalCode.replace(/\D/g, '').slice(0, 5);
    },

    onEmailInput() {
      this.emailStatus = null;
      this.emailMessage = '';

      if (this.emailDebounceTimer) {
        clearTimeout(this.emailDebounceTimer);
      }

      const cleanEmail = (this.form.email || '').trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;

      if (emailRegex.test(cleanEmail)) {
        this.emailDebounceTimer = setTimeout(() => {
          this.checkEmailDuplicate();
        }, 350);
      }
    },

    async checkEmailDuplicate() {
      const cleanEmail = (this.form.email || '').trim().toLowerCase();
      if (!cleanEmail) {
        this.emailStatus = null;
        this.emailMessage = '';
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
      if (!emailRegex.test(cleanEmail)) {
        this.emailStatus = 'invalid_format';
        this.emailMessage = '⚠️ รูปแบบอีเมลไม่ถูกต้อง (ต้องเป็น @gmail.com หรือ @hotmail.com)';
        return;
      }

      this.emailLoading = true;
      try {
        const res = await axios.get(`${API_BASE}/auth/check-email`, {
          params: { email: cleanEmail }
        });

        if (res.data && res.data.available) {
          this.emailStatus = 'available';
          this.emailMessage = '✓ อีเมลนี้สามารถใช้งานได้';
        } else {
          this.emailStatus = 'duplicate';
          this.emailMessage = '❌ อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น';
        }
      } catch (err) {
        console.warn('ไม่สามารถตรวจสอบอีเมลได้:', err);
        this.emailStatus = null;
        this.emailMessage = '';
      } finally {
        this.emailLoading = false;
      }
    },

    async checkPhoneDuplicate() {
      const cleanPhone = (this.form.phone || '').trim().replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        this.phoneStatus = null;
        this.phoneMessage = '';
        return;
      }

      if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
        this.phoneStatus = 'invalid_format';
        this.phoneMessage = '⚠️ รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0)';
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
        this.phoneStatus = null;
        this.phoneMessage = '';
      } finally {
        this.phoneLoading = false;
      }
    },

    async handleRegister() {
      this.errorMessage = '';

      // 1. ตรวจสอบว่ากรอกข้อมูลครบทุกช่องหรือไม่ (บังคับใส่ทุกช่องตามข้อกำหนด)
      const requiredFields = [
        { val: this.form.username, label: 'ชื่อผู้ใช้ (Username)' },
        { val: this.form.name, label: 'ชื่อ - นามสกุล' },
        { val: this.form.phone, label: 'เบอร์โทรศัพท์' },
        { val: this.form.email, label: 'อีเมล' },
        { val: this.form.address, label: 'ที่อยู่ (บ้านเลขที่, ซอย, ถนน)' },
        { val: this.form.subdistrict, label: 'แขวง / ตำบล' },
        { val: this.form.district, label: 'เขต / อำเภอ' },
        { val: this.form.province, label: 'จังหวัด' },
        { val: this.form.postalCode, label: 'รหัสไปรษณีย์' },
        { val: this.form.password, label: 'รหัสผ่าน' }
      ];

      for (const field of requiredFields) {
        if (!field.val || !String(field.val).trim()) {
          this.errorMessage = `กรุณากรอก "${field.label}" ให้เรียบร้อย (บังคับใส่ทุกช่อง)`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 2. ตรวจสอบเบอร์โทรศัพท์ต้องมีครบ 10 หลัก
      const cleanPhone = this.form.phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        this.errorMessage = 'เบอร์โทรศัพท์ต้องใส่ให้ครบ 10 หลัก (เช่น 0891234567)';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. ตรวจสอบรูปแบบอีเมล (ต้องเป็น @gmail.com หรือ @hotmail.com)
      const cleanEmail = this.form.email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
      if (!emailRegex.test(cleanEmail)) {
        this.errorMessage = 'อีเมลต้องลงท้ายด้วย @gmail.com หรือ @hotmail.com เท่านั้น (เช่น somchai@gmail.com)';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. ตรวจสอบรหัสไปรษณีย์ 5 หลัก
      const cleanPostal = this.form.postalCode.trim().replace(/\D/g, '');
      if (cleanPostal.length !== 5) {
        this.errorMessage = 'รหัสไปรษณีย์ต้องใส่ให้ครบ 5 หลัก (เช่น 10310)';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 5. ตรวจสอบรหัสผ่านอย่างน้อย 6 ตัวอักษร
      if (this.form.password.length < 6) {
        this.errorMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 6. ตรวจสอบสถานะชื่อผู้ใช้ซ้ำก่อนส่ง
      if (this.usernameStatus === 'duplicate') {
        this.errorMessage = 'ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ กรุณาใช้ชื่ออื่น';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 7. ตรวจสอบสถานะเบอร์ซ้ำก่อนส่ง
      if (this.phoneStatus === 'duplicate') {
        this.errorMessage = 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้วในระบบ กรุณาใช้เบอร์โทรอื่น';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 8. ตรวจสอบสถานะอีเมลซ้ำก่อนส่ง
      if (this.emailStatus === 'duplicate') {
        this.errorMessage = 'อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาใช้อีเมลอื่น';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      this.loading = true;

      try {
        const cleanAddress = this.form.address.trim();
        const cleanSubdistrict = this.form.subdistrict.trim();
        const cleanDistrict = this.form.district.trim();
        const cleanProvince = this.form.province.trim();

        // รวมที่อยู่สำหรับจัดส่งให้สมบูรณ์
        const fullAddress = `${cleanAddress} แขวง/ตำบล${cleanSubdistrict} เขต/อำเภอ${cleanDistrict} จ.${cleanProvince} ${cleanPostal}`.substring(0, 255);

        const payload = {
          username: this.form.username.trim(),
          password: this.form.password,
          phone_number: cleanPhone,
          email: this.form.email.trim(),
          address: fullAddress
        };

        // เคลียร์เซสชันเดิมก่อนสร้างบัญชีใหม่
        authStore.logout(false);

        // 1. บันทึกบัญชีผู้ใช้ลงฐานข้อมูล MySQL ผ่าน Backend API
        const regRes = await axios.post(`${API_BASE}/auth/register`, payload);

        // 2. ล็อกอินอัตโนมัติเพื่อรับ JWT access_token ของบัญชีใหม่
        try {
          const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            username: payload.username,
            password: payload.password
          });

          const token = loginRes.data?.access_token || loginRes.data?.token;
          const userObj = loginRes.data?.user || regRes.data || {};
          const sessionId = loginRes.data?.session_id;

          if (token) {
            // อัปเดตข้อมูลที่อยู่เพิ่มเติมเข้า Backend Profile
            try {
              await axios.patch(`${API_BASE}/auth/profile`, {
                address: fullAddress
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (addrErr) {
              console.warn('บันทึกที่อยู่เพิ่มเติมไม่สำเร็จ:', addrErr);
            }

            const userProfile = {
              user_id: userObj.user_id,
              username: payload.username,
              name: this.form.name.trim() || payload.username,
              phone: cleanPhone,
              address: fullAddress,
              addressDetail: cleanAddress,
              subdistrict: cleanSubdistrict,
              district: cleanDistrict,
              province: cleanProvince,
              postalCode: cleanPostal,
              email: payload.email,
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
  font-family: 'Prompt', sans-serif; 
}

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
  width: 480px; 
  max-width: 100%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
}

.logo-box { 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center; 
  margin-bottom: 18px; 
}

.shop-logo { 
  display: block;
  height: 60px; 
  width: auto;
  object-fit: contain;
  margin: 0 auto 10px auto; 
}

.logo-box h2 { 
  font-size: 22px; 
  font-weight: 600; 
  color: #333; 
  margin-bottom: 4px; 
}

.logo-box p { 
  font-size: 13px; 
  color: #777; 
}

.error-banner {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 15px;
  border: 1px solid #ffcdd2;
  font-weight: 500;
}

.auth-form { 
  display: flex; 
  flex-direction: column; 
  gap: 13px; 
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 440px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.input-group { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  position: relative;
}

.input-group label { 
  font-size: 13px; 
  font-weight: 500; 
  color: #444; 
}

.req-star { 
  color: #d32f2f; 
  font-weight: bold; 
  margin-left: 2px; 
}

.input-group input, 
.input-group textarea,
.form-select { 
  padding: 10px 14px; 
  border-radius: 12px; 
  border: 1px solid #ddd; 
  outline: none; 
  font-size: 13px; 
  font-family: inherit; 
  resize: none; 
  background-color: #fafafa;
  transition: border-color 0.2s, background-color 0.2s;
}

.input-group input:focus, 
.input-group textarea:focus,
.form-select:focus { 
  border-color: #557c61; 
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(85, 124, 97, 0.12);
}

.input-group input:disabled, 
.input-group textarea:disabled,
.form-select:disabled { 
  background-color: #f5f5f5; 
  cursor: not-allowed; 
}

/* Phone input with status indicator */
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

@keyframes spin { 
  100% { transform: rotate(360deg); } 
}

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
  padding: 12px; 
  border-radius: 12px; 
  font-size: 15px; 
  font-weight: 600; 
  cursor: pointer; 
  margin-top: 8px; 
  font-family: inherit; 
  transition: 0.2s; 
  box-shadow: 0 3px 8px rgba(85, 124, 97, 0.2);
}

.submit-btn:hover { 
  background: #405e49; 
}

.submit-btn:disabled { 
  background-color: #a3b8aa; 
  cursor: not-allowed; 
  box-shadow: none;
}

.auth-footer { 
  text-align: center; 
  margin-top: 16px; 
  font-size: 13px; 
  color: #666; 
}

.auth-footer a { 
  color: #557c61; 
  font-weight: 600; 
  text-decoration: none; 
}

.auth-footer a:hover { 
  text-decoration: underline; 
}

.back-home { 
  color: #888; 
  font-weight: 400; 
}
</style>