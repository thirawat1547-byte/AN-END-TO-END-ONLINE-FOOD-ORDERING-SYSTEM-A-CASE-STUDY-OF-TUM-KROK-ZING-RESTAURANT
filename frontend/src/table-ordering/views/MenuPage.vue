<template>
  <div class="menu-page">
    <OrderHeader :tableId="tableId" />

    <!-- 🛑 ป้ายแจ้งเตือนเมื่อร้านปิด -->
    <div v-if="!isStoreOpen" class="table-closed-banner">
      <div class="closed-banner-icon">🛑</div>
      <div class="closed-banner-info">
        <strong class="closed-banner-title">ขณะนี้ร้านปิดให้บริการชั่วคราว</strong>
        <p class="closed-banner-sub">ระบบงดรับคำสั่งซื้อจากโต๊ะอาหารในขณะนี้ ขออภัยในความไม่สะดวกครับ</p>
      </div>
      <span class="closed-banner-pill">ปิดร้าน</span>
    </div>

    <CategoryTabs :categories="categories" v-model="activeCategory" />
    
    <div class="menu-grid" :key="activeCategory">
      <MenuItemCard 
        v-for="item in filteredMenu" 
        :key="item.id + '-' + item.menu_name" 
        :item="item" 
        @select="handleAction(item, false)"
        @add="handleAction(item, true)"
      />
    </div>

    <!-- Modal สำหรับแสดงรูปและปุ่มเพิ่มลงตะกร้า (เมนูที่ไม่มีส่วนเสริม) -->
    <div v-if="previewItem" class="modal-overlay" @click="closePreview">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closePreview">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <img :src="previewItem.image_url" :alt="previewItem.menu_name" class="preview-image" />
        <div class="preview-info">
          <h3 class="preview-title">{{ previewItem.menu_name }}</h3>
          <p class="preview-desc" v-if="previewItem.desc">{{ previewItem.desc }}</p>
          <div class="preview-price">฿{{ previewItem.price.toFixed(2) }}</div>
        </div>
        <button class="modal-add-btn" @click="addFromPreview">
          + เพิ่มลงตะกร้า ฿{{ previewItem.price.toFixed(2) }}
        </button>
      </div>
    </div>

    <FloatingCartBar 
      :itemCount="cartItemCount" 
      :total="cartTotal" 
      @view-cart="goToCart"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import OrderHeader from '../components/OrderHeader.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import MenuItemCard from '../components/MenuItemCard.vue'
import FloatingCartBar from '../components/FloatingCartBar.vue'
import { useCart } from '../composables/useCart'
import { API_BASE } from '../../config/api'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { addToCart, cartItemCount, cartTotal } = useCart()
const isStoreOpen = ref(true)

// แผนที่รูปภาพมาตรฐานเพื่อการแสดงผลที่ถูกต้อง
const imageMap = {
  'กะเพราหมู': '/images/kapaomu.jpg',
  'กระเพราหมู': '/images/kapaomu.jpg',
  'กะเพราทะเล/หมึก/กุ้ง': '/images/kapaotaley.jpg',
  'กระเพราทะเล/หมึก/กุ้ง': '/images/kapaotaley.jpg',
  'ข้าวผัดหมู': '/images/khaopadmu.jpg',
  'ข้าวผัดทะเล/หมึก/กุ้ง': '/images/khaopadtalay.jpg',
  'ผัดพริกแกงหมู': '/images/pikkangmu.jpg',
  'ผัดพริกแกงทะเล/หมึก/กุ้ง': '/images/prikkangtalay.jpg',
  'ผัดคะน้าหมูกรอบ': '/images/kanamokrop.jpg',
  'ผัดคะน้าหมู': '/images/kanamokrop.jpg',
  'ผัดคะน้าทะเล/หมึก/กุ้ง': '/images/kanatalay.jpg',
  'ข้าวหมูกระเทียม': '/images/mookratiem.jpg',
  'ข้าวไข่เจียวหมูสับ': '/images/kaijeawmoosub.jpg',
  'ข้าวไข่เจียวกุ้ง': '/images/kaikung.jpg',
  'ส้มตำปูปลาร้า': '/images/tumprara.jpg',
  'ส้มตำไทย': '/images/tumtai.jpg',
  'ลาบหมู': '/images/larbmoo.jpg',
  'น้ำตกหมู': '/images/namtokmoo.jpg',
  'ยำวุ้นเส้นทะเล': '/images/yumtalay.jpg',
  'ไก่ทอด (สะโพก)': '/images/chick.jpg',
  'ไก่ทอด (ปีก)': '/images/wingchick.jpg',
  'ปีกไก่ทอด': '/images/wingchick.jpg',
  'โค้ก (กระป๋อง)': '/images/coke.jpg',
  'โค้ก (Coke)': '/images/coke.jpg',
  'สไปรท์ (Sprite)': '/images/sprite.jpg',
  'น้ำเก๊กฮวย': '/images/gek.jpg',
  'น้ำดื่ม': '/images/water.jpg',
  'น้ำเปล่า': '/images/water.jpg',
  'ข้าวเปล่า': '/images/kao.jpg',
  'ข้าวเหนียว': '/images/kaon.jpg'
}

