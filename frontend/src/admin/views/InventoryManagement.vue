<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminStore } from '../store/adminData'

// พจนานุกรมแปลชื่อวัตถุดิบและหน่วยนับอัตโนมัติสำหรับ Frontend
const THAI_MAP = {
  'salted crab': { name: 'ปูเค็ม / ปูดอง', unit: 'ตัว' },
  'bottled water': { name: 'น้ำดื่มขวด', unit: 'ขวด' },
  'coke can': { name: 'โค้กกระป๋อง', unit: 'กระป๋อง' },
  'coke': { name: 'โค้กกระป๋อง', unit: 'กระป๋อง' },
  'sprite': { name: 'สไปรท์กระป๋อง', unit: 'กระป๋อง' },
  'egg': { name: 'ไข่ไก่สด', unit: 'ฟอง' },
  'eggs': { name: 'ไข่ไก่สด', unit: 'ฟอง' },
  'lime': { name: 'มะนาวสด', unit: 'ลูก' },
  'limes': { name: 'มะนาวสด', unit: 'ลูก' },
  'pandan leaves': { name: 'ใบเตยสด', unit: 'กรัม' },
  'pandan': { name: 'ใบเตยสด', unit: 'กรัม' },
  'pepper powder': { name: 'พริกไทยป่น', unit: 'กรัม' },
  'black pepper': { name: 'พริกไทยดำป่น', unit: 'กรัม' },
  'white pepper': { name: 'พริกไทยขาวป่น', unit: 'กรัม' },
  'holy basil': { name: 'ใบกะเพราสด', unit: 'กรัม' },
  'sweet basil': { name: 'ใบโหระพาสด', unit: 'กรัม' },
  'basil': { name: 'ใบกะเพราสด', unit: 'กรัม' },
  'chicken seasoning powder': { name: 'ผงปรุงรสไก่', unit: 'กรัม' },
  'seasoning powder': { name: 'ผงปรุงรส', unit: 'กรัม' },
  'roasted rice powder': { name: 'ข้าวคั่ว', unit: 'กรัม' },
  'roasted rice': { name: 'ข้าวคั่ว', unit: 'กรัม' },
  'minced pork': { name: 'หมูสับสด', unit: 'กก.' },
  'crispy pork': { name: 'หมูกรอบ', unit: 'กก.' },
  'pork belly': { name: 'หมูสามชั้น', unit: 'กก.' },
  'pork': { name: 'เนื้อหมูสด', unit: 'กก.' },
  'chicken wing': { name: 'ปีกไก่สด', unit: 'กก.' },
  'chicken thigh': { name: 'สะโพกไก่สด', unit: 'กก.' },
  'chicken breast': { name: 'อกไก่สด', unit: 'กก.' },
  'chicken': { name: 'เนื้อไก่สด', unit: 'กก.' },
  'shrimp': { name: 'กุ้งสด', unit: 'กก.' },
  'squid': { name: 'หมึกสด', unit: 'กก.' },
  'seafood': { name: 'อาหารทะเลรวม', unit: 'กก.' },
  'papaya': { name: 'มะละกอดิบขูด', unit: 'กก.' },
  'chili': { name: 'พริกสดจินดาแดง', unit: 'กก.' },
  'garlic': { name: 'กระเทียมสด', unit: 'กก.' },
  'kale': { name: 'ผักคะน้าสด', unit: 'กก.' },
  'tomato': { name: 'มะเขือเทศสีดา', unit: 'กก.' },
  'long bean': { name: 'ถั่วฝักยาว', unit: 'กก.' },
  'fermented fish': { name: 'น้ำปลาร้าปรุงสุก', unit: 'ขวด' },
  'plara': { name: 'น้ำปลาร้าปรุงสุก', unit: 'ขวด' },
  'fish sauce': { name: 'น้ำปลาแท้', unit: 'ขวด' },
  'sugar': { name: 'น้ำตาลทราย', unit: 'กก.' },
  'oil': { name: 'น้ำมันพืช', unit: 'ขวด' },
  'rice': { name: 'ข้าวสารหอมมะลิ', unit: 'กก.' },
  'sticky rice': { name: 'ข้าวเหนียว', unit: 'กก.' },
  'glass noodles': { name: 'วุ้นเส้น', unit: 'ห่อ' },
  'peanuts': { name: 'ถั่วลิสงคั่วบด', unit: 'กก.' },
  'dried shrimp': { name: 'กุ้งแห้ง', unit: 'กก.' },
  'curry paste': { name: 'พริกแกงเผ็ด', unit: 'กก.' },
  'crispy flour': { name: 'แป้งทอดกรอบ', unit: 'กรัม' },
  'herbs for larb': { name: 'ผักเคียง/เครื่องลาบ', unit: 'กรัม' },
  'herbs for yum': { name: 'ผักเคียง/เครื่องยำ', unit: 'กรัม' }
}

