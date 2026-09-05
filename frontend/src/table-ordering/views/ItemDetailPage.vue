<template>
  <div class="item-detail-page">
    <OrderHeader :tableId="tableId" />
    
    <div class="back-nav" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      กลับ
    </div>

    <div v-if="item" class="detail-content">
      <div class="image-wrapper">
        <img :src="item.image_url" :alt="item.menu_name" class="main-image" />
      </div>
      
      <div class="item-header">
        <h1 class="item-title">{{ item.menu_name }}</h1>
        <div class="item-price">฿{{ item.price.toFixed(2) }}</div>
      </div>
      
      <div class="section">
        <h3 class="section-title">
          <span class="required-mark">*</span> เลือกระดับความเผ็ด
        </h3>
        <div class="options-group row-options">
          <label class="radio-option" v-for="opt in spicyOptions" :key="opt.value">
            <input type="radio" :value="opt.value" v-model="spicyLevel" name="spicy" />
            <span class="radio-custom"></span>
            {{ opt.label }}
          </label>
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">คำสั่งพิเศษ</h3>
        <textarea 
          v-model="specialInstructions" 
          placeholder="เช่น แพ้กุ้ง, ขอเพิ่มไข่ดาว..."
          class="special-input"
          rows="3"
        ></textarea>
      </div>
      
      <button class="add-to-cart-btn" @click="handleAddToCart">
        + เพิ่มลงตะกร้า ฿{{ item.price.toFixed(2) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrderHeader from '../components/OrderHeader.vue'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'
const itemId = route.params.itemId

const { addToCart } = useCart()

// Mock fetching item
const item = ref(null)
const spicyLevel = ref('normal')
const specialInstructions = ref('')

const spicyOptions = [
  { value: 'none', label: 'ไม่เผ็ด' },
  { value: 'less', label: 'เผ็ดน้อย' },
  { value: 'normal', label: 'เผ็ดกลาง' },
  { value: 'very', label: 'เผ็ดมาก' }
]

onMounted(() => {
  // Mock data simulation
  const menuItems = [
    { id: 1, menu_name: 'ส้มตำปูปลาร้า', price: 40, image_url: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?q=80&w=400&auto=format&fit=crop' },
    { id: 2, menu_name: 'ไก่ทอดสมุนไพร', price: 50, image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=400&auto=format&fit=crop' },
    { id: 3, menu_name: 'กะเพราหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1625068202283-8a3962d35f49?q=80&w=400&auto=format&fit=crop' },
    { id: 4, menu_name: 'ตำป่า', price: 50, image_url: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?q=80&w=400&auto=format&fit=crop' },
    { id: 5, menu_name: 'ผัดพริกแกง', price: 50, image_url: 'https://images.unsplash.com/photo-1625068202283-8a3962d35f49?q=80&w=400&auto=format&fit=crop' },
    { id: 6, menu_name: 'ข้าวผัด', price: 50, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop' }
  ]
  item.value = menuItems.find(i => i.id == itemId) || menuItems[0]
})

const goBack = () => {
  router.back()
}

const handleAddToCart = () => {
  if (item.value) {
    addToCart(item.value, 1, spicyLevel.value, specialInstructions.value)
    goBack()
  }
}
</script>

<style scoped>
.item-detail-page {
  min-height: 100vh;
  background-color: white;
  position: relative;
}

.back-nav {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
}

.detail-content {
  padding: 0 16px 32px;
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-header {
  text-align: center;
  margin-bottom: 24px;
}

.item-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.section {
  margin-bottom: 24px;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  display: flex;
  align-items: center;
}

.required-mark {
  color: #ff3b30;
  margin-right: 4px;
}

.row-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-around;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
}

.special-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.special-input:focus {
  outline: none;
  border-color: #3e7654;
}

.add-to-cart-btn {
  background-color: #3e7654;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  margin-top: 16px;
}
</style>
