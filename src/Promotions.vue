<template>
  <div class="page-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

    <div class="content-wrapper">
      <!-- Hero Banner -->
      <div class="promo-banner">
        <div class="promo-banner-text">
          <span class="badge-time">มีเวลาจำกัด</span>
          <h1>ฉลองสุดสัปดาห์ด้วย<br>อาหารอีสานรสแซ่บ</h1>
          <p>กดเก็บโค้ดโปรโมชันเพื่อรับส่วนลดพิเศษเมื่อสั่งซื้อออนไลน์ (เฉพาะเดลิเวอรี่เท่านั้น)</p>
          <button class="banner-btn" @click="$router.push('/')">ไปเลือกอาหาร ➔</button>
        </div>
      </div>

      <!-- ข้อความแจ้งเตือนเมื่อกดเก็บโค้ดสำเร็จ -->
      <div v-if="toastMessage" class="toast-notice">
        {{ toastMessage }}
      </div>

      <!-- หัวข้อคูปอง -->
      <div class="section-header-row">
        <div>
          <h2>คูปองและโปรโมชั่นทั้งหมด</h2>
          <p class="section-sub">กดเก็บโค้ดโปรโมชัน แล้วนำไปใช้เป็นส่วนลดได้ที่หน้าชำระเงินออนไลน์</p>
        </div>
        <span class="view-all-link">🌐 ใช้งานได้เฉพาะสั่งออนไลน์</span>
      </div>

      <!-- Grid คูปอง -->
      <div class="coupon-grid" v-if="activePromotions.length > 0">
        <div 
          class="coupon-card" 
          v-for="promo in activePromotions" 
          :key="promo.promo_id || promo.id"
          :class="{ 'already-claimed': isClaimed(promo.promo_id) }"
        >
          <div class="coupon-top">
            <div class="c-left">
              <span class="c-icon">🎁</span>
              <span class="online-only-pill">เฉพาะสั่งออนไลน์</span>
            </div>
            <span class="c-badge" :class="{ 'used-badge': isUsed(promo.promo_id) }">
              {{ isUsed(promo.promo_id) ? 'ใช้สิทธิ์แล้ว' : (isClaimed(promo.promo_id) ? 'เก็บแล้ว' : 'พร้อมให้เก็บ') }}
            </span>
          </div>

          <h4 class="discount-title">
            {{ formatDiscount(promo) }}
          </h4>

          <div class="coupon-desc-box">
            <p class="min-order-text">
              • ยอดสั่งซื้ออาหารขั้นต่ำ <b>฿{{ promo.min_order_price || 0 }}</b>
            </p>
            <p class="expiry-text">
              • หมดเขต: {{ formatDate(promo.expiry_date) }}
            </p>
          </div>

          <div class="coupon-code-box">
            <span class="code-label">รหัสโค้ด:</span>
            <code class="code-text">{{ promo.code }}</code>
            <button class="copy-btn" @click="copyCode(promo.code)" title="คัดลอกรหัส">📋 คัดลอก</button>
          </div>

          <!-- ปุ่มกดรับ/สถานะคูปอง -->
          <div class="coupon-actions">
            <!-- 1. ยังไม่ได้ล็อกอิน -->
            <button 
              v-if="!authStore.isLoggedIn"
              class="claim-btn login-req-btn"
              @click="$router.push('/login?redirect=/promotions')"
            >
              🔐 เข้าสู่ระบบเพื่อเก็บโค้ด
            </button>

            <!-- 2. ล็อกอินแล้ว แต่ใช้คูปองนี้ไปแล้ว -->
            <button 
              v-else-if="isUsed(promo.promo_id)"
              class="claim-btn used-btn"
              disabled
            >
              ✓ ใช้สิทธิ์ไปแล้ว
            </button>

            <!-- 3. ล็อกอินแล้ว และเก็บคูปองนี้ไว้แล้ว -->
            <button 
              v-else-if="isClaimed(promo.promo_id)"
              class="claim-btn claimed-btn"
              @click="useCouponForOrder(promo)"
            >
              ✓ เก็บแล้ว • นำไปใช้ที่ Checkout ➔
            </button>

            <!-- 4. ล็อกอินแล้ว และยังไม่ได้เก็บคูปองนี้ -->
            <button 
              v-else
              class="claim-btn ready-btn"
              :disabled="claimingId === promo.promo_id"
              @click="claimCoupon(promo)"
            >
              {{ claimingId === promo.promo_id ? '⏳ กำลังเก็บ...' : '📥 กดเก็บโค้ดนี้' }}
            </button>
          </div>
        </div>
      </div>

      <!-- กรณีไม่มีโปรโมชั่นเปิดใช้งาน -->
      <div v-else class="empty-promo-box">
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
      <div class="footer-copy">© 2026 Tum Krok Zing Restaurant. อาหารอีสานแท้รสแซ่บ</div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { API_BASE } from './config/api';
