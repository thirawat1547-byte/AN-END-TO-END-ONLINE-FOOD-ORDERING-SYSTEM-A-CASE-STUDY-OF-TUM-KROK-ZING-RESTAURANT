<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { adminStore } from '../store/adminData'

onMounted(async () => {
  await adminStore.fetchMenusFromAPI()
})

const selectedCategory = ref(0) // 0 = all
const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const fileInputRef = ref(null)
const isUploadingImage = ref(false)
const uploadError = ref('')

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
  const query = (searchQuery.value || '').trim().toLowerCase()
  return adminStore.menus.filter(m => {
    const matchCategory = selectedCategory.value === 0 || m.category_id === selectedCategory.value
    const matchSearch = !query || 
                        (m.menu_name || '').toLowerCase().includes(query) || 
                        (m.description || '').toLowerCase().includes(query)
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
  uploadError.value = ''
  form.value = { ...menu, allergen_ids: [...menu.allergen_ids] }
  isModalOpen.value = true
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // ตรวจสอบชนิดไฟล์
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
    uploadError.value = 'กรุณาเลือกไฟล์ภาพ (JPG, PNG, WEBP, GIF) เท่านั้น'
    return
  }

  // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'ขนาดไฟล์ภาพต้องไม่เกิน 5MB'
    return
  }

  uploadError.value = ''
  isUploadingImage.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await axios.post(`${API_BASE}/menus/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.data && res.data.url) {
      form.value.image_url = res.data.url
    }
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:', err)
    uploadError.value = err.response?.data?.message || 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isUploadingImage.value = false
    if (event.target) {
      event.target.value = ''
    }
  }
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
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${menu.menu_name}"?`)) {
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
        class="px-4 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-2"
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
            selectedCategory === 0 ? 'bg-[#183324] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            selectedCategory === cat.category_id ? 'bg-[#2d5a43] text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2d5a43]/50"
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
          <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#2d5a43] text-white font-bold text-[10px] shadow">
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
              <span class="font-black text-[#2d5a43] text-base flex-shrink-0">฿{{ menu.price }}</span>
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
                <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </div>
              <span class="text-[11px] font-medium text-slate-600">
                {{ menu.is_available ? 'พร้อมขาย' : 'ปิดการขาย' }}
              </span>
            </label>

            <!-- Edit & Delete Buttons -->
            <div class="flex items-center gap-1.5">
              <button 
                @click="openEditModal(menu)"
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-[#2d5a43] text-slate-600 text-xs transition"
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
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
            />
          </div>

          <!-- Category & Price -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">หมวดหมู่ *</label>
              <select 
                v-model="form.category_id"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">สถานะพร้อมจำหน่าย</label>
              <select 
                v-model="form.is_available"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              >
                <option :value="true">พร้อมขาย (In Stock)</option>
                <option :value="false">สินค้าหมด (Out of Stock)</option>
              </select>
            </div>
          </div>

          <!-- Image Upload & URL (Multer File Upload) -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>รูปภาพอาหาร (Menu Image) *</span>
              <span class="text-[10px] text-slate-400 font-normal">รองรับไฟล์ JPG, PNG, WEBP (สูงสุด 5MB)</span>
            </label>

            <!-- Upload Area & Preview -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div class="flex items-center gap-3">
                <!-- Preview Thumbnail -->
                <div class="w-16 h-16 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  <img 
                    v-if="form.image_url" 
                    :src="form.image_url" 
                    alt="Preview" 
                    class="w-full h-full object-cover"
                    @error="uploadError = 'ไม่สามารถโหลดรูปภาพตัวอย่างได้'"
                  />
                  <span v-else class="text-2xl text-slate-300">🍲</span>
                </div>

                <!-- Upload Buttons & Info -->
                <div class="flex-1 space-y-1.5">
                  <input 
                    type="file" 
                    ref="fileInputRef" 
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="hidden" 
                    @change="handleFileUpload"
                  />
                  
                  <button 
                    type="button"
                    @click="triggerFileInput"
                    :disabled="isUploadingImage"
                    class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <span v-if="isUploadingImage">⏳ กำลังอัปโหลด...</span>
                    <span v-else>📁 อัปโหลดไฟล์ภาพตรง (Multer)</span>
                  </button>

                  <div v-if="uploadError" class="text-[11px] text-rose-600 font-medium">
                    ⚠️ {{ uploadError }}
                  </div>
                  <div v-else class="text-[10px] text-slate-400">
                    {{ form.image_url ? 'อัปโหลดแล้ว หรือแก้ไข URL ได้ที่ช่องด้านล่าง' : 'เลือกรูปภาพจากเครื่องเพื่ออัปโหลดเข้าเซิร์ฟเวอร์' }}
                  </div>
                </div>
              </div>

              <!-- Direct URL Fallback / Edit -->
              <div>
                <input 
                  type="text" 
                  v-model="form.image_url"
                  placeholder="URL หรือเส้นทางไฟล์รูปภาพ (เช่น /uploads/... หรือ https://...)"
                  class="w-full px-3 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
                />
              </div>
            </div>
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
                  class="rounded text-[#2d5a43] focus:ring-[#2d5a43]"
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
            class="px-5 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition"
          >
            บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  </div>
</template>