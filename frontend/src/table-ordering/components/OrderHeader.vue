<template>
  <header class="order-header">
    <div class="logo-area" @click="goToMenu">
      <div class="logo-circle">
        <span class="logo-text">TKZ</span>
      </div>
      <span class="brand-name">TUMKROKZING</span>
    </div>
    <div class="right-actions">
      <div class="table-info">
        โต๊ะ {{ tableId }}
      </div>
      <button class="bill-btn" @click="goToBill">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        บิล
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  tableId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()

const goToMenu = () => {
  router.push(`/table/${props.tableId}`)
}

const goToBill = () => {
  router.push(`/table/${props.tableId}/bill`)
}
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
  cursor: pointer;
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

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-info {
  font-size: 14px;
  font-weight: 500;
}

.bill-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.bill-btn:hover {
  background-color: white;
  color: #3e7654;
}
</style>
