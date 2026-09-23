<template>
  <div class="tracking-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

    <!-- ส่วนที่ 1: เมื่อยังไม่ได้เข้าสู่ระบบ (แจ้งเตือนให้เข้าสู่ระบบ) -->
    <div class="empty-tracking-wrapper" v-if="!authStore.isLoggedIn">
      <div class="empty-tracking-card">
        <div class="empty-icon">🔒</div>
        <h3>กรุณาเข้าสู่ระบบ</h3>
        <p>คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบเพื่อติดตามสถานะคำสั่งซื้อของคุณ</p>
        <button class="go-home-btn" @click="$router.push('/login?redirect=/tracking')">เข้าสู่ระบบ ➔</button>
      </div>
    </div>

    <!-- ส่วนที่ 2: แสดงผลเมื่อเข้าสู่ระบบแล้ว และมีคำสั่งซื้อที่กำลังจัดส่ง (Active Order) -->
    <template v-else-if="hasActiveOrder && currentOrder">
      <!-- แถบแจ้งเตือนสถานะเรียลไทม์ด้านบนแผนที่ -->
      <div class="live-status-bar">
        <div class="live-indicator">
          <span class="live-dot-pulse"></span>
          <span class="live-text">กำลังติดตามสถานะแบบเรียลไทม์ (อัปเดตอัตโนมัติ)</span>
        </div>
        <div class="live-actions">
          <button class="manual-sync-btn" @click="fetchLatestOrder(false)" title="กดเพื่อซิงค์ข้อมูลล่าสุดทันที">
            🔄 ซิงค์สถานะ
          </button>
        </div>
      </div>

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
        <!-- 1. ไทม์ไลน์สถานะ 4 ขั้นตอน -->
        <div class="card status-card">
          <h3 class="card-title">สถานะการจัดส่ง</h3>
          <div class="timeline">
            <!-- ขั้นที่ 1: ยืนยันคำสั่งซื้อ -->
            <div class="timeline-item" :class="getStepClass(1)">
              <div class="dot"></div>
              <div class="content">
                <h4>ยืนยันคำสั่งซื้อแล้ว</h4>
                <p>ระบบได้รับออเดอร์ของคุณเรียบร้อยแล้ว</p>
              </div>
            </div>

            <!-- ขั้นที่ 2: กำลังเตรียมอาหาร -->
            <div class="timeline-item" :class="getStepClass(2)">
              <div class="dot"></div>
              <div class="content" :class="{ 'text-muted': currentStep < 2 }">
                <h4>กำลังเตรียมอาหาร</h4>
                <p v-if="currentStep >= 2">ร้านกำลังปรุงอาหารสดใหม่ให้คุณ</p>
              </div>
            </div>

            <!-- ขั้นที่ 3: กำลังจัดส่ง -->
            <div class="timeline-item" :class="getStepClass(3)">
              <div class="dot"></div>
              <div class="content" :class="{ 'text-muted': currentStep < 3 }">
                <h4>กำลังจัดส่ง</h4>
                <p v-if="currentStep >= 3">กำลังมุ่งหน้าไปส่งที่: {{ userProfile.address }}</p>
              </div>
            </div>

            <!-- ขั้นที่ 4: จัดส่งสำเร็จ -->
            <div class="timeline-item" :class="getStepClass(4)">
              <div class="dot"></div>
              <div class="content" :class="{ 'text-muted': currentStep < 4 }">
                <h4>จัดส่งสำเร็จแล้ว</h4>
                <p v-if="currentStep >= 4">ขอให้อร่อยกับมื้ออาหารของคุณครับ!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. รายละเอียดผู้ดำเนินการ (เปลี่ยนตามสถานะจริง: ในครัว -> ไรเดอร์ -> ส่งสำเร็จ) -->
        <div class="card rider-card">
          <h3 class="card-title">ผู้ดำเนินการ</h3>
          
          <!-- สถานะ 1-2: กำลังปรุงอาหารในครัว -->
          <div v-if="currentStep <= 2" class="prep-profile-box">
            <div class="prep-icon-large">👨‍🍳</div>
            <h4 class="rider-name">ห้องครัวตำครกซิ่ง</h4>
            <p class="rider-vehicle">🔥 เชฟกำลังปรุงสดใหม่ตามออเดอร์</p>
            <p class="prep-desc">ไรเดอร์จะเข้ารับอาหารทันทีที่ปรุงเสร็จเพื่อนำส่งถึงมือคุณ</p>
          </div>

          <!-- สถานะ 3: ส่งมอบไรเดอร์แล้ว กำลังจัดส่ง -->
          <div v-else-if="currentStep === 3" class="rider-profile-box">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" alt="Rider" class="rider-img">
            <h4 class="rider-name">สิริโชค คำมา (ไรเดอร์)</h4>
            <p class="rider-vehicle">🛵 Honda Wave • 1กข 1234</p>
            <div class="rider-actions">
              <button class="action-btn call-btn" @click="callRider">
                <span>📞</span> โทรหาคนขับ
              </button>
              <button class="action-btn chat-btn" @click="chatRider">
                <span>💬</span> ข้อความ
              </button>
            </div>
          </div>

          <!-- สถานะ 4: จัดส่งสำเร็จเรียบร้อย -->
          <div v-else class="completed-profile-box">
            <div class="completed-icon-large">🎉</div>
            <h4 class="rider-name">จัดส่งถึงคุณเรียบร้อยแล้ว</h4>
            <p class="rider-vehicle" style="background:#eef7f1; color:#2d5a43;">✓ พนักงานส่งมอบอาหารสำเร็จ</p>
            <p class="prep-desc">ขอบคุณที่เลือกทานอาหารกับร้านตำครกซิ่งครับ</p>
            <button class="dismiss-btn" @click="dismissOrder">
              ปิดหน้านี้ / สั่งอาหารเพิ่ม ➔
            </button>
          </div>
        </div>

        <!-- 3. ข้อมูลสรุปออเดอร์ -->
        <div class="card order-summary-card">
          <div class="order-header-row">
            <h3 class="card-title" style="margin-bottom:0;">คำสั่งซื้อ #{{ currentOrder.orderNumber }}</h3>
            <span class="badge-status" :class="statusBadgeClass">{{ displayStatusText }}</span>
          </div>

          <div class="eta-box">
            <div class="eta-icon">⏰</div>
            <div class="eta-text-group">
              <span class="eta-label">เวลาที่คาดว่าจะมาถึง</span>
              <span class="eta-time">{{ estimatedTimeText }}</span>
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
            <div class="price-row">
              <span>ยอดชำระ:</span>
              <span style="font-weight: 700; color: #557c61;">B{{ currentOrder.total }}</span>
            </div>
          </div>

          <button class="view-receipt-btn" @click="showReceiptModal = true">
            ดูใบเสร็จแบบเต็ม
          </button>
        </div>
      </div>
    </template>

    <!-- ส่วนที่ 3: เมื่อล็อกอินแล้วแต่ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างจัดส่งในขณะนี้ -->
    <div class="empty-tracking-wrapper" v-else>
      <div class="empty-tracking-card">
        <div class="empty-icon">🛵💨</div>
        <h3>ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างจัดส่ง</h3>
        <p>คุณยังไม่มีรายการอาหารที่กำลังจัดส่งในขณะนี้ สามารถเลือกดูเมนูอร่อยๆ หรือตรวจสอบประวัติคำสั่งซื้อที่ผ่านมาได้ครับ</p>
        <div class="empty-actions-row">
          <button class="go-home-btn" @click="$router.push('/')">เลือกซื้ออาหาร ➔</button>
          <button class="history-link-btn" @click="$router.push('/history')">ดูประวัติคำสั่งซื้อ</button>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-brand">ตำครกซิ่ง</div>
      <div class="footer-links">
        <a href="#">นโยบายความเป็นส่วนตัว</a>
        <a href="#">ข้อกำหนดการให้บริการ</a>
        <a href="#">ติดต่อเรา</a>
      </div>
      <div class="footer-copy">© 2026 Tum Krok Zing. สงวนลิขสิทธิ์</div>
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
            <div class="r-item-sub" v-if="item.options">
              <span>{{ item.options }}</span>
            </div>
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
      hasActiveOrder: false, 
      userProfile: {
        name: '',
        phone: '',
        address: ''
      },
      currentOrder: null, 
      showReceiptModal: false,
      rawStatus: 'PENDING',
      pollingTimer: null
    }
  },
  watch: {
    'authStore.isLoggedIn'(val) {
      if (!val) {
        this.hasActiveOrder = false;
        this.currentOrder = null;
      } else {
        this.fetchLatestOrder();
      }
    }
  },
  computed: {
    mapUrl() {
      if (!this.hasActiveOrder) return '';
      const address = this.userProfile.address || 'ตลาดปากเกร็ด นนทบุรี'; 
      const encodedAddress = encodeURIComponent(address);
      return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    },
    // แปลงสถานะจาก Backend เป็นตัวเลข Step 1-4
    currentStep() {
      switch (this.rawStatus) {
        case 'PENDING':
        case 'PAID':
          return 1;
        case 'COOKING':
          return 2;
        case 'READY':
        case 'IN_DELIVERY':
          return 3;
        case 'COMPLETED':
        case 'DELIVERED':
          return 4;
        default:
          return 1;
      }
    },
    displayStatusText() {
      const statusMap = {
        PENDING: 'ยืนยันออเดอร์แล้ว',
        PAID: 'รับออเดอร์แล้ว',
        COOKING: 'กำลังปรุงอาหาร',
        READY: 'อาหารเสร็จแล้ว',
        IN_DELIVERY: 'กำลังจัดส่ง',
        COMPLETED: 'จัดส่งสำเร็จ',
        DELIVERED: 'จัดส่งสำเร็จ',
        CANCELLED: 'ยกเลิกแล้ว'
      };
      return statusMap[this.rawStatus] || this.rawStatus;
    },
    statusBadgeClass() {
      if (this.rawStatus === 'COMPLETED' || this.rawStatus === 'DELIVERED') return 'badge-completed';
      if (this.rawStatus === 'CANCELLED') return 'badge-cancelled';
      return 'badge-pending';
    },
    estimatedTimeText() {
      if (this.rawStatus === 'COMPLETED' || this.rawStatus === 'DELIVERED') return 'ส่งถึงแล้ว';
      if (this.rawStatus === 'READY' || this.rawStatus === 'IN_DELIVERY') return '10-15 นาที';
      if (this.rawStatus === 'COOKING') return '20-25 นาที';
      return '25-35 นาที';
    }
  },
  async mounted() {
    authStore.syncAuth();

    // 1. โหลดข้อมูลโปรไฟล์
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        this.userProfile = {
          name: parsed.name || parsed.username || 'ลูกค้าทั่วไป',
          phone: parsed.phone || '08x-xxx-xxxx',
          address: parsed.address || 'ตลาดปากเกร็ด นนทบุรี'
        };
      } catch (e) {
        this.userProfile = { name: 'ลูกค้าทั่วไป', phone: '08x-xxx-xxxx', address: 'ตลาดปากเกร็ด นนทบุรี' };
      }
    }

    // 2. ดึงข้อมูลออเดอร์ที่กำลังจัดส่งของ User คนนี้จากเซิร์ฟเวอร์
    if (this.authStore.isLoggedIn) {
      await this.fetchLatestOrder();
    } else {
      this.hasActiveOrder = false;
      this.currentOrder = null;
    }

    // 3. เริ่มต้น Polling อัปเดตสถานะแบบ Real-Time ทุก 2.5 วินาที
    this.pollingTimer = setInterval(() => {
      if (this.authStore.isLoggedIn) {
        this.fetchLatestOrder(true);
      }
    }, 2500);
  },
  beforeUnmount() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  },
  methods: {
    getStepClass(step) {
      if (this.currentStep > step) return 'completed';
      if (this.currentStep === step) return 'active';
      return 'pending';
    },
    async fetchLatestOrder(isSilent = false) {
      if (!this.authStore.isLoggedIn) {
        this.hasActiveOrder = false;
        this.currentOrder = null;
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        this.hasActiveOrder = false;
        this.currentOrder = null;
        return;
      }

      try {
        // ดึงเฉพาะคำสั่งซื้อประเภท DELIVERY ที่กำลัง active อยู่ของผู้ใช้คนนี้
        const routeOrderId = this.$route.query.orderId || sessionStorage.getItem('active_tracking_order_id');
        const queryParam = routeOrderId ? `?orderId=${encodeURIComponent(routeOrderId)}` : '';

        const res = await axios.get(`${API_BASE}/orders/my-active${queryParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const activeOrder = res.data;

        // หากพบคำสั่งซื้อที่กำลังจัดส่งอยู่จริง
        if (activeOrder && activeOrder.order_id) {
          this.rawStatus = activeOrder.status;

          const items = (activeOrder.order_items || []).map(oi => {
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

          this.currentOrder = {
            orderNumber: String(activeOrder.order_id),
            date: new Date(activeOrder.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
            total: Number(activeOrder.total_price),
            subtotal: subtotal || Number(activeOrder.total_price),
            shippingFee: Math.max(0, Number(activeOrder.total_price) - subtotal),
            paymentMethod: activeOrder.payment_method || 'พร้อมเพย์',
            status: this.displayStatusText,
            items: items
          };

          this.hasActiveOrder = true;
        } else {
          // ถ้าไม่มีออเดอร์ที่กำลังจัดส่งอยู่ ให้เคลียร์สถานะเป็นไม่มีออเดอร์
          this.hasActiveOrder = false;
          this.currentOrder = null;
          sessionStorage.removeItem('active_tracking_order_id');
        }
      } catch (err) {
        if (!isSilent) console.warn('ดึงข้อมูลสถานะล่าสุดไม่สำเร็จ:', err);
      }
    },
    dismissOrder() {
      this.hasActiveOrder = false;
      this.currentOrder = null;
      sessionStorage.removeItem('active_tracking_order_id');
      this.$router.push('/');
    },
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.clear();
      this.$router.push('/');
    },
    callRider() {
      alert('กำลังโทรหาคุณสิริโชค (คนขับ)...');
    },
    chatRider() {
      alert('กำลังเปิดหน้าต่างแชทกับคนขับ...');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.tracking-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

/* แถบแจ้งเตือน Real-Time */
.live-status-bar {
  max-width: 1300px;
  width: 100%;
  margin: 16px auto 0;
  padding: 8px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.live-dot-pulse {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: livePulse 1.8s infinite;
}

.live-text {
  font-size: 12px;
  font-weight: 600;
  color: #15803d;
}

.manual-sync-btn {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.manual-sync-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.map-banner { width: 100%; height: 260px; position: relative; overflow: hidden; background: #e0dfd5; margin-top: 10px; }
.map-overlay-simulation { width: 100%; height: 100%; }

.tracking-content { display: flex; justify-content: center; gap: 20px; padding: 25px 40px; max-width: 1300px; margin: 0 auto; width: 100%; flex-grow: 1; }
.card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); flex: 1; display: flex; flex-direction: column; }
.card-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 20px; position: relative; padding-left: 10px; }
.timeline::before { content: ''; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 2px; background: #e5e2d5; }
.timeline-item { display: flex; gap: 15px; position: relative; align-items: flex-start; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: #ccc; border: 2px solid white; position: relative; z-index: 1; margin-top: 4px; }
.timeline-item.completed .dot { background: #557c61; }
.timeline-item.active .dot { background: #557c61; box-shadow: 0 0 0 4px rgba(85, 124, 97, 0.2); }
.timeline-item.pending .dot { background: #e0dfd5; }

.timeline-item h4 { font-size: 14px; font-weight: 600; color: #333; }
.timeline-item p { font-size: 12px; color: #777; margin-top: 2px; line-height: 1.4; }
.text-muted h4 { color: #aaa; }

/* Dynamic Middle Card */
.prep-profile-box, .completed-profile-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: auto 0;
  padding: 10px 0;
}

.prep-icon-large, .completed-icon-large {
  font-size: 52px;
  line-height: 1;
  margin-bottom: 4px;
}

.prep-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.dismiss-btn {
  margin-top: 8px;
  background: #557c61;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.dismiss-btn:hover {
  background: #405e49;
}

/* Rider Card */
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

/* Summary Card */
.order-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.badge-status { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 10px; }
.badge-pending { background: #fef3c7; color: #d97706; }
.badge-completed { background: #eef2ed; color: #557c61; }
.badge-cancelled { background: #fee2e2; color: #dc2626; }

.eta-box { background: #fcfbf8; border: 1px solid #e5e2d5; border-radius: 14px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.eta-icon { font-size: 24px; }
.eta-text-group { display: flex; flex-direction: column; }
.eta-label { font-size: 11px; color: #777; }
.eta-time { font-size: 20px; font-weight: 700; color: #333; line-height: 1.2; }

.order-pricing { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.price-row { display: flex; justify-content: space-between; font-size: 13px; color: #666; }

.view-receipt-btn { background: #557c61; color: white; border: none; width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: 0.2s; margin-top: auto; font-family: inherit; }
.view-receipt-btn:hover { background: #405e49; }

/* Empty state */
.empty-tracking-wrapper { display: flex; justify-content: center; align-items: center; flex-grow: 1; padding: 40px 20px; }
.empty-tracking-card { background: white; border-radius: 20px; padding: 60px 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid #e5e2d5; max-width: 600px; width: 100%; }
.empty-icon { font-size: 60px; margin-bottom: 5px; }
.empty-tracking-card h3 { font-size: 22px; font-weight: 600; color: #333; }
.empty-tracking-card p { font-size: 14px; color: #777; margin-bottom: 15px; max-width: 440px; line-height: 1.5; }

.empty-actions-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.go-home-btn { background: #557c61; color: white; border: none; padding: 12px 26px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; }
.go-home-btn:hover { background: #405e49; transform: translateY(-1px); }

.history-link-btn {
  background: #f1ede1;
  color: #444;
  border: 1px solid #e5e2d5;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
}
.history-link-btn:hover {
  background: #e5e2d5;
}

.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; margin-top: auto; font-size: 12px; color: #666; }
.footer-brand { font-weight: 600; color: #557c61; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #557c61; }
.footer-copy { color: #888; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
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
.receipt-summary { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
.r-summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.r-total-row { font-size: 18px; font-weight: 700; color: #557c61; margin-top: 5px; }

@keyframes livePulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}
</style>