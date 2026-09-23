<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminStore } from './store/adminData'
import logoImg from '../assets/logo.png'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(true)
const isMobileOpen = ref(false)

const navLinks = [
  { name: 'ภาพรวมยอดขาย', path: '/admin/dashboard', icon: '📊', badge: null },
  { name: 'จัดการเมนูอาหาร', path: '/admin/menus', icon: '🌶️', badge: () => adminStore.menus.length },
  { name: 'คลังวัตถุดิบ & สูตร', path: '/admin/inventory', icon: '📦', badge: () => adminStore.ingredients.filter(i => Number(i.quantity_in_stock) <= Number(i.reorder_level)).length || null, badgeColor: 'bg-red-500' },
  { name: 'ผังโต๊ะอาหาร', path: '/admin/tables', icon: '🪑', badge: () => adminStore.tables.filter(t => t.status === 'Occupied' || t.status === 'OCCUPIED').length + ' โต๊ะ' },
  { name: 'จอห้องครัว KDS', path: '/admin/kds', icon: '🍳', badge: () => adminStore.orders.filter(o => ['Pending', 'Cooking', 'PENDING', 'COOKING'].includes(o.status)).length || null, badgeColor: 'bg-[#2d5a43]' },
  { name: 'โปรโมชัน & ส่วนลด', path: '/admin/promotions', icon: '🏷️', badge: () => adminStore.promotions.filter(p => p.is_active).length },
  { name: 'ประวัติบิล & การเงิน', path: '/admin/transactions', icon: '💰', badge: null },
  { name: 'ตั้งค่าร้านค้า', path: '/admin/settings', icon: '⚙️', badge: null }
]

const currentTitle = computed(() => {
  const current = navLinks.find(link => route.path === link.path || (link.path !== '/admin' && route.path.startsWith(link.path)))
  return current ? current.name : 'ระบบจัดการร้าน'
})

const lowStockCount = computed(() => {
  return adminStore.ingredients.filter(i => Number(i.quantity_in_stock) <= Number(i.reorder_level)).length
})

const activeCookingOrders = computed(() => {
  return adminStore.orders.filter(o => ['Pending', 'Cooking', 'PENDING', 'COOKING'].includes(o.status)).length
})

