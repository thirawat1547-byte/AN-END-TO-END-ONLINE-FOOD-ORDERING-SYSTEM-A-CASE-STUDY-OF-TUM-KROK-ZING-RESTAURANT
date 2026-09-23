<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import logoImg from '../assets/logo.png'

const route = useRoute()
const isCollapsed = ref(false)

const navLinks = [
  { name: 'จอห้องครัว (KDS)', path: '/kitchen/monitor', icon: '🍳' },
  { name: 'จัดการโต๊ะอาหาร', path: '/kitchen/manage', icon: '🪑' },
  { name: 'จัดการสต็อกสินค้า', path: '/kitchen/inventory', icon: '📦' },
  { name: 'รายงานยอดขาย', path: '/kitchen/sales', icon: '📊' },
]

const isActive = (path) => {
  if (path === '/kitchen/manage') {
    return route.path.startsWith('/kitchen/manage') || route.path.startsWith('/kitchen/table')
  }
  return route.path === path || route.path.startsWith(path)
}
</script>

<template>
  <aside 
    :class="[
      'h-full bg-[#365c44] text-white flex flex-col transition-all duration-300 shadow-xl border-r border-[#2d4d39] flex-shrink-0 select-none',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Top Brand -->
    <div class="p-4 flex items-center justify-between border-b border-[#2d4d39]/80">
      <div class="flex items-center gap-3 overflow-hidden">
        <img 
          :src="logoImg" 
          alt="Logo" 
          class="h-10 w-auto object-contain flex-shrink-0 drop-shadow" 
        />
        <div v-show="!isCollapsed" class="min-w-0 transition-opacity duration-200">
          <h2 class="font-bold text-sm tracking-wide text-white truncate">ตำครกซิ่ง</h2>
          <p class="text-[11px] text-emerald-200/75">Kitchen System</p>
        </div>
      </div>
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-[#2d4d39] transition text-xs"
        title="ย่อ/ขยาย"
      >
        <span v-if="!isCollapsed">◀</span>
        <span v-else>▶</span>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto">
      <router-link
        v-for="item in navLinks"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all',
          isActive(item.path)
            ? 'bg-[#48785A] text-white font-semibold shadow-md border border-emerald-400/30'
            : 'text-emerald-100/80 hover:bg-[#2d4d39] hover:text-white'
        ]"
      >
        <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
        <span v-show="!isCollapsed" class="truncate">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Bottom Links -->
    <div class="p-3 border-t border-[#2d4d39]/80 space-y-1">
      <router-link
        to="/admin/dashboard"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-200/80 hover:bg-[#2d4d39] hover:text-white transition"
      >
        <span class="text-base flex-shrink-0">⚙️</span>
        <span v-show="!isCollapsed" class="truncate">จัดการร้าน (Admin)</span>
      </router-link>
      <router-link
        to="/"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-200/80 hover:bg-[#2d4d39] hover:text-white transition"
      >
        <span class="text-base flex-shrink-0">📱</span>
        <span v-show="!isCollapsed" class="truncate">หน้าสั่งอาหารลูกค้า</span>
      </router-link>
    </div>
  </aside>
</template>
