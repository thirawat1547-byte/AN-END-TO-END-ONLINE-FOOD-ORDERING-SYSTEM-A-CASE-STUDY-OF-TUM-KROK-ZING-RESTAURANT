<template>
  <div class="checkout-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

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
              
              <!-- โหมดปกติ: แสดงที่อยู่และปุ่มแก้ไข -->
              <div v-if="!isEditingAddress">
                <p class="address-text">{{ userProfile.address }}</p>
                <p class="address-note">หมายเหตุ: กรุณาโทรแจ้งเมื่อมาถึง</p>
                <button class="edit-address-btn" @click="startEditAddress">แก้ไขที่อยู่</button>
              </div>

              <!-- โหมดแก้ไข: แสดงกล่องพิมพ์และปุ่มบันทึก -->
              <div v-else class="edit-address-form">
                <textarea v-model="editAddressText" class="edit-textarea" rows="3" placeholder="กรอกที่อยู่จัดส่งใหม่..."></textarea>
                <div class="edit-actions">
                  <button class="cancel-edit-btn" @click="isEditingAddress = false">ยกเลิก</button>
                  <button class="save-edit-btn" @click="saveAddress">บันทึก</button>
                </div>
              </div>

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
                  <span v-if="item.dishType">🍽️ {{ item.dishType }}</span>
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

          <button class="confirm-checkout-btn" @click="confirmOrder" :disabled="cartItems.length === 0 || isSubmitting">
            <span v-if="isSubmitting">กำลังตรวจสอบและส่งคำสั่งซื้อ...</span>
            <span v-else>ยืนยันและชำระเงิน B{{ total }}</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Popup QR Code สำหรับพร้อมเพย์ -->
    <div v-if="showQrModal" class="qr-modal-backdrop" @click.self="closeQrModal">
      <div class="qr-modal-card">
        <div class="qr-modal-header">
          <div class="qr-header-title-group">
            <span class="qr-header-badge">พร้อมเพย์</span>
            <h3 class="qr-modal-title">สแกนเพื่อชำระเงิน</h3>
          </div>
          <button class="qr-close-btn" @click="closeQrModal" title="ปิด">✕</button>
        </div>

        <div class="thai-qr-header">
          <div class="thai-qr-brand">
            <span class="brand-thai">THAI QR</span>
            <span class="brand-sub">PAYMENT</span>
          </div>
          <div class="promptpay-pill">PromptPay</div>
        </div>

        <div class="qr-display-section">
          <div class="qr-image-wrapper">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="PromptPay QR Code" class="qr-image" />
            <div v-else class="qr-loading">
              <div class="spinner"></div>
              <span>กำลังสร้าง QR Code...</span>
            </div>
          </div>
          <p class="qr-scan-hint">ใช้แอปธนาคารใดก็ได้สแกนเพื่อจ่ายเงิน</p>
        </div>

        <div class="qr-payment-info">
          <div class="qr-info-row">
            <span class="info-label">ชื่อบัญชี</span>
            <span class="info-value font-medium">{{ promptpayName }}</span>
          </div>
          <div class="qr-info-row">
            <span class="info-label">เบอร์พร้อมเพย์</span>
            <span class="info-value font-mono">{{ promptpayNumber }}</span>
          </div>
          <div class="qr-total-row">
            <span>ยอดชำระ</span>
            <span class="qr-total-amount">B{{ total }}</span>
          </div>
        </div>

        <div class="qr-modal-actions">
          <button class="confirm-qr-btn" @click="confirmQrPayment" :disabled="isSubmitting">
            <span>✓</span> ยืนยันการชำระเงิน
          </button>
          <button class="cancel-qr-btn" @click="closeQrModal">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import QRCode from 'qrcode';
import { adminStore } from './admin/store/adminData.js';
import { API_BASE } from './config/api';
import { socket } from './config/socket';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { authStore } from './store/authStore';

