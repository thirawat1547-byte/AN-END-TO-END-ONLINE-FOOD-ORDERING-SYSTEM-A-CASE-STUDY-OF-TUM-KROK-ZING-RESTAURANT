<script setup>
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
