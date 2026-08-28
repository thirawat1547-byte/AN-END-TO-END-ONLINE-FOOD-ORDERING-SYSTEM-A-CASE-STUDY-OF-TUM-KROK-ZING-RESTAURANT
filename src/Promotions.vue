<template>
  <div class="page-container">
    <header class="navbar">
      <img src="./assets/logo.png" alt="Logo" class="logo-img">
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item active">ข้อเสนอ</router-link>
        <router-link to="/help" class="nav-item">ความช่วยเหลือ</router-link>
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
      <!-- Hero Banner -->
      <div class="promo-banner">
        <div class="promo-banner-text">
          <span class="badge-time">มีเวลาจำกัด</span>
          <h1>ฉลองสุดสัปดาห์ด้วย<br>อาหารออร์แกนิก</h1>
          <p>ลดสูงสุด 30% สำหรับเมนูจากฟาร์มสู่โต๊ะอาหารที่คัดสรรมาเฉพาะฤดูกาล</p>
          <button class="banner-btn">รับสิทธิ์ ➔</button>
        </div>
      </div>

      

      <!-- หัวข้อคูปอง -->
      <div class="section-header-row">
        <h2>คูปองสำหรับคุณ</h2>
        <a href="#" class="view-all-link">ดูทั้งหมด</a>
      </div>

      <!-- Grid คูปอง -->
      <div class="coupon-grid">
        <div class="coupon-card">
          <div class="coupon-top">
            <span class="c-icon">🚚</span>
            <span class="c-badge">หมดอายุวันนี้</span>
          </div>
          <h4>ส่งฟรี</h4>
          <p>สำหรับการสั่งซื้อทั้งหมดที่เกิน B300 ขึ้นไป ใช้ได้กับการจัดส่งฟาร์มในท้องถิ่น</p>
          <div class="coupon-code-box">
            <code>FREESHIP300</code>
            <span class="copy-icon">📋</span>
          </div>
          <button class="coupon-btn active">ใช้คูปอง</button>
        </div>

        <div class="coupon-card">
          <div class="coupon-top">
            <span class="c-icon">🥗</span>
            <span class="c-badge time-left">เหลือเวลา 3 วัน</span>
          </div>
          <h4>ลด 20% สำหรับสลัด</h4>
          <p>เพลิดเพลินกับผักออร์แกนิกสดใหม่พร้อมส่วนลด</p>
          <div class="coupon-code-box">
            <code>GREEN20</code>
            <span class="copy-icon">📋</span>
          </div>
          <button class="coupon-btn active">ใช้คูปอง</button>
        </div>

        <div class="coupon-card">
          <div class="coupon-top">
            <span class="c-icon">🎉</span>
            <span class="c-badge used">ผู้ใช้ใหม่</span>
          </div>
          <h4>ลด B100 การสั่งซื้อครั้งแรก</h4>
          <p>ยินดีต้อนรับสู่ Terra! ใช้ได้เมื่อซื้อขั้นต่ำ B400</p>
          <div class="coupon-code-box">
            <code>WELCOME100</code>
            <span class="copy-icon">📋</span>
          </div>
          <button class="coupon-btn used-btn">ใช้แล้ว</button>
        </div>

        <div class="coupon-card disabled">
          <div class="coupon-top">
            <span class="c-icon">☕</span>
            <span class="c-badge expired">หมดอายุแล้ว</span>
          </div>
          <h4>ฟรีกาแฟอาร์ติชาาน</h4>
          <p>เมื่อซื้ออาหารเข้าแบบชาเมนูใดก็ได้</p>
          <div class="coupon-code-box">
            <code>WAKEUPFREE</code>
            <span class="copy-icon">📋</span>
          </div>
          <button class="coupon-btn disabled-btn">ไม่สามารถใช้ได้</button>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-brand">คำตากซิ่ง</div>
      <div class="footer-links">
        <a href="#">แหล่งที่มาของเรา</a>
        <a href="#">การจัดส่งที่เป็นกลางทางคาร์บอน</a>
        <a href="#">นโยบายความเป็นส่วนตัว</a>
        <a href="#">ข้อกำหนดในการให้บริการ</a>
      </div>
      <div class="footer-copy">© 2024 Terra Eats. หนึ่งรากลึกในความยั่งยืน</div>
    </footer>
  </div>
</template>

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

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 30px 40px; display: flex; flex-direction: column; gap: 30px; flex-grow: 1; }

/* Banner */
.promo-banner { background: url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200') center/cover; border-radius: 24px; padding: 50px; color: white; position: relative; overflow: hidden; }
.promo-banner::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
.promo-banner-text { position: relative; z-index: 1; max-width: 500px; }
.badge-time { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; backdrop-filter: blur(5px); display: inline-block; margin-bottom: 15px; }
.promo-banner h1 { font-size: 36px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
.promo-banner p { font-size: 14px; opacity: 0.9; margin-bottom: 20px; }
.banner-btn { background: #557c61; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; }

/* Points Card */
.points-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.points-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.points-title-group { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #333; }
.view-all-link { color: #557c61; font-size: 13px; font-weight: 600; text-decoration: none; }
.points-subtitle { font-size: 13px; color: #777; }
.points-value { font-size: 32px; font-weight: 700; color: #333; }
.points-value .unit { font-size: 16px; font-weight: 500; color: #557c61; }
.points-progress-section { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.progress-labels { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
.progress-bar-bg { width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #557c61; border-radius: 4px; }

/* Section Header */
.section-header-row { display: flex; justify-content: space-between; align-items: center; }
.section-header-row h2 { font-size: 20px; font-weight: 600; color: #333; }

/* Coupon Grid */
.coupon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.coupon-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px; position: relative; }
.coupon-card.disabled { opacity: 0.7; }
.coupon-top { display: flex; justify-content: space-between; align-items: center; }
.c-icon { font-size: 20px; }
.c-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 8px; background: #eef2ed; color: #557c61; }
.c-badge.time-left { background: #fef3c7; color: #d97706; }
.c-badge.used { background: #e0f2fe; color: #0284c7; }
.c-badge.expired { background: #fee2e2; color: #dc2626; }
.coupon-card h4 { font-size: 15px; font-weight: 600; color: #333; }
.coupon-card p { font-size: 12px; color: #777; line-height: 1.4; flex-grow: 1; }
.coupon-code-box { background: #f7f6f0; border: 1px dashed #ccc; padding: 8px 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #444; }
.coupon-btn { width: 100%; padding: 10px; border-radius: 12px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; font-family: inherit; }
.coupon-btn.active { background: #557c61; color: white; }
.coupon-btn.used-btn { background: #e5e2d5; color: #555; }
.coupon-btn.disabled-btn { background: #f1ede1; color: #999; cursor: not-allowed; }

/* Footer */
.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; font-size: 12px; color: #666; margin-top: auto; }
.footer-brand { font-weight: 600; color: #557c61; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #557c61; }
.footer-copy { color: #888; }
</style>