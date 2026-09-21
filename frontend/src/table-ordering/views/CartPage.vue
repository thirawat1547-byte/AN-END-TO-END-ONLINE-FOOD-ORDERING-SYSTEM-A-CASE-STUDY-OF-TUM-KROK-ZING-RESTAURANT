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
      
      <div class="cart-summary-total">
        <span>ราคารวม</span>
        <span class="total-amount">฿{{ cartTotal.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="empty-cart" v-else>
      <p>ไม่มีรายการอาหารในตะกร้า</p>
      <button class="back-to-menu-btn" @click="goToMenu">กลับไปเลือกอาหาร</button>
    </div>

    <div class="checkout-footer" v-if="cart.length > 0">
      <div class="footer-summary">
        <span class="footer-count">รายการอาหาร {{ cartItemCount }} รายการ</span>
        <span class="footer-total">฿{{ cartTotal.toFixed(2) }}</span>
      </div>
      <button 
        class="checkout-btn" 
        :disabled="!isStoreOpen || isSubmitting"
        :class="{ 'disabled-btn': !isStoreOpen }"
        @click="placeOrder"
      >
        {{ !isStoreOpen ? '🛑 ร้านปิดบริการชั่วคราว' : 'สั่งอาหาร' }}
        <svg v-if="isStoreOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

import { onMounted } from 'vue'
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

const { cart, updateQuantity, cartTotal, cartItemCount, placeOrderToHistory, removeFromCart } = useCart()

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}

const placeOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return

  // ตรวจสอบสถานะร้านค้าจากเซิร์ฟเวอร์ก่อนส่งออเดอร์เสมอ
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

        const validMenuId = Number(item.menu_id || item.id)
        return {
          menu_id: validMenuId,
          quantity: Number(item.quantity || 1),
          notes: notesList.join(' | ') || undefined
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
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
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
</style>