<template>
  <div class="page-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

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
import CustomerNavbar from './components/CustomerNavbar.vue';
import { isCardPaymentEnabled } from './utils/stripe';

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      isLoggedIn: false,
      userProfile: { address: '', avatar: '' },
      searchQuery: '',
      // คำตอบ FAQ ให้ตรงกับสิ่งที่ระบบทำได้จริง
      faqs: [
        { question: 'ฉันจะยกเลิกคำสั่งซื้อได้อย่างไร?', answer: 'ตอนนี้ลูกค้ายังกดยกเลิกคำสั่งซื้อเองในระบบไม่ได้ หากต้องการยกเลิก กรุณาติดต่อร้านโดยเร็วที่สุดพร้อมแจ้งเลขออเดอร์ ทางร้านจะตรวจสอบและยกเลิกให้หากยังไม่เริ่มปรุงอาหารครับ', isOpen: false },
        { question: 'ฉันจะติดตามสถานะการจัดส่งได้อย่างไร?', answer: 'หลังสั่งซื้อ ระบบจะพาไปหน้า "ติดตามออเดอร์" ซึ่งแสดงสถานะตั้งแต่ร้านรับออเดอร์ กำลังปรุง จนถึงไรเดอร์กำลังจัดส่ง เมื่อมีไรเดอร์รับงานแล้วจะเห็นชื่อไรเดอร์และสามารถส่งข้อความหาไรเดอร์ได้จากหน้านั้นครับ', isOpen: false },
        { question: 'มีช่องทางการชำระเงินใดบ้าง?', answer: isCardPaymentEnabled
          ? 'รองรับการสแกน QR Code พร้อมเพย์, เงินสดปลายทาง และบัตรเดบิตผ่าน Stripe (ยังไม่รองรับบัตรเครดิต) กรณีพร้อมเพย์ ทางร้านจะตรวจสอบยอดเงินเข้าบัญชีก่อนยืนยันการชำระเงินครับ'
          : 'รองรับการสแกน QR Code พร้อมเพย์ และเงินสดปลายทาง กรณีพร้อมเพย์ ทางร้านจะตรวจสอบยอดเงินเข้าบัญชีก่อนยืนยันการชำระเงินครับ', isOpen: false },
        { question: 'มีค่าจัดส่งเท่าไหร่?', answer: 'ค่าจัดส่งจะแสดงในหน้าชำระเงินก่อนยืนยันคำสั่งซื้อ และจัดส่งฟรีเมื่อสั่งอาหารครบ ฿300 ขึ้นไปครับ', isOpen: false },
        { question: 'หากได้รับอาหารไม่ครบ หรือไม่ตรงตามสั่งต้องทำอย่างไร?', answer: 'โปรดถ่ายรูปอาหารที่ได้รับ แล้วติดต่อร้านพร้อมแจ้งเลขออเดอร์ ทางร้านจะตรวจสอบกับรายการในระบบให้ครับ นอกจากนี้คุณยังให้คะแนนและเขียนรีวิวได้หลังได้รับอาหาร', isOpen: false },
        { question: 'ฉันสามารถเปลี่ยนที่อยู่จัดส่งหลังจากสั่งซื้อไปแล้วได้หรือไม่?', answer: 'ระบบไม่รองรับการแก้ไขที่อยู่หลังยืนยันคำสั่งซื้อ กรุณาตรวจสอบที่อยู่และหมุดบนแผนที่ในหน้าชำระเงินให้ถูกต้องก่อนกดสั่งซื้อ หากจำเป็นต้องเปลี่ยน ให้ส่งข้อความหาไรเดอร์หรือติดต่อร้านครับ', isOpen: false },
        { question: 'มีโปรโมชั่นหรือโค้ดส่วนลดไหม?', answer: 'ดูโปรโมชั่นที่ร้านเปิดอยู่ได้ที่หน้า "โปรโมชั่น" เก็บคูปองไว้แล้วเลือกใช้ หรือกรอกโค้ดส่วนลดได้ในหน้าชำระเงินครับ', isOpen: false },
        { question: 'ฉันจะแก้ไขข้อมูลบัญชี เบอร์โทร หรือที่อยู่ได้ที่ไหน?', answer: 'เข้าไปที่หน้า "โปรไฟล์" เพื่อแก้ไขชื่อ เบอร์โทร และที่อยู่จัดส่งของบัญชีคุณได้ครับ', isOpen: false }
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