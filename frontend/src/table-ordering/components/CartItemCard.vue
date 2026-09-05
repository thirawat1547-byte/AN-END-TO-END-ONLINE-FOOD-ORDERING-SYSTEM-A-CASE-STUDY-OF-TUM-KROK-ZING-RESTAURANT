<template>
  <div class="cart-item">
    <div class="item-info">
      <h4 class="item-name">{{ item.menu_name }}</h4>
      <div class="customizations" v-if="item.spicyLevel !== 'normal' || item.specialInstructions">
        <span class="spicy-level" v-if="item.spicyLevel !== 'normal'">
          🌶️ {{ getSpicyLabel(item.spicyLevel) }}
        </span>
        <span class="special-note" v-if="item.specialInstructions">
          📝 {{ item.specialInstructions }}
        </span>
      </div>
      <div class="price">฿{{ item.price.toFixed(2) }}</div>
    </div>
    
    <div class="quantity-controls">
      <button class="qty-btn" @click="$emit('update-qty', item.quantity - 1)">-</button>
      <span class="qty-display">{{ item.quantity }}</span>
      <button class="qty-btn" @click="$emit('update-qty', item.quantity + 1)">+</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['update-qty'])

const getSpicyLabel = (level) => {
  const labels = {
    none: 'ไม่เผ็ด',
    less: 'เผ็ดน้อย',
    normal: 'เผ็ดกลาง',
    very: 'เผ็ดมาก'
  }
  return labels[level] || level
}
</script>

<style scoped>
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  flex: 1;
  padding-right: 16px;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.customizations {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}

.spicy-level, .special-note {
  font-size: 12px;
  color: #666;
}

.price {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: #3e7654;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.qty-display {
  font-size: 14px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
</style>
