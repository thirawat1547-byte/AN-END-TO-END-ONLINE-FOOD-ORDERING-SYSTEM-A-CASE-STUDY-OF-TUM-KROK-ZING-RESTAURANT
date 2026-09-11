<template>
  <div class="menu-page">
    <OrderHeader :tableId="tableId" />
    <CategoryTabs :categories="categories" v-model="activeCategory" />
    
    <div class="menu-grid">
      <MenuItemCard 
        v-for="item in filteredMenu" 
        :key="item.id" 
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import MenuItemCard from '../components/MenuItemCard.vue'
import FloatingCartBar from '../components/FloatingCartBar.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'

const { addToCart, cartItemCount, cartTotal } = useCart()

// Mock data
const categories = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'ขายดีที่สุด', name: 'เมนูแนะนำ' },
  { id: 'เมนูอาหาร', name: 'เมนูอาหาร' },
  { id: 'เมนูอาหารอีสาน', name: 'อาหารอีสาน' },
  { id: 'เครื่องดื่ม', name: 'เครื่องดื่ม' }
]

const activeCategory = ref('all')
const previewItem = ref(null) // ตัวแปรสำหรับเก็บเมนูที่กำลังแสดงใน Modal

const menuItems = [
  { id: 1, menu_name: 'กระเพราหมู', price: 40, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', image_url: '/images/kapaomu.jpg', isPopular: true, isSpicy: true },
  { id: 2, menu_name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'เผ็ดร้อน ถึงเครื่อง', image_url: '/images/kapaotaley.jpg', isSpicy: true },
  { id: 3, menu_name: 'ข้าวผัดหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ข้าวผัดหอมกรุ่น', image_url: '/images/khaopadmu.jpg', isSpicy: false },
  { id: 5, menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'รวมมิตรทะเลผัด', image_url: '/images/khaopadtalay.jpg', isSpicy: false },
  { id: 6, menu_name: 'ผัดพริกแกงหมู', price: 40, category: ['เมนูอาหาร'], desc: 'พริกแกงเข้มข้น', image_url: '/images/pikkangmu.jpg', isSpicy: true },
  { id: 7, menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'จัดจ้านถึงใจ', image_url: '/images/prikkangtalay.jpg', isSpicy: true },
  { id: 8, menu_name: 'ผัดคะน้าหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ผักกรอบ หมูนุ่ม', image_url: '/images/kanamokrop.jpg', isSpicy: false },
  { id: 9, menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'คะน้ากรอบกับซีฟู้ด', image_url: '/images/kanatalay.jpg', isSpicy: false },
  { id: 10, menu_name: 'ข้าวหมูกระเทียม', price: 40, category: ['เมนูอาหาร'], desc: 'หอมกระเทียมพริกไทย', image_url: '/images/mookratiem.jpg', isSpicy: false },
  { id: 11, menu_name: 'ข้าวไข่เจียวหมูสับ', price: 40, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', image_url: '/images/kaijeawmoosub.jpg', isSpicy: false },
  { id: 12, menu_name: 'ข้าวไข่เจียวกุ้ง', price: 50, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูกับกุ้ง', image_url: '/images/kaikung.jpg', isSpicy: false },
  { id: 13, menu_name: 'ยำวุ้นเส้นทะเล', price: 70, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'เปรี้ยวเผ็ดแซ่บ', image_url: '/images/yumtalay.jpg', isSpicy: true },
  { id: 14, menu_name: 'ส้มตำปูปลาร้า', price: 40, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', image_url: '/images/tumprara.jpg', isPopular: true, isSpicy: true },
  { id: 15, menu_name: 'ส้มตำไทย', price: 40, category: ['เมนูอาหารอีสาน'], desc: 'เปรี้ยวหวาน สามรส', image_url: '/images/tumtai.jpg', isSpicy: true },
  { id: 16, menu_name: 'ลาบหมู', price: 60, category: ['เมนูอาหารอีสาน'], desc: 'หอมข้าวคั่ว แซ่บถึงใจ', image_url: '/images/larbmoo.jpg', isSpicy: true },
  { id: 17, menu_name: 'ไก่ทอด (ปีก)', price: 20, category: ['เมนูอาหารอีสาน'], desc: 'กรอบนอกนุ่มใน', image_url: '/images/wingchick.jpg', isSpicy: false },
  { id: 18, menu_name: 'ไก่ทอด (สะโพก)', price: 50, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', image_url: '/images/chick.jpg', isSpicy: false },
  { id: 19, menu_name: 'น้ำเก๊กฮวย', price: 20, category: ['เครื่องดื่ม', 'ขายดีที่สุด'], desc: 'หวานเย็น ชื่นใจ', image_url: '/images/gek.jpg' },
  { id: 20, menu_name: 'โค้ก (Coke)', price: 20, category: ['เครื่องดื่ม'], desc: 'น้ำอัดลมซ่าสดชื่น', image_url: '/images/coke.jpg' },
  { id: 21, menu_name: 'สไปรท์ (Sprite)', price: 20, category: ['เครื่องดื่ม'], desc: 'ซ่า สดชื่น กลิ่นเลมอน', image_url: '/images/sprite.jpg' },
  { id: 22, menu_name: 'น้ำเปล่า', price: 10, category: ['เครื่องดื่ม'], desc: 'น้ำดื่มบริสุทธิ์', image_url: '/images/water.jpg' },
  { id: 23, menu_name: 'ข้าวเปล่า', price: 10, category: ['เมนูอาหาร'], desc: 'ข้าวสวยหอมมะลิ ร้อนๆ นุ่มอร่อย', image_url: '/images/kao.jpg', isSpicy: false },
  { id: 24, menu_name: 'ข้าวเหนียว', price: 10, category: ['เมนูอาหารอีสาน', 'เมนูอาหาร'], desc: 'ข้าวเหนียวนุ่ม ร้อนๆ หอมอร่อย', image_url: '/images/kaon.jpg', isSpicy: false }
]

const filteredMenu = computed(() => {
  if (activeCategory.value === 'all') return menuItems
  return menuItems.filter(item => item.category && item.category.includes(activeCategory.value))
})

// ฟังก์ชันตรวจสอบว่าเมนูนี้มีตัวเลือก/ส่วนเสริมที่ต้องเลือกหรือไม่
const checkHasOptions = (item) => {
  const name = item.menu_name || '';
  const cats = item.category || [];
  
  // ตรวจสอบว่าได้รับการยกเว้นกับข้าว/ราดข้าว หรือไม่
  const isExempt = cats.includes('เครื่องดื่ม') || name.includes('น้ำ') || name.includes('โค้ก') || name.includes('สไปรท์') || name.includes('ลาบ') || name.includes('ไก่ทอด') || name.includes('ส้มตำ') || name.includes('ข้าวผัด') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว') || name.includes('ยำ');

  // ถ้าไม่ใช่เมนูที่ได้รับการยกเว้น แสดงว่าต้องเลือกกับข้าวหรือราดข้าว -> ต้องไปหน้า ItemDetailPage
  if (!isExempt) return true;

  if (item.isSpicy) return true; // ถ้าเป็นเมนูรสจัดต้องเลือกความเผ็ด
  if (name.includes('ทะเล')) return true; // ถ้าเป็นทะเลต้องเลือกกุ้ง/หมึก
  
  // เช็คว่าเป็นเมนูที่ถูกยกเว้นส่วนเสริมหรือไม่ (เช่น น้ำ, ไก่ทอด, ข้าวเปล่า, ข้าวเหนียว)
  const isNoAddonCategory = cats.includes('เครื่องดื่ม') || name.includes('ไก่ทอด') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว');
  
  return !isNoAddonCategory;
}

// ฟังก์ชันจัดการเมื่อคลิกรูป หรือ กดปุ่ม +
const handleAction = (item, isQuickAdd = false) => {
  if (checkHasOptions(item)) {
    // ถ้าเมนูมีส่วนเสริม ให้เด้งไปหน้า ItemDetailPage
    router.push(`/table/${tableId}/item/${item.id}`)
  } else {
    // ถ้าไม่มีส่วนเสริม (เช่น น้ำ, ไก่ทอด)
    if (isQuickAdd) {
      addToCartQuick(item) // กดปุ่ม + ให้ลงตะกร้าเลย
    } else {
      previewItem.value = item // กดที่รูป ให้เปิด Popup Modal ขึ้นมาแสดงภาพ
    }
  }
}

const closePreview = () => {
  previewItem.value = null
}

const addFromPreview = () => {
  if (previewItem.value) {
    addToCartQuick(previewItem.value)
    closePreview()
  }
}

const addToCartQuick = (item) => {
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