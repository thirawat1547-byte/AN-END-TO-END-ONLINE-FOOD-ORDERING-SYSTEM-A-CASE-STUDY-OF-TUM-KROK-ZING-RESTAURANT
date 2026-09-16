<template>
  <div class="cart-page">
    <OrderHeader :tableId="tableId" />
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
      <button class="checkout-btn" @click="placeOrder">
        สั่งอาหาร 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'
const isSubmitting = ref(false)

const { cart, updateQuantity, cartTotal, cartItemCount, placeOrderToHistory, removeFromCart } = useCart()

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}

const placeOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return
  isSubmitting.value = true
  const finalTotal = cartTotal.value

  try {
    const token = localStorage.getItem('access_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const orderPayload = {
      table_id: Number(tableId) || 1,
      order_type: 'DINE_IN',
      items: cart.value.map(item => {
        const notesList = []
        if (item.spicyLevel) notesList.push(`เผ็ด: ${item.spicyLevel}`)
        if (item.specialInstructions) notesList.push(item.specialInstructions)
        if (item.addons && item.addons.length > 0) {
          notesList.push('เพิ่ม: ' + item.addons.map(a => a.name).join(', '))
        }

        return {
          menu_id: Number(item.id || item.menu_id || 1),
          quantity: Number(item.quantity || 1),
          notes: notesList.join(' | ') || undefined
        }
      })
    }

    // ส่งคำสั่งซื้อเข้า Backend เพื่อส่งต่อไปยังห้องครัว (Kitchen KDS) ทันที
    await axios.post(`${API_BASE}/orders`, orderPayload, { headers })

    placeOrderToHistory()
    router.push({ path: `/table/${tableId}/success`, query: { total: finalTotal } })
  } catch (err) {
    console.warn('ส่งออเดอร์เข้า Backend ไม่สำเร็จ กำลังบันทึกในระบบท้องถิ่น:', err)
    // Fallback: บันทึกเข้าประวัติท้องถิ่น
    placeOrderToHistory()
    router.push({ path: `/table/${tableId}/success`, query: { total: finalTotal } })
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
</style>