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
          <router-link to="/promotions" class="nav-item">โปรโมชั่น</router-link>
          <router-link to="/help" class="nav-item">ช่วยเหลือ</router-link>
        </nav>
      </div>
      
      <!-- ดันขวา -->
      <div class="header-spacer"></div>

      <!-- กลุ่มขวา: แจ้งเตือน + ตะกร้า + โปรไฟล์ -->
      <div class="header-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn" @click="$router.push('/')" v-if="$route.path !== '/'">🛒</button>
        <div class="auth-links" v-if="!isLoggedIn">
          <router-link to="/login" class="login-text">เข้าสู่ระบบ</router-link>
          <router-link to="/register" class="reg-text">สมัครสมาชิก</router-link>
        </div>
        <div class="auth-links" v-else>
          <button class="logout-btn" @click="logout">ออกจากระบบ</button>
          <div class="profile-avatar" @click="$router.push('/profile')">
            <img :src="userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'" alt="Profile">
          </div>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <h1 class="page-main-title">ประวัติคำสั่งซื้อ</h1>

      <div class="history-card-box">
        <div class="table-tabs">
          <span class="tab active">รายการทั้งหมด</span>
          <span class="tab">เฉพาะรายการที่ถูกยกเลิก</span>
        </div>

        <table class="history-table">
          <thead>
            <tr>
              <th>วันเวลา</th>
              <th>เลขที่ใบเสร็จ</th>
              <th>จำนวนเงินรวม</th>
              <th>วิธีการชำระเงิน</th>
              <th>สถานะการทำรายการ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in orderHistory" :key="index">
              <td>{{ order.date }}</td>
              <td style="font-weight: 500;">#{{ order.orderNumber }}</td>
              <td>B{{ order.total }}</td>
              <td>
                <span class="pay-method">
                  <span v-if="order.paymentMethod === 'เงินสด'">💵</span>
                  <span v-else>📱</span> 
                  {{ order.paymentMethod }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="{'success': order.status === 'ชำระเงินสำเร็จ', 'pending': order.status === 'กำลังดำเนินการ'}">
                  {{ order.status }}
                </span>
              </td>
              <td>
                <button class="search-icon-btn" @click="viewOrderDetails(order)" title="ดูรายละเอียด">🔍</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="orderHistory.length === 0" style="text-align: center; padding: 60px; color: #888;">
          <div style="font-size: 40px; margin-bottom: 10px;">🍽️</div>
          คุณยังไม่มีประวัติการสั่งซื้อ ไปสั่งของอร่อยกันเถอะ!
        </div>

        <div class="pagination-row" v-if="orderHistory.length > 0">
          <span>แสดง 1 ถึง {{ orderHistory.length }} จาก {{ orderHistory.length }} รายการ</span>
          <div class="pagination-btns">
            <button class="page-btn disabled">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn disabled">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- POP-UP ใบเสร็จแบบเต็ม -->
    <div class="modal-overlay" v-if="showReceiptModal" @click.self="showReceiptModal = false">
      <div class="receipt-modal-content">
        <button class="close-modal-btn" @click="showReceiptModal = false">✕</button>
        <h2 class="receipt-title">รายละเอียดคำสั่งซื้อ</h2>
        <p class="receipt-order-num">ออเดอร์ #{{ selectedOrder.orderNumber }}</p>
        <div class="receipt-divider"></div>

        <div class="receipt-items-list">
          <div class="r-item" v-for="(item, index) in selectedOrder.items" :key="index">
            <div class="r-item-main">
              <div class="r-item-name"><span class="r-qty">{{ item.qty }}x</span> {{ item.name }}</div>
              <div class="r-item-price">B{{ item.price * item.qty }}</div>
            </div>
            <div class="r-item-sub">
              <span v-if="item.seafoodChoice">✔️ {{ item.seafoodChoice }}</span>
              <span v-if="item.spiceLevel">🌶️ {{ item.spiceLevel }}</span>
              <span v-for="addon in item.addons" :key="addon.name"> +{{ addon.name }}</span>
            </div>
            <div class="r-item-note" v-if="item.note">*หมายเหตุ: {{ item.note }}</div>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-summary">
          <div class="r-summary-row">
            <span>ยอดรวมอาหาร</span>
            <span>B{{ selectedOrder.subtotal }}</span>
          </div>
          <div class="r-summary-row">
            <span>ค่าจัดส่ง</span>
            <span v-if="selectedOrder.shippingFee === 0" style="color: #557c61; font-weight: 600;">ฟรี</span>
            <span v-else>B{{ selectedOrder.shippingFee }}</span>
          </div>
          <div class="r-summary-row r-total-row">
            <span>ยอดสุทธิ</span>
            <span>B{{ selectedOrder.total }}</span>
          </div>
        </div>
        
        <div class="payment-info-box">
          <div>สถานะ: <span style="font-weight: 600; color: #557c61;">{{ selectedOrder.status }}</span></div>
          <div>วิธีชำระ: {{ selectedOrder.paymentMethod }}</div>
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
      showAddressDropdown: false,
      userProfile: { address: '', avatar: '' },
      showReceiptModal: false,
      selectedOrder: null,
      orderHistory: []
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
  mounted() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(profileData) };
    } else if (this.isLoggedIn) {
      this.userProfile.address = '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000';
    }

    const savedHistory = localStorage.getItem('orderHistoryList');
    if (savedHistory) {
      this.orderHistory = JSON.parse(savedHistory);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('isLoggedIn');
      this.isLoggedIn = false;
      this.$router.push('/');
    },
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.showReceiptModal = true;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; gap: 15px; }
.logo-img { height: 40px; }
.nav-menu { display: flex; gap: 20px; white-space: nowrap; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-item.router-link-exact-active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.header-spacer { flex-grow: 1; }

.location-wrapper { position: relative; display: inline-block; z-index: 20; }
.location-box { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #444; background: #f1ede1; padding: 6px 12px; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.2s; border: 1px solid transparent; }
.location-box:hover { background: #e8e4d5; border-color: #d6d2c4; }
.loc-icon { color: #557c61; }
.dropdown-arrow { font-size: 10px; color: #777; margin-left: 3px; transition: transform 0.3s ease; }
.dropdown-arrow.arrow-up { transform: rotate(180deg); color: #557c61; }

.address-dropdown-menu { position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: white; border: 1px solid #e5e2d5; border-radius: 16px; padding: 15px 20px; width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; cursor: default; }
.address-dropdown-menu::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: white; border-left: 1px solid #e5e2d5; border-top: 1px solid #e5e2d5; }
.addr-title { font-size: 13px; font-weight: 600; color: #557c61; margin-bottom: 6px; }
.addr-full-text { font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 12px; word-wrap: break-word; background: #faf9f5; padding: 10px; border-radius: 8px; }
.addr-edit-btn { width: 100%; background: white; border: 1px solid #557c61; color: #557c61; padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; font-family: inherit; }
.addr-edit-btn:hover { background: #f4faeb; }

.header-actions { display: flex; align-items: center; gap: 15px; white-space: nowrap; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.auth-links { display: flex; gap: 12px; font-size: 13px; font-weight: 600; align-items: center; }
.login-text { color: #557c61; text-decoration: none; }
.reg-text { color: #333; text-decoration: none; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: inherit; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 1px solid transparent; margin-left: 10px; }
.profile-avatar:hover { border-color: #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 40px; display: flex; flex-direction: column; gap: 25px; flex-grow: 1; }
.page-main-title { font-size: 26px; font-weight: 700; color: #333; text-align: center; margin-bottom: 10px; }

.history-card-box { background: white; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; }
.table-tabs { display: flex; gap: 25px; padding: 20px 30px; border-bottom: 1px solid #eee; font-size: 14px; color: #777; font-weight: 500; }
.tab.active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 4px; }

.history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.history-table th { padding: 16px 30px; color: #666; font-weight: 600; background: #faf9f5; border-bottom: 1px solid #eee; }
.history-table td { padding: 18px 30px; color: #333; border-bottom: 1px solid #f2f0ea; vertical-align: middle; }
.pay-method { display: flex; align-items: center; gap: 5px; }
.status-badge { padding: 5px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-badge.success { background: #eef2ed; color: #557c61; }
.status-badge.pending { background: #fef3c7; color: #d97706; }
.search-icon-btn { background: #fdfbf7; border: 1px solid #e0dfd5; border-radius: 8px; width: 32px; height: 32px; font-size: 14px; cursor: pointer; color: #555; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
.search-icon-btn:hover { background: #eef2ed; border-color: #557c61; }

.pagination-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; font-size: 13px; color: #666; background: #faf9f5; }
.pagination-btns { display: flex; gap: 6px; align-items: center; }
.page-btn { background: white; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.page-btn.active { background: #557c61; color: white; border-color: #557c61; }
.page-btn.disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.receipt-modal-content { background: white; padding: 35px 35px; border-radius: 20px; width: 420px; max-width: 90vw; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-height: 85vh; display: flex; flex-direction: column; }
.close-modal-btn { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 20px; color: #888; cursor: pointer; }
.close-modal-btn:hover { color: #333; }
.receipt-title { font-size: 20px; font-weight: 700; color: #333; text-align: center; margin-bottom: 5px; }
.receipt-order-num { font-size: 13px; color: #777; text-align: center; margin-bottom: 20px; }
.receipt-divider { border-top: 2px dashed #ddd; margin: 15px 0; }
.receipt-items-list { overflow-y: auto; flex-grow: 1; padding-right: 5px; max-height: 300px;}
.r-item { margin-bottom: 15px; }
.r-item-main { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 3px; }
.r-qty { font-weight: 600; color: #557c61; margin-right: 8px; }
.r-item-sub { font-size: 12px; color: #777; padding-left: 25px; display: flex; flex-wrap: wrap; gap: 5px; }
.r-item-note { font-size: 11px; color: #999; padding-left: 25px; margin-top: 3px; font-style: italic; }
.receipt-summary { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
.r-summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.r-total-row { font-size: 18px; font-weight: 700; color: #557c61; margin-top: 5px; }
.payment-info-box { background: #faf9f5; border: 1px solid #e0dfd5; padding: 12px; border-radius: 12px; margin-top: 20px; font-size: 13px; color: #555; display: flex; justify-content: space-between; }

.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.nav-left-group { display: flex; align-items: center; gap: 30px; } /* โค้ดสำคัญ: บังคับให้อยู่แถวเดียวกัน */
.logo-img { height: 40px; cursor: pointer; display: block; }
.nav-menu { display: flex; align-items: center; gap: 20px; white-space: nowrap; margin-top: 5px; }
</style>