const UNIT_TRANSLATIONS = {
  pcs: 'ชิ้น',
  piece: 'ชิ้น',
  pieces: 'ชิ้น',
  bottle: 'ขวด',
  bottles: 'ขวด',
  can: 'กระป๋อง',
  cans: 'กระป๋อง',
  g: 'กรัม',
  gram: 'กรัม',
  grams: 'กรัม',
  kg: 'กก.',
  kilogram: 'กก.',
  kilograms: 'กก.',
  pack: 'ห่อ',
  packs: 'ห่อ',
  packet: 'ซอง',
  bag: 'ถุง',
  box: 'กล่อง',
  ml: 'มล.',
  l: 'ลิตร'
}

function getThaiName(name) {
  if (!name) return ''
  const lower = name.toLowerCase().trim()
  for (const [key, val] of Object.entries(THAI_MAP)) {
    if (lower === key || lower.includes(key)) {
      return val.name
    }
  }
  return name
}

function getThaiUnit(unit, name = '') {
  if (!unit) return 'หน่วย'
  const lowerUnit = unit.toLowerCase().trim()
  const lowerName = (name || '').toLowerCase().trim()

  // พิเศษตามชนิดวัตถุดิบ
  if (lowerName.includes('egg') || lowerName.includes('ไข่')) return 'ฟอง'
  if (lowerName.includes('crab') || lowerName.includes('ปู')) return 'ตัว'
  if (lowerName.includes('lime') || lowerName.includes('lemon') || lowerName.includes('มะนาว')) return 'ลูก'

  if (UNIT_TRANSLATIONS[lowerUnit]) {
    return UNIT_TRANSLATIONS[lowerUnit]
  }
  return unit
}

// ดึงข้อมูลคลังวัตถุดิบและรายการอาหารพร้อมสูตรจริงจาก Backend ทันทีที่เปิดหน้าเว็บ
onMounted(async () => {
  await Promise.all([
    adminStore.fetchInventoryFromAPI ? adminStore.fetchInventoryFromAPI() : null,
    adminStore.fetchMenusFromAPI ? adminStore.fetchMenusFromAPI() : null
  ])
})

const activeTab = ref('stock') // 'stock' or 'recipes'
const searchQuery = ref('')
const filterLowStockOnly = ref(false)
const isAddStockModalOpen = ref(false)
const isAdjustModalOpen = ref(false)
const selectedItem = ref(null)
const isTranslating = ref(false)

const editForm = ref({
  ingredient_name: '',
  unit: '',
  quantity_in_stock: 0,
  reorder_level: 0,
  cost_per_unit: 0
})

const newIngredient = ref({
  ingredient_name: '',
  quantity_in_stock: 10,
  unit: 'กก.',
  reorder_level: 3,
  cost_per_unit: 50
})

const filteredIngredients = computed(() => {
  return adminStore.ingredients.filter(i => {
    const thName = getThaiName(i.ingredient_name).toLowerCase()
    const origName = (i.ingredient_name || '').toLowerCase()
    const query = searchQuery.value.toLowerCase()
    const matchSearch = thName.includes(query) || origName.includes(query)
    const matchLow = filterLowStockOnly.value ? i.quantity_in_stock <= i.reorder_level : true
    return matchSearch && matchLow
  })
})

function openAdjust(item) {
  selectedItem.value = item
  editForm.value = {
    ingredient_name: getThaiName(item.ingredient_name),
    unit: getThaiUnit(item.unit, item.ingredient_name),
    quantity_in_stock: Number(item.quantity_in_stock),
    reorder_level: Number(item.reorder_level),
    cost_per_unit: Number(item.cost_per_unit || 25)
  }
  isAdjustModalOpen.value = true
}

