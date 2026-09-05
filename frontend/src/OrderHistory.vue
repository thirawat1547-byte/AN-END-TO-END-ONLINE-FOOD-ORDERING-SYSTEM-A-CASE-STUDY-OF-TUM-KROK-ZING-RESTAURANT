<template>
  <div class="page-container">
    <header class="navbar">
      <div class="logo-section">
        <img src="./assets/logo.png" alt="Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item">ข้อเสนอ</router-link>
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
      <h1 class="page-main-title">ประวัติคำสั่งซื้อ</h1>

      <!-- ตารางประวัติคำสั่งซื้อ -->
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
            <!-- วนลูปแสดงข้อมูลประวัติการสั่งซื้อ -->
            <tr v-for="(order, index) in orderHistory" :key="index">
              <td>{{ order.date }}</td>
              <td style="font-weight: 500;">{{ order.orderNumber }}</td>
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

        <!-- ถ้ารายการว่างเปล่า -->
        <div v-if="orderHistory.length === 0" style="text-align: center; padding: 40px; color: #888;">
          ยังไม่มีประวัติการสั่งซื้อ
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

    <!-- POP-UP ใบเสร็จแบบเต็ม (เปิดเมื่อกดปุ่มแว่นขยาย) -->
    <div class="modal-overlay" v-if="showReceiptModal" @click.self="showReceiptModal = false">
      <div class="receipt-modal-content">
        <button class="close-modal-btn" @click="showReceiptModal = false">✕</button>
        <h2 class="receipt-title">รายละเอียดคำสั่งซื้อ</h2>
        <p class="receipt-order-num">ออเดอร์ {{ selectedOrder.orderNumber }}</p>
        <div class="receipt-divider"></div>

        <!-- รายการอาหารในบิลนั้นๆ -->
        <div class="receipt-items-list">
          <div class="r-item" v-for="(item, index) in selectedOrder.items" :key="index">
            <div class="r-item-main">
              <div class="r-item-name"><span class="r-qty">{{ item.qty }}x</span> {{ item.name }}</div>
              <div class="r-item-price">B{{ item.price * item.qty }}</div>
            </div>
            <!-- ส่วนเสริม/ความเผ็ด -->
            <div class="r-item-sub">
              <span v-if="item.spiceLevel">🌶️ {{ item.spiceLevel }}</span>
              <span v-for="addon in item.addons" :key="addon.name"> +{{ addon.name }}</span>
            </div>
            <div class="r-item-note" v-if="item.note">*หมายเหตุ: {{ item.note }}</div>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <!-- สรุปราคาในใบเสร็จ -->
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
        
        <!-- ข้อมูลการชำระเงิน -->
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
      showReceiptModal: false,
      selectedOrder: null,
      
      // ข้อมูลประวัติการสั่งซื้อ (Mock Data พื้นฐาน)
      orderHistory: [
        {
          date: 'เมื่อวาน, 14:32',
          orderNumber: '#TRX-9945',
          paymentMethod: 'เงินสด',
          status: 'ชำระเงินสำเร็จ',
          subtotal: 1230,
          shippingFee: 20,
          total: 1250,
          items: [
            { name: 'ส้มตำปูปลาร้า', qty: 2, price: 40, spiceLevel: 'เผ็ดมาก', addons: [{name: 'เพิ่มขนมจีน', price: 20}] },
            { name: 'ไก่ทอด (สะโพก)', qty: 5, price: 50, spiceLevel: null, addons: [] },
            { name: 'ข้าวผัดทะเล/หมึก/กุ้ง', qty: 3, price: 60, spiceLevel: null, addons: [{name: 'ไข่ดาว', price: 10}] },
            { name: 'น้ำเก๊กฮวย', qty: 4, price: 20, spiceLevel: null, addons: [] }
          ]
        },
        {
          date: '3 วันที่แล้ว, 12:45',
          orderNumber: '#TRX-9940',
          paymentMethod: 'พร้อมเพย์',
          status: 'ชำระเงินสำเร็จ',
          subtotal: 450,
          shippingFee: 0,
          total: 450,
          items: [
            { name: 'ยำวุ้นเส้นทะเล', qty: 2, price: 70, spiceLevel: 'เผ็ดกลาง', addons: [] },
            { name: 'กระเพราหมู', qty: 3, price: 40, spiceLevel: 'เผ็ดน้อย', addons: [{name: 'ไข่ดาว', price: 10}] },
            { name: 'โค้ก (Coke)', qty: 2, price: 20, spiceLevel: null, addons: [] }
          ]
        }
      ]
    }
  },
  mounted() {
    // ดึงออเดอร์ล่าสุดที่คุณเพิ่งสั่งไป (จาก localStorage) มาแทรกไว้บนสุดของตาราง
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      this.orderHistory.unshift({
        date: 'เพิ่งสั่งซื้อ',
        orderNumber: parsedOrder.orderNumber,
        paymentMethod: 'พร้อมเพย์', // สมมติค่าเริ่มต้น
        status: 'กำลังดำเนินการ',
        subtotal: parsedOrder.subtotal,
        shippingFee: parsedOrder.shippingFee,
        total: parsedOrder.total,
        items: parsedOrder.items
      });
    }
  },
  methods: {
    // เปิด Pop-up และตั้งค่าข้อมูลออเดอร์ที่จะแสดง
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
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.logo-img { height: 35px; }
.nav-menu { display: flex; gap: 30px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.profile-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 2px solid #557c61; cursor: pointer; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 40px; display: flex; flex-direction: column; gap: 25px; flex-grow: 1; }
.page-main-title { font-size: 26px; font-weight: 700; color: #333; text-align: center; margin-bottom: 10px; }

/* History Card & Table */
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

/* Modal General Overlay */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }

/* Receipt Modal Styles */
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
</style>