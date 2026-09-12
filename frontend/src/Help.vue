<template>
  <div class="page-container">
    <!-- Header มาตรฐาน -->
    <header class="navbar">
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
      
      <div class="header-spacer"></div>

      <div class="header-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn" @click="$router.push('/')">🛒</button>
        <div class="auth-links">
          <button class="logout-btn" @click="logout">ออกจากระบบ</button>
          <div class="profile-avatar" @click="$router.push('/profile')">
            <img :src="userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'" alt="Profile">
          </div>
        </div>
      </div>
    </header>

    <!-- เนื้อหาหน้าช่วยเหลือ -->
    <div class="help-content-wrapper">
      <div class="help-banner">
        <h2>สวัสดี, เราจะช่วยเหลือคุณได้อย่างไร?</h2>
        <div class="help-search-box">
          <span class="search-icon">🔍</span>
          <!-- ผูก v-model เพื่อให้ค้นหาทำงานได้จริง -->
          <input type="text" v-model="searchQuery" placeholder="ค้นหาปัญหาของคุณ เช่น 'ยกเลิกคำสั่งซื้อ'...">
        </div>
      </div>

      <!-- หมวดหมู่ปัญหา (กดเพื่อค้นหาอัตโนมัติ) -->
      <div class="help-topics-grid" v-if="!searchQuery">
        <div class="topic-card" @click="searchQuery = 'จัดส่ง'">
          <div class="topic-icon">🛵</div>
          <span>การจัดส่ง</span>
        </div>
        <div class="topic-card" @click="searchQuery = 'ชำระเงิน'">
          <div class="topic-icon">💳</div>
          <span>การชำระเงิน</span>
        </div>
        <div class="topic-card" @click="searchQuery = 'อาหาร'">
          <div class="topic-icon">🍱</div>
          <span>เกี่ยวกับอาหาร</span>
        </div>
        <div class="topic-card" @click="searchQuery = 'บัญชี'">
          <div class="topic-icon">👤</div>
          <span>บัญชีของฉัน</span>
        </div>
      </div>
      <!-- ส่วนคำถามที่พบบ่อย (FAQ) -->
      <div class="faq-section">
        <h3 class="faq-title">{{ searchQuery ? 'ผลการค้นหา' : 'คำถามที่พบบ่อย' }}</h3>
        
        <div class="faq-list" v-if="filteredFaqs.length > 0">
          <div 
            class="faq-item" 
            v-for="(faq, index) in filteredFaqs" 
            :key="index"
            :class="{ 'is-open': faq.isOpen }"
          >
            <div class="faq-question" @click="toggleFaq(faq)">
              <span>{{ faq.question }}</span>
              <span class="toggle-icon">{{ faq.isOpen ? '−' : '＋' }}</span>
            </div>
            <div class="faq-answer" v-show="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <!-- กรณีค้นหาแล้วไม่เจอ -->
        <div class="no-result" v-else>
          <div class="no-result-icon">😔</div>
          <p>ไม่พบคำตอบสำหรับ <b>"{{ searchQuery }}"</b></p>
          <p class="sub-text">โปรดลองใช้คำค้นหาอื่น หรือติดต่อฝ่ายบริการลูกค้า</p>
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
      userProfile: { address: '', avatar: '' },
      searchQuery: '',
      // ข้อมูลจำลองสำหรับ FAQ
      faqs: [
        { question: 'ฉันจะยกเลิกคำสั่งซื้อได้อย่างไร?', answer: 'คุณสามารถยกเลิกคำสั่งซื้อได้ภายใน 5 นาทีหลังจากกดสั่งซื้อ โดยเข้าไปที่หน้า "ประวัติคำสั่งซื้อ" แล้วกดปุ่มยกเลิก หากเกินเวลาที่กำหนดจะไม่สามารถยกเลิกได้ครับ', isOpen: false },
        { question: 'ใช้เวลาจัดส่งอาหารนานเท่าไหร่?', answer: 'โดยปกติแล้วเราจะใช้เวลาจัดส่งประมาณ 30-45 นาที ขึ้นอยู่กับระยะทางจากร้านถึงที่อยู่ของคุณ และสภาพการจราจรในขณะนั้นครับ', isOpen: false },
        { question: 'มีช่องทางการชำระเงินใดบ้าง?', answer: 'เรารองรับการชำระเงินหลากหลายรูปแบบ ได้แก่ บัตรเครดิต/เดบิต, สแกน QR Code (พร้อมเพย์), และการชำระเงินสดปลายทางครับ', isOpen: false },
        { question: 'หากได้รับอาหารไม่ครบ หรือไม่ตรงตามสั่งต้องทำอย่างไร?', answer: 'โปรดถ่ายรูปใบเสร็จและอาหารที่ได้รับ จากนั้นติดต่อฝ่ายบริการลูกค้าของเราทันที ทางเราจะดำเนินการตรวจสอบและชดเชยให้โดยเร็วที่สุดครับ', isOpen: false },
        { question: 'ฉันสามารถเปลี่ยนที่อยู่จัดส่งหลังจากสั่งซื้อไปแล้วได้หรือไม่?', answer: 'เพื่อความรวดเร็วและป้องกันความผิดพลาดในการจัดส่ง คุณจะไม่สามารถเปลี่ยนที่อยู่ได้หลังจากยืนยันคำสั่งซื้อแล้ว แนะนำให้กดยกเลิกและทำรายการสั่งซื้อใหม่ครับ', isOpen: false },
        { question: 'มีโปรโมชั่นสำหรับลูกค้าใหม่หรือไม่?', answer: 'มีครับ! ลูกค้าใหม่จะได้รับส่วนลด 15% สำหรับการสั่งซื้อครั้งแรก เพียงเข้าไปที่หน้า "โปรโมชั่น" เพื่อดูรายละเอียดเพิ่มเติม', isOpen: false }
      ]
    }
  },
  computed: {
    // ฟังก์ชันกรองคำถามตามที่ผู้ใช้พิมพ์ค้นหา
    filteredFaqs() {
      if (!this.searchQuery) return this.faqs;
      const query = this.searchQuery.toLowerCase().trim();
      return this.faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(profileData) };
    }
  },
  methods: {
    logout() {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('cartData');
      this.isLoggedIn = false;
      this.$router.push('/');
    },
    // ฟังก์ชันเปิด/ปิด FAQ
    toggleFaq(faq) {
      faq.isOpen = !faq.isOpen;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

/* HEADER STYLES */
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.nav-left-group { display: flex; align-items: center; gap: 30px; }
.logo-img { height: 40px; cursor: pointer; display: block; }
.nav-menu { display: flex; align-items: center; gap: 20px; white-space: nowrap; margin-top: 5px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { color: #557c61; }
.nav-item.router-link-exact-active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.header-spacer { flex-grow: 1; }

.header-actions { display: flex; align-items: center; gap: 15px; white-space: nowrap; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.auth-links { display: flex; align-items: center; gap: 12px; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: inherit; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 1px solid transparent; }
.profile-avatar:hover { border-color: #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* HELP CONTENT STYLES */
.help-content-wrapper { max-width: 900px; margin: 0 auto; width: 100%; padding: 50px 20px; display: flex; flex-direction: column; align-items: center; flex-grow: 1; }
.help-banner { background: #6b8e73; width: 100%; border-radius: 20px; padding: 50px 30px; text-align: center; color: white; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.help-banner h2 { font-size: 26px; font-weight: 600; margin-bottom: 20px; }
.help-search-box { position: relative; max-width: 500px; margin: 0 auto; }
.help-search-box input { width: 100%; padding: 15px 20px 15px 45px; border-radius: 25px; border: none; font-size: 15px; outline: none; font-family: inherit; color: #333; }
.help-search-box .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #557c61; font-size: 16px; }

.help-topics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; width: 100%; max-width: 800px; margin-bottom: 40px; }
.topic-card { background: white; border-radius: 16px; padding: 30px 20px; text-align: center; cursor: pointer; border: 1px solid #e5e2d5; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.topic-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #6b8e73; }
.topic-icon { font-size: 35px; }
.topic-card span { font-size: 14px; font-weight: 500; color: #444; }

/* FAQ STYLES */
.faq-section { width: 100%; max-width: 800px; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #e5e2d5; }
.faq-title { font-size: 20px; font-weight: 600; color: #333; margin-bottom: 20px; border-bottom: 2px solid #f2f0ea; padding-bottom: 15px; }

.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { border: 1px solid #eee; border-radius: 12px; overflow: hidden; transition: 0.3s; }
.faq-item.is-open { border-color: #557c61; box-shadow: 0 2px 8px rgba(85,124,97,0.1); }
.faq-question { padding: 15px 20px; background: #faf9f5; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 15px; font-weight: 500; color: #333; transition: 0.2s; }
.faq-question:hover { background: #f4faeb; }
.faq-item.is-open .faq-question { background: #557c61; color: white; }
.toggle-icon { font-size: 18px; font-weight: bold; }
.faq-answer { padding: 20px; background: white; font-size: 14px; color: #555; line-height: 1.6; border-top: 1px solid #eee; }

.no-result { text-align: center; padding: 40px 20px; }
.no-result-icon { font-size: 40px; margin-bottom: 10px; }
.no-result p { font-size: 16px; color: #333; margin-bottom: 5px; }
.sub-text { font-size: 14px !important; color: #888 !important; }
</style>