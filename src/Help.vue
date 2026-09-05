<template>
  <div class="page-container">
    <!-- Navbar -->
    <header class="navbar">
      <div class="logo-section">
        <img src="./assets/logo.png" alt="Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/history" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item">ข้อเสนอ</router-link>
        <router-link to="/help" class="nav-item active">ความช่วยเหลือ</router-link>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn" @click="$router.push('/')">🛒</button>
        <div class="profile-avatar" @click="$router.push('/profile')">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Profile">
        </div>
      </div>
    </header>

    <div class="help-content-wrapper">
      <!-- ส่วนแบนเนอร์และช่องค้นหาความช่วยเหลือ -->
      <div class="help-header-box">
        <h1 class="help-title">สวัสดี, เราจะช่วยเหลือคุณได้อย่างไร?</h1>
        <div class="help-search-container">
          <span class="search-icon">🔍</span>
          <!-- ช่องค้นหาที่แก้ไขให้พิมพ์ได้แล้ว -->
          <input 
            type="text" 
            class="help-search-input" 
            placeholder="ค้นหาปัญหาของคุณ เช่น 'ยกเลิกคำสั่งซื้อ'..." 
            v-model="searchQuery"
          >
        </div>
      </div>

      <!-- หมวดหมู่ความช่วยเหลือด่วน -->
      <div class="help-categories" v-if="!searchQuery">
        <div class="category-card" @click="searchQuery = 'จัดส่ง'">
          <div class="cat-icon">🛵</div>
          <div class="cat-name">การจัดส่ง</div>
        </div>
        <div class="category-card" @click="searchQuery = 'ชำระเงิน'">
          <div class="cat-icon">💳</div>
          <div class="cat-name">การชำระเงิน</div>
        </div>
        <div class="category-card" @click="searchQuery = 'อาหาร'">
          <div class="cat-icon">🍱</div>
          <div class="cat-name">เกี่ยวกับอาหาร</div>
        </div>
        <div class="category-card" @click="searchQuery = 'บัญชี'">
          <div class="cat-icon">👤</div>
          <div class="cat-name">บัญชีของฉัน</div>
        </div>
      </div>

      <!-- รายการคำถามที่พบบ่อย (FAQ) กรองตามคำค้นหา -->
      <div class="faq-section">
        <h2 class="faq-section-title">{{ searchQuery ? 'ผลการค้นหา' : 'คำถามที่พบบ่อย' }}</h2>
        
        <div class="faq-list">
          <div class="faq-item" v-for="faq in filteredFaqs" :key="faq.id">
            <h3 class="faq-question">{{ faq.question }}</h3>
            <p class="faq-answer">{{ faq.answer }}</p>
          </div>
          
          <!-- กรณีค้นหาแล้วไม่เจอ -->
          <div v-if="filteredFaqs.length === 0" class="no-result">
            <p>ไม่พบข้อมูลที่ตรงกับ "{{ searchQuery }}"</p>
            <button class="contact-support-btn" @click="contactSupport">ติดต่อพนักงานบริการลูกค้า</button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      // ฐานข้อมูลจำลองสำหรับคำถามที่พบบ่อย
      faqs: [
        { id: 1, category: 'จัดส่ง', question: 'ฉันจะติดตามคำสั่งซื้อได้อย่างไร?', answer: 'คุณสามารถไปที่เมนู "คำสั่งซื้อ" (หรือ History) และคลิกที่ออเดอร์ล่าสุดเพื่อดูสถานะและตำแหน่งของพนักงานจัดส่งแบบเรียลไทม์ได้เลยครับ' },
        { id: 2, category: 'จัดส่ง', question: 'ทำไมคำสั่งซื้อของฉันถึงล่าช้ากว่ากำหนด?', answer: 'อาจเกิดจากสภาพอากาศ หรือการจราจรในพื้นที่จัดส่งขัดข้อง คุณสามารถกดปุ่ม "โทรหาคนขับ" ในหน้าติดตามคำสั่งซื้อเพื่อสอบถามตำแหน่งปัจจุบันได้ครับ' },
        { id: 3, category: 'อาหาร', question: 'ฉันได้รับอาหารไม่ตรงกับที่สั่ง ต้องทำอย่างไร?', answer: 'ขออภัยในความไม่สะดวกครับ โปรดถ่ายรูปอาหารที่ได้รับพร้อมใบเสร็จ และกดปุ่มติดต่อพนักงานบริการลูกค้าด้านล่างเพื่อทำการเคลมยอดเงินคืนครับ' },
        { id: 4, category: 'ชำระเงิน', question: 'มีวิธีการชำระเงินแบบใดบ้าง?', answer: 'ปัจจุบันระบบของเรารองรับการชำระเงิน 2 รูปแบบ คือ 1. สแกนคิวอาร์โค้ด (พร้อมเพย์) และ 2. ชำระด้วยเงินสดปลายทาง' },
        { id: 5, category: 'ชำระเงิน', question: 'ฉันถูกหักเงินไปแล้ว แต่สถานะออเดอร์ยังไม่ขึ้น?', answer: 'หากเป็นกรณีนี้ โปรดรอประมาณ 1-2 นาทีให้ระบบอัปเดต หรือหากยังไม่ขึ้น กรุณาเตรียมสลิปการโอนเงินและติดต่อเจ้าหน้าที่ครับ' },
        { id: 6, category: 'บัญชี', question: 'ฉันจะเปลี่ยนที่อยู่จัดส่งได้อย่างไร?', answer: 'คุณสามารถไปที่รูปโปรไฟล์ของคุณมุมขวาบน (บัญชีของฉัน) แล้วคลิกที่ไอคอนรูปดินสอหลังที่อยู่เพื่อทำการแก้ไขและบันทึกข้อมูลใหม่ได้ทันทีครับ' },
        { id: 7, category: 'อาหาร', question: 'ฉันต้องการยกเลิกคำสั่งซื้อ ทำได้หรือไม่?', answer: 'คุณสามารถยกเลิกคำสั่งซื้อได้ภายใน 1 นาทีหลังจากกดยืนยันออเดอร์ หากร้านค้ารับออเดอร์และเริ่มปรุงอาหารแล้ว จะไม่สามารถยกเลิกได้ครับ' }
      ]
    }
  },
  computed: {
    // ฟังก์ชันกรองคำถามตามสิ่งที่พิมพ์ในช่องค้นหา
    filteredFaqs() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.faqs; // ถ้าไม่ได้พิมพ์อะไร ให้แสดงทั้งหมด

      return this.faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    contactSupport() {
      alert('กำลังเชื่อมต่อกับเจ้าหน้าที่ Live Chat...');
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
.nav-item.active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }
.nav-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.profile-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 2px solid #557c61; cursor: pointer; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.help-content-wrapper { max-width: 900px; margin: 0 auto; width: 100%; padding: 40px 20px; display: flex; flex-direction: column; gap: 40px; flex-grow: 1; }

/* Header & Search */
.help-header-box { background: #557c61; border-radius: 20px; padding: 50px 40px; text-align: center; color: white; box-shadow: 0 10px 20px rgba(85, 124, 97, 0.2); }
.help-title { font-size: 28px; font-weight: 600; margin-bottom: 25px; }
.help-search-container { position: relative; max-width: 500px; margin: 0 auto; z-index: 10; }
.help-search-input { width: 100%; padding: 16px 20px 16px 50px; border-radius: 30px; border: none; font-size: 15px; font-family: inherit; color: #333; outline: none; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position: relative; z-index: 11; }
.search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #888; z-index: 12; }

/* Categories */
.help-categories { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
.category-card { background: white; border: 1px solid #e0dfd5; padding: 20px 30px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; min-width: 150px; }
.category-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); border-color: #557c61; }
.cat-icon { font-size: 32px; }
.cat-name { font-size: 14px; font-weight: 500; color: #444; }

/* FAQ List */
.faq-section { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.faq-section-title { font-size: 20px; font-weight: 600; color: #333; margin-bottom: 25px; border-bottom: 2px solid #e5e2d5; padding-bottom: 15px; }
.faq-list { display: flex; flex-direction: column; gap: 20px; }
.faq-item { padding-bottom: 20px; border-bottom: 1px solid #f2f0ea; }
.faq-item:last-child { border-bottom: none; padding-bottom: 0; }
.faq-question { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; }
.faq-answer { font-size: 14px; color: #666; line-height: 1.6; }

/* No Results */
.no-result { text-align: center; padding: 30px; color: #777; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.contact-support-btn { background: #557c61; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; }
.contact-support-btn:hover { background: #405e49; }
</style>