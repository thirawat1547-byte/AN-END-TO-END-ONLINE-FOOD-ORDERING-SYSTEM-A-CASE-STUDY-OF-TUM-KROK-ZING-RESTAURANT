<template>
  <div class="page-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

    <!-- ส่วนที่ 1: เมื่อยังไม่ได้เข้าสู่ระบบ (ซ่อนประวัติคำสั่งซื้อ) -->
    <div class="empty-history-wrapper" v-if="!authStore.isLoggedIn">
      <div class="empty-history-card">
        <div class="empty-icon">🔒</div>
        <h3>กรุณาเข้าสู่ระบบ</h3>
        <p>คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อของคุณ</p>
        <button class="go-home-btn" @click="$router.push('/login?redirect=/history')">เข้าสู่ระบบ ➔</button>
      </div>
    </div>

    <!-- ส่วนที่ 2: เมื่อเข้าสู่ระบบแล้ว -->
    <div class="content-wrapper" v-else>
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
              <th style="text-align: right;">จัดการ</th>
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
                <div class="action-cell">
                  <button class="search-icon-btn" @click="viewOrderDetails(order)" title="ดูรายละเอียด">🔍</button>
                  <button class="reorder-btn" @click="reorder(order)" title="สั่งรายการนี้อีกครั้ง">
                    <span>🔁</span> สั่งอีกครั้ง
                  </button>
                </div>
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

        <div class="modal-actions-box">
          <button class="modal-reorder-btn" @click="reorder(selectedOrder)">
            <span>🔁</span> สั่งรายการนี้อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE } from './config/api';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { authStore } from './store/authStore';

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      authStore,
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
  watch: {
    'authStore.isLoggedIn'(newVal) {
      if (newVal) {
        this.fetchOrderHistory();
      } else {
        this.orderHistory = [];
      }
    },
    'authStore.userProfile.user_id'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.orderHistory = [];
        if (newVal) {
          this.fetchOrderHistory();
        }
      }
    }
  },
  mounted() {
    authStore.syncAuth();
    if (this.authStore.isLoggedIn) {
      this.fetchOrderHistory();
    } else {
      this.orderHistory = [];
    }
  },
  methods: {
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.showReceiptModal = true;
    },
    reorder(order) {
      if (!order || !order.items || order.items.length === 0) {
        alert('ไม่พบรายการอาหารในคำสั่งซื้อนี้');
        return;
      }

      // แปลงรายการสินค้าให้อยู่ในรูปแบบของ Cart
      const cartItems = order.items.map(item => {
        let dishType = null;
        let spiceLevel = null;
        let seafoodChoice = null;
        const addons = [];

        if (item.options) {
          const parts = String(item.options).split(',').map(s => s.trim());
          for (const p of parts) {
            if (p === 'ราดข้าว' || p === 'กับข้าว') {
              dishType = p;
            } else if (p.startsWith('เผ็ด:')) {
              spiceLevel = p.replace('เผ็ด:', '').trim();
            } else if (p.includes('หมึก') || p.includes('กุ้ง') || p.includes('รวม')) {
              seafoodChoice = p;
            } else if (p.startsWith('+')) {
              addons.push({ name: p.replace('+', '').trim(), price: 10 });
            } else if (p.startsWith('เพิ่ม')) {
              addons.push({ name: p.trim(), price: 10 });
            }
          }
        }

        return {
          name: item.name,
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          dishType: dishType,
          spiceLevel: spiceLevel,
          seafoodChoice: seafoodChoice,
          addons: addons
        };
      });

      // บันทึกใส่ localStorage และ sessionStorage
      localStorage.setItem('cartData', JSON.stringify(cartItems));
      sessionStorage.setItem('cartData', JSON.stringify(cartItems));

      this.showReceiptModal = false;
      this.$router.push('/checkout');
    },
    async fetchOrderHistory() {
      if (!this.authStore.isLoggedIn) {
        this.orderHistory = [];
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        this.orderHistory = [];
        return;
      }

      this.isLoading = true;
      this.orderHistory = [];
      try {
        const res = await axios.get(`${API_BASE}/orders/my-orders`, {
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

          const items = (order.order_items || []).map(oi => {
            let noteStr = oi.notes || '';
            if (!noteStr && oi.customization) {
              if (typeof oi.customization === 'string') noteStr = oi.customization;
              else if (typeof oi.customization === 'object') {
                const p = [];
                if (oi.customization.spicy && oi.customization.spicy !== '-') p.push(`เผ็ด: ${oi.customization.spicy}`);
                if (oi.customization.no_msg) p.push('ไม่ใส่ชูรส');
                if (oi.customization.note) p.push(oi.customization.note);
                noteStr = p.join(', ');
              }
            }
            return {
              name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
              qty: Number(oi.quantity),
              price: Number(oi.unit_price || oi.menu?.price || 0),
              options: noteStr
            };
          });

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
        this.orderHistory = [];
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

.action-cell { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.reorder-btn {
  background: #557c61;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}
.reorder-btn:hover {
  background: #405e49;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(85, 124, 97, 0.3);
}
.modal-actions-box {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
.modal-reorder-btn {
  width: 100%;
  background: #557c61;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.modal-reorder-btn:hover {
  background: #405e49;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(85, 124, 97, 0.3);
}

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

.empty-history-wrapper { display: flex; justify-content: center; align-items: center; flex-grow: 1; padding: 40px 20px; }
.empty-history-card { background: white; border-radius: 20px; padding: 60px 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid #e5e2d5; max-width: 600px; width: 100%; }
.empty-icon { font-size: 60px; margin-bottom: 5px; }
.empty-history-card h3 { font-size: 22px; font-weight: 600; color: #333; }
.empty-history-card p { font-size: 15px; color: #777; margin-bottom: 20px; }
.go-home-btn { background: #557c61; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; }
.go-home-btn:hover { background: #405e49; }
</style>