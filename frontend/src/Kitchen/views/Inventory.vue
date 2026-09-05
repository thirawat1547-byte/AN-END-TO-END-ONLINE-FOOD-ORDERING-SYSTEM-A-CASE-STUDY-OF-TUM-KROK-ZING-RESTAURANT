<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const activeCategory = ref('all')

const categories = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'food', label: 'อาหาร' },
  { id: 'drink', label: 'เครื่องดื่ม' },
]

const menuItems = ref([
  { id: 1, name: 'ข้าวผัดกระเพราหมูสับ', price: 60, category: 'food', image: '🍚', available: true },
  { id: 2, name: 'ต้มยำกุ้ง', price: 120, category: 'food', image: '🍲', available: true },
  { id: 3, name: 'ผัดไทยกุ้งสด', price: 90, category: 'food', image: '🍝', available: false },
  { id: 4, name: 'ลาบหมู', price: 70, category: 'food', image: '🥗', available: true },
  { id: 5, name: 'ส้มตำไทย', price: 60, category: 'food', image: '🥙', available: true },
  { id: 6, name: 'ไก่ย่าง', price: 80, category: 'food', image: '🍗', available: true },
  { id: 7, name: 'แกงเขียวหวานไก่', price: 80, category: 'food', image: '🍛', available: false },
  { id: 8, name: 'ผัดซีอิ๊วหมู', price: 65, category: 'food', image: '🍜', available: true },
  { id: 9, name: 'น้ำมะนาว', price: 30, category: 'drink', image: '🍋', available: true },
  { id: 10, name: 'ชาเย็น', price: 35, category: 'drink', image: '🧋', available: true },
  { id: 11, name: 'โค้ก', price: 25, category: 'drink', image: '🥤', available: true },
  { id: 12, name: 'น้ำเปล่า', price: 15, category: 'drink', image: '💧', available: true },
])

const filtered = computed(() => {
  return menuItems.value.filter(item => {
    const matchCat = activeCategory.value === 'all' || item.category === activeCategory.value
    const matchSearch = item.name.toLowerCase().includes(search.value.toLowerCase())
    return matchCat && matchSearch
  })
})

const toggleAvailable = (item) => {
  item.available = !item.available
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
        <button style="cursor: pointer; background: none; border: none; color: inherit;">❓</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; background: none; color: inherit; cursor: pointer; font-size: 14px;">👤</button>
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
          <div style="background-color: #EFECE3; padding: 6px; border-radius: 16px; display: flex; align-items: center; gap: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              style="padding: 10px 24px; border-radius: 12px; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s;"
              :style="activeCategory === cat.id ? 'background-color: #FAF9F5; color: #111827; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05);' : 'background: transparent; color: #4B5563; font-weight: 500;'"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Inventory List Card Table -->
        <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); border: 1px solid rgba(227,222,195,0.6); margin-bottom: 40px;">
          <!-- Table Header -->
          <div style="display: grid; grid-template-columns: 80px 1fr 120px 140px 140px; color: #4B5563; font-weight: 700; font-size: 14px; padding-bottom: 16px; padding-left: 16px; padding-right: 16px; border-bottom: 1px solid rgba(209,213,219,0.6); align-items: center;">
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
              style="display: grid; grid-template-columns: 80px 1fr 120px 140px 140px; align-items: center; padding: 16px; font-size: 14px; border-bottom: 1px solid rgba(209,213,219,0.3);"
              :style="!item.available ? 'opacity: 0.6;' : ''"
            >
              <!-- Image Icon -->
              <div>
                <div style="width: 56px; height: 56px; border-radius: 16px; background-color: #FAF9F5; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
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
                <span style="background-color: #FAF9F5; border: 1px solid rgba(209,213,219,0.8); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 500; color: #374151;">
                  {{ item.category === 'food' ? 'อาหาร' : 'เครื่องดื่ม' }}
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