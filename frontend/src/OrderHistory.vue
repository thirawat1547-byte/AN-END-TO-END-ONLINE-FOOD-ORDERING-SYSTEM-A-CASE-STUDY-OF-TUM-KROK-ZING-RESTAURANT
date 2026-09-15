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
          <span class="tab" :class="{ active: currentTab === 'all' }" @click="currentTab = 'all'">รายการทั้งหมด</span>
          <span class="tab" :class="{ active: currentTab === 'cancelled' }" @click="currentTab = 'cancelled'">เฉพาะรายการที่ถูกยกเลิก</span>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>กำลังโหลดประวัติคำสั่งซื้อจากเซิร์ฟเวอร์...</p>
        </div>

        <table class="history-table" v-else-if="filteredOrders.length > 0">
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
            <tr v-for="(order, index) in filteredOrders" :key="index">
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
                <span 
                  class="status-badge" 
                  :class="{
                    'success': order.status === 'ชำระเงินสำเร็จ' || order.status === 'สำเร็จ', 
                    'pending': order.status === 'กำลังดำเนินการ' || order.status === 'กำลังปรุงอาหาร',
                    'cancelled': order.status === 'ยกเลิกแล้ว'
                  }"
                >
                  {{ order.status }}
                </span>
              </td>
              <td>
                <button class="search-icon-btn" @click="viewOrderDetails(order)" title="ดูรายละเอียด">🔍</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else style="text-align: center; padding: 60px; color: #888;">
          <div style="font-size: 40px; margin-bottom: 10px;">🍽️</div>
          คุณยังไม่มีประวัติการสั่งซื้อ ไปสั่งของอร่อยกันเถอะ!
        </div>

        <div class="pagination-row" v-if="!isLoading && filteredOrders.length > 0">
          <span>แสดง 1 ถึง {{ filteredOrders.length }} จาก {{ filteredOrders.length }} รายการ</span>
          <div class="pagination-btns">
            <button class="page-btn disabled">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn disabled">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- POP-UP ใบเสร็จแบบเต็ม -->
    <div class="modal-overlay" v-if="showReceiptModal && selectedOrder" @click.self="showReceiptModal = false">
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
            <div class="r-item-sub" v-if="item.options">
              <span>{{ item.options }}</span>
            </div>
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
import axios from 'axios';

export default {
  data() {
    return {
      isLoggedIn: false,
      userProfile: { address: '', avatar: '' },
      showReceiptModal: false,
      selectedOrder: null,
      orderHistory: [],
      currentTab: 'all',
      isLoading: false
    }
  },
  computed: {
    filteredOrders() {
      if (this.currentTab === 'cancelled') {
        return this.orderHistory.filter(o => o.status === 'ยกเลิกแล้ว' || o.rawStatus === 'CANCELLED');
      }
      return this.orderHistory;
    }
  },
  mounted() {
    this.isLoggedIn = !!localStorage.getItem('access_token') || localStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(profileData) };
    }

    this.fetchOrderHistory();
  },
  methods: {
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      this.isLoggedIn = false;
      this.$router.push('/');
    },
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.showReceiptModal = true;
    },
    async fetchOrderHistory() {
      const token = localStorage.getItem('access_token');
      
      // ถ้าไม่ได้เข้าสู่ระบบ ให้ดึงจาก LocalStorage ชั่วคราว
      if (!token) {
        const savedHistory = localStorage.getItem('orderHistoryList');
        if (savedHistory) {
          this.orderHistory = JSON.parse(savedHistory);
        }
        return;
      }

      this.isLoading = true;
      try {
        const res = await axios.get('http://localhost:5000/api/v1/orders/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const statusMap = {
          PENDING: 'กำลังดำเนินการ',
          COOKING: 'กำลังปรุงอาหาร',
          READY: 'พร้อมจัดส่ง',
          COMPLETED: 'สำเร็จ',
          PAID: 'ชำระเงินสำเร็จ',
          CANCELLED: 'ยกเลิกแล้ว'
        };

        // แปลงข้อมูลจาก Database ให้ตรงกับที่ Template ใช้งาน
        this.orderHistory = (res.data || []).map(order => {
          const dateObj = new Date(order.created_at);
          const formattedDate = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
            : '-';

          const items = (order.order_items || []).map(oi => ({
            name: oi.menu?.name || `เมนู #${oi.menu_id}`,
            qty: Number(oi.quantity),
            price: Number(oi.unit_price || oi.menu?.price || 0),
            options: oi.customization || ''
          }));

          const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

          return {
            orderNumber: String(order.order_id),
            date: formattedDate,
            total: Number(order.total_price),
            subtotal: subtotal || Number(order.total_price),
            shippingFee: Math.max(0, Number(order.total_price) - subtotal),
            paymentMethod: order.payment_method || 'พร้อมเพย์',
            status: statusMap[order.status] || order.status,
            rawStatus: order.status,
            items: items
          };
        });
      } catch (err) {
        console.error('โหลดประวัติคำสั่งซื้อไม่สำเร็จ:', err);
        // หากเชื่อมต่อ Backend ไม่ได้ ให้ดึงประวัติเก่าจาก LocalStorage แทน
        const savedHistory = localStorage.getItem('orderHistoryList');
        if (savedHistory) {
          this.orderHistory = JSON.parse(savedHistory);
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; gap: 15px; }
.nav-left-group { display: flex; align-items: center; gap: 30px; }
.logo-img { height: 40px; cursor: pointer; display: block; }
.nav-menu { display: flex; align-items: center; gap: 20px; white-space: nowrap; margin-top: 5px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-item.router-link-exact-active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.header-spacer { flex-grow: 1; }

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
.tab { cursor: pointer; }
.tab.active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 4px; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px; gap: 15px; color: #666; font-size: 14px; }
.spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #557c61; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.history-table th { padding: 16px 30px; color: #666; font-weight: 600; background: #faf9f5; border-bottom: 1px solid #eee; }
.history-table td { padding: 18px 30px; color: #333; border-bottom: 1px solid #f2f0ea; vertical-align: middle; }
.pay-method { display: flex; align-items: center; gap: 5px; }
.status-badge { padding: 5px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-badge.success { background: #eef2ed; color: #557c61; }
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.cancelled { background: #fee2e2; color: #dc2626; }
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
.receipt-summary { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
.r-summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.r-total-row { font-size: 18px; font-weight: 700; color: #557c61; margin-top: 5px; }
.payment-info-box { background: #faf9f5; border: 1px solid #e0dfd5; padding: 12px; border-radius: 12px; margin-top: 20px; font-size: 13px; color: #555; display: flex; justify-content: space-between; }
</style>