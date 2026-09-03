# -*- coding: utf-8 -*-
import os

def write_file(filename, content):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated: {filename}")

# ==============================================================================
# 1. AdminDashboard.vue
# ==============================================================================
write_file('src/admin/views/AdminDashboard.vue', """<script setup>
import { computed } from 'vue'
import { adminStore } from '../store/adminData'

// Metrics calculations
const totalGrossSales = computed(() => {
  return adminStore.orders.reduce((sum, o) => sum + (o.payment_status === 'Completed' ? o.total_price : 0), 0)
})

const totalOrdersCount = computed(() => adminStore.orders.length)

const totalItemsSold = computed(() => {
  return adminStore.orders.reduce((sum, o) => {
    return sum + o.items.reduce((s, i) => s + i.quantity, 0)
  }, 0)
})

const occupiedTablesCount = computed(() => {
  return adminStore.tables.filter(t => t.status === 'Occupied' || t.status === 'Billing').length
})

const lowStockItems = computed(() => {
  return adminStore.ingredients.filter(i => i.quantity_in_stock <= i.reorder_level)
})

const topMenus = computed(() => {
  return [...adminStore.menus].sort((a, b) => b.total_sold - a.total_sold).slice(0, 5)
})

const recentOrders = computed(() => {
  return [...adminStore.orders].slice(0, 5)
})

// Hourly sales distribution mock
const hourlySales = [
  { hour: '11:00', sales: 450, height: '25%' },
  { hour: '12:00', sales: 1850, height: '85%', peak: true },
  { hour: '13:00', sales: 1200, height: '60%' },
  { hour: '14:00', sales: 380, height: '20%' },
  { hour: '15:00', sales: 250, height: '15%' },
  { hour: '16:00', sales: 500, height: '30%' },
  { hour: '17:00', sales: 980, height: '50%' },
  { hour: '18:00', sales: 2150, height: '100%', peak: true },
  { hour: '19:00', sales: 1780, height: '80%' },
  { hour: '20:00', sales: 920, height: '45%' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome & Quick Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-xl">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-amber-400 font-semibold text-sm">ยินดีต้อนรับสู่ระบบแดชบอร์ด</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Real-time Sync</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">สรุปภาพรวมร้านตำครกซิ่ง</h1>
        <p class="text-slate-400 text-xs mt-0.5">ข้อมูลการขาย สถานะโต๊ะ และความเคลื่อนไหวในครัวประจำวันนี้</p>
      </div>
      <div class="flex items-center gap-2">
        <router-link 
          to="/admin/menus" 
          class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <span>➕ เพิ่มเมนูอาหาร</span>
        </router-link>
        <router-link 
          to="/admin/kds" 
          class="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition flex items-center gap-1.5"
        >
          <span>🍳 เปิดจอ KDS</span>
        </router-link>
      </div>
    </div>

    <!-- 4 Key Executive Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Gross Sales -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">ยอดขายรวมวันนี้ (Gross Sales)</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            💵
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">฿{{ totalGrossSales.toLocaleString() }}</div>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
            <span>↑ 18.5%</span>
            <span class="text-slate-400 font-normal">เทียบกับเมื่อวาน</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Total Orders -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">จำนวนออเดอร์ทั้งหมด</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            🧾
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">{{ totalOrdersCount }} <span class="text-sm font-normal text-slate-500">ออเดอร์</span></div>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-amber-600 font-medium">
            <span>{{ totalItemsSold }} จาน</span>
            <span class="text-slate-400 font-normal">ยอดรวมรายการอาหาร</span>
          </div>
        </div>
      </div>

      <!-- Card 3: Active Tables -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">โต๊ะที่กำลังใช้งาน (Table Active)</span>
          <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">
            🪑
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">{{ occupiedTablesCount }} / {{ adminStore.tables.length }} <span class="text-sm font-normal text-slate-500">โต๊ะ</span></div>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-orange-600 font-medium">
            <span>{{ Math.round((occupiedTablesCount / adminStore.tables.length) * 100) }}%</span>
            <span class="text-slate-400 font-normal">อัตราการครองโต๊ะ</span>
          </div>
        </div>
      </div>

      <!-- Card 4: Prep Time Average -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">เวลาเฉลี่ยในการปรุง (Avg Time)</span>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            ⏱️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">8.4 <span class="text-sm font-normal text-slate-500">นาที</span></div>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
            <span>⚡ เร็วตามมาตรฐาน</span>
            <span class="text-slate-400 font-normal">(< 12 นาที)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Section: Hourly Sales Chart + Low Stock Alert -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Hourly Sales Chart -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-800">สถิติยอดขายตามช่วงเวลา (Peak Hours)</h2>
            <p class="text-xs text-slate-400">วิเคราะห์ชั่วโมงเร่งด่วนเพื่อวางแผนเตรียมสต็อกและพนักงาน</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span class="w-2.5 h-2.5 rounded bg-amber-500"></span> ช่วงปกติ
            </span>
            <span class="flex items-center gap-1 text-[11px] text-red-500 font-medium">
              <span class="w-2.5 h-2.5 rounded bg-red-500"></span> ช่วงเร่งด่วน (Peak)
            </span>
          </div>
        </div>

        <!-- Visual Bar Chart -->
        <div class="flex-1 flex items-end justify-between gap-2 pt-8 pb-3 px-2 border-b border-slate-100 min-h-[180px]">
          <div 
            v-for="item in hourlySales" 
            :key="item.hour"
            class="flex-1 flex flex-col items-center gap-2 group relative"
          >
            <!-- Tooltip -->
            <div class="absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none shadow-md">
              ฿{{ item.sales.toLocaleString() }} ({{ item.hour }})
            </div>
            <!-- Bar -->
            <div 
              :style="{ height: item.height }"
              :class="[
                'w-full max-w-[32px] rounded-t-lg transition-all duration-500 group-hover:scale-105',
                item.peak ? 'bg-gradient-to-t from-red-600 to-amber-500 shadow-sm shadow-red-500/20' : 'bg-gradient-to-t from-amber-500 to-amber-400'
              ]"
            ></div>
            <span class="text-[10px] font-medium text-slate-400">{{ item.hour }}</span>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
          <div class="flex items-center gap-2">
            <span>🔥 ช่วงพีคสูงสุด: <b>18:00 - 19:00 น.</b> (฿2,150)</span>
          </div>
          <div class="font-medium text-amber-700">แนะนำ: เตรียมวัตถุดิบส้มตำและคอหมูย่างล่วงหน้า</div>
        </div>
      </div>

      <!-- Low Stock Alerts Widget -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            <h2 class="text-base font-bold text-slate-800">แจ้งเตือนวัตถุดิบใกล้หมด</h2>
          </div>
          <router-link to="/admin/inventory" class="text-xs text-amber-600 hover:text-amber-700 font-semibold">ดูคลังทั้งหมด →</router-link>
        </div>
        <p class="text-xs text-slate-400 mb-3">วัตถุดิบที่มีปริมาณคงเหลือต่ำกว่าเกณฑ์สั่งซื้อ (Reorder Level)</p>

        <div class="flex-1 space-y-2.5 overflow-y-auto max-h-[220px]">
          <div 
            v-for="item in lowStockItems" 
            :key="item.ingredient_id"
            class="p-3 rounded-xl bg-red-50/70 border border-red-200/70 flex items-center justify-between"
          >
            <div>
              <p class="font-bold text-xs text-red-950">{{ item.ingredient_name }}</p>
              <p class="text-[11px] text-red-600">จุดเตือน: {{ item.reorder_level }} {{ item.unit }}</p>
            </div>
            <div class="text-right">
              <span class="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs">
                เหลือ {{ item.quantity_in_stock }} {{ item.unit }}
              </span>
            </div>
          </div>

          <div v-if="lowStockItems.length === 0" class="p-6 text-center text-slate-400 text-xs">
            🎉 วัตถุดิบทุกรายการมีปริมาณเพียงพอ
          </div>
        </div>

        <button 
          @click="$router.push('/admin/inventory')"
          class="mt-4 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
        >
          จัดการและเติมสต็อกวัตถุดิบ
        </button>
      </div>
    </div>

    <!-- Bottom Section: Top Selling Dishes + Recent Orders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top 5 Best Sellers -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🏆</span> 5 อันดับเมนูขายดีประจำร้าน
          </h2>
          <router-link to="/admin/menus" class="text-xs text-amber-600 font-semibold hover:underline">จัดการเมนูทั้งหมด</router-link>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(menu, idx) in topMenus" 
            :key="menu.menu_id"
            class="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
          >
            <div 
              :class="[
                'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0',
                idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ idx + 1 }}
            </div>
            <img :src="menu.image_url" :alt="menu.menu_name" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm">
            <div class="flex-1 min-w-0">
              <p class="font-bold text-xs text-slate-800 truncate">{{ menu.menu_name }}</p>
              <p class="text-[11px] text-slate-400">ราคา ฿{{ menu.price }} | {{ menu.calories }} kcal</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="font-black text-xs text-amber-600">{{ menu.total_sold }} จาน</p>
              <p class="text-[10px] text-slate-400">฿{{ (menu.total_sold * menu.price).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Live Feed -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🔔</span> คำสั่งซื้อล่าสุด (Live Orders)
          </h2>
          <router-link to="/admin/transactions" class="text-xs text-amber-600 font-semibold hover:underline">ดูประวัติทั้งหมด</router-link>
        </div>

        <div class="space-y-3">
          <div 
            v-for="order in recentOrders" 
            :key="order.order_id"
            class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900">#ORD-{{ order.order_id }}</span>
                <span 
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-md font-bold',
                    order.status === 'Cooking' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Served' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ order.status === 'Cooking' ? '🍳 กำลังปรุง' : order.status === 'Pending' ? '⏳ รอคิว' : order.status === 'Served' ? '🍽️ เสิร์ฟแล้ว' : '✅ สำเร็จ' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ order.customer_name }} • {{ order.items.length }} รายการ</p>
            </div>

            <div class="text-right">
              <p class="font-bold text-xs text-slate-900">฿{{ order.total_price }}</p>
              <p class="text-[10px] text-slate-400">{{ order.created_at.slice(11, 16) }} น. ({{ order.payment_method }})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("AdminDashboard generated.")

# ==============================================================================
# 2. MenuManagement.vue

# ==============================================================================
write_file('src/admin/views/MenuManagement.vue', """<script setup>
import { ref, computed } from 'vue'
import { adminStore } from '../store/adminData'

const selectedCategory = ref(0) // 0 = all
const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)

