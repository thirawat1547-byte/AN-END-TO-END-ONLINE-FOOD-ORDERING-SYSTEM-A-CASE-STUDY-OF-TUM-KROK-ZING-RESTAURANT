<template>
  <div class="menu-item-card" @click="$emit('select', item)">
    <div class="image-container">
      <img :src="item.image_url || 'https://placehold.co/400x300?text=Food'" :alt="item.menu_name" class="item-image" />
    </div>
    <div class="item-details">
      <h3 class="item-name">{{ item.menu_name }}</h3>
      <div class="price-action">
        <span class="item-price">฿{{ item.price.toFixed(2) }}</span>
      </div>
      <button class="add-button" @click.stop="$emit('add', item)">
        + Add
      </button>
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
defineEmits(['select', 'add'])
</script>

<style scoped>
.menu-item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.image-container {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-price {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}

.add-button {
  background-color: #3e7654;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.add-button:active {
  background-color: #2c543b;
}
</style>
