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
      <div style="margin: 16px; padding: 16px; background: #FAF9F5; border-radius: 16px; border: 1.5px solid #E5E7EB; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
          <span style="background: #003B70; color: white; padding: 2px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px;">PromptPay</span>
          <span style="background: #635bff; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">Stripe</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #1F2937; margin-bottom: 6px;">
          สแกน QR เพื่อชำระเงิน ฿{{ billTotal.toFixed(2) }}
        </div>
        <img v-if="paymentQrUrl" :src="paymentQrUrl" alt="Payment QR" style="width: 170px; height: 170px; margin: 0 auto; display: block; border: 2px solid #003B70; border-radius: 12px; background: white; padding: 6px;" />
        <div style="font-size: 11px; color: #6B7280; margin-top: 8px; line-height: 1.4;">
          ร้านตำครกซิ่ง | พร้อมเพย์: 081-234-5678<br/>
          (สามารถสแกนจ่ายผ่านแอปธนาคาร หรือแจ้งชำระที่เคาน์เตอร์ได้ครับ)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import OrderHeader from '../components/OrderHeader.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { placedOrders, billTotal } = useCart()
const paymentQrUrl = ref('')

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePromptPayPayload(target, amount) {
  const cleanTarget = String(target || '0812345678').replace(/[^0-9]/g, '');
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
  if (amount !== undefined && amount !== null && Number(amount) > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  }
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

const generatePaymentQr = async () => {
  if (billTotal.value <= 0) return
  try {
    const payload = generatePromptPayPayload('081-234-5678', billTotal.value)
    paymentQrUrl.value = await QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#003B70', light: '#FFFFFF' }
    })
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  generatePaymentQr()
})

watch(billTotal, () => {
  generatePaymentQr()
})

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
