<template>
  <div class="category-tabs-container">
    <div class="category-tabs">
      <button 
        v-for="category in categories" 
        :key="category.id"
        class="category-tab"
        :class="{ active: modelValue === category.id }"
        @click="$emit('update:modelValue', category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number],
    required: true
  }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-tabs-container {
  background-color: white;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 56px; /* Below header */
  z-index: 99;
}

.category-tabs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.category-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.category-tab {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background-color: white;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab.active {
  background-color: #3e7654;
  color: white;
  border-color: #3e7654;
}
</style>
