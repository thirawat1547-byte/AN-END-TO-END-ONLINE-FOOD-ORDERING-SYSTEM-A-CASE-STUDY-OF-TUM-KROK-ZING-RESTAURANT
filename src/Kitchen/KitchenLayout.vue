<!-- src/views/KitchenLayout.vue -->
<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <!-- ล็อกขนาดหน้าจอแน่นด้วย h-screen w-screen overflow-hidden -->
  <div class="flex h-screen w-screen bg-[#F4F1EA] font-['Prompt',sans-serif] overflow-hidden">
    <Sidebar />
    <!-- เปลี่ยนจาก overflow-hidden เป็น overflow-y-auto ตรงนี้ครับ -->
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>