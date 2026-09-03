<script setup>
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