const form = ref({
  menu_id: null,
  category_id: 1,
  menu_name: '',
  description: '',
  price: 60,
  calories: 150,
  image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=80',
  allergen_ids: [],
  is_available: true
})

const filteredMenus = computed(() => {
  return adminStore.menus.filter(m => {
    const matchCategory = selectedCategory.value === 0 || m.category_id === selectedCategory.value
    const matchSearch = m.menu_name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        m.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchSearch
  })
})

function openAddModal() {
  isEditing.value = false
  form.value = {
    menu_id: null,
    category_id: 1,
    menu_name: '',
    description: '',
    price: 60,
    calories: 150,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    allergen_ids: [],
    is_available: true
  }
  isModalOpen.value = true
}

function openEditModal(menu) {
  isEditing.value = true
  form.value = { ...menu, allergen_ids: [...menu.allergen_ids] }
  isModalOpen.value = true
}

function saveMenu() {
  if (!form.value.menu_name || !form.value.price) {
    alert('กรุณากรอกชื่อเมนูและราคาอาหาร')
    return
  }
  if (isEditing.value) {
    adminStore.updateMenuItem(form.value)
  } else {
    adminStore.addMenuItem(form.value)
  }
  isModalOpen.value = false
}

function confirmDelete(menu) {
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู \"${menu.menu_name}\"?`)) {
    adminStore.deleteMenuItem(menu.menu_id)
  }
}

function getCategoryName(catId) {
  const c = adminStore.categories.find(x => x.category_id === catId)
  return c ? c.menu_name || c.category_name : 'ทั่วไป'
}