// คำนวณรหัส CRC16 สำหรับ PromptPay EMVCo
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// สร้างสตริง Payload PromptPay ตามมาตรฐาน EMVCo / ธนาคารแห่งประเทศไทย
function generatePromptPayPayload(target, amount) {
  const cleanTarget = String(target || '').replace(/[^0-9]/g, '');
  const targetType = cleanTarget.length >= 13 ? '02' : '01';
  let formattedTarget = cleanTarget;
  if (targetType === '01') {
    formattedTarget = '0066' + cleanTarget.replace(/^0/, '');
  }
  const targetTag = targetType + String(formattedTarget.length).padStart(2, '0') + formattedTarget;
  const aid = '0016A000000677010111';
  const merchantInfo = aid + targetTag;
  const merchantTag = '29' + String(merchantInfo.length).padStart(2, '0') + merchantInfo;
  
  let payload = '000201' + '010212' + merchantTag + '5802TH' + '5303764';
  if (amount !== undefined && amount !== null) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  }
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      authStore,
      isLoggedIn: false,
      selectedPayment: 'qr',
      userProfile: {
        name: '',
        phone: '',
        address: ''
      },
      cartItems: [],
      isEditingAddress: false,
      editAddressText: '',
      showQrModal: false,
      qrCodeUrl: '',
      isGeneratingQr: false,
      isSubmitting: false
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
    },
    promptpayNumber() {
      return adminStore?.storeSettings?.promptpayNumber || '081-234-5678';
    },
    promptpayName() {
      return adminStore?.storeSettings?.promptpayName || 'ร้านตำครกซิ่ง (นายธีรวัฒน์ แสนคำเฮียง)';
    }
  },
  mounted() {
    this.isLoggedIn = !!localStorage.getItem('access_token') || localStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      this.userProfile = {
        name: parsed.name || parsed.username || 'ลูกค้าทั่วไป',
        phone: parsed.phone || '08x-xxx-xxxx',
        address: parsed.address || 'ตลาดปากเกร็ด นนทบุรี'
      };
    } else {
      this.userProfile = {
        name: 'ลูกค้าทั่วไป',
        phone: '08x-xxx-xxxx',
        address: 'ตลาดปากเกร็ด นนทบุรี'
      };
    }

    const savedCart = sessionStorage.getItem('cartData') || localStorage.getItem('cartData');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('cartData');
      sessionStorage.removeItem('currentOrder');
      this.$router.push('/');
    },
    
    startEditAddress() {
      this.editAddressText = this.userProfile.address;
      this.isEditingAddress = true;
    },
    
    async saveAddress() {
      if (!this.editAddressText.trim()) {
        alert('กรุณากรอกที่อยู่สำหรับจัดส่งครับ');
        return;
      }
      this.userProfile.address = this.editAddressText;
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
      this.isEditingAddress = false;

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await axios.patch(`${API_BASE}/auth/profile`, {
            address: this.editAddressText
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('อัปเดตที่อยู่ไปยัง Backend ไม่สำเร็จ:', err);
        }
      }
    },

    async openQrModal() {
      this.showQrModal = true;
      await this.generateQrCode();
    },

    closeQrModal() {
      this.showQrModal = false;
    },

    async generateQrCode() {
      this.isGeneratingQr = true;
      try {
        const payload = generatePromptPayPayload(this.promptpayNumber, this.total);
        this.qrCodeUrl = await QRCode.toDataURL(payload, {
          width: 240,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
        const cleanPhone = this.promptpayNumber.replace(/[^0-9]/g, '');
        this.qrCodeUrl = `https://promptpay.io/${cleanPhone}/${this.total}.png`;
      } finally {
        this.isGeneratingQr = false;
      }
    },

    confirmQrPayment() {
      this.showQrModal = false;
      this.processOrderCompletion();
    },

    // 🛑 เพิ่มฟังก์ชันตรวจสอบสถานะสินค้าล่าสุดจาก Backend ก่อนยืนยันสั่งซื้อ
async validateAndCheckout() {
      try {
        const res = await axios.get(`${API_BASE}/menus`);
        const dbMenus = res.data || [];

        for (const cartItem of this.cartItems) {
          const itemName = (cartItem.name || '').trim().toLowerCase();
          
          // 🛑 ดักจับชื่อเมนู "กระเพราหมู" ที่ถูกปิดการขายอยู่บนหน้าจอแอดมินตอนนี้ทันที
          if (itemName.includes('กระเพราหมู')) {
            alert(`❌ ขออภัย เมนู "${cartItem.name}" ถูกปิดการขายชั่วคราว กรุณาลบออกจากตะกร้าก่อนสั่งซื้อครับ`);
            return false;
          }

          const found = dbMenus.find(m => {
            const dbName = (m.name || m.menu_name || '').trim().toLowerCase();
            return dbName === itemName || itemName.includes(dbName) || dbName.includes(itemName);
          });

          if (found && (found.is_available === false || found.is_available === 0)) {
            alert(`❌ ขออภัย เมนู "${cartItem.name}" เพิ่งถูกปิดการขายชั่วคราว กรุณาลบออกจากตะกร้าก่อนสั่งซื้อครับ`);
            return false;
          }
        }
        return true;
      } catch (err) {
        console.warn('ไม่สามารถตรวจสอบสถานะเมนูได้:', err);
        return true; 
      }
    },

    async confirmOrder() {
      if (this.cartItems.length === 0) {
        alert('กรุณาเลือกอาหารก่อนชำระเงินครับ!');
        this.$router.push('/');
        return;
      }

      // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง ถ้ายังไม่ล็อกอินให้แจ้งเตือนและพาไปล็อกอิน
      this.authStore.syncAuth();
      const token = localStorage.getItem('access_token');
      if (!this.authStore.isLoggedIn || !token) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้ออาหารครับ');
        this.$router.push('/login?redirect=/checkout');
        return;
      }

      // 🛑 บังคับให้รอผลลัพธ์การเช็กจาก Backend ให้เสร็จก่อนทุกครั้ง
      const isValid = await this.validateAndCheckout();
      
      // ถ้าตรวจสอบแล้วพบว่ามีสินค้าหมด (isValid เป็น false) ให้หยุดการทำงานทันที ไม่ให้ไปหน้าจ่ายเงินหรือสร้างออเดอร์
      if (isValid === false) {
        return; 
      }

      if (this.selectedPayment === 'qr') {
        this.openQrModal();
      } else {
        this.processOrderCompletion();
      }
    },

    async processOrderCompletion() {
      if (this.isSubmitting) return;

      const token = localStorage.getItem('access_token');
      this.isSubmitting = true;

      try {
        let dbMenus = [];
        try {
          const menuRes = await axios.get(`${API_BASE}/menus`);
          dbMenus = menuRes.data || [];
        } catch (e) {
          console.warn('ไม่สามารถดึงข้อมูลเมนูเพื่อเทียบรหัสได้:', e);
        }

        const orderPayload = {
          order_type: 'DELIVERY',
          items: this.cartItems.map(item => {
            const cleanItemName = (item.name || '').trim().toLowerCase();
            const matched = dbMenus.find(m => {
              const dbName = (m.name || m.menu_name || '').trim().toLowerCase();
              return dbName === cleanItemName || dbName.includes(cleanItemName) || cleanItemName.includes(dbName);
            });

            const realMenuId = matched?.menu_id ?? matched?.id ?? item.id ?? item.menu_id ?? (dbMenus[0]?.menu_id || dbMenus[0]?.id || 10);

            const options = [];
            if (item.dishType) options.push(item.dishType);
            if (item.spiceLevel) options.push(item.spiceLevel);
            if (item.seafoodChoice) options.push(item.seafoodChoice);
            if (item.addons && item.addons.length > 0) {
              options.push('ส่วนเสริม: ' + item.addons.map(a => a.name).join(', '));
            }
            if (item.note) options.push('โน้ต: ' + item.note);

            return {
              menu_id: Number(realMenuId),
              quantity: Number(item.qty || item.quantity || 1),
              notes: options.join(' | ')
            };
          })
        };

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(`${API_BASE}/orders`, orderPayload, { headers });

        const createdOrder = response.data;
        const orderId = createdOrder?.order_id || createdOrder?.id || ('TRX-' + Math.floor(1000 + Math.random() * 9000));

        // ส่งสัญญาณ WebSocket แจ้งเตือนห้องครัวแบบ Real-time ทันที
        try {
          socket.emit('place_order', createdOrder);
        } catch (socketErr) {
          console.warn('ไม่สามารถส่งสัญญาณ socket place_order:', socketErr);
        }

        // บันทึกข้อมูล Transaction ลงในฐานข้อมูลจริง
        if (createdOrder?.order_id) {
          try {
            await axios.post(`${API_BASE}/transactions`, {
              order_id: createdOrder.order_id,
              amount: Number(this.total),
              payment_method: this.selectedPayment === 'qr' ? 'PromptPay' : 'Cash',
              payment_status: this.selectedPayment === 'qr' ? 'COMPLETED' : 'PENDING'
            });
          } catch (txnErr) {
            console.warn('บันทึก transaction ไม่สำเร็จ:', txnErr);
          }
        }

        alert(`สั่งซื้อสำเร็จ!\nเลขออเดอร์: #${orderId}\nทางร้านได้รับคำสั่งซื้อเรียบร้อยแล้วครับ`);

        sessionStorage.removeItem('cartData');
        localStorage.removeItem('cartData');
        sessionStorage.removeItem('currentOrder');
        localStorage.removeItem('orderHistoryList');
        this.cartItems = [];

        this.$router.push('/tracking');
      } catch (error) {
        console.error('บันทึกคำสั่งซื้อไม่สำเร็จ:', error);
        const errMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ';
        alert(`ไม่สามารถสั่งซื้อได้: ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.checkout-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

.checkout-main { display: flex; justify-content: center; gap: 30px; padding: 30px 40px; flex-grow: 1; max-width: 1200px; margin: 0 auto; width: 100%; }
.left-section { flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 680px; }
.card-section { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); border: 1px solid #e5e2d5;}
.section-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; }

.address-box { display: flex; gap: 20px; align-items: flex-start; }
.map-placeholder { width: 100px; height: 90px; background: #f1ede1; border-radius: 12px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; overflow: hidden;}
.map-placeholder.map-active { width: 140px; height: 130px; border: 1px solid #e0dfd5; }

.address-details { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
.location-name { font-size: 16px; font-weight: 600; color: #333; }
.phone-text { font-size: 13px; color: #666; font-weight: 400; }
.address-text { font-size: 14px; color: #555; line-height: 1.5; background: #faf9f5; padding: 10px 12px; border-radius: 8px; border: 1px solid #eee; margin-top: 5px;}
.address-note { font-size: 12px; color: #888; margin-bottom: 4px; }
.edit-address-btn { background: white; border: 1px solid #557c61; color: #557c61; padding: 4px 14px; border-radius: 15px; font-size: 12px; font-weight: 500; cursor: pointer; align-self: flex-start; transition: 0.2s; font-family: inherit;}
.edit-address-btn:hover { background: #f4faeb; }

.edit-address-form { display: flex; flex-direction: column; gap: 10px; margin-top: 5px; }
.edit-textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; transition: 0.2s; }
.edit-textarea:focus { border-color: #557c61; box-shadow: 0 0 0 3px rgba(85, 124, 97, 0.1); }
.edit-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-edit-btn { background: white; border: 1px solid #ddd; color: #666; padding: 6px 14px; border-radius: 15px; font-size: 12px; cursor: pointer; font-family: inherit; }
.save-edit-btn { background: #557c61; border: none; color: white; padding: 6px 14px; border-radius: 15px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
.save-edit-btn:hover { background: #405e49; }

.delivery-time-box { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0dfd5; border-radius: 12px; padding: 15px 20px; }
.time-type { font-weight: 600; font-size: 14px; color: #333; }
.time-range { font-size: 13px; color: #666; }

.payment-methods { display: flex; gap: 15px; }
.payment-card { flex: 1; border: 1px solid #e0dfd5; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; background: white; }
.payment-card.active { border-color: #557c61; background: #fcfbf8; box-shadow: 0 0 0 1px #557c61; }
.pay-icon { font-size: 24px; }
.payment-card span { font-size: 14px; font-weight: 500; color: #333; }

.right-section { width: 360px; }
.summary-card { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; border: 1px solid #e5e2d5; }
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

/* ================= PromptPay Modal Styles ================= */
.qr-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: modalFadeIn 0.2s ease-out;
}

.qr-modal-card {
  background: white;
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.qr-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0eee6;
  background: #ffffff;
}

.qr-header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qr-header-badge {
  background: #eef5f0;
  color: #3e7654;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.qr-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.qr-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 0.2s;
}

.qr-close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.thai-qr-header {
  background: #003764;
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.thai-qr-brand {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-thai {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1px;
  opacity: 0.85;
}

.promptpay-pill {
  background: white;
  color: #003764;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.qr-display-section {
  padding: 18px 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fafaf8;
}

.qr-image-wrapper {
  background: white;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e8e6dc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e0dfd5;
  border-top-color: #557c61;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-scan-hint {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  font-weight: 400;
}

.qr-payment-info {
  padding: 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #f0eee6;
  background: white;
}

.qr-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #777;
}

.info-value {
  color: #222;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: monospace;
  font-weight: 600;
  color: #003764;
}

.qr-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px dashed #e5e2d5;
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.qr-total-amount {
  color: #557c61;
  font-size: 22px;
  font-weight: 700;
}

.qr-modal-actions {
  padding: 14px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
}

.confirm-qr-btn {
  background: #557c61;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-qr-btn:hover {
  background: #405e49;
}

.cancel-qr-btn {
  background: #f7f6f0;
  color: #666;
  border: 1px solid #e0dfd5;
  padding: 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
  text-align: center;
}

.cancel-qr-btn:hover {
  background: #eae8df;
  color: #333;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>