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
        <p class="item-desc">{{ item.desc }}</p>
        <div class="item-price">฿{{ item.price.toFixed(2) }}</div>
      </div>
      
      <div class="section" v-if="item.isSpicy">
        <h3 class="section-title">
          <span class="required-mark">*</span> เลือกระดับความเผ็ด
        </h3>
        <div class="options-group row-options">
          <label class="radio-option" v-for="opt in spicyOptions" :key="opt.value">
            <input type="radio" :value="opt.label" v-model="spicyLevel" name="spicy" />
            <span class="radio-custom"></span>
            {{ opt.label }}
          </label>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">ส่วนเสริม (ไม่บังคับ)</h3>
        <div class="addon-list">
          <label class="addon-item" v-for="addon in availableAddons" :key="addon.name">
            <div class="addon-left">
              <input type="checkbox" :value="addon" v-model="selectedAddons" />
              <span>{{ addon.name }}</span>
            </div>
            <span class="addon-price">+฿{{ addon.price }}</span>
          </label>
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">คำสั่งพิเศษ</h3>
        <textarea 
          v-model="specialInstructions" 
          placeholder="เช่น แพ้กุ้ง, ขอเพิ่มไข่ดาว, ไม่ใส่ผัก..."
          class="special-input"
          rows="3"
        ></textarea>
      </div>
      
      <button class="add-to-cart-btn" @click="handleAddToCart">
        + เพิ่มลงตะกร้า ฿{{ calculatedPrice.toFixed(2) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
const spicyLevel = ref('เผ็ดกลาง')
const specialInstructions = ref('')
const selectedAddons = ref([])

const availableAddons = [
  { name: 'ไข่ดาว', price: 10 },
  { name: 'ไข่เจียว', price: 10 }
]

const spicyOptions = [
  { value: 'none', label: 'ไม่เผ็ด' },
  { value: 'less', label: 'เผ็ดน้อย' },
  { value: 'normal', label: 'เผ็ดกลาง' },
  { value: 'very', label: 'เผ็ดมาก' }
]

onMounted(() => {
  // Mock data simulation - identical to Home.vue
  const menuItems = [
    { id: 1, menu_name: 'กระเพราหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', isSpicy: true },
    { id: 2, menu_name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500', desc: 'เผ็ดร้อน ถึงเครื่อง', isSpicy: true },
    { id: 3, menu_name: 'ข้าวผัดหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', desc: 'ข้าวผัดหอมกรุ่น', isSpicy: false },
    { id: 4, menu_name: 'ข้าวผัดกุ้ง', price: 50, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', desc: 'กุ้งตัวโตเต็มคำ', isSpicy: false },
    { id: 5, menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500', desc: 'รวมมิตรทะเลผัด', isSpicy: false },
    { id: 6, menu_name: 'ผัดพริกแกงหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500', desc: 'พริกแกงเข้มข้น', isSpicy: true },
    { id: 7, menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, image_url: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500', desc: 'จัดจ้านถึงใจ', isSpicy: true },
    { id: 8, menu_name: 'ผัดคะน้าหมู', price: 40, image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', desc: 'ผักกรอบ หมูนุ่ม', isSpicy: false },
    { id: 9, menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500', desc: 'คะน้ากรอบกับซีฟู้ด', isSpicy: false },
    { id: 10, menu_name: 'ข้าวหมูกระเทียม', price: 40, image_url: 'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500', desc: 'หอมกระเทียมพริกไทย', isSpicy: false },
    { id: 11, menu_name: 'ข้าวไข่เจียวหมูสับ', price: 40, image_url: 'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500', desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', isSpicy: false },
    { id: 12, menu_name: 'ข้าวไข่เจียวกุ้ง', price: 50, image_url: 'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500', desc: 'ไข่เจียวฟูกับกุ้ง', isSpicy: false },
    { id: 13, menu_name: 'ยำวุ้นเส้นทะเล', price: 70, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', desc: 'เปรี้ยวเผ็ดแซ่บ', isSpicy: true },
    { id: 14, menu_name: 'ส้มตำปูปลาร้า', price: 40, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500', desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', isSpicy: true },
    { id: 15, menu_name: 'ส้มตำไทย', price: 40, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500', desc: 'เปรี้ยวหวาน สามรส', isSpicy: true },
    { id: 16, menu_name: 'ลาบหมู', price: 60, image_url: 'https://images.unsplash.com/photo-1544378730-8b5afcb62b88?q=80&w=500', desc: 'หอมข้าวคั่ว แซ่บถึงใจ', isSpicy: true },
    { id: 17, menu_name: 'ไก่ทอด (ปีก)', price: 20, image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500', desc: 'กรอบนอกนุ่มใน', isSpicy: false },
    { id: 18, menu_name: 'ไก่ทอด (สะโพก)', price: 50, image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500', desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', isSpicy: false },
    { id: 19, menu_name: 'น้ำเก๊กฮวย', price: 20, image_url: 'https://images.unsplash.com/photo-1622760814917-76b9dfa38a7c?q=80&w=500', desc: 'หวานเย็น ชื่นใจ', isSpicy: false },
    { id: 20, menu_name: 'โค้ก (Coke)', price: 20, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500', desc: 'น้ำอัดลมซ่าสดชื่น', isSpicy: false },
    { id: 21, menu_name: 'สไปรท์ (Sprite)', price: 20, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500', desc: 'ซ่า สดชื่น กลิ่นเลมอน', isSpicy: false },
    { id: 22, menu_name: 'น้ำเปล่า', price: 10, image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4c?q=80&w=500', desc: 'น้ำดื่มบริสุทธิ์', isSpicy: false }
  ]
  item.value = menuItems.find(i => i.id == itemId) || menuItems[0]
})

const calculatedPrice = computed(() => {
  if (!item.value) return 0;
  let addonTotal = selectedAddons.value.reduce((sum, addon) => sum + addon.price, 0);
  return item.value.price + addonTotal;
})

const goBack = () => {
  router.back()
}

const handleAddToCart = () => {
  if (item.value) {
    addToCart(
      item.value, 
      1, 
      item.value.isSpicy ? spicyLevel.value : null, 
      specialInstructions.value,
      selectedAddons.value
    )
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
  margin-bottom: 6px;
}

.item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #3e7654;
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

.addon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.addon-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.addon-left input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3e7654;
}

.addon-price {
  font-size: 14px;
  color: #666;
  font-weight: 500;
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