function getAllergenNames(ids) {
  if (!ids || ids.length === 0) return []
  return adminStore.allergens.filter(a => ids.includes(a.allergen_id))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">จัดการรายการอาหารและเครื่องดื่ม (Menu Management)</h1>
        <p class="text-xs text-slate-500">เพิ่ม ลบ แก้ไข รายการเมนู ราคา ข้อมูลโภชนาการ และเปิด/ปิดสถานะพร้อมขาย</p>
      </div>
      <button 
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
      >
        <span>➕ เพิ่มเมนูใหม่</span>
      </button>
    </div>

    <!-- Filter & Search Controls -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Categories Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <button 
          @click="selectedCategory = 0"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedCategory === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ทั้งหมด ({{ adminStore.menus.length }})
        </button>
        <button 
          v-for="cat in adminStore.categories"
          :key="cat.category_id"
          @click="selectedCategory = cat.category_id"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5',
            selectedCategory === cat.category_id ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.category_name }}</span>
        </button>
      </div>

      <!-- Search Box -->
      <div class="relative w-full md:w-72">
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="ค้นหาชื่อเมนู หรือส่วนผสม..."
          class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>
    </div>

    <!-- Menus Grid List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="menu in filteredMenus" 
        :key="menu.menu_id"
        :class="[
          'bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md',
          menu.is_available ? 'border-slate-200/80' : 'border-red-200 bg-slate-50/70 opacity-80'
        ]"
      >
        <!-- Image & Badges -->
        <div class="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img :src="menu.image_url" :alt="menu.menu_name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          
          <!-- Category Tag -->
          <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[10px] shadow">
            {{ getCategoryName(menu.category_id) }}
          </span>

          <!-- Sold Count Badge -->
          <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] shadow">
            ขายแล้ว {{ menu.total_sold }}
          </span>

          <!-- Out of Stock Overlay -->
          <div v-if="!menu.is_available" class="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span class="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg">
              ❌ สินค้าหมดชั่วคราว
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-bold text-sm text-slate-900 leading-snug">{{ menu.menu_name }}</h3>
              <span class="font-black text-amber-600 text-base flex-shrink-0">฿{{ menu.price }}</span>
            </div>
            <p class="text-slate-500 text-xs mt-1 line-clamp-2">{{ menu.description }}</p>

            <!-- Calories & Allergens -->
            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                🔥 {{ menu.calories }} kcal
              </span>
              <span 
                v-for="al in getAllergenNames(menu.allergen_ids)" 
                :key="al.allergen_id"
                class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/60 text-[10px] font-medium"
                :title="'สารก่อภูมิแพ้: ' + al.allergen_name"
              >
                {{ al.icon }} {{ al.allergen_name }}
              </span>
            </div>
          </div>

          <!-- Bottom Action Controls -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <!-- Quick Availability Toggle -->
            <label class="flex items-center gap-2 cursor-pointer">
              <div class="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  :checked="menu.is_available" 
                  @change="adminStore.toggleMenuAvailability(menu.menu_id)"
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
              <span class="text-[11px] font-medium text-slate-600">
                {{ menu.is_available ? 'พร้อมขาย' : 'ปิดการขาย' }}
              </span>
            </label>

            <!-- Edit & Delete Buttons -->
            <div class="flex items-center gap-1.5">
              <button 
                @click="openEditModal(menu)"
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 text-xs transition"
                title="แก้ไขข้อมูลเมนู"
              >
                ✏️
              </button>
              <button 
                @click="confirmDelete(menu)"
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 text-xs transition"
                title="ลบเมนูนี้"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Add / Edit Menu) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900">
            {{ isEditing ? '✏️ แก้ไขรายการอาหาร' : '➕ เพิ่มรายการอาหารใหม่' }}
          </h2>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3.5 text-xs">
          <!-- Menu Name -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อรายการอาหาร *</label>
            <input 
              type="text" 
              v-model="form.menu_name"
              placeholder="เช่น ส้มตำปูปลาร้าครกซิ่ง"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
            />
          </div>

          <!-- Category & Price -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">หมวดหมู่ *</label>
              <select 
                v-model="form.category_id"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              >
                <option v-for="c in adminStore.categories" :key="c.category_id" :value="c.category_id">
                  {{ c.icon }} {{ c.category_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ราคา (บาท) *</label>
              <input 
                type="number" 
                v-model="form.price"
                placeholder="65"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">คำอธิบายและส่วนประกอบ</label>
            <textarea 
              v-model="form.description"
              rows="2"
              placeholder="รายละเอียดเมนู รสชาติ ส่วนผสมเด่น..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
            ></textarea>
          </div>

          <!-- Calories & Image URL -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ปริมาณแคลอรี (kcal)</label>
              <input 
                type="number" 
                v-model="form.calories"
                placeholder="150"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">สถานะพร้อมจำหน่าย</label>
              <select 
                v-model="form.is_available"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              >
                <option :value="true">พร้อมขาย (In Stock)</option>
                <option :value="false">สินค้าหมด (Out of Stock)</option>
              </select>
            </div>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">ลิงก์รูปภาพอาหาร (Image URL)</label>
            <input 
              type="text" 
              v-model="form.image_url"
              placeholder="https://images.unsplash.com/..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
            />
          </div>

          <!-- Allergens Multi-select -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">สารก่อภูมิแพ้ (Allergens Warning)</label>
            <div class="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label 
                v-for="al in adminStore.allergens" 
                :key="al.allergen_id"
                class="flex items-center gap-2 cursor-pointer text-[11px]"
              >
                <input 
                  type="checkbox" 
                  :value="al.allergen_id" 
                  v-model="form.allergen_ids"
                  class="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>{{ al.icon }} {{ al.allergen_name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button 
            @click="isModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs"
          >
            ยกเลิก
          </button>
          <button 
            @click="saveMenu"
            class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("MenuManagement generated.")

# ==============================================================================
# 3. InventoryManagement.vue (Ingredients & Recipe Formulation)

# ==============================================================================
write_file('src/admin/views/InventoryManagement.vue', """<script setup>
import { ref, computed } from 'vue'
import { adminStore } from '../store/adminData'

const activeTab = ref('stock') // 'stock' or 'recipes'
const searchQuery = ref('')
const filterLowStockOnly = ref(false)
const isAddStockModalOpen = ref(false)
const isAdjustModalOpen = ref(false)
const selectedItem = ref(null)
const adjustQty = ref(0)

const newIngredient = ref({
  ingredient_name: '',
  quantity_in_stock: 10,
  unit: 'กิโลกรัม',
  reorder_level: 3,
  cost_per_unit: 50
})

const filteredIngredients = computed(() => {
  return adminStore.ingredients.filter(i => {
    const matchSearch = i.ingredient_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchLow = filterLowStockOnly.value ? i.quantity_in_stock <= i.reorder_level : true
    return matchSearch && matchLow
  })
})

function openAdjust(item) {
  selectedItem.value = item
  adjustQty.value = item.quantity_in_stock
  isAdjustModalOpen.value = true
}

function saveAdjust() {
  if (selectedItem.value) {
    adminStore.updateStock(selectedItem.value.ingredient_id, adjustQty.value)
  }
  isAdjustModalOpen.value = false
}

function quickAdd(item, amount) {
  adminStore.updateStock(item.ingredient_id, Number(item.quantity_in_stock) + amount)
}

function saveNewIngredient() {
  if (!newIngredient.value.ingredient_name) {
    alert('กรุณากรอกชื่อวัตถุดิบ')
    return
  }
  adminStore.addIngredient({
    ...newIngredient.value,
    quantity_in_stock: Number(newIngredient.value.quantity_in_stock),
    reorder_level: Number(newIngredient.value.reorder_level),
    cost_per_unit: Number(newIngredient.value.cost_per_unit)
  })
  isAddStockModalOpen.value = false
  newIngredient.value = { ingredient_name: '', quantity_in_stock: 10, unit: 'กิโลกรัม', reorder_level: 3, cost_per_unit: 50 }
}

function deleteIng(id) {
  if (confirm('คุณต้องการลบวัตถุดิบนี้ใช่หรือไม่?')) {
    adminStore.deleteIngredient(id)
  }
}

// Recipes formulation helpers
function getMenuIngredients(menuId) {
  return adminStore.menuIngredients
    .filter(mi => mi.menu_id === menuId)
    .map(mi => {
      const ing = adminStore.ingredients.find(i => i.ingredient_id === mi.ingredient_id)
      return {
        ...mi,
        ingredient_name: ing ? ing.ingredient_name : 'วัตถุดิบ',
        unit: ing ? ing.unit : '',
        in_stock: ing ? ing.quantity_in_stock : 0
      }
    })
}

function getMaxPortions(menuId) {
  const reqs = getMenuIngredients(menuId)
  if (reqs.length === 0) return '-'
  let minPortions = Infinity
  for (const r of reqs) {
    if (r.quantity_used > 0) {
      const p = Math.floor(r.in_stock / r.quantity_used)
      if (p < minPortions) minPortions = p
    }
  }
  return minPortions === Infinity ? '-' : minPortions + ' จาน'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">คลังวัตถุดิบและสูตรอาหาร (Inventory & Recipe Management)</h1>
        <p class="text-xs text-slate-500">จัดการสต็อกวัตถุดิบ จุดแจ้งเตือนสั่งซื้อเพิ่ม และสูตรอาหารสำหรับตัดสต็อกอัตโนมัติ</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="isAddStockModalOpen = true"
          class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
        >
          <span>➕ เพิ่มวัตถุดิบใหม่</span>
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button 
        @click="activeTab = 'stock'"
        :class="[
          'px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2',
          activeTab === 'stock' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>📦 รายการสต็อกวัตถุดิบ</span>
        <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">{{ adminStore.ingredients.length }}</span>
      </button>
      <button 
        @click="activeTab = 'recipes'"
        :class="[
          'px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2',
          activeTab === 'recipes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>🍲 สูตรอาหารและการตัดสต็อก (Recipe Formula)</span>
        <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">Auto Deduct</span>
      </button>
    </div>

    <!-- TAB 1: Stock Inventory Table -->
    <div v-if="activeTab === 'stock'" class="space-y-4">
      <!-- Search & Filter Controls -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button 
            @click="filterLowStockOnly = !filterLowStockOnly"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5',
              filterLowStockOnly ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100'
            ]"
          >
            <span>⚠️ แสดงเฉพาะใกล้หมด</span>
          </button>
          <span class="text-xs text-slate-400">พบ {{ filteredIngredients.length }} รายการ</span>
        </div>

        <div class="relative w-full sm:w-64">
          <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="ค้นหาชื่อวัตถุดิบ..."
            class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="p-4">ชื่อวัตถุดิบ (Ingredient)</th>
                <th class="p-4">ปริมาณคงเหลือ (Stock)</th>
                <th class="p-4">จุดสั่งซื้อเพิ่ม (Reorder Level)</th>
                <th class="p-4">ต้นทุน/หน่วย</th>
                <th class="p-4">สถานะสต็อก</th>
                <th class="p-4">อัปเดตล่าสุด</th>
                <th class="p-4 text-right">ปรับยอดสต็อก</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="item in filteredIngredients" 
                :key="item.ingredient_id"
                :class="[
                  'hover:bg-slate-50/80 transition',
                  item.quantity_in_stock <= item.reorder_level ? 'bg-red-50/40' : ''
                ]"
              >
                <!-- Name -->
                <td class="p-4 font-bold text-slate-900 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="item.quantity_in_stock <= item.reorder_level ? 'bg-red-500' : 'bg-emerald-500'"></span>
                  {{ item.ingredient_name }}
                </td>

                <!-- Stock Amount -->
                <td class="p-4">
                  <span class="font-black text-sm text-slate-900">{{ item.quantity_in_stock }}</span>
                  <span class="text-slate-500 ml-1 font-medium">{{ item.unit }}</span>
                </td>

                <!-- Reorder Level -->
                <td class="p-4 text-slate-600 font-medium">
                  {{ item.reorder_level }} {{ item.unit }}
                </td>

                <!-- Cost -->
                <td class="p-4 text-slate-600 font-medium">
                  ฿{{ item.cost_per_unit }} / {{ item.unit }}
                </td>

                <!-- Status Badge -->
                <td class="p-4">
                  <span 
                    v-if="item.quantity_in_stock <= 0" 
                    class="px-2.5 py-1 rounded-md bg-red-600 text-white font-bold text-[10px]"
                  >
                    ❌ สินค้าหมด
                  </span>
                  <span 
                    v-else-if="item.quantity_in_stock <= item.reorder_level" 
                    class="px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold text-[10px] flex items-center gap-1 w-fit"
                  >
                    <span>⚠️ วัตถุดิบเหลือน้อย</span>
                  </span>
                  <span 
                    v-else 
                    class="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-fit"
                  >
                    <span>✅ สต็อกปกติ</span>
                  </span>
                </td>

                <!-- Last Updated -->
                <td class="p-4 text-slate-400 text-[11px]">
                  {{ item.last_updated }}
                </td>

                <!-- Actions -->
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      @click="quickAdd(item, 5)"
                      class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition"
                      title="เติมสต็อกทันที +5 หน่วย"
                    >
                      +5
                    </button>
                    <button 
                      @click="openAdjust(item)"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 font-semibold text-[11px] transition"
                    >
                      แก้ไข
                    </button>
                    <button 
                      @click="deleteIng(item.ingredient_id)"
                      class="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 text-xs transition"
                      title="ลบ"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Recipe Formulation (MENU_INGREDIENTS) -->
    <div v-else class="space-y-4">
      <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <span class="text-xl flex-shrink-0">💡</span>
        <div>
          <p class="font-bold">ระบบตัดสต็อกวัตถุดิบอัตโนมัติ (Automated Stock Deduction Logic)</p>
          <p class="text-[11px] text-amber-800/90 mt-0.5">
            เมื่อลูกค้าสั่งอาหารและชำระเงินสำเร็จ ระบบจะคำนวณและตัดจำนวนวัตถุดิบตามสูตร (Quantity Used) ในตาราง MENU_INGREDIENTS ทันที
          </p>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="menu in adminStore.menus" 
          :key="menu.menu_id"
          class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img :src="menu.image_url" :alt="menu.menu_name" class="w-12 h-12 rounded-xl object-cover">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm text-slate-900 truncate">{{ menu.menu_name }}</h3>
                <p class="text-slate-400 text-xs">฿{{ menu.price }} | ทำได้สูงสุด: <b class="text-emerald-600">{{ getMaxPortions(menu.menu_id) }}</b></p>
              </div>
            </div>

            <!-- Ingredients breakdown -->
            <div class="mt-3 space-y-2">
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">สูตรและสัดส่วนต่อ 1 จาน:</div>
              <div 
                v-for="r in getMenuIngredients(menu.menu_id)" 
                :key="r.ingredient_id"
                class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50"
              >
                <span class="font-medium text-slate-800">{{ r.ingredient_name }}</span>
                <div class="text-right">
                  <span class="font-bold text-amber-700">{{ r.quantity_used }} {{ r.unit }}</span>
                  <span class="text-[10px] text-slate-400 ml-1.5">(คงเหลือ {{ r.in_stock }} {{ r.unit }})</span>
                </div>
              </div>

              <div v-if="getMenuIngredients(menu.menu_id).length === 0" class="text-xs text-slate-400 italic py-2 text-center">
                ยังไม่ได้ผูกสูตรวัตถุดิบ
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>คำนวณต้นทุนวัตถุดิบ: <b>~฿{{ Math.round(menu.price * 0.35) }}</b></span>
            <span class="text-[10px] text-emerald-600 font-bold">Gross Margin ~65%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Adjust Stock -->
    <div v-if="isAdjustModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-bold text-base text-slate-900">
          ⚖️ ปรับยอดสต็อก: {{ selectedItem?.ingredient_name }}
        </h3>
        <p class="text-xs text-slate-500">ระบุจำนวนปริมาณสต็อกใหม่ที่นับได้จริง (หน่วย: {{ selectedItem?.unit }})</p>

        <div>
          <input 
            type="number" 
            step="0.1" 
            v-model="adjustQty"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            @click="isAdjustModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ยกเลิก
          </button>
          <button 
            @click="saveAdjust"
            class="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            บันทึกยอดสต็อก
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Ingredient -->
    <div v-if="isAddStockModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-base text-slate-900">➕ เพิ่มรายการวัตถุดิบใหม่</h3>
          <button @click="isAddStockModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อวัตถุดิบ *</label>
            <input 
              type="text" 
              v-model="newIngredient.ingredient_name"
              placeholder="เช่น มะเขือเทศสีดา"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">จำนวนเริ่มต้น *</label>
              <input 
                type="number" 
                step="0.1" 
                v-model="newIngredient.quantity_in_stock"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">หน่วยนับ *</label>
              <input 
                type="text" 
                v-model="newIngredient.unit"
                placeholder="กิโลกรัม, ขวด, ถุง"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">จุดเตือนสั่งซื้อ (Reorder Level)</label>
              <input 
                type="number" 
                step="0.1" 
                v-model="newIngredient.reorder_level"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ต้นทุนเฉลี่ย / หน่วย (บาท)</label>
              <input 
                type="number" 
                v-model="newIngredient.cost_per_unit"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button 
            @click="isAddStockModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ยกเลิก
          </button>
          <button 
            @click="saveNewIngredient"
            class="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            บันทึกวัตถุดิบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("InventoryManagement generated.")

# ==============================================================================
# 4. PromotionManagement.vue
# ==============================================================================
write_file('src/admin/views/PromotionManagement.vue', """<script setup>
import { ref, computed } from 'vue'
import { adminStore } from '../store/adminData'

const isModalOpen = ref(false)
const simBillAmount = ref(450)
const simCode = ref('ZING50')

const newPromo = ref({
  code: '',
  discount_type: 'Fixed', // Fixed or Percentage
  discount_value: 50,
  min_order_price: 300,
  expiry_date: '2026-10-31',
  is_active: true
})

function savePromo() {
  if (!newPromo.value.code || !newPromo.value.discount_value) {
    alert('กรุณากรอกรหัสโปรโมชันและมูลค่าส่วนลด')
    return
  }
  adminStore.addPromotion({ ...newPromo.value })
  isModalOpen.value = false
  newPromo.value = { code: '', discount_type: 'Fixed', discount_value: 50, min_order_price: 300, expiry_date: '2026-10-31', is_active: true }
}

function deletePromo(id) {
  if (confirm('คุณต้องการลบโปรโมชันนี้ใช่หรือไม่?')) {
    adminStore.deletePromotion(id)
  }
}

// Discount Simulation
const simResult = computed(() => {
  const p = adminStore.promotions.find(x => x.code.toUpperCase() === simCode.value.toUpperCase() && x.is_active)
  if (!p) {
    return { valid: false, message: '❌ ไม่พบโค้ดส่วนลดนี้ หรือโค้ดปิดใช้งานอยู่', discount: 0, net: simBillAmount.value }
  }
  if (simBillAmount.value < p.min_order_price) {
    return { valid: false, message: `⚠️ ยอดสั่งซื้อขั้นต่ำต้องถึง ฿${p.min_order_price} (ปัจจุบัน ฿${simBillAmount.value})`, discount: 0, net: simBillAmount.value }
  }
  let discount = 0
  if (p.discount_type === 'Fixed') {
    discount = p.discount_value
  } else {
    discount = (simBillAmount.value * p.discount_value) / 100
  }
  const net = Math.max(0, simBillAmount.value - discount)
  return { valid: true, message: `✅ ใช้โค้ด ${p.code} สำเร็จ! ลดทันที ฿${discount}`, discount, net }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">จัดการโปรโมชันและแคมเปญส่วนลด (Promotions)</h1>
        <p class="text-xs text-slate-500">สร้างโค้ดส่วนลด กำหนดเงื่อนไขยอดสั่งซื้อขั้นต่ำ และควบคุมตรรกะส่วนลด (Order-level Discount Logic)</p>
      </div>
      <button 
        @click="isModalOpen = true"
        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
      >
        <span>➕ สร้างโค้ดโปรโมชันใหม่</span>
      </button>
    </div>

    <!-- Promo Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="promo in adminStore.promotions" 
        :key="promo.promo_id"
        :class="[
          'bg-white rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between relative overflow-hidden',
          promo.is_active ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200 bg-slate-50/70 opacity-70'
        ]"
      >
        <!-- Top Promo Badge -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏷️</span>
            <div>
              <h3 class="font-black text-base text-slate-900 font-mono tracking-wider">{{ promo.code }}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                {{ promo.discount_type === 'Percentage' ? `ลด ${promo.discount_value}%` : `ลด ฿${promo.discount_value} บาท` }}
              </span>
            </div>
          </div>
          <button 
            @click="deletePromo(promo.promo_id)" 
            class="text-slate-400 hover:text-red-500 text-xs p-1"
            title="ลบ"
          >
            🗑️
          </button>
        </div>

        <!-- Details -->
        <div class="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">สั่งขั้นต่ำ:</span>
            <span class="font-bold text-slate-800">฿{{ promo.min_order_price }} บาท</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">หมดอายุ:</span>
            <span class="font-medium text-slate-800">{{ promo.expiry_date }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">ใช้งานแล้ว:</span>
            <span class="font-bold text-amber-600">{{ promo.used_count }} ครั้ง</span>
          </div>
        </div>

        <!-- Toggle Switch -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-medium" :class="promo.is_active ? 'text-emerald-600 font-bold' : 'text-slate-400'">
            {{ promo.is_active ? '🟢 เปิดใช้งานอยู่' : '⚪ ปิดใช้งาน' }}
          </span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              :checked="promo.is_active" 
              @change="adminStore.togglePromoStatus(promo.promo_id)"
              class="sr-only peer"
            >
            <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Interactive Discount Logic Tester Tool -->
    <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl space-y-4">
      <div class="flex items-center gap-2">
        <span class="text-xl">🧮</span>
        <div>
          <h2 class="text-base font-bold">เครื่องมือจำลองการคำนวณส่วนลด (Discount Simulator)</h2>
          <p class="text-xs text-slate-400">ทดสอบตรรกะ Order-level Discount Logic ก่อนปล่อยแคมเปญให้ลูกค้าใช้งานจริง</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">ยอดรวมคำสั่งซื้อ (บาท)</label>
          <input 
            type="number" 
            v-model="simBillAmount"
            class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">รหัสโปรโมชัน</label>
          <input 
            type="text" 
            v-model="simCode"
            placeholder="เช่น ZING50"
            class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div class="text-xs font-medium" :class="simResult.valid ? 'text-emerald-400' : 'text-amber-400'">
            {{ simResult.message }}
          </div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60 mt-1">
            <span class="text-slate-400">ยอดสุทธิที่ต้องจ่าย:</span>
            <span class="text-base font-black text-amber-400">฿{{ simResult.net }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Promo -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-base text-slate-900">➕ สร้างโค้ดโปรโมชันใหม่</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสคูปอง (Promo Code) *</label>
            <input 
              type="text" 
              v-model="newPromo.code"
              placeholder="เช่น ZING100"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono font-bold focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ประเภทส่วนลด *</label>
              <select 
                v-model="newPromo.discount_type"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              >
                <option value="Fixed">ลดเป็นบาท (Fixed ฿)</option>
                <option value="Percentage">ลดเป็นเปอร์เซ็นต์ (%)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">มูลค่าส่วนลด *</label>
              <input 
                type="number" 
                v-model="newPromo.discount_value"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
              <input 
                type="number" 
                v-model="newPromo.min_order_price"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">วันหมดอายุ</label>
              <input 
                type="date" 
                v-model="newPromo.expiry_date"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button 
            @click="isModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ยกเลิก
          </button>
          <button 
            @click="savePromo"
            class="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            บันทึกโปรโมชัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("PromotionManagement generated.")

# ==============================================================================
# 5. TransactionAudit.vue
# ==============================================================================
write_file('src/admin/views/TransactionAudit.vue', """<script setup>
import { ref, computed } from 'vue'
import { adminStore } from '../store/adminData'

const selectedStatus = ref('All')
const searchQuery = ref('')
const selectedOrder = ref(null)
const slipModalUrl = ref(null)

const filteredOrders = computed(() => {
  return adminStore.orders.filter(o => {
    const matchStatus = selectedStatus.value === 'All' || o.payment_status === selectedStatus.value
    const matchSearch = String(o.order_id).includes(searchQuery.value) || 
                        o.customer_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        o.payment_method.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

function viewSlip(url) {
  slipModalUrl.value = url
}

function viewOrderDetails(order) {
  selectedOrder.value = order
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">ตรวจสอบการเงินและประวัติธุรกรรม (Transaction & Audit)</h1>
        <p class="text-xs text-slate-500">ตรวจสอบหลักฐานการโอนเงิน สลิป QR Code ยอดรวมสุทธิ และรายงานทางบัญชี</p>
      </div>
      <button 
        @click="adminStore.exportSalesCSV()"
        class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
      >
        <span>📥 ดาวน์โหลดไฟล์รายงาน (Export CSV)</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
        <button 
          @click="selectedStatus = 'All'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ทั้งหมด ({{ adminStore.orders.length }})
        </button>
        <button 
          @click="selectedStatus = 'Completed'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          ชำระแล้ว (Completed)
        </button>
        <button 
          @click="selectedStatus = 'Pending'"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
            selectedStatus === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          รอชำระ (Pending)
        </button>
      </div>

      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="ค้นหา Order ID หรือ ลูกค้า..."
          class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
        />
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
            <tr>
              <th class="p-4">รหัสออเดอร์ (ID)</th>
              <th class="p-4">วัน-เวลา</th>
              <th class="p-4">ประเภท/โต๊ะ</th>
              <th class="p-4">ลูกค้า</th>
              <th class="p-4">ช่องทางชำระเงิน</th>
              <th class="p-4">ส่วนลด</th>
              <th class="p-4">ยอดรวมสุทธิ</th>
              <th class="p-4">สถานะการชำระ</th>
              <th class="p-4 text-center">สลิปโอน</th>
              <th class="p-4 text-right">รายละเอียด</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="order in filteredOrders" 
              :key="order.order_id"
              class="hover:bg-slate-50/80 transition"
            >
              <td class="p-4 font-mono font-bold text-slate-900">#ORD-{{ order.order_id }}</td>
              <td class="p-4 text-slate-500">{{ order.created_at }}</td>
              <td class="p-4 font-medium">
                <span :class="order.order_type === 'In-store' ? 'text-amber-700' : 'text-blue-700'">
                  {{ order.order_type === 'In-store' ? `🍽️ ${order.table_id ? 'โต๊ะ T-0' + order.table_id : 'ทานที่ร้าน'}` : '🛵 สั่งกลับบ้าน' }}
                </span>
              </td>
              <td class="p-4 font-medium text-slate-800">{{ order.customer_name }}</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  {{ order.payment_method }}
                </span>
              </td>
              <td class="p-4 text-amber-600 font-bold">
                {{ order.discount_applied > 0 ? `-฿${order.discount_applied}` : '-' }}
              </td>
              <td class="p-4 font-black text-sm text-slate-900">฿{{ order.total_price }}</td>
              <td class="p-4">
                <span 
                  :class="[
                    'px-2.5 py-1 rounded-md text-[10px] font-bold',
                    order.payment_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ order.payment_status === 'Completed' ? '✅ ชำระแล้ว' : '⏳ รอชำระ' }}
                </span>
              </td>
              <td class="p-4 text-center">
                <button 
                  v-if="order.payment_slip_url"
                  @click="viewSlip(order.payment_slip_url)"
                  class="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition"
                >
                  🖼️ ดูสลิป
                </button>
                <span v-else class="text-slate-300 text-[11px]">-</span>
              </td>
              <td class="p-4 text-right">
                <button 
                  @click="viewOrderDetails(order)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                >
                  ดูบิล
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slip Viewer Modal -->
    <div v-if="slipModalUrl" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-sm text-slate-900">หลักฐานสลิปการโอนเงิน (Slip URL)</h3>
          <button @click="slipModalUrl = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img :src="slipModalUrl" alt="Payment Slip" class="w-full h-auto max-h-[380px] object-contain">
        </div>
        <button 
          @click="slipModalUrl = null"
          class="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>

    <!-- Order Receipt Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-base text-slate-900">ใบเสร็จ #ORD-{{ selectedOrder.order_id }}</h3>
            <p class="text-slate-400 text-[10px]">{{ selectedOrder.created_at }}</p>
          </div>
          <button @click="selectedOrder = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div 
            v-for="item in selectedOrder.items" 
            :key="item.menu_id"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-50"
          >
            <div>
              <p class="font-bold text-slate-800">{{ item.menu_name }} x{{ item.quantity }}</p>
              <p v-if="item.customization?.spicy" class="text-[10px] text-amber-700">
                • {{ item.customization.spicy }} {{ item.customization.no_msg ? '• ไม่ใส่ชูรส' : '' }}
              </p>
            </div>
            <span class="font-bold text-slate-900">฿{{ item.subtotal }}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 space-y-1">
          <div class="flex justify-between text-slate-500">
            <span>ส่วนลดโปรโมชัน ({{ selectedOrder.promo_code || '-' }}):</span>
            <span class="text-amber-600 font-bold">-฿{{ selectedOrder.discount_applied }}</span>
          </div>
          <div class="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-dashed">
            <span>ยอดรวมสุทธิ:</span>
            <span class="text-amber-600">฿{{ selectedOrder.total_price }}</span>
          </div>
        </div>

        <button 
          @click="selectedOrder = null"
          class="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>
""")

print("TransactionAudit generated.")

# ==============================================================================
# 6. TableController.vue

# ==============================================================================
write_file('src/admin/views/TableController.vue', """<script setup>
import { ref } from 'vue'
import { adminStore } from '../store/adminData'

const selectedTable = ref(null)

function getTableOrder(table) {
  if (!table.activeOrderId) return null
  return adminStore.orders.find(o => o.order_id === table.activeOrderId)
}

function openTableModal(table) {
  selectedTable.value = table
}

function changeStatus(table, newStatus) {
  adminStore.toggleTableStatus(table.table_id, newStatus)
}

function clearTable(table) {
  if (confirm(`คุณต้องการเช็คบิลและเคลียร์โต๊ะ ${table.table_number} หรือไม่?`)) {
    if (table.activeOrderId) {
      adminStore.updateOrderStatus(table.activeOrderId, 'Completed')
    }
    adminStore.toggleTableStatus(table.table_id, 'Empty')
    selectedTable.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">แผนผังและการจัดการโต๊ะอาหาร (Table Controller)</h1>
        <p class="text-xs text-slate-500">แสดงสถานะโต๊ะแบบเรียลไทม์ (ว่าง, กำลังทาน, รอเช็คบิล) ควบคุม QR Code ประจำโต๊ะ</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ว่าง: {{ adminStore.tables.filter(t => t.status === 'Empty').length }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> มีลูกค้า: {{ adminStore.tables.filter(t => t.status === 'Occupied').length }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> รอเช็คบิล: {{ adminStore.tables.filter(t => t.status === 'Billing').length }}
        </span>
      </div>
    </div>

    <!-- Table Grid Floor Plan -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="table in adminStore.tables" 
        :key="table.table_id"
        @click="openTableModal(table)"
        :class="[
          'bg-white rounded-2xl p-5 border-2 transition duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden',
          table.status === 'Empty' ? 'border-emerald-200 hover:border-emerald-400' :
          table.status === 'Occupied' ? 'border-red-300 ring-2 ring-red-100 hover:border-red-400' :
          'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
        ]"
      >
        <!-- Table Status Indicator Strip -->
        <div 
          :class="[
            'absolute top-0 inset-x-0 h-1.5',
            table.status === 'Empty' ? 'bg-emerald-500' :
            table.status === 'Occupied' ? 'bg-red-500' : 'bg-amber-500'
          ]"
        ></div>

        <div>
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs text-slate-400 font-bold">TABLE</span>
              <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ table.table_number }}</h3>
            </div>
            <span 
              :class="[
                'text-[10px] px-2.5 py-1 rounded-lg font-bold',
                table.status === 'Empty' ? 'bg-emerald-100 text-emerald-800' :
                table.status === 'Occupied' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              ]"
            >
              {{ table.status === 'Empty' ? '🟢 โต๊ะว่าง' : table.status === 'Occupied' ? '🔴 มีลูกค้า' : '🟡 รอชำระเงิน' }}
            </span>
          </div>

          <!-- Capacity & Seated Time -->
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>👥 รองรับ {{ table.capacity }} ที่นั่ง</span>
            <span v-if="table.status !== 'Empty'" class="font-bold text-slate-700">⏱️ {{ table.elapsedMinutes }} นาที</span>
          </div>

          <!-- Order Summary if active -->
          <div v-if="table.status !== 'Empty'" class="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>ออเดอร์ #ORD-{{ table.activeOrderId }}</span>
              <span class="font-black text-slate-900">฿{{ table.currentBill }}</span>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-amber-600 font-bold hover:underline">คลิกเพื่อดู / จัดการ →</span>
          <span class="text-slate-400 text-sm">📱 QR</span>
        </div>
      </div>
    </div>

    <!-- Table Details Modal -->
    <div v-if="selectedTable" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-base text-slate-900">จัดการโต๊ะ {{ selectedTable.table_number }}</h3>
            <p class="text-slate-400 text-[11px]">ความจุ: {{ selectedTable.capacity }} ที่นั่ง</p>
          </div>
          <button @click="selectedTable = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <!-- Quick Status Change Buttons -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">เปลี่ยนสถานะโต๊ะ:</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              @click="changeStatus(selectedTable, 'Empty')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Empty' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              ]"
            >
              ว่าง
            </button>
            <button 
              @click="changeStatus(selectedTable, 'Occupied')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Occupied' ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100'
              ]"
            >
              มีลูกค้า
            </button>
            <button 
              @click="changeStatus(selectedTable, 'Billing')"
              :class="[
                'py-2 rounded-xl font-bold text-xs transition',
                selectedTable.status === 'Billing' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              ]"
            >
              รอเช็คบิล
            </button>
          </div>
        </div>

        <!-- Order details if active -->
        <div v-if="getTableOrder(selectedTable)" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div class="flex justify-between font-bold text-slate-800">
            <span>รายการอาหารโต๊ะนี้ (#ORD-{{ selectedTable.activeOrderId }})</span>
            <span class="text-amber-600 font-black">฿{{ selectedTable.currentBill }}</span>
          </div>
          <div class="space-y-1 max-h-40 overflow-y-auto">
            <div 
              v-for="i in getTableOrder(selectedTable).items" 
              :key="i.menu_id"
              class="flex justify-between text-[11px] text-slate-600"
            >
              <span>{{ i.menu_name }} x{{ i.quantity }}</span>
              <span>฿{{ i.subtotal }}</span>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            v-if="selectedTable.status !== 'Empty'"
            @click="clearTable(selectedTable)"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow"
          >
            💳 ชำระเงิน & เคลียร์โต๊ะ
          </button>
          <div class="flex-1"></div>
          <button 
            @click="selectedTable = null"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("TableController generated.")

# ==============================================================================
# 7. KitchenKDS.vue (Kitchen Display System)
# ==============================================================================
write_file('src/admin/views/KitchenKDS.vue', """<script setup>
import { computed } from 'vue'
import { adminStore } from '../store/adminData'

const activeOrders = computed(() => {
  return adminStore.orders.filter(o => ['Pending', 'Cooking', 'Ready'].includes(o.status))
})

function advanceStatus(order) {
  if (order.status === 'Pending') {
    adminStore.updateOrderStatus(order.order_id, 'Cooking')
  } else if (order.status === 'Cooking') {
    adminStore.updateOrderStatus(order.order_id, 'Ready')
  } else if (order.status === 'Ready') {
    adminStore.updateOrderStatus(order.order_id, 'Served')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl">
          🍳
        </div>
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            หน้าจอในครัว (Kitchen Display System - KDS)
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 animate-pulse">
              LIVE TICKET
            </span>
          </h1>
          <p class="text-xs text-slate-400">รับรายการสั่งอาหาร ปรุงตามหมายเหตุ และอัปเดตสถานะให้ลูกค้าเห็นทันที</p>
        </div>
      </div>

      <!-- Live sound alert toggle -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input type="checkbox" v-model="adminStore.storeSettings.soundAlertKDS" class="rounded text-amber-500">
          <span>🔊 เปิดเสียงเตือนเมื่อมีออเดอร์ใหม่</span>
        </label>
        <span class="px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs border border-slate-700">
          กำลังรอทำ: {{ activeOrders.length }} ออเดอร์
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="activeOrders.length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
      <span class="text-4xl">🎉</span>
      <h3 class="text-base font-bold text-slate-800">ไม่มีออเดอร์ค้างในครัว!</h3>
      <p class="text-xs text-slate-400">รายการอาหารทั้งหมดปรุงเสร็จและเสิร์ฟถึงมือลูกค้าเรียบร้อยแล้ว</p>
    </div>

    <!-- KDS Tickets Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="order in activeOrders" 
        :key="order.order_id"
        :class="[
          'bg-white rounded-2xl border-2 transition-all shadow-md flex flex-col justify-between overflow-hidden',
          order.status === 'Pending' ? 'border-blue-400 ring-2 ring-blue-100' :
          order.status === 'Cooking' ? 'border-amber-500 ring-2 ring-amber-100' :
          'border-emerald-500 ring-2 ring-emerald-100'
        ]"
      >
        <!-- Ticket Header -->
        <div 
          :class="[
            'p-4 text-white flex items-center justify-between',
            order.status === 'Pending' ? 'bg-blue-600' :
            order.status === 'Cooking' ? 'bg-amber-600' : 'bg-emerald-600'
          ]"
        >
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {{ order.order_type === 'In-store' ? 'DINE-IN ทานในร้าน' : 'TAKEAWAY กลับบ้าน' }}
            </span>
            <h2 class="text-2xl font-black">
              {{ order.table_id ? 'โต๊ะ T-0' + order.table_id : 'สั่งกลับบ้าน' }}
            </h2>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold">#ORD-{{ order.order_id }}</span>
            <p class="text-[10px] opacity-80">{{ order.created_at.slice(11, 16) }} น.</p>
          </div>
        </div>

        <!-- Ticket Body (Items List) -->
        <div class="p-4 flex-1 space-y-3">
          <div 
            v-for="item in order.items" 
            :key="item.menu_id"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-bold text-sm text-slate-900">{{ item.menu_name }}</span>
              <span class="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                x{{ item.quantity }}
              </span>
            </div>

            <!-- Customization Warnings in Red/Amber for Kitchen! -->
            <div v-if="item.customization" class="mt-1.5 space-y-1 text-xs">
              <div v-if="item.customization.spicy && item.customization.spicy !== '-'" class="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold inline-block mr-1 text-[11px]">
                🔥 {{ item.customization.spicy }}
              </div>
              <div v-if="item.customization.no_msg" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold inline-block mr-1 text-[11px]">
                🌿 ไม่ใส่ผงชูรส
              </div>
              <div v-if="item.customization.note" class="text-[11px] text-slate-700 italic bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                💬 หมายเหตุ: <b>{{ item.customization.note }}</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Ticket Action Button -->
        <div class="p-4 pt-2 bg-slate-50 border-t border-slate-100">
          <button 
            @click="advanceStatus(order)"
            :class="[
              'w-full py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2',
              order.status === 'Pending' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' :
              order.status === 'Cooking' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
              'bg-slate-900 hover:bg-slate-800 text-white'
            ]"
          >
            <span v-if="order.status === 'Pending'">🍳 เริ่มปรุงอาหาร (Cooking)</span>
            <span v-else-if="order.status === 'Cooking'">✅ ปรุงเสร็จแล้ว (Ready)</span>
            <span v-else>🍽️ เสิร์ฟถึงโต๊ะแล้ว (Served)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
""")

print("KitchenKDS generated.")

# ==============================================================================
# 8. AdminSettings.vue
# ==============================================================================
write_file('src/admin/views/AdminSettings.vue', """<script setup>
import { ref } from 'vue'
import { adminStore } from '../store/adminData'

const savedNotice = ref(false)

function saveSettings() {
  savedNotice.value = true
  setTimeout(() => {
    savedNotice.value = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">ตั้งค่าระบบร้านค้า (Store Settings)</h1>
        <p class="text-xs text-slate-500">ข้อมูลร้านค้า การชำระเงิน PromptPay เวลาเปิด-ปิด และการจัดการพนักงาน</p>
      </div>
      <button 
        @click="saveSettings"
        class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
      >
        💾 บันทึกการตั้งค่า
      </button>
    </div>

    <div v-if="savedNotice" class="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300">
      ✅ บันทึกข้อมูลการตั้งค่าเรียบร้อยแล้ว!
    </div>

    <!-- Store Info Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>🏪</span> ข้อมูลทั่วไปของร้าน
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อร้านค้า</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.storeName"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สโลแกน / Tagline</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.tagline"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">ที่อยู่ร้าน</label>
        <input 
          type="text" 
          v-model="adminStore.storeSettings.address"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาเปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.openTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.closeTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Payment & Tax Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>💳</span> ตั้งค่าการชำระเงินและภาษี (PromptPay & Tax)
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เบอร์พร้อมเพย์ (PromptPay ID)</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.promptpayNumber"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono font-bold text-amber-700"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อบัญชีรับเงิน</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.promptpayName"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">อัตราภาษีมูลค่าเพิ่ม VAT (%)</label>
          <input 
            type="number" 
            v-model="adminStore.storeSettings.vatRate"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.taxId"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Staff Accounts Table -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>👥</span> ผู้ใช้งานและสิทธิ์การเข้าถึง (Role-Based Access)
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
            <tr>
              <th class="p-3">Username</th>
              <th class="p-3">Email</th>
              <th class="p-3">เบอร์โทรศัพท์</th>
              <th class="p-3">สิทธิ์ (Role)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in adminStore.users" :key="u.user_id">
              <td class="p-3 font-bold text-slate-900">{{ u.username }}</td>
              <td class="p-3 text-slate-500">{{ u.email }}</td>
              <td class="p-3 text-slate-500">{{ u.phone_number }}</td>
              <td class="p-3">
                <span 
                  :class="[
                    'px-2.5 py-0.5 rounded-full font-bold text-[10px]',
                    u.role === 'Admin' ? 'bg-amber-100 text-amber-900' :
                    u.role === 'Staff' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ u.role }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
""")

print("AdminSettings generated.")

# ==============================================================================
# 9. Update src/router/index.js
# ==============================================================================
write_file('src/router/index.js', """import { createRouter, createWebHistory } from 'vue-router'

// Customer Views
import Home from '../Home.vue'
import Login from '../Login.vue'
import Register from '../Register.vue'
import Checkout from '../Checkout.vue'
import Tracking from '../Tracking.vue'
import Promotions from '../Promotions.vue'
import Help from '../Help.vue'
import Profile from '../Profile.vue'
import OrderHistory from '../OrderHistory.vue'

// Admin Views
import AdminLayout from '../admin/AdminLayout.vue'
import AdminDashboard from '../admin/views/AdminDashboard.vue'
import MenuManagement from '../admin/views/MenuManagement.vue'
import InventoryManagement from '../admin/views/InventoryManagement.vue'
import PromotionManagement from '../admin/views/PromotionManagement.vue'
import TransactionAudit from '../admin/views/TransactionAudit.vue'
import TableController from '../admin/views/TableController.vue'
import KitchenKDS from '../admin/views/KitchenKDS.vue'
import AdminSettings from '../admin/views/AdminSettings.vue'

const routes = [
  // Customer Routes
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/checkout', component: Checkout },
  { path: '/tracking', component: Tracking },
  { path: '/promotions', component: Promotions },
  { path: '/help', component: Help },
  { path: '/profile', component: Profile },
  { path: '/history', component: OrderHistory },

  // Admin Routes with AdminLayout
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'menus', component: MenuManagement },
      { path: 'inventory', component: InventoryManagement },
      { path: 'promotions', component: PromotionManagement },
      { path: 'transactions', component: TransactionAudit },
      { path: 'tables', component: TableController },
      { path: 'kds', component: KitchenKDS },
      { path: 'settings', component: AdminSettings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
""")

print("Router index.js updated with admin routes.")
print("All admin views generated successfully.")