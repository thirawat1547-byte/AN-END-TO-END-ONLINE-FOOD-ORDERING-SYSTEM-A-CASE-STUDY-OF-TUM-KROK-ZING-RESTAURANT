<template>
  <div class="tracking-container">
    <!-- Header -->
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

    <!-- 🟢 ส่วนที่ 1: จะแสดงผลเมื่อ "มี" ออเดอร์ (hasActiveOrder = true) -->
    <template v-if="hasActiveOrder">
      <div class="map-banner">
        <div class="map-overlay-simulation">
          <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            style="border:0;"
            :src="mapUrl" 
            allowfullscreen>
          </iframe>
        </div>
      </div>

      <div class="tracking-content">
        <div class="card status-card">
          <h3 class="card-title">สถานะการจัดส่ง</h3>
          <div class="timeline">
            <div class="timeline-item completed">
              <div class="dot"></div>
              <div class="content">
                <h4>ยืนยันคำสั่งซื้อแล้ว</h4>
                <p>ระบบได้รับออเดอร์ของคุณแล้ว</p>
              </div>
            </div>
            <div class="timeline-item completed">
              <div class="dot"></div>
              <div class="content">
                <h4>กำลังเตรียมอาหาร</h4>
                <p>ร้านกำลังปรุงอาหารสดใหม่</p>
              </div>
            </div>
            <div class="timeline-item active">
              <div class="dot"></div>
              <div class="content">
                <h4>กำลังจัดส่ง</h4>
                <p>กำลังมุ่งไปหาคุณที่: {{ userProfile.address }}</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="dot pending"></div>
              <div class="content text-muted">
                <h4>มาถึงแล้ว</h4>
              </div>
            </div>
          </div>
        </div>

        <div class="card rider-card">
          <h3 class="card-title">รายละเอียดผู้จัดส่ง</h3>
          <div class="rider-profile-box">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" alt="Rider" class="rider-img">
            <h4 class="rider-name">สิริโชค คำมา</h4>
            <p class="rider-vehicle">🛵 Honda Wave • 1กข 1234</p>
          </div>
          <div class="rider-actions">
            <button class="action-btn call-btn" @click="callRider">
              <span>📞</span> โทรหาคนขับ
            </button>
            <button class="action-btn chat-btn" @click="chatRider">
              <span>💬</span> ข้อความ
            </button>
          </div>
        </div>

        <div class="card order-summary-card">
          <div class="order-header-row">
            <h3 class="card-title" style="margin-bottom:0;">คำสั่งซื้อ #{{ currentOrder.orderNumber }}</h3>
            <span class="badge-status">กำลังดำเนินการ</span>
          </div>

          <div class="eta-box">
            <div class="eta-icon">⏰</div>
            <div class="eta-text-group">
              <span class="eta-label">เวลาที่คาดว่าจะมาถึง</span>
              <span class="eta-time">15 นาที</span>
            </div>
          </div>

          <div class="order-pricing">
            <div class="price-row">
              <span>จัดส่งถึง:</span>
              <span style="text-align:right; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ userProfile.name }}
              </span>
            </div>
            <div class="price-row">
              <span>เบอร์ติดต่อ:</span>
              <span>{{ userProfile.phone }}</span>
            </div>
          </div>

          <button class="view-receipt-btn" @click="showReceiptModal = true">
            ดูใบเสร็จแบบเต็ม
          </button>
        </div>
      </div>
    </template>

    <!-- 🟢 ส่วนที่ 2: จะแสดงผลเมื่อ "ไม่มี" ออเดอร์ (hasActiveOrder = false) -->
    <div class="empty-tracking-wrapper" v-else>
      <div class="empty-tracking-card">
        <div class="empty-icon">🛵💨</div>
        <h3>ยังไม่มีคำสั่งซื้อในขณะนี้</h3>
        <p>คุณยังไม่ได้ทำรายการสั่งซื้ออาหาร ไปเลือกเมนูอร่อยๆ กันเลย!</p>
        <button class="go-home-btn" @click="$router.push('/')">เลือกซื้ออาหาร ➔</button>
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

    <!-- POP-UP ใบเสร็จแบบเต็ม -->
    <div class="modal-overlay" v-if="showReceiptModal && currentOrder" @click.self="showReceiptModal = false">
      <div class="receipt-modal-content">
        <button class="close-modal-btn" @click="showReceiptModal = false">✕</button>
        <h2 class="receipt-title">ใบเสร็จรับเงิน</h2>
        <p class="receipt-order-num">ออเดอร์ #{{ currentOrder.orderNumber }}</p>
        <div class="receipt-divider"></div>

        <div class="receipt-items-list">
          <div class="r-item" v-for="(item, index) in currentOrder.items" :key="index">
            <div class="r-item-main">
              <div class="r-item-name"><span class="r-qty">{{ item.qty }}x</span> {{ item.name }}</div>
              <div class="r-item-price">B{{ item.price * item.qty }}</div>
            </div>
            <div class="r-item-sub">
              <span v-if="item.spiceLevel">🌶️ {{ item.spiceLevel }}</span>
              <span v-for="addon in item.addons" :key="addon.name"> +{{ addon.name }}</span>
            </div>
            <div class="r-item-note" v-if="item.note">*หมายเหตุ: {{ item.note }}</div>
          </div>
          
          <div v-if="!currentOrder.items || currentOrder.items.length === 0" style="text-align: center; color: #888; font-size: 13px; padding: 20px 0;">
            ไม่มีข้อมูลรายการอาหาร
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-summary">
          <div class="r-summary-row">
            <span>ยอดรวมอาหาร</span>
            <span>B{{ currentOrder.subtotal }}</span>
          </div>
          <div class="r-summary-row">
            <span>ค่าจัดส่ง</span>
            <span v-if="currentOrder.shippingFee === 0" style="color: #557c61; font-weight: 600;">ฟรี</span>
            <span v-else>B{{ currentOrder.shippingFee }}</span>
          </div>
          <div class="r-summary-row r-total-row">
            <span>ยอดชำระสุทธิ</span>
            <span>B{{ currentOrder.total }}</span>
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
      hasActiveOrder: false, 
      userProfile: {
        name: '',
        phone: '',
        address: ''
      },
      currentOrder: null, 
      showReceiptModal: false 
    }
  },
  computed: {
    mapUrl() {
      if (!this.hasActiveOrder) return '';
      const address = this.userProfile.address || 'ตลาดปากเกร็ด นนทบุรี'; 
      const encodedAddress = encodeURIComponent(address);
      return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
  },
  mounted() {
    // 🟢 สั่งเคลียร์ออเดอร์เก่าที่ค้างอยู่ในบั๊กของเบราว์เซอร์ทิ้ง
    localStorage.removeItem('currentOrder');

    // 1. โหลดข้อมูลโปรไฟล์
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      this.userProfile = {
        name: parsed.name || 'คมชาญ หล่อวัน',
        phone: parsed.phone || '091-020-7256',
        address: parsed.address || '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000'
      };
    } else {
      this.userProfile = {
        name: 'คมชาญ หล่อวัน',
        phone: '091-020-7256',
        address: '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000'
      };
    }

    // 2. เช็คออเดอร์โดยใช้ sessionStorage แทน (ปิดแท็บ = ออเดอร์หาย รีเซ็ตใหม่)
    const savedOrder = sessionStorage.getItem('currentOrder');
    if (savedOrder) {
      this.currentOrder = JSON.parse(savedOrder);
      this.hasActiveOrder = true; // มีออเดอร์ โชว์แผนที่
    } else {
      this.currentOrder = null;
      this.hasActiveOrder = false; // ไม่มีออเดอร์ โชว์หน้าว่างๆ
    }
  },
  methods: {
    logout() {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('cartData');
      sessionStorage.removeItem('currentOrder'); // เคลียร์ออเดอร์ตอนออกจากระบบด้วย
      this.$router.push('/');
    },
    callRider() {
      alert('กำลังโทรหาคนขับ...');
    },
    chatRider() {
      alert('กำลังเปิดหน้าต่างแชท...');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.tracking-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

/* Navbar */
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.nav-left-group { display: flex; align-items: center; gap: 30px; }
.logo-img { height: 40px; cursor: pointer; display: block; }
.nav-menu { display: flex; align-items: center; gap: 20px; white-space: nowrap; margin-top: 5px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { color: #557c61; }
.nav-item.router-link-exact-active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.header-spacer { flex-grow: 1; }

.header-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: inherit; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 1px solid transparent; }
.profile-avatar:hover { border-color: #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Map Banner */
.map-banner { width: 100%; height: 260px; position: relative; overflow: hidden; background: #e0dfd5; }
.map-overlay-simulation { width: 100%; height: 100%; }

/* Tracking Content Layout */
.tracking-content { display: flex; justify-content: center; gap: 20px; padding: 30px 40px; max-width: 1300px; margin: 0 auto; width: 100%; flex-grow: 1;}
.card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); flex: 1; display: flex; flex-direction: column; }
.card-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }

/* 1. สถานะการจัดส่ง (Timeline) */
.timeline { display: flex; flex-direction: column; gap: 20px; position: relative; padding-left: 10px; }
.timeline::before { content: ''; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 2px; background: #e5e2d5; }
.timeline-item { display: flex; gap: 15px; position: relative; align-items: flex-start; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: #ccc; border: 2px solid white; position: relative; z-index: 1; margin-top: 4px; }
.timeline-item.completed .dot { background: #557c61; }
.timeline-item.active .dot { background: #557c61; box-shadow: 0 0 0 4px rgba(85, 124, 97, 0.2); }
.dot.pending { background: #e0dfd5; }

.timeline-item h4 { font-size: 14px; font-weight: 600; color: #333; }
.timeline-item p { font-size: 12px; color: #777; margin-top: 2px; line-height: 1.4;}
.text-muted h4 { color: #aaa; }

/* 2. รายละเอียดผู้จัดส่ง */
.rider-profile-box { text-align: center; display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.rider-img { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 2px solid #557c61; }
.rider-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }
.rider-vehicle { font-size: 13px; color: #666; background: #f7f6f0; padding: 4px 12px; border-radius: 12px; }

.rider-actions { display: flex; gap: 10px; margin-top: auto; }
.action-btn { flex: 1; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; border: none; transition: 0.2s; }
.call-btn { background: #f1ede1; color: #333; }
.call-btn:hover { background: #e5e2d5; }
.chat-btn { background: #f1ede1; color: #333; }
.chat-btn:hover { background: #e5e2d5; }

/* 3. สรุปคำสั่งซื้อ */
.order-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.badge-status { background: #fef3c7; color: #d97706; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 10px; }

.eta-box { background: #fcfbf8; border: 1px solid #e5e2d5; border-radius: 14px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.eta-icon { font-size: 24px; }
.eta-text-group { display: flex; flex-direction: column; }
.eta-label { font-size: 11px; color: #777; }
.eta-time { font-size: 20px; font-weight: 700; color: #333; line-height: 1.2; }

.order-pricing { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.price-row { display: flex; justify-content: space-between; font-size: 13px; color: #666; }

.view-receipt-btn { background: #557c61; color: white; border: none; width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: 0.2s; margin-top: auto; font-family: inherit; }
.view-receipt-btn:hover { background: #405e49; }

/* 🔴 สไตล์สำหรับส่วนที่ยังไม่มีออเดอร์ (Empty State) 🔴 */
.empty-tracking-wrapper { display: flex; justify-content: center; align-items: center; flex-grow: 1; padding: 40px 20px; }
.empty-tracking-card { background: white; border-radius: 20px; padding: 60px 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid #e5e2d5; max-width: 600px; width: 100%; }
.empty-icon { font-size: 60px; margin-bottom: 5px; }
.empty-tracking-card h3 { font-size: 22px; font-weight: 600; color: #333; }
.empty-tracking-card p { font-size: 15px; color: #777; margin-bottom: 20px; }
.go-home-btn { background: #557c61; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; }
.go-home-btn:hover { background: #405e49; }

/* Footer */
.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; margin-top: auto; font-size: 12px; color: #666; }
.footer-brand { font-weight: 600; color: #557c61; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #557c61; }
.footer-copy { color: #888; }

/* Modal General Overlay */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }

/* Receipt Modal Styles */
.receipt-modal-content { background: white; padding: 35px 35px; border-radius: 20px; width: 420px; max-width: 90vw; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-height: 85vh; display: flex; flex-direction: column; }
.close-modal-btn { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 20px; color: #888; cursor: pointer; }
.close-modal-btn:hover { color: #333; }

.receipt-title { font-size: 20px; font-weight: 700; color: #333; text-align: center; margin-bottom: 5px; }
.receipt-order-num { font-size: 13px; color: #777; text-align: center; margin-bottom: 20px; }

.receipt-divider { border-top: 2px dashed #ddd; margin: 15px 0; }

.receipt-items-list { overflow-y: auto; flex-grow: 1; padding-right: 5px; }
.r-item { margin-bottom: 15px; }
.r-item-main { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 3px; }
.r-qty { font-weight: 600; color: #557c61; margin-right: 8px; }
.r-item-sub { font-size: 12px; color: #777; padding-left: 25px; display: flex; flex-wrap: wrap; gap: 5px; }
.r-item-note { font-size: 11px; color: #999; padding-left: 25px; margin-top: 3px; font-style: italic; }

.receipt-summary { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
.r-summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.r-total-row { font-size: 18px; font-weight: 700; color: #557c61; margin-top: 5px; }
</style>