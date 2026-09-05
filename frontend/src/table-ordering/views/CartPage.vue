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
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'
import CartItemCard from '../components/CartItemCard.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { cart, updateQuantity, cartTotal, cartItemCount, placeOrderToHistory } = useCart()

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}

const placeOrder = () => {
  // Simulate API call to place order
  const finalTotal = cartTotal.value;
  setTimeout(() => {
    placeOrderToHistory()
    router.push({ path: `/table/${tableId}/success`, query: { total: finalTotal } })
  }, 500)
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