async function saveAdjust() {
  if (selectedItem.value) {
    if (typeof adminStore.updateIngredientAPI === 'function') {
      await adminStore.updateIngredientAPI(selectedItem.value.ingredient_id, editForm.value)
    } else if (typeof adminStore.updateStockAPI === 'function') {
      await adminStore.updateStockAPI(selectedItem.value.ingredient_id, editForm.value.quantity_in_stock)
    } else {
      adminStore.updateStock(selectedItem.value.ingredient_id, editForm.value.quantity_in_stock)
    }
  }
  isAdjustModalOpen.value = false
}

async function quickAdd(item, amount) {
  const newQty = Number(item.quantity_in_stock) + amount
  if (typeof adminStore.updateStockAPI === 'function') {
    await adminStore.updateStockAPI(item.ingredient_id, newQty)
  } else {
    adminStore.updateStock(item.ingredient_id, newQty)
  }
}

async function handleTranslateAll() {
  if (isTranslating.value) return
  isTranslating.value = true
  try {
    const success = await adminStore.translateIngredientsToThaiAPI()
    if (success) {
      alert('🎉 แปลงชื่อวัตถุดิบและหน่วยทั้งหมดเป็นภาษาไทยเรียบร้อยแล้ว!')
    } else {
      await adminStore.fetchInventoryFromAPI()
      alert('ดำเนินการแปลงเป็นภาษาไทยเรียบร้อยแล้ว')
    }
  } catch (err) {
    console.error('Translate error:', err)
  } finally {
    isTranslating.value = false
  }
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
  newIngredient.value = { ingredient_name: '', quantity_in_stock: 10, unit: 'กก.', reorder_level: 3, cost_per_unit: 50 }
}

function deleteIng(id) {
  if (confirm('คุณต้องการลบวัตถุดิบนี้ใช่หรือไม่?')) {
    adminStore.deleteIngredient(id)
  }
}