const categories = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'ขายดีที่สุด', name: 'เมนูแนะนำ' },
  { id: 'อาหารจานเดียว / ผัด', name: 'อาหารจานเดียว / ผัด' },
  { id: 'ส้มตำแซ่บซิ่ง', name: 'ส้มตำแซ่บซิ่ง' },
  { id: 'ลาบ / ยำ', name: 'ลาบ / ยำ' },
  { id: 'ของทอด', name: 'ของทอด' },
  { id: 'เครื่องดื่ม', name: 'เครื่องดื่ม' }
]

const activeCategory = ref('all')
const previewItem = ref(null)
const menuItems = ref([])
let menuPollTimer = null

// โหลดเมนูจริงจากฐานข้อมูล Backend
const fetchMenus = async () => {
  try {
    const res = await axios.get(`${API_BASE}/menus`)
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // กรองเมนูซ้ำซ้อนโดยใช้ชื่อมาตรฐาน
      const seen = new Set()
      const uniqueData = []
      for (const m of res.data) {
        const canonical = m.menu_name === 'ไข่เจียวหมูสับ' ? 'ข้าวไข่เจียวหมูสับ' :
                          m.menu_name === 'ไข่เจียวกุ้ง' ? 'ข้าวไข่เจียวกุ้ง' :
                          m.menu_name === 'ปีกไก่ทอด' ? 'ไก่ทอด (ปีก)' : m.menu_name
        if (!seen.has(canonical)) {
          seen.add(canonical)
          uniqueData.push({ ...m, menu_name: canonical })
        }
      }

      menuItems.value = uniqueData.map(m => {
        const catName = m.category?.category_name || ''
        const cats = []
        if (catName.includes('เครื่องดื่ม') || m.category_id === 5) {
          cats.push('เครื่องดื่ม')
        } else if (catName.includes('ส้มตำ') || m.category_id === 2) {
          cats.push('ส้มตำแซ่บซิ่ง')
        } else if (catName.includes('ลาบ') || catName.includes('ยำ') || m.category_id === 3) {
          cats.push('ลาบ / ยำ')
        } else if (catName.includes('ของทอด') || m.category_id === 4) {
          cats.push('ของทอด')
        } else {
          cats.push('อาหารจานเดียว / ผัด')
        }

        if (['กะเพราหมู', 'กระเพราหมู', 'ส้มตำปูปลาร้า', 'ยำวุ้นเส้นทะเล', 'ไก่ทอด (สะโพก)', 'น้ำเก๊กฮวย'].includes(m.menu_name)) {
          cats.push('ขายดีที่สุด')
        }

        const isSpicy = m.menu_name.includes('กะเพรา') || m.menu_name.includes('กระเพรา') || m.menu_name.includes('พริกแกง') || m.menu_name.includes('ส้มตำ') || m.menu_name.includes('ลาบ') || m.menu_name.includes('ยำ')

        return {
          id: m.menu_id,
          menu_id: m.menu_id,
          menu_name: m.menu_name,
          price: Number(m.price),
          category: cats,
          desc: m.description || '',
          image_url: m.image_url || imageMap[m.menu_name] || '/images/kapaomu.jpg',
          calories: m.calories || 350,
          isPopular: cats.includes('ขายดีที่สุด'),
          isSpicy,
          is_available: m.is_available !== false
        }
      })
    }

    // ซิงค์สถานะร้านค้า เปิด / ปิด จาก Backend
    try {
      const setRes = await axios.get(`${API_BASE}/settings`)
      if (setRes.data && setRes.data.is_open !== undefined) {
        isStoreOpen.value = Boolean(setRes.data.is_open)
      }
    } catch (e) {
      console.warn('โหลดสถานะร้านค้าไม่สำเร็จ:', e)
    }
  } catch (err) {
    console.warn('โหลดเมนูจาก API ไม่สำเร็จ กำลังใช้ข้อมูลสำรอง:', err)
  }
}

onMounted(async () => {
  await fetchMenus()
  // ซิงค์สถานะเปิด-ปิดเมนูอัตโนมัติทุกๆ 6 วินาที
  menuPollTimer = setInterval(fetchMenus, 6000)
})

