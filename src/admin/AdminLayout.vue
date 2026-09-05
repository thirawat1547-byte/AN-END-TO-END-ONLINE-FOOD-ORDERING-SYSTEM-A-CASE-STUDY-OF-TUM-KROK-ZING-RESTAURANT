<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminStore } from './store/adminData'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(true)
const isMobileOpen = ref(false)

const navLinks = [
  { name: 'ภาพรวมยอดขาย', path: '/admin/dashboard', icon: '📊', badge: null },
  { name: 'จัดการเมนูอาหาร', path: '/admin/menus', icon: '🌶️', badge: () => adminStore.menus.length },
  { name: 'คลังวัตถุดิบ & สูตร', path: '/admin/inventory', icon: '📦', badge: () => adminStore.ingredients.filter(i => i.quantity_in_stock <= i.reorder_level).length || null, badgeColor: 'bg-red-500' },
  { name: 'ผังโต๊ะอาหาร', path: '/admin/tables', icon: '🪑', badge: () => adminStore.tables.filter(t => t.status === 'Occupied').length + ' โต๊ะ' },
  { name: 'จอห้องครัว KDS', path: '/admin/kds', icon: '🍳', badge: () => adminStore.orders.filter(o => ['Pending', 'Cooking'].includes(o.status)).length || null, badgeColor: 'bg-amber-500' },
  { name: 'โปรโมชัน & ส่วนลด', path: '/admin/promotions', icon: '🏷️', badge: () => adminStore.promotions.filter(p => p.is_active).length },
  { name: 'ประวัติบิล & การเงิน', path: '/admin/transactions', icon: '💰', badge: null },
  { name: 'ตั้งค่าร้านค้า', path: '/admin/settings', icon: '⚙️', badge: null }
]

const currentTitle = computed(() => {
  const current = navLinks.find(link => route.path === link.path || (link.path !== '/admin' && route.path.startsWith(link.path)))
  return current ? current.name : 'ระบบจัดการร้าน'
})

const lowStockCount = computed(() => {
  return adminStore.ingredients.filter(i => i.quantity_in_stock <= i.reorder_level).length
})

const activeCookingOrders = computed(() => {
  return adminStore.orders.filter(o => ['Pending', 'Cooking'].includes(o.status)).length
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
    <!-- Sidebar for Desktop -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Brand Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            🌶️
          </div>
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h1 class="font-bold text-base tracking-tight leading-tight text-white flex items-center gap-1">
              ตำครกซิ่ง <span class="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">PRO</span>
            </h1>
            <p class="text-xs text-slate-400">Admin & Kitchen System</p>
          </div>
        </div>
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="ย่อ/ขยาย เมนู"
        >
          <span v-if="isSidebarOpen">◀</span>
          <span v-else>▶</span>
        </button>
      </div>

      <!-- Live Store Status Banner -->
      <div v-show="isSidebarOpen" class="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-medium text-slate-200">สถานะร้าน: <b class="text-emerald-400">{{ adminStore.storeSettings.isOpen ? 'เปิดบริการ' : 'ปิดร้าน' }}</b></span>
        </div>
        <button 
          @click="adminStore.storeSettings.isOpen = !adminStore.storeSettings.isOpen"
          class="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
        >
          สลับ
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
        <router-link
          v-for="item in navLinks"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group',
            route.path === item.path 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/30' 
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          ]"
        >
          <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
          <span v-show="isSidebarOpen" class="flex-1 truncate">{{ item.name }}</span>
          <span 
            v-if="item.badge && item.badge() && isSidebarOpen" 
            :class="[
              'text-[10px] px-2 py-0.5 rounded-full font-bold text-white',
              item.badgeColor || 'bg-slate-700'
            ]"
          >
            {{ item.badge() }}
          </span>
        </router-link>
      </nav>

      <!-- Quick Back to Customer Web -->
      <div class="p-3 border-t border-slate-800">
        <router-link 
          to="/" 
          class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
        >
          <span class="text-base">📱</span>
          <span v-show="isSidebarOpen">ไปหน้าสั่งอาหารลูกค้า</span>
        </router-link>
      </div>

      <!-- User Footer -->
      <div class="p-3 border-t border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
          AD
        </div>
        <div v-show="isSidebarOpen" class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white truncate">ผู้จัดการร้าน</p>
          <p class="text-[10px] text-slate-400 truncate">admin@tumkrokzing.com</p>
        </div>
      </div>
    </aside>

    <!-- Main Container -->
    <div 
      :class="[
        'flex-1 flex flex-col transition-all duration-300 min-w-0',
        isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
      ]"
    >
      <!-- Top Navbar -->
      <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileOpen = !isMobileOpen" 
            class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ☰
          </button>
          <div>
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              {{ currentTitle }}
            </h2>
            <p class="text-xs text-slate-500 hidden sm:block">ระบบสั่งอาหารออนไลน์แบบครบวงจร กรณีศึกษาร้านตำครกซิ่ง</p>
          </div>
        </div>

        <!-- Top Right Quick Info -->
        <div class="flex items-center gap-3">
          <!-- Kitchen Alert -->
          <router-link 
            to="/admin/kds"
            class="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100 transition"
          >
            <span>🍳 ครัวกำลังทำ: <b>{{ activeCookingOrders }}</b> ออเดอร์</span>
            <span v-if="activeCookingOrders > 0" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </router-link>

          <!-- Stock Alert Badge -->
          <router-link 
            v-if="lowStockCount > 0"
            to="/admin/inventory"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition"
          >
            <span>⚠️ วัตถุดิบใกล้หมด ({{ lowStockCount }})</span>
          </router-link>

          <!-- CSV Export Button -->
          <button 
            @click="adminStore.exportSalesCSV()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            title="ดาวน์โหลดรายงานยอดขาย"
          >
            <span>📥 Export CSV</span>
          </button>
        </div>
      </header>

      <!-- Mobile Sidebar Overlay -->
      <div 
        v-if="isMobileOpen" 
        @click="isMobileOpen = false" 
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
      >
        <div 
          @click.stop 
          class="w-64 h-full bg-slate-900 text-white p-4 flex flex-col"
        >
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 class="font-bold text-base text-amber-400">ตำครกซิ่ง Admin</h3>
            <button @click="isMobileOpen = false" class="text-slate-400 hover:text-white text-xl">✕</button>
          </div>
          <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
            <router-link
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileOpen = false"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition',
                route.path === item.path ? 'bg-amber-500 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              ]"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Main Router View -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
