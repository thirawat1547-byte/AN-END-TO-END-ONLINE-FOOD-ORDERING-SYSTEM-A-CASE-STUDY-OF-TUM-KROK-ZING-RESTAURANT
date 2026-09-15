<template>
  <div class="bill-page">
    <OrderHeader :tableId="tableId" />
    
    <div class="back-nav" @click="goToMenu">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      กลับไปหน้าสั่งอาหาร
    </div>

    <div class="page-title-area">
      <h2 class="page-title">สรุปยอดบิล (Table {{ tableId }})</h2>
    </div>

    <div class="bill-list" v-if="placedOrders.length > 0">
      <div v-for="(item, index) in placedOrders" :key="index" class="bill-item">
        <div class="item-info">
          <div class="item-qty">{{ item.quantity }}x</div>
          <div class="item-name">
            {{ item.menu_name }}
            <div v-if="item.spicyLevel && item.spicyLevel !== 'normal'" class="item-note">
              ความเผ็ด: {{ item.spicyLevel }}
            </div>
            <div v-for="addon in item.addons" :key="addon.name" class="item-note">
              + {{ addon.name }} (฿{{ addon.price }})
            </div>
            <div v-if="item.specialInstructions" class="item-note">
              {{ item.specialInstructions }}
            </div>
          </div>
        </div>
        <div class="item-price">฿{{ (calculateItemTotal(item) * item.quantity).toFixed(2) }}</div>
      </div>
      
      <div class="bill-summary-total">
        <span>ราคารวมทั้งหมด</span>
        <span class="total-amount">฿{{ billTotal.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="empty-bill" v-else>
      <p>ยังไม่มีรายการอาหารที่สั่ง</p>
    </div>

    <div class="checkout-footer" v-if="placedOrders.length > 0">
      <div class="pay-at-counter-note">
        กรุณาชำระเงินที่หน้าเคาน์เตอร์
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { placedOrders, billTotal } = useCart()

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}

const calculateItemTotal = (item) => {
  const addonTotal = item.addons ? item.addons.reduce((sum, addon) => sum + addon.price, 0) : 0
  return item.price + addonTotal
}
</script>

<style scoped>
.bill-page {
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

.bill-list {
  padding: 16px;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
}

.item-info {
  display: flex;
  gap: 12px;
}

.item-qty {
  font-weight: bold;
  color: #3e7654;
  min-width: 24px;
}

.item-name {
  color: #333;
  font-size: 15px;
}

.item-note {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.item-price {
  font-weight: 600;
  color: #333;
}

.bill-summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  font-size: 18px;
  font-weight: bold;
  color: #3e7654;
  border-top: 2px solid #eee;
  margin-top: 16px;
}

.empty-bill {
  padding: 48px 16px;
  text-align: center;
  color: #666;
}

.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
  z-index: 100;
}

.pay-at-counter-note {
  width: 100%;
  background-color: #f5f5f5;
  color: #333;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  border: 1px dashed #ccc;
}
</style>
