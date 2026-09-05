<template>
  <div class="floating-cart-container" v-if="itemCount > 0">
    <div class="cart-bar">
      <div class="cart-summary">
        <div class="cart-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="item-badge">{{ itemCount }}</span>
        </div>
        <div class="text-summary">
          <span class="label">รวมค่าอาหาร</span>
          <span class="count">{{ itemCount }} รายการ</span>
        </div>
      </div>
      
      <div class="total-price">
        ฿{{ total.toFixed(2) }}
      </div>
    </div>
    <button class="view-cart-btn" @click="$emit('view-cart')">
      รายการคำสั่งซื้อ 
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  itemCount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})
defineEmits(['view-cart'])
</script>

<style scoped>
.floating-cart-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #3e7654;
  padding: 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

.cart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon-wrapper {
  position: relative;
  background-color: rgba(255,255,255,0.2);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff3b30;
  color: white;
  font-size: 10px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #3e7654;
}

.text-summary {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  font-weight: bold;
}

.count {
  font-size: 12px;
  opacity: 0.9;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
}

.view-cart-btn {
  background-color: white;
  color: #3e7654;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;
}
</style>
