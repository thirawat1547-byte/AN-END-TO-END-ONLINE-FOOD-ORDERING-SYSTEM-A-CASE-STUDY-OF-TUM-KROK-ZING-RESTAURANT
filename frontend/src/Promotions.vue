<template>
  <div class="page-container">
    <header class="navbar">
      <!-- กลุ่มซ้าย: โลโก้ + เมนู -->
      <div class="nav-left-group">
        <img src="./assets/logo.png" alt="Logo" class="logo-img" @click="$router.push('/')">
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">ค้นหา</router-link>
          <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
          <router-link to="/history" class="nav-item">ประวัติคำสั่งซื้อ</router-link>
          <router-link to="/promotions" class="nav-item active">โปรโมชั่น</router-link>
          <router-link to="/help" class="nav-item">ช่วยเหลือ</router-link>
        </nav>
      </div>
      
      <!-- พื้นที่ว่างดันไปขวา -->
      <div class="header-spacer"></div>

      <!-- กลุ่มขวา: จัดเรียงแนวนอนทั้งหมด -->
      <div class="header-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn" @click="$router.push('/')" v-if="$route.path !== '/'">🛒</button>
        <button class="logout-btn" @click="logout">ออกจากระบบ</button>
        <div class="profile-avatar" @click="$router.push('/profile')">
          <img :src="userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'" alt="Profile">
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <!-- Hero Banner -->
      <div class="promo-banner">
        <div class="promo-banner-text">
          <span class="badge-time">มีเวลาจำกัด</span>
          <h1>ฉลองสุดสัปดาห์ด้วย<br>อาหารอีสานรสแซ่บ</h1>
          <p>ลดพิเศษสำหรับสมาชิกและลูกค้าทุกท่าน อิ่มคุ้ม สั่งเลย!</p>
          <button class="banner-btn" @click="$router.push('/')">รับสิทธิ์ ➔</button>
        </div>
      </div>

      <!-- หัวข้อคูปอง -->
      <div class="section-header-row">
        <h2>คูปองและโปรโมชั่นทั้งหมด</h2>
        <span class="view-all-link">อัปเดตแบบเรียลไทม์</span>
      </div>

      <!-- Grid คูปอง (แสดงผลเฉพาะที่เปิดใช้งาน) -->
      <div class="coupon-grid" v-if="activePromotions.length > 0">
        <div class="coupon-card" v-for="promo in activePromotions" :key="promo.promo_id || promo.id">
          <div class="coupon-top">
            <span class="c-icon">🎁</span>
            <span class="c-badge">ใช้งานได้</span>
          </div>
          <h4>{{ promo.discount_type === 'Percentage' ? `ลด ${promo.discount_value}%` : `ลด ฿${promo.discount_value} บาท` }}</h4>
          <p>ยอดซื้อขั้นต่ำ ฿{{ promo.min_order_price }} ขึ้นไป (หมดเขต {{ promo.expiry_date || '31/12/2026' }})</p>
          <div class="coupon-code-box">
            <code>{{ promo.code }}</code>
            <span class="copy-icon" @click="copyCode(promo.code)" title="คัดลอกโค้ด">📋</span>
          </div>
          <button class="coupon-btn active" @click="$router.push('/')">ไปใช้สิทธิ์</button>
        </div>
      </div>

      <!-- กรณีไม่มีโปรโมชั่นเปิดใช้งาน -->
      <div v-else style="text-align: center; padding: 40px; color: #888; background: white; border-radius: 20px;">
        <p>ยังไม่มีโปรโมชั่นในขณะนี้ โปรดติดตามเร็วๆ นี้</p>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-brand">ตำครกซิ่ง</div>
      <div class="footer-links">
        <a href="#">แหล่งที่มาของเรา</a>
        <a href="#">การจัดส่งที่เป็นกลางทางคาร์บอน</a>
        <a href="#">นโยบายความเป็นส่วนตัว</a>
        <a href="#">ข้อกำหนดในการให้บริการ</a>
      </div>
      <div class="footer-copy">© 2026 Terra Eats. หนึ่งรากลึกในความยั่งยืน</div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      showAddressDropdown: false,
      isLoggedIn: false,
      userProfile: { address: '', avatar: '' },
      promotionsList: []
    }
  },
  computed: {
    activePromotions() {
      return this.promotionsList.filter(p => p.is_active !== false);
    },
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
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(profileData) };
    } else if (this.isLoggedIn) {
      this.userProfile.address = '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000';
    }

    // โหลดโปรโมชันที่แอดมินสร้างไว้จาก localStorage
    this.loadPromotions();
  },
  methods: {
    loadPromotions() {
      const saved = localStorage.getItem('tumkrok_promotions');
      if (saved) {
        try {
          this.promotionsList = JSON.parse(saved);
        } catch (e) {
          this.promotionsList = [];
        }
      } else {
        // ค่าสำรองเริ่มต้น
        this.promotionsList = [
          { promo_id: 1, code: 'ZING50', discount_type: 'Fixed', discount_value: 50, min_order_price: 300, expiry_date: '2026-10-31', is_active: true },
          { promo_id: 2, code: 'SEP10', discount_type: 'Percentage', discount_value: 10, min_order_price: 200, expiry_date: '2026-09-30', is_active: true },
          { promo_id: 3, code: 'WELCOME100', discount_type: 'Fixed', discount_value: 100, min_order_price: 500, expiry_date: '2026-12-31', is_active: true }
        ];
      }
    },
    copyCode(code) {
      if (!code) return;
      navigator.clipboard.writeText(code);
      alert(`คัดลอกโค้ด "${code}" เรียบร้อยแล้ว!`);
    },
    logout() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('access_token');
      this.isLoggedIn = false;
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.logo-img { height: 35px; cursor: pointer; }
.nav-menu { display: flex; gap: 30px; align-items: center; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-item.active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }
.header-spacer { flex-grow: 1; }
.header-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 12px; border-radius: 15px; cursor: pointer; font-size: 13px; font-weight: 500; font-family: inherit; transition: 0.2s; }
.logout-btn:hover { background: #fff0f0; }
.profile-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 2px solid #557c61; cursor: pointer; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 30px 40px; display: flex; flex-direction: column; gap: 30px; flex-grow: 1; }

/* Banner */
.promo-banner { background: url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200') center/cover; border-radius: 24px; padding: 50px; color: white; position: relative; overflow: hidden; }
.promo-banner::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
.promo-banner-text { position: relative; z-index: 1; max-width: 500px; }
.badge-time { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; backdrop-filter: blur(5px); display: inline-block; margin-bottom: 15px; }
.promo-banner h1 { font-size: 36px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
.promo-banner p { font-size: 14px; opacity: 0.9; margin-bottom: 20px; }
.banner-btn { background: #557c61; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; }

/* Section Header */
.section-header-row { display: flex; justify-content: space-between; align-items: center; }
.section-header-row h2 { font-size: 20px; font-weight: 600; color: #333; }
.view-all-link { color: #557c61; font-size: 13px; font-weight: 600; }

/* Coupon Grid */
.coupon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.coupon-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px; position: relative; border: 1px solid #e5e2d5; }
.coupon-top { display: flex; justify-content: space-between; align-items: center; }
.c-icon { font-size: 20px; }
.c-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 8px; background: #eef2ed; color: #557c61; }
.coupon-card h4 { font-size: 15px; font-weight: 600; color: #333; }
.coupon-card p { font-size: 12px; color: #777; line-height: 1.4; flex-grow: 1; }
.coupon-code-box { background: #f7f6f0; border: 1px dashed #ccc; padding: 8px 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #444; }
.copy-icon { cursor: pointer; transition: 0.2s; }
.copy-icon:hover { transform: scale(1.1); }
.coupon-btn { width: 100%; padding: 10px; border-radius: 12px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; font-family: inherit; }
.coupon-btn.active { background: #557c61; color: white; }
.coupon-btn.active:hover { background: #405e49; }

/* Footer */
.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; font-size: 12px; color: #666; margin-top: auto; }
.footer-brand { font-weight: 600; color: #557c61; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #557c61; }
.footer-copy { color: #888; }
</style>