<template>
  <div class="checkout-container">
    <header class="navbar">
      <div class="logo-section">
        <img src="./assets/logo.png" alt="Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">ค้นหา</router-link>
        <router-link to="/history" class="nav-item">คำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item">ข้อเสนอ</router-link>
        <router-link to="/help" class="nav-item">ช่วยเหลือ</router-link>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn">🔔</button>
        <div class="profile-icon" @click="$router.push('/profile')">👤</div>
      </div>
    </header>

    <div class="checkout-main">
      <div class="left-section">
        
        <div class="card-section">
          <h3 class="section-title">ที่อยู่จัดส่ง</h3>
          <div class="address-box">
            <div class="map-placeholder map-active">
              <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                style="border:0; border-radius: 12px;"
                :src="mapUrl" 
                allowfullscreen>
              </iframe>
            </div>
            <div class="address-details">
              <h4 class="location-name">
                {{ userProfile.name }} 
                <span class="phone-text">({{ userProfile.phone }})</span>
              </h4>
              <p class="address-text">{{ userProfile.address }}</p>
              <p class="address-note">หมายเหตุ: กรุณาโทรแจ้งเมื่อมาถึง</p>
              <button class="edit-address-btn" @click="$router.push('/profile')">แก้ไขที่อยู่</button>
            </div>
          </div>
        </div>

        <div class="card-section">
          <h3 class="section-title">เวลาจัดส่ง</h3>
          <div class="delivery-time-box">
            <div class="time-type">มาตรฐาน</div>
            <div class="time-range">25-35 นาที</div>
          </div>
        </div>

        <div class="card-section">
          <h3 class="section-title">วิธีชำระเงิน</h3>
          <div class="payment-methods">
            <div class="payment-card" :class="{ active: selectedPayment === 'qr' }" @click="selectedPayment = 'qr'">
              <div class="pay-icon">📱</div>
              <span>พร้อมเพย์</span>
            </div>
            <div class="payment-card" :class="{ active: selectedPayment === 'cash' }" @click="selectedPayment = 'cash'">
              <div class="pay-icon">💵</div>
              <span>เงินสด</span>
            </div>
          </div>
        </div>

      </div>

      <aside class="right-section">
        <div class="summary-card">
          <h3 class="summary-title">สรุปคำสั่งซื้อ</h3>

          <div class="order-items-list">
            <div class="order-item" v-for="(item, index) in cartItems" :key="index">
              <div class="item-badge">{{ item.qty }}</div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-sub">
                  <span v-if="item.spiceLevel">🌶️ {{ item.spiceLevel }}</span>
                  <span v-for="addon in item.addons" :key="addon.name"> +{{ addon.name }}</span>
                </div>
              </div>
              <div class="item-price">B{{ item.price * item.qty }}</div>
            </div>

            <div v-if="cartItems.length === 0" style="text-align: center; color: #888; font-size: 13px;">
              ไม่มีรายการอาหารในตะกร้า
            </div>
          </div>

          <div class="price-breakdown">
            <div class="breakdown-row">
              <span>ยอดรวม</span>
              <span>B{{ subtotal }}</span>
            </div>
            <div class="breakdown-row">
              <span>
                ค่าจัดส่ง 
                <span v-if="isFreeShipping" class="free-shipping-text">(ส่งฟรีเกิน B300)</span>
              </span>
              <span v-if="!isFreeShipping">B20</span>
              <span v-else class="free-shipping-price">ฟรี</span>
            </div>
          </div>

          <div class="net-total-row">
            <span>ยอดสุทธิ</span>
            <span class="total-price-highlight">B{{ total }}</span>
          </div>

          <button class="confirm-checkout-btn" @click="confirmOrder" :disabled="cartItems.length === 0">
            ยืนยันและชำระเงิน B{{ total }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedPayment: 'qr',
      userProfile: {
        name: '',
        phone: '',
        address: ''
      },
      cartItems: []
    }
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },
    isFreeShipping() {
      return this.subtotal >= 300;
    },
    shippingFee() {
      return this.isFreeShipping ? 0 : 20;
    },
    total() {
      return this.subtotal + this.shippingFee;
    },
    mapUrl() {
      const address = this.userProfile.address || 'ตลาดปากเกร็ด นนทบุรี'; 
      const encodedAddress = encodeURIComponent(address);
      return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  },
  mounted() {
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

    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  },
  methods: {
    confirmOrder() {
      if (this.cartItems.length === 0) {
        alert('กรุณาเลือกอาหารก่อนชำระเงินครับ!');
        this.$router.push('/');
        return;
      }

      // สุ่มเลขที่ออเดอร์ (เช่น TRX-4921)
      const randomOrderNumber = 'TRX-' + Math.floor(1000 + Math.random() * 9000);

      // สร้างแพ็กเกจข้อมูลออเดอร์ปัจจุบัน
      const currentOrder = {
        orderNumber: randomOrderNumber,
        items: this.cartItems,
        subtotal: this.subtotal,
        shippingFee: this.shippingFee,
        total: this.total
      };

      // บันทึกออเดอร์ปัจจุบันลง localStorage เพื่อให้หน้า Tracking ดึงไปใช้
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));

      alert(`สั่งซื้อสำเร็จ!\nเลขออเดอร์: #${randomOrderNumber}\nขอบคุณคุณ ${this.userProfile.name} ระบบกำลังดำเนินการจัดส่งครับ`);
      
      // ล้างข้อมูลตะกร้าออกเพราะสั่งซื้อไปแล้ว
      localStorage.removeItem('cartData');
      
      this.$router.push('/tracking');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.checkout-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; background: #f7f6f0; border-bottom: 1px solid #e5e2d5; }
