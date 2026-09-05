<template>
  <div class="menu-page">
    <OrderHeader :tableId="tableId" />
    <CategoryTabs :categories="categories" v-model="activeCategory" />
    
    <div class="menu-grid">
      <MenuItemCard 
        v-for="item in filteredMenu" 
        :key="item.id" 
        :item="item" 
        @select="goToDetail(item)"
        @add="addToCartQuick(item)"
      />
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

const menuItems = [
  { id: 1, menu_name: 'กระเพราหมู', price: 40, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', isPopular: true, isSpicy: true },
  { id: 2, menu_name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'เผ็ดร้อน ถึงเครื่อง', image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500', isSpicy: true },
  { id: 3, menu_name: 'ข้าวผัดหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ข้าวผัดหอมกรุ่น', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', isSpicy: false },
  { id: 4, menu_name: 'ข้าวผัดกุ้ง', price: 50, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'กุ้งตัวโตเต็มคำ', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', isSpicy: false },
  { id: 5, menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'รวมมิตรทะเลผัด', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', isSpicy: false },
  { id: 6, menu_name: 'ผัดพริกแกงหมู', price: 40, category: ['เมนูอาหาร'], desc: 'พริกแกงเข้มข้น', image_url: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500', isSpicy: true },
  { id: 7, menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'จัดจ้านถึงใจ', image_url: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500', isSpicy: true },
  { id: 8, menu_name: 'ผัดคะน้าหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ผักกรอบ หมูนุ่ม', image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', isSpicy: false },
  { id: 9, menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'คะน้ากรอบกับซีฟู้ด', image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500', isSpicy: false },
  { id: 10, menu_name: 'ข้าวหมูกระเทียม', price: 40, category: ['เมนูอาหาร'], desc: 'หอมกระเทียมพริกไทย', image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', isSpicy: false },
  { id: 11, menu_name: 'ข้าวไข่เจียวหมูสับ', price: 40, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', image_url: 'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500', isSpicy: false },
  { id: 12, menu_name: 'ข้าวไข่เจียวกุ้ง', price: 50, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูกับกุ้ง', image_url: 'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500', isSpicy: false },
  { id: 13, menu_name: 'ยำวุ้นเส้นทะเล', price: 70, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'เปรี้ยวเผ็ดแซ่บ', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', isSpicy: true },
  { id: 14, menu_name: 'ส้มตำปูปลาร้า', price: 40, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500', isPopular: true, isSpicy: true },
  { id: 15, menu_name: 'ส้มตำไทย', price: 40, category: ['เมนูอาหารอีสาน'], desc: 'เปรี้ยวหวาน สามรส', image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500', isSpicy: true },
  { id: 16, menu_name: 'ลาบหมู', price: 60, category: ['เมนูอาหารอีสาน'], desc: 'หอมข้าวคั่ว แซ่บถึงใจ', image_url: 'https://images.unsplash.com/photo-1544378730-8b5afcb62b88?q=80&w=500', isSpicy: true },
  { id: 17, menu_name: 'ไก่ทอด (ปีก)', price: 20, category: ['เมนูอาหารอีสาน'], desc: 'กรอบนอกนุ่มใน', image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500', isSpicy: false },
  { id: 18, menu_name: 'ไก่ทอด (สะโพก)', price: 50, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500', isSpicy: false },
  { id: 19, menu_name: 'น้ำเก๊กฮวย', price: 20, category: ['เครื่องดื่ม', 'ขายดีที่สุด'], desc: 'หวานเย็น ชื่นใจ', image_url: 'https://images.unsplash.com/photo-1622760814917-76b9dfa38a7c?q=80&w=500' },
  { id: 20, menu_name: 'โค้ก (Coke)', price: 20, category: ['เครื่องดื่ม'], desc: 'น้ำอัดลมซ่าสดชื่น', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500' },
  { id: 21, menu_name: 'สไปรท์ (Sprite)', price: 20, category: ['เครื่องดื่ม'], desc: 'ซ่า สดชื่น กลิ่นเลมอน', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500' },
  { id: 22, menu_name: 'น้ำเปล่า', price: 10, category: ['เครื่องดื่ม'], desc: 'น้ำดื่มบริสุทธิ์', image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4c?q=80&w=500' }
]

const filteredMenu = computed(() => {
  if (activeCategory.value === 'all') return menuItems
  return menuItems.filter(item => item.category && item.category.includes(activeCategory.value))
})

const goToDetail = (item) => {
  router.push(`/table/${tableId}/item/${item.id}`)
}

const addToCartQuick = (item) => {
  addToCart(item, 1, 'normal', '')
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
