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
  { id: 'all', name: 'เมนูแนะนำ' },
  { id: 'food', name: 'เมนูอาหาร' },
  { id: 'isan', name: 'เมนูอาหารอีสาน' }
]

const activeCategory = ref('all')

const menuItems = [
  { id: 1, category_id: 'isan', menu_name: 'ส้มตำปูปลาร้า', price: 40, image_url: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?q=80&w=400&auto=format&fit=crop' },
  { id: 2, category_id: 'food', menu_name: 'ไก่ทอดสมุนไพร', price: 50, image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=400&auto=format&fit=crop' },
  { id: 3, category_id: 'food', menu_name: 'กะเพราหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1625068202283-8a3962d35f49?q=80&w=400&auto=format&fit=crop' },
  { id: 4, category_id: 'isan', menu_name: 'ตำป่า', price: 50, image_url: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?q=80&w=400&auto=format&fit=crop' },
  { id: 5, category_id: 'food', menu_name: 'ผัดพริกแกง', price: 50, image_url: 'https://images.unsplash.com/photo-1625068202283-8a3962d35f49?q=80&w=400&auto=format&fit=crop' },
  { id: 6, category_id: 'food', menu_name: 'ข้าวผัด', price: 50, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop' }
]

const filteredMenu = computed(() => {
  if (activeCategory.value === 'all') return menuItems
  return menuItems.filter(item => item.category_id === activeCategory.value)
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
