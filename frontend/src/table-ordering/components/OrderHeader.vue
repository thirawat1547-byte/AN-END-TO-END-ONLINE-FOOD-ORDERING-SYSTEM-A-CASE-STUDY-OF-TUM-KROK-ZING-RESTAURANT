<template>
  <header class="order-header">
    <div class="logo-area">
      <div class="logo-circle">
        <span class="logo-text">TKZ</span>
      </div>
      <span class="brand-name">TUMKROKZING</span>
    </div>
    <div class="table-info">
      Table {{ tableId }}
    </div>
  </header>
</template>

<script setup>
defineProps({
  tableId: {
    type: [String, Number],
    required: true
  }
})
</script>

<style scoped>
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3e7654;
  color: white;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-text {
  color: #3e7654;
  font-weight: bold;
  font-size: 10px;
}

.brand-name {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.table-info {
  font-size: 14px;
  font-weight: 500;
}
</style>