import { authStore } from './store/authStore';
import { usePromotionStore } from './store/promotionStore';

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      authStore,
      promotionStore: usePromotionStore(),
      promotionsList: [],
      claimedPromos: [],
      claimingId: null,
      toastMessage: ''
    };
  },
  computed: {
    activePromotions() {
      return this.promotionsList.filter(p => p.is_active !== false);
    }
  },
  async mounted() {
    this.authStore.syncAuth();
    await this.loadPromotions();
    if (this.authStore.isLoggedIn) {
      await this.loadMyClaimedPromotions();
    }
  },
  methods: {
    async loadPromotions() {
      try {
        const res = await axios.get(`${API_BASE}/promotions`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.promotionsList = res.data;
          return;
        }
      } catch (err) {
        console.warn('ดึงโปรโมชันจาก API ไม่สำเร็จ ใช้ข้อมูลสำรอง:', err);
      }

      // ข้อมูลสำรองเริ่มต้น
      this.promotionsList = [
        { promo_id: 1, code: 'ZING50', discount_type: 'FIXED', discount_value: 50, min_order_price: 300, expiry_date: '2026-12-31' },
        { promo_id: 2, code: 'SEP10', discount_type: 'PERCENTAGE', discount_value: 10, min_order_price: 200, expiry_date: '2026-12-31' },
        { promo_id: 3, code: 'WELCOME100', discount_type: 'FIXED', discount_value: 100, min_order_price: 500, expiry_date: '2026-12-31' },
        { promo_id: 4, code: 'DELIVERY20', discount_type: 'FIXED', discount_value: 20, min_order_price: 200, expiry_date: '2026-12-31' }
      ];
    },

    async loadMyClaimedPromotions() {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/promotions/my/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          this.claimedPromos = res.data;
        }
      } catch (err) {
        console.warn('ไม่สามารถดึงรายการคูปองที่เก็บไว้ได้:', err);
      }
    },

    isClaimed(promoId) {
      return this.claimedPromos.some(c => c.promo_id === promoId);
    },

    isUsed(promoId) {
      const found = this.claimedPromos.find(c => c.promo_id === promoId);
      return found ? Boolean(found.is_used) : false;
    },

    async claimCoupon(promo) {
      if (!this.authStore.isLoggedIn) {
        this.$router.push('/login?redirect=/promotions');
        return;
      }

      const token = localStorage.getItem('access_token');
      this.claimingId = promo.promo_id;

      try {
        const res = await axios.post(
          `${API_BASE}/promotions/claim/${promo.promo_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.showToast(`🎉 ${res.data?.message || 'เก็บโค้ดส่วนลดสำเร็จ!'}`);
        await this.promotionStore.claimCoupon(promo);
        await this.loadMyClaimedPromotions();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'เก็บโค้ดไม่สำเร็จ';
        alert(`เกิดข้อผิดพลาด: ${msg}`);
      } finally {
        this.claimingId = null;
      }
    },

    useCouponForOrder(promo) {
      this.promotionStore.selectCouponForCheckout(promo);
      this.$router.push('/checkout');
    },

    copyCode(code) {
      if (!code) return;
      navigator.clipboard.writeText(code);
      this.showToast(`📋 คัดลอกโค้ด "${code}" เรียบร้อยแล้ว!`);
    },

    showToast(msg) {
      this.toastMessage = msg;
      setTimeout(() => {
        this.toastMessage = '';
      }, 3500);
    },

    formatDiscount(promo) {
      const type = (promo.discount_type || '').toUpperCase();
      if (type === 'PERCENTAGE' || type === 'PERCENT') {
        return `ลด ${promo.discount_value}%`;
      }
      return `ลด ฿${Number(promo.discount_value).toLocaleString()} บาท`;
    },

    formatDate(dateStr) {
      if (!dateStr) return '31/12/2026';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

.content-wrapper { max-width: 1300px; margin: 0 auto; width: 100%; padding: 30px 40px; display: flex; flex-direction: column; gap: 24px; flex-grow: 1; }

/* Banner */
.promo-banner { background: url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200') center/cover; border-radius: 24px; padding: 50px; color: white; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.promo-banner::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.38); }
.promo-banner-text { position: relative; z-index: 1; max-width: 520px; }
.badge-time { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; backdrop-filter: blur(5px); display: inline-block; margin-bottom: 15px; }
.promo-banner h1 { font-size: 34px; font-weight: 700; line-height: 1.25; margin-bottom: 12px; }
.promo-banner p { font-size: 14px; opacity: 0.92; margin-bottom: 20px; line-height: 1.5; }
.banner-btn { background: #557c61; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.banner-btn:hover { background: #3e6048; transform: translateY(-2px); }

/* Toast Notice */
.toast-notice {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #6ee7b7;
  padding: 12px 20px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  animation: fadeIn 0.3s ease;
}

/* Section Header */
.section-header-row { display: flex; justify-content: space-between; align-items: flex-end; }
.section-header-row h2 { font-size: 22px; font-weight: 700; color: #1e293b; }
.section-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.view-all-link { background: #e2e8f0; color: #334155; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; }

/* Coupon Grid */
.coupon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.coupon-card { 
  background: white; 
  border-radius: 20px; 
  padding: 22px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
  display: flex; 
  flex-direction: column; 
  gap: 14px; 
  position: relative; 
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s;
}
.coupon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}
.coupon-card.already-claimed {
  border-color: #86efac;
  background: #fafdfa;
}

.coupon-top { display: flex; justify-content: space-between; align-items: center; }
.c-left { display: flex; align-items: center; gap: 8px; }
.c-icon { font-size: 20px; }
.online-only-pill { font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; }
.c-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 10px; background: #eef2ed; color: #2d5a43; }
.c-badge.used-badge { background: #f1f5f9; color: #94a3b8; }

.discount-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 2px 0; }
.coupon-desc-box { font-size: 12px; color: #64748b; line-height: 1.5; flex-grow: 1; }
.min-order-text b { color: #334155; }
.expiry-text { color: #94a3b8; margin-top: 2px; }

.coupon-code-box { 
  background: #f8fafc; 
  border: 1px dashed #cbd5e1; 
  padding: 8px 12px; 
  border-radius: 12px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  font-size: 13px; 
}
.code-label { font-size: 11px; color: #64748b; }
.code-text { font-weight: 700; color: #1e293b; letter-spacing: 0.5px; }
.copy-btn { 
  background: none; 
  border: none; 
  color: #2563eb; 
  font-size: 11px; 
  font-weight: 600; 
  cursor: pointer; 
  padding: 2px 6px; 
  border-radius: 6px; 
  transition: 0.15s; 
}
.copy-btn:hover { background: #eff6ff; }

/* Action Buttons */
.claim-btn { 
  width: 100%; 
  padding: 11px; 
  border-radius: 14px; 
  border: none; 
  font-size: 13px; 
  font-weight: 700; 
  cursor: pointer; 
  text-align: center; 
  transition: 0.2s;
  font-family: inherit;
}
.claim-btn.ready-btn { 
  background: #2d5a43; 
  color: white; 
  box-shadow: 0 3px 10px rgba(45, 90, 67, 0.2); 
}
.claim-btn.ready-btn:hover { 
  background: #183324; 
  transform: translateY(-1px); 
}
.claim-btn.claimed-btn { 
  background: #ecfdf5; 
  color: #059669; 
  border: 1px solid #a7f3d0; 
}
.claim-btn.claimed-btn:hover { 
  background: #d1fae5; 
}
.claim-btn.used-btn { 
  background: #f1f5f9; 
  color: #94a3b8; 
  cursor: not-allowed; 
}
.claim-btn.login-req-btn { 
  background: #f8fafc; 
  color: #475569; 
  border: 1px solid #cbd5e1; 
}
.claim-btn.login-req-btn:hover { 
  background: #f1f5f9; 
  color: #0f172a; 
}

.empty-promo-box { text-align: center; padding: 40px; color: #94a3b8; background: white; border-radius: 20px; }

/* Footer */
.footer { display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; background: #f7f6f0; border-top: 1px solid #e5e2d5; font-size: 12px; color: #666; margin-top: auto; }
.footer-brand { font-weight: 700; color: #2d5a43; font-size: 14px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: #666; }
.footer-links a:hover { color: #2d5a43; }
.footer-copy { color: #888; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>