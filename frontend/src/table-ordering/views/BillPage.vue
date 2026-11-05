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
            <div class="item-cal-tag" v-if="getItemCalories(item)">
              🔥 {{ getItemCalories(item) * item.quantity }} kcal
            </div>
          </div>
        </div>
        <div class="item-price">฿{{ (calculateItemTotal(item) * item.quantity).toFixed(2) }}</div>
      </div>
      
      <div class="bill-summary-total">
        <div class="bill-cal-row" v-if="billTotalCalories > 0">
          <span class="bill-cal-label">🔥 พลังงานรวมทั้งมื้อ (Total Calories)</span>
          <span class="bill-cal-val">{{ billTotalCalories.toLocaleString() }} kcal</span>
        </div>
        <div class="bill-price-row">
          <span>ราคารวมทั้งหมด</span>
          <span class="total-amount">฿{{ billTotal.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <div class="empty-bill" v-else>
      <p>ยังไม่มีรายการอาหารที่สั่ง</p>
    </div>

    <div class="checkout-footer" v-if="placedOrders.length > 0">
      <div style="margin: 16px; padding: 16px; background: #FAF9F5; border-radius: 16px; border: 1.5px solid #E5E7EB; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
          <span style="background: #003B70; color: white; padding: 2px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px;">PromptPay</span>
          <span style="background: #635bff; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">Stripe</span>
          <span style="background: #2d5a43; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">เงินสด</span>
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #1F2937; margin-bottom: 6px;">
          ยอดชำระ ฿{{ billTotal.toFixed(2) }}
        </div>
        <div style="font-size: 12px; color: #4B5563; line-height: 1.5;">
          🙋 เรียกพนักงานเพื่อเช็คบิล<br/>
          📱 <b>พร้อมเพย์</b>: พนักงานจะแสดง QR (ผ่าน Stripe) ให้สแกนจ่าย ยอดเข้าระบบอัตโนมัติ<br/>
          💵 <b>เงินสด</b>: ชำระกับพนักงานได้ที่โต๊ะ
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { placedOrders, billTotal, billTotalCalories, getItemCalories } = useCart()
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

.item-cal-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 4px;
}

.bill-summary-total {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-top: 2px solid #eee;
  margin-top: 16px;
}

.bill-cal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 8px 12px;
  border-radius: 8px;
}

.bill-cal-label {
  font-size: 13px;
  font-weight: 700;
  color: #b45309;
}

.bill-cal-val {
  font-size: 14px;
  font-weight: 800;
  color: #d97706;
}

.bill-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #3e7654;
  padding: 4px 0;
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
