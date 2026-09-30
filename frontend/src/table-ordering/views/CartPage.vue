<template>
  <div class="cart-page">
    <OrderHeader :tableId="tableId" />

    <!-- 🛑 ป้ายแจ้งเตือนเมื่อร้านปิด -->
    <div v-if="!isStoreOpen" class="table-closed-banner">
      <div class="closed-banner-icon">🛑</div>
      <div class="closed-banner-info">
        <strong class="closed-banner-title">ขณะนี้ร้านปิดให้บริการชั่วคราว</strong>
        <p class="closed-banner-sub">ระบบงดรับคำสั่งซื้อจากโต๊ะอาหารในขณะนี้ ขออภัยในความไม่สะดวกครับ</p>
      </div>
      <span class="closed-banner-pill">ปิดร้าน</span>
    </div>

    <div class="back-nav" @click="goToMenu">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      เพิ่มรายการอาหาร
    </div>

    <div class="page-title-area">
      <h2 class="page-title">รายการอาหารที่คุณสั่ง</h2>
    </div>

    <div class="cart-list" v-if="cart.length > 0">
      <CartItemCard 
        v-for="item in cart" 
        :key="item.cartItemId"
        :item="item"
        @update-qty="(newQty) => updateQuantity(item.cartItemId, newQty)"
        @remove="removeFromCart(item.cartItemId)"
      />

      <!-- 🥗 ส่วนแสดงผลพลังงานรวมทั้งมื้อ (Total Calories) -->
      <div class="calories-summary-box" v-if="cart.length > 0">
        <div class="cal-box-header">
          <div class="cal-title-left">
            <div class="cal-badge-pill">
              <span class="cal-fire-icon">🔥</span>
              <span>ข้อมูลทางโภชนาการ</span>
            </div>
            <h4 class="cal-box-title">พลังงานรวมทั้งมื้อ (Total Calories)</h4>
          </div>
          <div class="cal-number-right">
            <span class="cal-total-value">{{ (cartTotalCalories || 0).toLocaleString() }}</span>
            <span class="cal-total-unit">kcal</span>
          </div>
        </div>

        <div class="cal-progress-section">
          <div class="cal-progress-bar-bg">
            <div 
              class="cal-progress-bar-fill" 
              :style="{ width: caloriesPercentage + '%' }"
              :class="{
                'cal-fill-healthy': cartTotalCalories <= 700,
                'cal-fill-balanced': cartTotalCalories > 700 && cartTotalCalories <= 1200,
                'cal-fill-high': cartTotalCalories > 1200
              }"
            ></div>
          </div>
          <div class="cal-progress-meta">
            <span class="cal-meta-desc">คิดเป็น <strong>{{ caloriesPercentage }}%</strong> ของพลังงานแนะนำต่อวัน (2,000 kcal)</span>
            <span class="cal-status-tag healthy" v-if="cartTotalCalories <= 700">🥗 มื้อเบาสบาย</span>
            <span class="cal-status-tag balanced" v-else-if="cartTotalCalories <= 1200">🍲 มื้ออิ่มพอดี</span>
            <span class="cal-status-tag high" v-else>🎉 มื้อจัดเต็ม</span>
          </div>
        </div>
      </div>
      
      <div class="cart-summary-total">
        <div class="cal-summary-row" v-if="cartTotalCalories > 0">
          <span class="cal-label">🔥 พลังงานรวมทั้งมื้อ (Total Calories)</span>
          <span class="cal-value">{{ (cartTotalCalories || 0).toLocaleString() }} kcal</span>
        </div>
        <div class="price-summary-row">
          <span>ราคารวม</span>
          <span class="total-amount">฿{{ cartTotal.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <div class="empty-cart" v-else>
      <p>ไม่มีรายการอาหารในตะกร้า</p>
      <button class="back-to-menu-btn" @click="goToMenu">กลับไปเลือกอาหาร</button>
    </div>

    <div class="checkout-footer" v-if="cart.length > 0">
      <div class="footer-summary">
        <div class="footer-info">
          <span class="footer-count">รายการอาหาร {{ cartItemCount }} รายการ</span>
          <span class="footer-cal" v-if="cartTotalCalories > 0">🔥 รวม {{ (cartTotalCalories || 0).toLocaleString() }} kcal</span>
        </div>
        <span class="footer-total">฿{{ cartTotal.toFixed(2) }}</span>
      </div>
      <button 
        class="checkout-btn" 
        :disabled="!isStoreOpen || isSubmitting"
        :class="{ 'disabled-btn': !isStoreOpen }"
        @click="promptConfirmOrder"
      >
        {{ !isStoreOpen ? '🛑 ร้านปิดบริการชั่วคราว' : 'สั่งอาหาร' }}
        <svg v-if="isStoreOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- 🛑 Pop-up Confirm Modal ยืนยันก่อนส่งออเดอร์เข้าครัว ป้องกันการสั่งซ้ำ -->
    <div v-if="showConfirmModal" class="confirm-modal-backdrop" @click.self="showConfirmModal = false">
      <div class="confirm-modal-box">
        <div class="confirm-modal-header">
          <div class="confirm-icon-circle">🍲</div>
          <h3 class="confirm-title">ยืนยันส่งรายการอาหารเข้าครัว?</h3>
          <p class="confirm-subtitle">โต๊ะอาหารหมายเลข <strong>{{ tableId }}</strong></p>
        </div>

        <div class="confirm-items-preview">
          <div class="preview-item-row" v-for="item in cart" :key="item.cartItemId">
            <span class="preview-item-name">{{ item.quantity }}x {{ item.name || item.menu_name }}</span>
            <span class="preview-item-price">฿{{ ((item.price || 0) * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="confirm-total-row">
          <span>รวมทั้งสิ้น ({{ cartItemCount }} รายการ)</span>
          <strong class="confirm-total-amount">฿{{ cartTotal.toFixed(2) }}</strong>
        </div>

        <div class="confirm-cal-row" v-if="cartTotalCalories > 0">
          <span class="confirm-cal-label">🔥 พลังงานรวมทั้งมื้อ</span>
          <span class="confirm-cal-val">{{ (cartTotalCalories || 0).toLocaleString() }} kcal</span>
        </div>

        <div class="confirm-warning-note">
          ⚠️ เมื่อกดยืนยัน รายการจะถูกส่งตรงเข้าจอครัวและเริ่มปรุงอาหารทันที กรุณาตรวจสอบความถูกต้องเพื่อป้องกันการสั่งซ้ำครับ
        </div>

        <div class="confirm-modal-actions">
          <button 
            type="button" 
            class="modal-btn-cancel" 
            :disabled="isSubmitting"
            @click="showConfirmModal = false"
          >
            ตรวจสอบอีกครั้ง
          </button>
          <button 
            type="button" 
            class="modal-btn-confirm" 
            :disabled="isSubmitting"
            @click="executePlaceOrder"
          >
            <span v-if="isSubmitting">กำลังส่งเข้าครัว...</span>
            <span v-else>✓ ยืนยันส่งอาหาร</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import OrderHeader from '../components/OrderHeader.vue'
import CartItemCard from '../components/CartItemCard.vue'
import { useCart } from '../composables/useCart'
import { API_BASE } from '../../config/api'
import { socket } from '../../config/socket'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'
const isSubmitting = ref(false)
const isStoreOpen = ref(true)
const showConfirmModal = ref(false)

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE}/settings`)
    if (res.data && res.data.is_open !== undefined) {
      isStoreOpen.value = Boolean(res.data.is_open)
    }
  } catch (err) {
    console.warn('โหลดสถานะร้านค้าไม่สำเร็จ:', err)
  }
})

const { cart, updateQuantity, cartTotal, cartItemCount, cartTotalCalories, placeOrderToHistory, removeFromCart } = useCart()

const caloriesPercentage = computed(() => {
  return Math.min(100, Math.round(((cartTotalCalories.value || 0) / 2000) * 100))
})

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}

// 1. กดสั่งอาหาร -> ตรวจสอบเงื่อนไขแล้วเปิด Pop-up Confirm Modal ก่อนส่งครัว
const promptConfirmOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return

  // ตรวจสอบสถานะร้านค้าจากเซิร์ฟเวอร์ก่อนเสมอ
  try {
    const checkRes = await axios.get(`${API_BASE}/settings`)
    if (checkRes.data && checkRes.data.is_open === false) {
      isStoreOpen.value = false
      alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถส่งออเดอร์เข้าห้องครัวได้ครับ')
      return
    }
  } catch (e) {}

  if (!isStoreOpen.value) {
    alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถส่งออเดอร์เข้าห้องครัวได้ครับ')
    return
  }

  // ตรวจสอบว่ามีเมนูที่ปิดการขายอยู่ในตะกร้าหรือไม่
  const unavailableItem = cart.value.find(item => item.is_available === false)
  if (unavailableItem) {
    alert(`ขออภัยครับ เมนู "${unavailableItem.menu_name || 'อาหารบางรายการ'}" ปิดรับออเดอร์ชั่วคราว กรุณาลบออกจากตะกร้าก่อนสั่งซื้อครับ`)
    return
  }

  // เปิด Confirm Modal เพื่อให้ลูกค้ายืนยัน ป้องกันการกดส่งซ้ำ
  showConfirmModal.value = true
}

// 2. กดยืนยันใน Confirm Modal -> ส่งข้อมูลไปยังเซิร์ฟเวอร์และห้องครัว
const executePlaceOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return
  isSubmitting.value = true
  const finalTotal = cartTotal.value

  try {
    const token = localStorage.getItem('access_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const parsedTableId = Number(String(tableId).replace(/\D/g, '')) || 1
    const orderPayload = {
      table_id: parsedTableId,
      order_type: 'DINE_IN',
      items: cart.value.map(item => {
        const notesList = []
        if (item.spicyLevel && item.spicyLevel !== 'normal') notesList.push(`เผ็ด: ${item.spicyLevel}`)
        if (item.specialInstructions) notesList.push(item.specialInstructions)
        if (item.addons && item.addons.length > 0) {
          notesList.push('เพิ่ม: ' + item.addons.map(a => a.name).join(', '))
        }

        let dishTypeVal = undefined
        if (item.specialInstructions && item.specialInstructions.includes('กับข้าว')) {
          dishTypeVal = 'กับข้าว'
        } else if (item.specialInstructions && item.specialInstructions.includes('ราดข้าว')) {
          dishTypeVal = 'ราดข้าว'
        }

        const validMenuId = Number(item.menu_id || item.id)
        return {
          menu_id: validMenuId,
          quantity: Number(item.quantity || 1),
          notes: notesList.join(' | ') || undefined,
          dish_type: dishTypeVal
        }
      })
    }

    // ส่งคำสั่งซื้อเข้า Backend เพื่อส่งต่อไปยังห้องครัว (Kitchen KDS) ทันที
    const res = await axios.post(`${API_BASE}/orders`, orderPayload, { headers })

    // ส่งสัญญาณ WebSocket แจ้งเตือนห้องครัวทันที
    try {
      socket.emit('place_order', res.data)
    } catch (socketErr) {
      console.warn('ไม่สามารถส่งสัญญาณ socket place_order จากโต๊ะ:', socketErr)
    }

    showConfirmModal.value = false
    placeOrderToHistory()
    router.push({ path: `/table/${tableId}/success`, query: { total: finalTotal, orderId: res.data?.order_id } })
  } catch (err) {
    console.error('ส่งออเดอร์เข้า Backend ไม่สำเร็จ:', err)
    const errMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ'
    alert(`ไม่สามารถส่งคำสั่งซื้อเข้าห้องครัวได้:\n${errMessage}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: white;
  padding-bottom: 100px;
  position: relative;
}

.back-nav {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
}

.page-title-area {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.cart-list {
  padding: 0 16px;
}

.cart-summary-total {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0 24px;
}

.cal-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 8px 12px;
  border-radius: 8px;
}

.cal-summary-row .cal-label {
  font-size: 12px;
  font-weight: 700;
  color: #b45309;
}

.cal-summary-row .cal-value {
  font-size: 13px;
  font-weight: 800;
  color: #d97706;
}

.price-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 4px 0;
}

.empty-cart {
  padding: 48px 16px;
  text-align: center;
  color: #666;
}

.back-to-menu-btn {
  margin-top: 16px;
  background-color: transparent;
  color: #3e7654;
  border: 1px solid #3e7654;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #3e7654;
  padding: 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  color: white;
  z-index: 100;
}

.footer-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.footer-total {
  font-weight: bold;
  font-size: 16px;
}

.checkout-btn {
  width: 100%;
  background-color: white;
  color: #3e7654;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkout-btn.disabled-btn {
  background-color: #94a3b8 !important;
  color: #f1f5f9 !important;
  cursor: not-allowed !important;
}

/* 🛑 ป้ายแจ้งเตือนร้านปิด */
.table-closed-banner {
  background-color: #fee2e2;
  border-bottom: 1.5px solid #ef4444;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.closed-banner-icon { font-size: 20px; }
.closed-banner-info { flex: 1; }
.closed-banner-title { font-size: 13px; font-weight: 700; color: #991b1b; }
.closed-banner-sub { font-size: 11px; color: #b91c1c; margin: 0; }
.closed-banner-pill {
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
}

/* 🛑 Pop-up Confirm Modal Styles */
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.confirm-modal-box {
  background: white;
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: scaleUp 0.2s ease-out;
}

.confirm-modal-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.confirm-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ecfdf5;
  border: 2px solid #a7f3d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 12px;
}

.confirm-title {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.confirm-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.confirm-items-preview {
  max-height: 140px;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.preview-item-name {
  color: #334155;
  font-weight: 600;
}

.preview-item-price {
  color: #059669;
  font-weight: 700;
}

.confirm-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
  font-size: 14px;
  color: #1e293b;
}

.confirm-total-amount {
  font-size: 18px;
  font-weight: 900;
  color: #047857;
}

.confirm-warning-note {
  font-size: 11px;
  line-height: 1.4;
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 8px 12px;
  border-radius: 10px;
}

.confirm-modal-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 10px;
  margin-top: 4px;
}

.modal-btn-cancel {
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.modal-btn-confirm {
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #059669;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #047857;
}

.modal-btn-confirm:disabled,
.modal-btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 🥗 TOTAL CALORIES NUTRITION STYLES */
.calories-summary-box {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fde68a;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 14px;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
}

.cal-box-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cal-title-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #b45309;
  background: rgba(254, 243, 199, 0.9);
  border: 1px solid #fcd34d;
  padding: 1px 8px;
  border-radius: 9999px;
  width: fit-content;
}

.cal-box-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.cal-number-right {
  display: flex;
  align-items: baseline;
  gap: 3px;
  background: white;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid #fde68a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cal-total-value {
  font-size: 18px;
  font-weight: 800;
  color: #d97706;
  font-family: monospace, sans-serif;
}

.cal-total-unit {
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
}

.cal-progress-section {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cal-progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(253, 230, 138, 0.5);
  border-radius: 9999px;
  overflow: hidden;
}

.cal-progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.cal-fill-healthy {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.cal-fill-balanced {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.cal-fill-high {
  background: linear-gradient(90deg, #ea580c, #f97316);
}

.cal-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #78350f;
  flex-wrap: wrap;
  gap: 4px;
}

.cal-meta-desc {
  font-size: 10.5px;
  color: #92400e;
}

.cal-status-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.cal-status-tag.healthy {
  background: #dcfce7;
  color: #15803d;
}

.cal-status-tag.balanced {
  background: #fef3c7;
  color: #b45309;
}

.cal-status-tag.high {
  background: #ffedd5;
  color: #c2410c;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-cal {
  font-size: 11px;
  color: #fde68a;
  font-weight: 600;
}

.confirm-cal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  color: #d97706;
  border-top: 1px dashed #fed7aa;
  margin-top: 6px;
}

.confirm-cal-label {
  font-weight: 600;
}

.confirm-cal-val {
  font-weight: 800;
}
</style>