onBeforeUnmount(() => {
  if (menuPollTimer) clearInterval(menuPollTimer)
})

const filteredMenu = computed(() => {
  if (activeCategory.value === 'all') return menuItems.value
  return menuItems.value.filter(item => item.category && item.category.includes(activeCategory.value))
})

// ฟังก์ชันตรวจสอบว่าเมนูนี้มีตัวเลือก/ส่วนเสริมที่ต้องเลือกหรือไม่
const checkHasOptions = (item) => {
  const name = item.menu_name || '';
  const cats = item.category || [];
  
  const isExempt = cats.includes('เครื่องดื่ม') || name.includes('น้ำ') || name.includes('โค้ก') || name.includes('สไปรท์') || name.includes('ลาบ') || name.includes('ไก่ทอด') || name.includes('ส้มตำ') || name.includes('ข้าวผัด') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว') || name.includes('ยำ');

  if (!isExempt) return true;
  if (item.isSpicy) return true;
  if (name.includes('ทะเล')) return true;
  
  const isNoAddonCategory = cats.includes('เครื่องดื่ม') || name.includes('ไก่ทอด') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว');
  return !isNoAddonCategory;
}

// ฟังก์ชันตรวจสอบว่าเมนูนี้เป็นเครื่องดื่ม / น้ำ หรือไม่
const isDrink = (item) => {
  if (!item) return false;
  const name = item.menu_name || item.name || '';
  const cats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
  return cats.includes('เครื่องดื่ม') ||
         cats.some(c => String(c).includes('เครื่องดื่ม')) ||
         name.includes('น้ำ') ||
         name.includes('โค้ก') ||
         name.includes('สไปรท์') ||
         name.toLowerCase().includes('coke') ||
         name.toLowerCase().includes('sprite') ||
         name.includes('เก๊กฮวย');
}

// จัดการคลิกเลือกเมนู
const handleAction = (item, isQuickAdd = false) => {
  if (!isStoreOpen.value) {
    alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้')
    return
  }
  if (item.is_available === false) {
    alert(`ขออภัยครับ เมนู "${item.menu_name}" หมดชั่วคราว ไม่สามารถสั่งได้ครับ`)
    return
  }

  // 🛑 เมนูน้ำจะไม่สามารถกดตรงรูปภาพหรือการ์ดเพื่อเพิ่มรายการเข้าตะกร้าได้ จะต้องกดที่ + ตรงการ์ดเท่านั้น
  if (isDrink(item) && !isQuickAdd) {
    return;
  }

  if (checkHasOptions(item)) {
    router.push(`/table/${tableId}/item/${item.id}`)
  } else {
    if (isQuickAdd) {
      addToCartQuick(item)
    } else {
      previewItem.value = item
    }
  }
}

const closePreview = () => {
  previewItem.value = null
}

const addFromPreview = () => {
  if (!isStoreOpen.value) {
    alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้')
    return
  }
  if (previewItem.value) {
    if (previewItem.value.is_available === false) {
      alert(`ขออภัยครับ เมนู "${previewItem.value.menu_name}" หมดชั่วคราวครับ`)
      closePreview()
      return
    }
    addToCartQuick(previewItem.value)
    closePreview()
  }
}

const addToCartQuick = (item) => {
  if (!isStoreOpen.value) {
    alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้')
    return
  }
  if (item.is_available === false) {
    alert(`ขออภัยครับ เมนู "${item.menu_name}" หมดชั่วคราวครับ`)
    return
  }
  addToCart(item, 1, null, '', [])
}

const goToCart = () => {
  router.push(`/table/${tableId}/cart`)
}
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background-color: #f7f6f0;
  padding-bottom: 90px;
  position: relative;
}

/* 🛑 ป้ายแจ้งเตือนร้านปิด */
.table-closed-banner {
  background-color: #fee2e2;
  border-bottom: 1.5px solid #ef4444;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.closed-banner-icon { font-size: 20px; }
.closed-banner-info { flex: 1; }
.closed-banner-title { font-size: 13px; font-weight: 700; color: #991b1b; }
.closed-banner-sub { font-size: 11px; color: #b91c1c; margin: 0; }
.closed-banner-pill {
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

/* ==================================
   CSS สำหรับ Popup Modal
==================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-image {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}

.preview-info {
  padding: 16px;
  text-align: center;
}

.preview-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
}

.preview-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.preview-price {
  font-size: 20px;
  font-weight: 700;
  color: #3e7654;
}

.modal-add-btn {
  width: calc(100% - 32px);
  margin: 0 16px 16px;
  background: #3e7654;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>