.logo-img { height: 35px; }
.nav-menu { display: flex; gap: 30px; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; }
.nav-item:hover { color: #557c61; }
.nav-actions { display: flex; align-items: center; gap: 15px; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.profile-icon { width: 32px; height: 32px; background: #e5e2d5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; }

.checkout-main { display: flex; justify-content: center; gap: 30px; padding: 30px 40px; flex-grow: 1; max-width: 1200px; margin: 0 auto; width: 100%; }
.left-section { flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 680px; }
.card-section { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.section-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; }

.address-box { display: flex; gap: 20px; align-items: flex-start; }
.map-placeholder { width: 100px; height: 90px; background: #f1ede1; border-radius: 12px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; overflow: hidden;}
.map-placeholder.map-active { width: 140px; height: 110px; border: 1px solid #e0dfd5; }

.address-details { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
.location-name { font-size: 16px; font-weight: 600; color: #333; }
.phone-text { font-size: 13px; color: #666; font-weight: 400; }
.address-text { font-size: 14px; color: #555; line-height: 1.5; background: #faf9f5; padding: 10px 12px; border-radius: 8px; border: 1px solid #eee; }
.address-note { font-size: 12px; color: #888; margin-bottom: 4px; }
.edit-address-btn { background: white; border: 1px solid #557c61; color: #557c61; padding: 4px 14px; border-radius: 15px; font-size: 12px; font-weight: 500; cursor: pointer; align-self: flex-start; transition: 0.2s; }
.edit-address-btn:hover { background: #f4faeb; }

.delivery-time-box { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0dfd5; border-radius: 12px; padding: 15px 20px; }
.time-type { font-weight: 600; font-size: 14px; color: #333; }
.time-range { font-size: 13px; color: #666; }

.payment-methods { display: flex; gap: 15px; }
.payment-card { flex: 1; border: 1px solid #e0dfd5; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; background: white; }
.payment-card.active { border-color: #557c61; background: #fcfbf8; box-shadow: 0 0 0 1px #557c61; }
.pay-icon { font-size: 24px; }
.payment-card span { font-size: 14px; font-weight: 500; color: #333; }

.right-section { width: 360px; }
.summary-card { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.summary-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }

.order-items-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; max-height: 350px; overflow-y: auto; }
.order-item { display: flex; align-items: flex-start; gap: 12px; }
.item-badge { background: #f1ede1; color: #444; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 2px; }
.item-info { flex-grow: 1; display: flex; flex-direction: column; gap: 3px; }
.item-name { font-size: 14px; font-weight: 600; color: #333; }
.item-sub { font-size: 12px; color: #777; display: flex; flex-wrap: wrap; gap: 5px; }
.item-price { font-size: 14px; font-weight: 600; color: #333; }

.price-breakdown { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
.breakdown-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.free-shipping-text { color: #557c61; font-size: 11px; font-weight: 600; background: #eef2ed; padding: 2px 6px; border-radius: 6px; margin-left: 5px; }
.free-shipping-price { color: #557c61; font-weight: 600; }

.net-total-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 20px; font-size: 16px; font-weight: 600; color: #333; }
.total-price-highlight { color: #557c61; font-size: 22px; font-weight: 700; }

.confirm-checkout-btn { background: #557c61; color: white; border: none; width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; text-align: center; font-family: inherit; }
.confirm-checkout-btn:hover { background: #405e49; }
.confirm-checkout-btn:disabled { background: #ccc; cursor: not-allowed; }
</style>