// Recipes formulation helpers (ดึงสูตรจากฐานข้อมูลของเพื่อนก่อนเป็นอันดับแรก)
function getMenuIngredients(menuId) {
  const targetMenu = adminStore.menus.find(m => m.menu_id === menuId)
  if (targetMenu && targetMenu.ingredients && targetMenu.ingredients.length > 0) {
    return targetMenu.ingredients.map(mi => {
      const ing = adminStore.ingredients.find(i => i.ingredient_id === mi.ingredient_id)
      return {
        ...mi,
        ingredient_name: ing ? getThaiName(ing.ingredient_name) : (getThaiName(mi.ingredient_name) || 'วัตถุดิบ'),
        unit: ing ? getThaiUnit(ing.unit, ing.ingredient_name) : (getThaiUnit(mi.unit, mi.ingredient_name) || ''),
        in_stock: ing ? ing.quantity_in_stock : (mi.in_stock || 0)
      }
    })
  }

  return adminStore.menuIngredients
    .filter(mi => mi.menu_id === menuId)
    .map(mi => {
      const ing = adminStore.ingredients.find(i => i.ingredient_id === mi.ingredient_id)
      return {
        ...mi,
        ingredient_name: ing ? getThaiName(ing.ingredient_name) : (getThaiName(mi.ingredient_name) || 'วัตถุดิบ'),
        unit: ing ? getThaiUnit(ing.unit, ing.ingredient_name) : (getThaiUnit(mi.unit, mi.ingredient_name) || ''),
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

function canChooseDishType(menu) {
  if (!menu) return false
  const name = menu.menu_name || menu.name || ''
  // เมนูข้าวผัด, ข้าวเปล่า, ข้าวเหนียว, เครื่องดื่ม, ส้มตำ, ลาบ, ยำ ไม่มีตัวเลือกกับข้าว/ราดข้าว
  if (name.includes('ข้าวผัด') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว')) return false
  if (name.includes('เครื่องดื่ม') || name.includes('น้ำ') || name.includes('โค้ก') || name.includes('สไปรท์') || name.includes('เก๊กฮวย')) return false
  if (name.includes('ส้มตำ') || name.includes('ลาบ') || name.includes('ยำ') || name.includes('ไก่ทอด')) return false
  return true
}

// Recipe editing / formulation modal state
const isRecipeModalOpen = ref(false)
const selectedMenuForRecipe = ref(null)
const recipeEditingItems = ref([])
const newRecipeIngId = ref('')
const newRecipeQty = ref(15)
const isSavingRecipe = ref(false)

function openRecipeModal(menu) {
  selectedMenuForRecipe.value = menu
  const currentReqs = getMenuIngredients(menu.menu_id)
  recipeEditingItems.value = currentReqs.map(r => ({
    ingredient_id: r.ingredient_id,
    quantity_used: Number(r.quantity_used),
    ingredient_name: r.ingredient_name,
    unit: r.unit,
    in_stock: r.in_stock
  }))
  newRecipeIngId.value = ''
  newRecipeQty.value = 15
  isRecipeModalOpen.value = true
}

function addIngredientToRecipe() {
  if (!newRecipeIngId.value) return
  const ingId = Number(newRecipeIngId.value)
  const existing = recipeEditingItems.value.find(i => i.ingredient_id === ingId)
  if (existing) {
    existing.quantity_used = Math.round(((Number(existing.quantity_used) || 0) + (Number(newRecipeQty.value) || 1)) * 100) / 100
    newRecipeIngId.value = ''
    return
  }

  const ing = adminStore.ingredients.find(i => i.ingredient_id === ingId)
  recipeEditingItems.value.push({
    ingredient_id: ingId,
    quantity_used: Number(newRecipeQty.value) || 1,
    ingredient_name: ing ? getThaiName(ing.ingredient_name) : 'วัตถุดิบ',
    unit: ing ? getThaiUnit(ing.unit, ing.ingredient_name) : '',
    in_stock: ing ? ing.quantity_in_stock : 0
  })
  newRecipeIngId.value = ''
  newRecipeQty.value = 15
}

function removeIngredientFromRecipe(index) {
  recipeEditingItems.value.splice(index, 1)
}

async function saveRecipeFormula() {
  if (!selectedMenuForRecipe.value) return
  isSavingRecipe.value = true
  try {
    const payload = recipeEditingItems.value
      .filter(item => Number(item.quantity_used) > 0)
      .map(item => ({
        ingredient_id: item.ingredient_id,
        quantity_used: Number(item.quantity_used)
      }))

    const ok = await adminStore.updateMenuRecipeAPI(selectedMenuForRecipe.value.menu_id, payload)
    if (ok) {
      alert(`🎉 บันทึกสูตรอาหาร "${selectedMenuForRecipe.value.menu_name}" ลงฐานข้อมูลเรียบร้อยแล้ว!`)
      isRecipeModalOpen.value = false
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกสูตรอาหาร กรุณาลองใหม่อีกครั้ง')
    }
  } catch (err) {
    console.error('Save recipe error:', err)
    alert('เกิดข้อผิดพลาด: ' + err.message)
  } finally {
    isSavingRecipe.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">คลังวัตถุดิบ & สูตร (Inventory & Recipe)</h1>
        <p class="text-xs text-slate-500">ระบบสั่งอาหารออนไลน์แบบครบวงจร กรณีศึกษาร้านตำครกซิ่ง</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- ปุ่มแปลงเป็นภาษาไทยทั้งหมด -->
        <button 
          @click="handleTranslateAll"
          :disabled="isTranslating"
          class="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-md shadow-amber-900/10 transition flex items-center gap-1.5 disabled:opacity-50"
          title="แปลงชื่อวัตถุดิบและหน่วยนับทั้งหมดในฐานข้อมูลเป็นภาษาไทย"
        >
          <span v-if="isTranslating">⏳ กำลังแปลงภาษาไทย...</span>
          <span v-else>🇹🇭 แปลงเป็นภาษาไทยทั้งหมด</span>
        </button>

        <button 
          @click="isAddStockModalOpen = true"
          class="px-4 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5"
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
          activeTab === 'stock' ? 'border-[#2d5a43] text-[#2d5a43]' : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>📦 รายการสต็อกวัตถุดิบ</span>
        <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">{{ adminStore.ingredients.length }}</span>
      </button>
      <button 
        @click="activeTab = 'recipes'"
        :class="[
          'px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2',
          activeTab === 'recipes' ? 'border-[#2d5a43] text-[#2d5a43]' : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>🍲 สูตรอาหารและการตัดสต็อก (Recipe Formula)</span>
        <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-[#2d5a43] font-bold text-[10px]">Auto Deduct</span>
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
            class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
          />
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="p-4">ชื่อวัตถุดิบ (INGREDIENT)</th>
                <th class="p-4">ปริมาณคงเหลือ (STOCK)</th>
                <th class="p-4">จุดสั่งซื้อเพิ่ม (REORDER LEVEL)</th>
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
                <!-- Name with Thai primary & subtle English subtitle -->
                <td class="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="item.quantity_in_stock <= item.reorder_level ? 'bg-red-500' : 'bg-emerald-500'"></span>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900 leading-snug">{{ getThaiName(item.ingredient_name) }}</span>
                    <span v-if="getThaiName(item.ingredient_name) !== item.ingredient_name" class="text-[10px] text-slate-400 font-normal">
                      {{ item.ingredient_name }}
                    </span>
                  </div>
                </td>

                <!-- Stock Amount with Thai Unit -->
                <td class="p-4">
                  <span class="font-black text-sm text-slate-900">{{ item.quantity_in_stock }}</span>
                  <span class="text-slate-500 ml-1.5 font-medium">{{ getThaiUnit(item.unit, item.ingredient_name) }}</span>
                </td>

                <!-- Reorder Level with Thai Unit -->
                <td class="p-4 text-slate-600 font-medium">
                  {{ item.reorder_level }} {{ getThaiUnit(item.unit, item.ingredient_name) }}
                </td>

                <!-- Cost with Thai Unit -->
                <td class="p-4 text-slate-600 font-medium">
                  ฿{{ item.cost_per_unit }} / {{ getThaiUnit(item.unit, item.ingredient_name) }}
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
      <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/80 text-xs text-[#183324] flex items-start gap-3">
        <span class="text-xl flex-shrink-0">💡</span>
        <div>
          <p class="font-bold">ระบบตัดสต็อกวัตถุดิบอัตโนมัติ (Automated Stock Deduction Logic)</p>
          <p class="text-[11px] text-emerald-800/90 mt-0.5">
            เมื่อลูกค้าสั่งอาหารและชำระเงินสำเร็จ ระบบจะคำนวณและตัดจำนวนวัตถุดิบตามสูตร (Quantity Used) ในตาราง MENU_INGREDIENTS ทันที <span class="bg-emerald-100/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">✨ กรณีสั่งแบบ "กับข้าว" ระบบจะไม่ตัดสต็อกข้าวสารหอมมะลิ</span> <span class="bg-sky-100/90 text-sky-900 px-1.5 py-0.5 rounded font-bold ml-1">🦐🦑 เมนูทะเลแยก "เฉพาะกุ้ง" หรือ "เฉพาะหมึก" ระบบจะตัดเฉพาะวัตถุดิบที่ลูกค้าเลือก</span>
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
              <button
                @click="openRecipeModal(menu)"
                class="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#2d5a43] text-[#2d5a43] hover:text-white font-bold text-xs transition flex items-center gap-1 border border-emerald-200/80 shadow-sm flex-shrink-0"
                title="แก้ไขสูตรหรือผูกวัตถุดิบเข้ากับเมนูนี้"
              >
                <span>⚙️</span>
                <span>ผูก/แก้ไขสูตร</span>
              </button>
            </div>

            <!-- Ingredients breakdown -->
            <div class="mt-3 space-y-2">
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">สูตรและสัดส่วนต่อ 1 จาน:</div>
              <div 
                v-for="r in getMenuIngredients(menu.menu_id)" 
                :key="r.ingredient_id"
                class="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50"
              >
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span class="font-semibold text-slate-800">{{ r.ingredient_name }}</span>
                  <span 
                    v-if="(r.ingredient_name.includes('ข้าวสาร') || r.ingredient_name.includes('ข้าวหอมมะลิ')) && canChooseDishType(menu)"
                    class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold"
                    title="ระบบจะตัดสต็อกเฉพาะเมื่อสั่งแบบราดข้าว หากสั่งเป็นกับข้าวจะไม่ดึงสต็อกรายการนี้"
                  >
                    เฉพาะราดข้าว (สั่งกับข้าวไม่ตัด)
                  </span>
                  <span 
                    v-if="(r.ingredient_name.includes('กุ้ง') && !r.ingredient_name.includes('กุ้งแห้ง')) && (menu.menu_name.includes('ทะเล') || menu.menu_name.includes('/กุ้ง'))"
                    class="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold"
                    title="ระบบจะตัดสต็อกกุ้งสดเมื่อสั่งรวมทะเลหรือสั่งเฉพาะกุ้ง (หากสั่งเฉพาะหมึกจะไม่ตัด)"
                  >
                    🦐 ทะเล/กุ้ง (สั่งเฉพาะหมึกไม่ตัด)
                  </span>
                  <span 
                    v-if="r.ingredient_name.includes('หมึก') && (menu.menu_name.includes('ทะเล') || menu.menu_name.includes('หมึก'))"
                    class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold"
                    title="ระบบจะตัดสต็อกหมึกสดเมื่อสั่งรวมทะเลหรือสั่งเฉพาะหมึก (หากสั่งเฉพาะกุ้งจะไม่ตัด)"
                  >
                    🦑 ทะเล/หมึก (สั่งเฉพาะกุ้งไม่ตัด)
                  </span>
                </div>
                <div class="text-slate-500">
                  <span class="font-bold text-slate-900">{{ r.quantity_used }}</span> {{ r.unit }} 
                  <span class="text-[10px] text-slate-400 ml-1">(คงเหลือ {{ r.in_stock }} {{ r.unit }})</span>
                </div>
              </div>
              <div v-if="getMenuIngredients(menu.menu_id).length === 0" class="text-xs text-slate-400 italic py-2 text-center">
                ยังไม่มีการผูกสูตรอาหาร (กดปุ่ม "ผูก/แก้ไขสูตร" เพื่อกำหนดวัตถุดิบ)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: จัดการ/ผูกสูตรอาหาร (Recipe Formulation Modal) -->
    <div v-if="isRecipeModalOpen && selectedMenuForRecipe" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <img :src="selectedMenuForRecipe.image_url" :alt="selectedMenuForRecipe.menu_name" class="w-10 h-10 rounded-xl object-cover">
            <div>
              <h3 class="font-bold text-base text-slate-900">
                🍲 จัดการสูตรอาหาร: {{ selectedMenuForRecipe.menu_name }}
              </h3>
              <p class="text-[11px] text-slate-500">
                กำหนดวัตถุดิบและสัดส่วนที่ใช้ต่อ 1 จาน (บันทึกลงตาราง MENU_INGREDIENTS)
              </p>
            </div>
          </div>
          <button @click="isRecipeModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <!-- Recipe Ingredients List -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div v-if="recipeEditingItems.length === 0" class="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
            ยังไม่มีวัตถุดิบในสูตรนี้ กดเลือกวัตถุดิบด้านล่างเพื่อเพิ่มได้เลยครับ
          </div>

          <div 
            v-for="(item, idx) in recipeEditingItems" 
            :key="item.ingredient_id"
            class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-slate-800 truncate">{{ item.ingredient_name }}</span>
                <span 
                  v-if="(item.ingredient_name.includes('กุ้ง') && !item.ingredient_name.includes('กุ้งแห้ง')) && (selectedMenuForRecipe?.menu_name.includes('ทะเล') || selectedMenuForRecipe?.menu_name.includes('/กุ้ง'))"
                  class="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold"
                >
                  🦐 เฉพาะกุ้ง/รวม
                </span>
                <span 
                  v-if="item.ingredient_name.includes('หมึก') && (selectedMenuForRecipe?.menu_name.includes('ทะเล') || selectedMenuForRecipe?.menu_name.includes('หมึก'))"
                  class="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold"
                >
                  🦑 เฉพาะหมึก/รวม
                </span>
              </div>
              <div class="text-[10px] text-slate-400">คงเหลือในสต็อก: {{ item.in_stock }} {{ item.unit }}</div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-slate-500 text-[11px]">ใช้ต่อ 1 จาน:</span>
              <input 
                type="number" 
                step="0.01" 
                min="0.01"
                v-model.number="item.quantity_used"
                class="w-20 px-2 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-900 text-center text-xs focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
              <span class="text-slate-600 font-bold w-10 text-xs">{{ item.unit }}</span>
              <button 
                @click="removeIngredientFromRecipe(idx)"
                class="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="ลบวัตถุดิบนี้ออกจากสูตร"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Add ingredient section -->
          <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2 mt-3">
            <label class="block font-bold text-slate-700 text-xs">➕ เพิ่มวัตถุดิบลงในสูตรอาหาร:</label>
            <div class="flex items-center gap-2 flex-wrap">
              <select 
                v-model="newRecipeIngId"
                class="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-semibold text-slate-800"
              >
                <option value="" disabled>-- เลือกวัตถุดิบจากคลัง --</option>
                <option 
                  v-for="ing in adminStore.ingredients" 
                  :key="ing.ingredient_id" 
                  :value="ing.ingredient_id"
                >
                  {{ getThaiName(ing.ingredient_name) }} (คงเหลือ {{ ing.quantity_in_stock }} {{ getThaiUnit(ing.unit, ing.ingredient_name) }})
                </option>
              </select>

              <input 
                type="number" 
                step="0.01" 
                min="0.01"
                v-model.number="newRecipeQty"
                placeholder="ปริมาณ"
                class="w-20 px-2 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-center text-xs focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />

              <button 
                type="button"
                @click="addIngredientToRecipe"
                :disabled="!newRecipeIngId"
                class="px-3 py-1.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                เพิ่มในสูตร
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
          <button 
            @click="isRecipeModalOpen = false" 
            class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
          >
            ยกเลิก
          </button>
          <button 
            @click="saveRecipeFormula"
            :disabled="isSavingRecipe"
            class="px-4 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <span v-if="isSavingRecipe">⏳ กำลังบันทึก...</span>
            <span v-else>💾 บันทึกสูตรอาหาร</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Adjust / Edit Stock & Details -->
    <div v-if="isAdjustModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">✏️</span>
            <div>
              <h3 class="font-bold text-base text-slate-900">แก้ไขข้อมูลวัตถุดิบ & สต็อก</h3>
              <p class="text-[11px] text-slate-400">แก้ไขชื่อภาษาไทย หน่วยนับ และจำนวนสต็อก</p>
            </div>
          </div>
          <button @click="isAdjustModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อวัตถุดิบ (ภาษาไทย) *</label>
            <input 
              type="text" 
              v-model="editForm.ingredient_name"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-semibold text-slate-900"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ปริมาณคงเหลือ *</label>
              <input 
                type="number" 
                step="0.1" 
                v-model="editForm.quantity_in_stock"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-slate-900 text-center"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">หน่วยนับ *</label>
              <input 
                type="text" 
                v-model="editForm.unit"
                placeholder="เช่น กก., ขวด, ตัว, ฟอง"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-medium text-slate-800 text-center"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">จุดเตือนสั่งเพิ่ม (Reorder Level)</label>
              <input 
                type="number" 
                step="0.1" 
                v-model="editForm.reorder_level"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none text-center"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ต้นทุน / หน่วย (บาท)</label>
              <input 
                type="number" 
                v-model="editForm.cost_per_unit"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none text-center"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button 
            @click="isAdjustModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition"
          >
            ยกเลิก
          </button>
          <button 
            @click="saveAdjust"
            class="px-4 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-[#2d5a43]/20 transition"
          >
            บันทึกการเปลี่ยนแปลง
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
            <label class="block font-bold text-slate-700 mb-1">ชื่อวัตถุดิบ (ภาษาไทย) *</label>
            <input 
              type="text" 
              v-model="newIngredient.ingredient_name"
              placeholder="เช่น มะเขือเทศสีดา, หมูสับ"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">จำนวนเริ่มต้น *</label>
              <input 
                type="number" 
                step="0.1" 
                v-model="newIngredient.quantity_in_stock"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">หน่วยนับ *</label>
              <input 
                type="text" 
                v-model="newIngredient.unit"
                placeholder="เช่น กก., ขวด, ตัว, ฟอง, กรัม"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ต้นทุนเฉลี่ย / หน่วย (บาท)</label>
              <input 
                type="number" 
                v-model="newIngredient.cost_per_unit"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
            class="px-5 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-[#2d5a43]/20 transition"
          >
            บันทึกวัตถุดิบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>