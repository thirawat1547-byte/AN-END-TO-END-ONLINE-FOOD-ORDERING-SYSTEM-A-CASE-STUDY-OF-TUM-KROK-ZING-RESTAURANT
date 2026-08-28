<template>
  <div class="page-container">
    <header class="navbar">
      <div class="logo-section"><img src="./assets/logo.png" alt="Logo" class="logo-img" @error="$event.target.style.display='none'"></div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item">ข้อเสนอ</router-link>
        <router-link to="/help" class="nav-item active">ความช่วยเหลือ</router-link>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">🛒</button>
        <div class="profile-avatar" @click="$router.push('/profile')">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Profile">
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <!-- Search Banner -->
      <div class="help-hero">
        <h1>วันนี้เราจะช่วยอะไรคุณได้บ้าง?</h1>
        <p>เรียกดูหัวข้อช่วยเหลือหรือค้นหาสิ่งที่คุณต้องการ</p>
        <div class="help-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="ค้นหา 'สินค้าไม่ครบ', 'การคืนเงิน', 'เวลาจัดส่ง'...">
        </div>
      </div>

      <!-- หัวข้อที่พบบ่อย -->
      <h3 class="section-title">หัวข้อที่พบบ่อย</h3>
      <div class="topics-grid">
        <div class="topic-card">
          <div class="topic-icon">📦</div>
          <h4>คำสั่งซื้อของฉัน</h4>
          <p>ติดตาม, แก้ไข, หรือรายงานปัญหาเกี่ยวกับคำสั่งซื้อล่าสุด</p>
        </div>
        <div class="topic-card">
          <div class="topic-icon">💳</div>
          <h4>การชำระเงินและการคืนเงิน</h4>
          <p>จัดการวิธีการชำระเงินและตรวจสอบสถานะการคืนเงิน</p>
        </div>
        <div class="topic-card">
          <div class="topic-icon">🎟️</div>
          <h4>บัตรกำนัลและโปรโมชั่น</h4>
          <p>ใช้รหัสและทำความเข้าใจเงื่อนไขของบัตรกำนัล</p>
        </div>
        <div class="topic-card">
          <div class="topic-icon">⚙️</div>
          <h4>การตั้งค่าบัญชี</h4>
          <p>อัปเดตรายละเอียดโปรไฟล์, ที่อยู่, และการแจ้งเตือน</p>
        </div>
      </div>

      <!-- คำถามที่พบบ่อย (FAQ Accordion) -->
      <h3 class="section-title" style="margin-top: 15px;">คำถามที่พบบ่อย</h3>
      <div class="faq-list">
        <div class="faq-item" @click="toggleFaq(0)">
          <div class="faq-question">
            <span>❓ คำสั่งซื้อของฉันอยู่ที่ไหน?</span>
            <span class="arrow" :class="{ open: activeFaq === 0 }">▼</span>
          </div>
          <div class="faq-answer" v-if="activeFaq === 0">
            คุณสามารถตรวจสอบสถานะและตำแหน่งปัจจุบันของคำสั่งซื้อได้แบบเรียลไทม์ผ่านเมนู "คำสั่งซื้อ" บนแถบเมนูด้านบน
          </div>
        </div>

        <div class="faq-item" @click="toggleFaq(1)">
          <div class="faq-question">
            <span>❌ ฉันจะยกเลิกคำสั่งซื้อได้อย่างไร?</span>
            <span class="arrow" :class="{ open: activeFaq === 1 }">▼</span>
          </div>
          <div class="faq-answer" v-if="activeFaq === 1">
            หากร้านยังไม่เริ่มเตรียมอาหาร คุณสามารถกดปุ่มยกเลิกได้ที่หน้าคำสั่งซื้อ หรือติดต่อฝ่ายสนับสนุนลูกค้าทันที
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-brand">คำตากซิ่ง</div>
      <div class="footer-links">
        <a href="#">นโยบายความเป็นส่วนตัว</a>
        <a href="#">ข้อกำหนดการให้บริการ</a>
        <a href="#">ความยั่งยืน</a>
        <a href="#">ติดต่อเรา</a>
      </div>
      <div class="footer-copy">© 2024 Terra Eats. สงวนลิขสิทธิ์</div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeFaq: null
    }
  },
  methods: {
    toggleFaq(index) {
      this.activeFaq = this.activeFaq === index ? null : index;
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

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 30px 40px; display: flex; flex-direction: column; gap: 25px; flex-grow: 1; }

/* Help Hero */
.help-hero { background: white; border-radius: 24px; padding: 45px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; gap: 10px; }
.help-hero h1 { font-size: 28px; font-weight: 700; color: #333; }
.help-hero p { font-size: 14px; color: #666; margin-bottom: 10px; }
.help-search-box { position: relative; width: 100%; max-width: 600px; }
.help-search-box input { width: 100%; padding: 12px 15px 12px 42px; border-radius: 25px; border: 1px solid #e0dfd5; background: #faf9f5; font-size: 14px; outline: none; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #888; }

.section-title { font-size: 18px; font-weight: 600; color: #333; }

/* Topics Grid */
.topics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.topic-card { background: white; border-radius: 20px; padding: 25px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: 0.2s; }
.topic-card:hover { transform: translateY(-3px); }
.topic-icon { font-size: 24px; margin-bottom: 5px; }
.topic-card h4 { font-size: 15px; font-weight: 600; color: #333; }
.topic-card p { font-size: 12px; color: #777; line-height: 1.4; }

/* FAQ List */
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { background: white; border-radius: 16px; padding: 18px 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); cursor: pointer; }
.faq-question { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: #333; }
.arrow { font-size: 12px; color: #777; transition: 0.2s; }
.arrow.open { transform: rotate(180deg); }
.faq-answer { font-size: 13px; color: #666; margin-top: 12px; border-top: 1px solid #eee; padding-top: 12px; line-height: 1.5; }

/* Footer */
.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; font-size: 12px; color: #666; margin-top: auto; }
.footer-brand { font-weight: 600; color: #557c61; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #557c61; }
.footer-copy { color: #888; }
</style>