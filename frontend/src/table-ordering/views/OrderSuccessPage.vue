<template>
  <div class="success-page">
    <OrderHeader :tableId="tableId" />
    
    <div class="status-container">
      <h2 class="page-title">สั่งอาหารสำเร็จ</h2>
      
      <div class="tracker">
        <div class="track-step active">
          <div class="step-icon">✓</div>
          <div class="step-label">ได้รับคำสั่งซื้อแล้ว</div>
        </div>
        <div class="track-line active"></div>
        <div class="track-step active">
          <div class="step-icon">🍳</div>
          <div class="step-label">กำลังจัดทำอาหาร</div>
        </div>
        <div class="track-line"></div>
        <div class="track-step">
          <div class="step-icon">🍽️</div>
          <div class="step-label">เสิร์ฟแล้ว</div>
        </div>
      </div>
      
      <div class="order-summary-box">
        <div class="summary-header">
          <span>รายการอาหารทั้งหมด</span>
          <span class="total-price">฿{{ orderTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-details">
          รอรับอาหารสักครู่นะคะ 😋
        </div>
      </div>
    </div>
    
    <div class="bottom-action">
      <button class="back-home-btn" @click="goToMenu">
        กลับไปหน้าสั่งอาหาร 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'

import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const orderTotal = computed(() => {
  return Number(route.query.total) || 0
})

const goToMenu = () => {
  router.push(`/table/${tableId}`)
}
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  position: relative;
}

.status-container {
  padding: 32px 24px;
  flex: 1;
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 40px;
}

.tracker {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48px;
  position: relative;
}

.track-line {
  flex: 1;
  height: 2px;
  background-color: #eee;
  margin-top: 15px;
  z-index: 1;
}

.track-line.active {
  background-color: #3e7654;
}

.track-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  z-index: 2;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #eee;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
}

.track-step.active .step-icon {
  background-color: #3e7654;
  color: white;
}

.step-label {
  font-size: 11px;
  text-align: center;
  color: #999;
}

.track-step.active .step-label {
  color: #333;
  font-weight: 500;
}

.order-summary-box {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.total-price {
  font-size: 18px;
  color: #3e7654;
}

.summary-details {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 20px;
}

.bottom-action {
  padding: 16px;
  background-color: #3e7654;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.back-home-btn {
  width: 100%;
  background-color: white;
  color: #3e7654;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
