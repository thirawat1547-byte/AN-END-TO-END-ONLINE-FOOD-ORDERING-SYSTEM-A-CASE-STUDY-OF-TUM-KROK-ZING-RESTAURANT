<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { socket } from '../../config/socket'

const search = ref('')
const activeCategory = ref('all')
const isLoading = ref(false)
const menuItems = ref([])
let pollTimer = null

// รายการหมวดหมู่อาหารหลักทั้งหมด 5 หมวดหมู่ + ทั้งหมด
const CATEGORY_DEFINITIONS = [
  { id: 'all', label: 'ทั้งหมด', icon: '🍽️' },
  { id: 1, label: 'อาหารจานเดียว / ผัด', icon: '🍳' },
  { id: 2, label: 'ส้มตำแซ่บซิ่ง', icon: '🌶️' },
  { id: 3, label: 'ลาบ / ยำ', icon: '🥗' },
  { id: 4, label: 'ของทอด', icon: '🍗' },
  { id: 5, label: 'เครื่องดื่ม', icon: '🥤' }
]

// แปลงข้อมูลหมวดหมู่ของเมนูให้ตรงตามฐานข้อมูล
function resolveCategory(m) {
  const catId = Number(m.category_id || m.category?.category_id || 0)
  let catName = m.category?.category_name || m.category_name || ''

  if (!catName) {
    if (catId === 1) catName = 'อาหารจานเดียว / ผัด'
    else if (catId === 2) catName = 'ส้มตำแซ่บซิ่ง'
    else if (catId === 3) catName = 'ลาบ / ยำ'
    else if (catId === 4) catName = 'ของทอด'
    else if (catId === 5) catName = 'เครื่องดื่ม'
    else {
      const n = (m.menu_name || m.name || '').toLowerCase()
      if (n.includes('น้ำ') || n.includes('โค้ก') || n.includes('สไปรท์') || n.includes('เก๊กฮวย') || n.includes('ดื่ม')) {
        return { id: 5, name: 'เครื่องดื่ม', icon: '🥤' }
      }
      if (n.includes('ส้มตำ') || n.includes('ตำ')) {
        return { id: 2, name: 'ส้มตำแซ่บซิ่ง', icon: '🌶️' }
      }
      if (n.includes('ลาบ') || n.includes('ยำ')) {
        return { id: 3, name: 'ลาบ / ยำ', icon: '🥗' }
      }
      if (n.includes('ทอด') || n.includes('ปีกไก่') || n.includes('ไก่ทอด')) {
        return { id: 4, name: 'ของทอด', icon: '🍗' }
      }
      return { id: 1, name: 'อาหารจานเดียว / ผัด', icon: '🍳' }
    }
  }

  let icon = '🍽️'
  if (catId === 1 || catName.includes('ผัด') || catName.includes('จานเดียว')) icon = '🍳'
  else if (catId === 2 || catName.includes('ส้มตำ') || catName.includes('ตำ')) icon = '🌶️'
  else if (catId === 3 || catName.includes('ลาบ') || catName.includes('ยำ')) icon = '🥗'
  else if (catId === 4 || catName.includes('ทอด')) icon = '🍗'
  else if (catId === 5 || catName.includes('เครื่องดื่ม') || catName.includes('น้ำ')) icon = '🥤'

  return { id: catId || 1, name: catName, icon }
}

// จัดสี Badge ของแต่ละหมวดหมู่ให้สวยงาม อ่านง่าย
const getCategoryBadgeStyle = (catId, catName) => {
  const id = Number(catId)
  if (id === 1 || catName?.includes('ผัด') || catName?.includes('จานเดียว')) {
    return {
      backgroundColor: '#FFF7ED',
      color: '#C2410C',
      border: '1px solid #FFEDD5'
    }
  }
  if (id === 2 || catName?.includes('ส้มตำ') || catName?.includes('ตำ')) {
    return {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      border: '1px solid #FEE2E2'
    }
  }
  if (id === 3 || catName?.includes('ลาบ') || catName?.includes('ยำ')) {
    return {
      backgroundColor: '#ECFDF5',
      color: '#047857',
      border: '1px solid #D1FAE5'
    }
  }
  if (id === 4 || catName?.includes('ทอด')) {
    return {
      backgroundColor: '#FEFCE8',
      color: '#A16207',
      border: '1px solid #FEF08A'
    }
  }
  if (id === 5 || catName?.includes('เครื่องดื่ม') || catName?.includes('น้ำ')) {
    return {
      backgroundColor: '#F0F9FF',
      color: '#0284C7',
      border: '1px solid #E0F2FE'
    }
  }
  return {
    backgroundColor: '#FAF9F5',
    color: '#374151',
    border: '1px solid rgba(209,213,219,0.8)'
  }
}

