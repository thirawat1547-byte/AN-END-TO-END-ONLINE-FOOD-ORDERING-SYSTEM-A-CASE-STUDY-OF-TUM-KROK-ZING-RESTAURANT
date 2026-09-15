<template>
  <div class="cart-item-card">
    <div class="item-info">
      <h4 class="item-name">{{ item.menu_name }}</h4>
      
      <div class="item-details" v-if="hasDetails">
        <div v-if="item.spicyLevel" class="detail-line">
          🌶️ {{ item.spicyLevel }}
        </div>
        <div v-if="item.specialInstructions" class="detail-line">
          📝 {{ item.specialInstructions }}
        </div>
        <div v-for="(addon, index) in item.addons" :key="index" class="detail-line">
          + {{ addon.name }} (฿{{ addon.price.toFixed(2) }})
        </div>
      </div>
      
      <div class="item-price">฿{{ itemTotal.toFixed(2) }}</div>
      <!-- แสดงแคลอรีต่อรายการ -->
      <div class="item-calories" v-if="item.calories">
        🔥 พลังงาน: {{ item.calories * item.quantity }} กิโลแคลอรี
      </div>
    </div>
    
    <div class="item-actions">
      <button class="circle-btn delete-btn" @click="$emit('remove')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      
      <button 
        class="circle-btn qty-btn" 
        @click="decreaseQty" 
        :disabled="item.quantity <= 1"
        :class="{ 'disabled-btn': item.quantity <= 1 }"
      >
        -
      </button>
      
      <span class="qty-number">{{ item.quantity }}</span>
      
      <button class="circle-btn qty-btn" @click="increaseQty">
        +
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-qty', 'remove'])

const hasDetails = computed(() => {
  return props.item.spicyLevel || 
         props.item.specialInstructions || 
         (props.item.addons && props.item.addons.length > 0)
})

const itemTotal = computed(() => {
  let addonTotal = 0
  if (props.item.addons) {
    addonTotal = props.item.addons.reduce((sum, a) => sum + a.price, 0)
  }
  return (props.item.price + addonTotal) * props.item.quantity
})

const decreaseQty = () => {
  if (props.item.quantity > 1) {
    emit('update-qty', props.item.quantity - 1)
  }
}

const increaseQty = () => {
  emit('update-qty', props.item.quantity + 1)
}
</script>

<style scoped>
.cart-item-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  flex: 1;
  padding-right: 12px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.item-details {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-price {
  font-size: 14px;
  color: #333;
  margin-top: 2px;
}

.item-calories {
  font-size: 12px;
  color: #e67e22;
  margin-top: 2px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn {
  border: 1px solid #ff3b30;
  color: #ff3b30;
  margin-right: 4px;
}

.delete-btn:active {
  background-color: #fff0f0;
}

.qty-btn {
  border: 1px solid #ddd;
  color: #3e7654;
  font-weight: bold;
  font-size: 16px;
}

.qty-btn:active {
  background-color: #f0f8f3;
}

.disabled-btn {
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
}

.qty-number {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 16px;
  text-align: center;
}
</style>