let pollTimer = null
onMounted(async () => {
  await adminStore.initAdminData()
  pollTimer = setInterval(() => {
    adminStore.initAdminData()
  }, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f6f0] flex text-slate-800 font-sans">
    <!-- Sidebar for Desktop -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-[#183324] text-white transition-all duration-300 flex flex-col shadow-2xl border-r border-[#244633]',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Brand Header -->
      <div class="p-4 border-b border-[#244633] flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <img 
            :src="logoImg" 
            alt="Logo ตำครกซิ่ง" 
            class="h-11 md:h-12 w-auto max-h-12 object-contain flex-shrink-0 drop-shadow-md transition-transform hover:scale-105" 
          />
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h1 class="font-bold text-base tracking-tight leading-tight text-white">
              ตำครกซิ่ง
            </h1>
            <p class="text-xs text-emerald-200/60">Admin & Kitchen System</p>
          </div>
        </div>
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="hidden md:flex p-1.5 rounded-lg text-emerald-200/60 hover:text-white hover:bg-[#244633] transition"
          title="ย่อ/ขยาย เมนู"
        >
          <span v-if="isSidebarOpen">◀</span>
          <span v-else>▶</span>
        </button>
      </div>

      <!-- Live Store Status Banner -->
      <div 
        v-show="isSidebarOpen" 
        :class="[
          'px-4 py-3 mx-3 my-3 rounded-xl border flex items-center justify-between transition-colors',
          adminStore.storeSettings.isOpen 
            ? 'bg-[#244633]/80 border-[#2d5a43]/60' 
            : 'bg-red-950/40 border-red-500/50'
        ]"
      >
        <div class="flex items-center gap-2">
          <span 
            :class="[
              'w-2.5 h-2.5 rounded-full',
              adminStore.storeSettings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            ]"
          ></span>
          <span class="text-xs font-medium text-emerald-100">
            สถานะร้าน: 
            <b :class="adminStore.storeSettings.isOpen ? 'text-emerald-300' : 'text-red-400 font-bold'">
              {{ adminStore.storeSettings.isOpen ? 'เปิดบริการ' : 'ปิดร้าน' }}
            </b>
          </span>
        </div>
        <button 
          @click="adminStore.toggleStoreStatus()"
          :class="[
            'text-[10px] px-2.5 py-1 rounded transition font-bold',
            adminStore.storeSettings.isOpen 
              ? 'bg-[#2d5a43] hover:bg-[#386b51] text-emerald-100' 
              : 'bg-red-700 hover:bg-red-600 text-white'
          ]"
          :title="adminStore.storeSettings.isOpen ? 'กดเพื่อปิดร้าน' : 'กดเพื่อเปิดร้าน'"
        >
          {{ adminStore.storeSettings.isOpen ? 'ปิดร้าน' : 'เปิดร้าน' }}
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
              ? 'bg-[#2d5a43] text-white shadow-md shadow-black/20 font-semibold' 
              : 'text-emerald-100/75 hover:bg-[#244633] hover:text-white'
          ]"
        >
          <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
          <span v-show="isSidebarOpen" class="flex-1 truncate">{{ item.name }}</span>
          <span 
            v-if="item.badge && item.badge() && isSidebarOpen" 
            :class="[
              'text-[10px] px-2 py-0.5 rounded-full font-bold text-white',
              item.badgeColor || 'bg-[#244633] text-emerald-200 border border-emerald-600/30'
            ]"
          >
            {{ item.badge() }}
          </span>
        </router-link>
      </nav>

      <!-- Quick Back to Customer Web -->
      <div class="p-3 border-t border-[#244633]">
        <router-link 
          to="/" 
          class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-emerald-200/70 hover:text-white hover:bg-[#244633] transition"
        >
          <span class="text-base">📱</span>
          <span v-show="isSidebarOpen">ไปหน้าสั่งอาหารลูกค้า</span>
        </router-link>
      </div>

      <!-- User Footer -->
      <div class="p-3 border-t border-[#244633] flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#2d5a43] border border-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center flex-shrink-0 text-sm">
          AD
        </div>
        <div v-show="isSidebarOpen" class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white truncate">ผู้จัดการร้าน</p>
          <p class="text-[10px] text-emerald-200/60 truncate">admin@tumkrokzing.com</p>
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
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileOpen = !isMobileOpen" 
            class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ☰
          </button>
          <div>
            <h2 class="text-xl font-bold text-[#183324] flex items-center gap-2">
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
            class="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2d5a43] text-xs font-semibold hover:bg-emerald-100 transition"
          >
            <span>🍳 ครัวกำลังทำ: <b>{{ activeCookingOrders }}</b> ออเดอร์</span>
            <span v-if="activeCookingOrders > 0" class="w-2 h-2 rounded-full bg-[#2d5a43] animate-ping"></span>
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
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white text-xs font-semibold shadow-sm transition"
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
        class="fixed inset-0 z-50 bg-[#183324]/70 backdrop-blur-sm md:hidden"
      >
        <div 
          @click.stop 
          class="w-64 h-full bg-[#183324] text-white p-4 flex flex-col shadow-2xl"
        >
          <div class="flex items-center justify-between pb-4 border-b border-[#244633]">
            <div class="flex items-center gap-2.5">
              <img :src="logoImg" alt="Logo ตำครกซิ่ง" class="h-10 w-auto object-contain flex-shrink-0 drop-shadow-md" />
              <h3 class="font-bold text-base text-emerald-300">ตำครกซิ่ง Admin</h3>
            </div>
            <button @click="isMobileOpen = false" class="text-emerald-200/70 hover:text-white text-xl">✕</button>
          </div>
          <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
            <router-link
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileOpen = false"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition',
                route.path === item.path ? 'bg-[#2d5a43] text-white font-bold shadow' : 'text-emerald-100/80 hover:bg-[#244633]'
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

<style>
@media print {
  /* ซ่อน Sidebar และ Header ของ Admin เมื่อสั่งพิมพ์หรือเซฟเป็น PDF */
  aside,
  header,
  .no-print {
    display: none !important;
  }

  /* ปรับให้เนื้อหาเต็มหน้า A4 ไม่ติด Margin ด้านซ้ายของ Sidebar */
  .md\:ml-64,
  .md\:ml-20 {
    margin-left: 0 !important;
    padding: 0 !important;
  }

  body,
  .min-h-screen,
  main {
    background: white !important;
    color: #111827 !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
  }
}
</style>