// หมวดหมู่พร้อมจำนวนเมนู
const categories = computed(() => {
  return CATEGORY_DEFINITIONS.map(c => {
    const count = c.id === 'all'
      ? menuItems.value.length
      : menuItems.value.filter(m => m.categoryId === c.id || m.categoryName === c.label).length
    return { ...c, count }
  })
})

// ดึงรายการเมนูทั้งหมดจากฐานข้อมูลจริง
const fetchMenus = async () => {
  try {
    isLoading.value = true
    const res = await axios.get(`${API_BASE}/menus`)
    const data = res.data || []
    const seen = new Set()
    const uniqueData = []
    for (const m of data) {
      let canonical = (m.menu_name || '').trim()
      if (canonical === 'ไข่เจียวหมูสับ') canonical = 'ข้าวไข่เจียวหมูสับ'
      if (canonical === 'ไข่เจียวกุ้ง') canonical = 'ข้าวไข่เจียวกุ้ง'
      if (canonical === 'ปีกไก่ทอด') canonical = 'ไก่ทอด (ปีก)'

      if (!seen.has(canonical)) {
        seen.add(canonical)
        uniqueData.push({ ...m, menu_name: canonical })
      }
    }

    menuItems.value = uniqueData.map(m => {
      const cat = resolveCategory(m)
      return {
        id: m.menu_id,
        name: m.menu_name,
        price: Number(m.price || 0),
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        image: m.image_url || '/images/kapaomu.jpg',
        available: m.is_available ?? true
      }
    })
  } catch (err) {
    console.error('โหลดเมนูไม่สำเร็จ:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMenus()
  if (socket) {
    socket.on('menu_updated', fetchMenus)
    socket.on('new_order', fetchMenus)
    socket.on('order_status_updated', fetchMenus)
  }
  pollTimer = setInterval(fetchMenus, 10000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (socket) {
    socket.off('menu_updated', fetchMenus)
    socket.off('new_order', fetchMenus)
    socket.off('order_status_updated', fetchMenus)
  }
})

const filtered = computed(() => {
  return menuItems.value.filter(item => {
    const matchCat = activeCategory.value === 'all' || 
                     item.categoryId === activeCategory.value || 
                     item.categoryName === activeCategory.value
    const matchSearch = item.name.toLowerCase().includes(search.value.toLowerCase()) ||
                        (item.categoryName && item.categoryName.toLowerCase().includes(search.value.toLowerCase()))
    return matchCat && matchSearch
  })
})

// อัปเดตสถานะเปิด/ปิดขายเมนูลงฐานข้อมูลจริง
const toggleAvailable = async (item) => {
  const newStatus = !item.available
  item.available = newStatus // Optimistic UI update
  try {
    await axios.patch(`${API_BASE}/menus/${item.id}`, {
      is_available: newStatus
    })
    if (socket && socket.connected) {
      socket.emit('menu_updated', { menu_id: item.id, is_available: newStatus })
    }
  } catch (err) {
    console.error('อัปเดตสถานะเมนูไม่สำเร็จ:', err)
    item.available = !newStatus // คืนค่าเดิมหากเชื่อมต่อล้มเหลว
    alert('ไม่สามารถอัปเดตสถานะสินค้าได้')
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Header Bar -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 24px; font-weight: 400; margin: 0; letter-spacing: 0.5px;">Inventory Management</h1>
        <span style="font-size: 14px; font-weight: 300; opacity: 0.8;">จัดการสต็อกสินค้า</span>
      </div>
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Content & Controls -->
    <div style="flex: 1; padding: 32px; overflow-y: auto; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 1152px;">
        
        <!-- Toolbar (Search & Category Switch) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
          <!-- Search Input -->
          <div style="position: relative; flex: 1; min-width: 280px; max-width: 400px;">
            <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #9CA3AF;">🔍</span>
            <input
              v-model="search"
              type="text"
              placeholder="ค้นหารายการอาหาร..."
              style="width: 100%; background-color: #EFECE3; padding: 12px 16px 12px 44px; border-radius: 16px; font-size: 15px; border: none; outline: none; color: #374151; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);"
            />
          </div>

          <!-- Category Filter Capsule -->
          <div style="background-color: #EFECE3; padding: 5px; border-radius: 16px; display: flex; align-items: center; gap: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03); overflow-x: auto; max-width: 100%;">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              style="padding: 8px 16px; border-radius: 12px; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"
              :style="activeCategory === cat.id ? 'background-color: #FAF9F5; color: #111827; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.08);' : 'background: transparent; color: #4B5563; font-weight: 500;'"
            >
              <span style="font-size: 14px;">{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
              <span 
                style="font-size: 11px; padding: 1px 6px; border-radius: 9999px; transition: all 0.2s;"
                :style="activeCategory === cat.id ? 'background: rgba(0,0,0,0.08); color: #111827; font-weight: 700;' : 'background: rgba(0,0,0,0.04); color: #6B7280;'"
              >
                {{ cat.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Inventory List Card Table -->
        <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); border: 1px solid rgba(227,222,195,0.6); margin-bottom: 40px;">
          <!-- Table Header -->
          <div style="display: grid; grid-template-columns: 76px 1fr 110px 190px 140px; color: #4B5563; font-weight: 700; font-size: 14px; padding-bottom: 16px; padding-left: 16px; padding-right: 16px; border-bottom: 1px solid rgba(209,213,219,0.6); align-items: center;">
            <div>รูปภาพ</div>
            <div>ชื่อรายการ</div>
            <div>ราคา</div>
            <div>หมวดหมู่</div>
            <div style="text-align: right;">สถานะสินค้า</div>
          </div>

          <!-- Table Rows -->
          <div style="display: flex; flex-direction: column;">
            <div
              v-for="item in filtered"
              :key="item.id"
              style="display: grid; grid-template-columns: 76px 1fr 110px 190px 140px; align-items: center; padding: 16px; font-size: 14px; border-bottom: 1px solid rgba(209,213,219,0.3);"
              :style="!item.available ? 'opacity: 0.6;' : ''"
            >
              <!-- Image Icon -->
              <div>
                <img 
                  v-if="item.image && item.image.startsWith('/')"
                  :src="item.image" 
                  :alt="item.name"
                  style="width: 56px; height: 56px; border-radius: 16px; object-fit: cover; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;"
                />
                <div v-else style="width: 56px; height: 56px; border-radius: 16px; background-color: #FAF9F5; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                  {{ item.image }}
                </div>
              </div>

              <!-- Item Name -->
              <div style="font-weight: 700; color: #1F2937; font-size: 16px;">
                {{ item.name }}
              </div>

              <!-- Price -->
              <div style="font-weight: 600; color: #1F2937; font-size: 16px;">
                ฿{{ item.price }}
              </div>

              <!-- Category Badge -->
              <div>
                <span 
                  :style="getCategoryBadgeStyle(item.categoryId, item.categoryName)"
                  style="padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;"
                >
                  <span style="font-size: 13px;">{{ item.categoryIcon }}</span>
                  <span>{{ item.categoryName }}</span>
                </span>
              </div>

              <!-- Stock Status & Toggle Switch -->
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
                <span
                  style="font-size: 12px; font-weight: 700;"
                  :style="item.available ? 'color: #374151;' : 'color: #EF4444;'"
                >
                  {{ item.available ? 'มีสินค้า' : 'สินค้าหมด' }}
                </span>

                <!-- Modern Toggle Switch -->
                <button
                  @click="toggleAvailable(item)"
                  style="width: 48px; height: 24px; border-radius: 9999px; padding: 2px; transition: background-color 0.3s; border: none; cursor: pointer; display: flex; align-items: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);"
                  :style="item.available ? 'background-color: #48785A;' : 'background-color: #F87171;'"
                >
                  <div
                    style="width: 20px; height: 20px; background-color: white; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: transform 0.3s;"
                    :style="item.available ? 'transform: translateX(24px);' : 'transform: translateX(0px);'"
                  ></div>
                </button>
              </div>
            </div>

            <!-- Empty Search Result -->
            <div v-if="filtered.length === 0" style="padding: 64px 0; text-align: center; color: #9CA3AF;">
              <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
              <p style="font-size: 14px; font-weight: 500; margin: 0;">ไม่พบรายการที่ค้นหา</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>