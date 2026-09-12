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
        <!-- แสดงแคลอรีโดยประมาณใต้ราคา -->
        <div class="item-calories">🔥 พลังงานโดยประมาณ: {{ item.calories }} กิโลแคลอรี</div>
      </div>
      
      <!-- ส่วนเลือกระดับความเผ็ด -->
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

      <!-- ส่วนเลือกเนื้อสัตว์ (เฉพาะเมนูทะเล) -->
      <div class="section" v-if="isSeafoodItem">
        <h3 class="section-title">
          <span class="required-mark">*</span> เลือกเนื้อสัตว์
        </h3>
        <div class="options-group row-options">
          <label class="radio-option" v-for="opt in seafoodOptions" :key="opt.value">
            <input type="radio" :value="opt.value" v-model="seafoodChoice" name="seafood" />
            <span class="radio-custom"></span>
            {{ opt.label }}
          </label>
        </div>
      </div>

      <!-- ส่วนเสริม (ปรับเปลี่ยนตามหมวดหมู่และชื่อเมนู) -->
      <div class="section" v-if="computedAddons.length > 0">
        <h3 class="section-title">ส่วนเสริม (ไม่บังคับ)</h3>
        <div class="addon-list">
          <label class="addon-item" v-for="addon in computedAddons" :key="addon.name">
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
          placeholder="เช่น แพ้กุ้ง, ไม่ใส่ผัก, ขอรสจัด..."
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

// State สำหรับเมนูทะเล
const seafoodChoice = ref('รวม')
const seafoodOptions = [
  { value: 'รวม', label: 'รวม (หมึก+กุ้ง)' },
  { value: 'หมึก', label: 'หมึก' },
  { value: 'กุ้ง', label: 'กุ้ง' }
]

const spicyOptions = [
  { value: 'none', label: 'ไม่เผ็ด' },
  { value: 'less', label: 'เผ็ดน้อย' },
  { value: 'normal', label: 'เผ็ดกลาง' },
  { value: 'very', label: 'เผ็ดมาก' }
]

onMounted(() => {
  // Mock data simulationพร้อมแคลอรีที่คำนวณไว้
  const menuItems = [
    { id: 1, menu_name: 'กระเพราหมู', price: 40, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', image_url: '/images/kapaomu.jpg', isPopular: true, isSpicy: true, calories: 520 },
    { id: 2, menu_name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'เผ็ดร้อน ถึงเครื่อง', image_url: '/images/kapaotaley.jpg', isSpicy: true, calories: 450 },
    { id: 3, menu_name: 'ข้าวผัดหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ข้าวผัดหอมกรุ่น', image_url: '/images/khaopadmu.jpg', isSpicy: false, calories: 550 },
    { id: 4, menu_name: 'ข้าวผัดกุ้ง', price: 50, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'กุ้งตัวโตเต็มคำ', image_url: '/images/khaopadkung.jpg', isSpicy: false, calories: 480 },
    { id: 5, menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'รวมมิตรทะเลผัด', image_url: '/images/khaopadtalay.jpg', isSpicy: false, calories: 490 },
    { id: 6, menu_name: 'ผัดพริกแกงหมู', price: 40, category: ['เมนูอาหาร'], desc: 'พริกแกงเข้มข้น', image_url: '/images/pikkangmu.jpg', isSpicy: true, calories: 500 },
    { id: 7, menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'จัดจ้านถึงใจ', image_url: '/images/prikkangtalay.jpg', isSpicy: true, calories: 430 },
    { id: 8, menu_name: 'ผัดคะน้าหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ผักกรอบ หมูนุ่ม', image_url: '/images/kanamokrop.jpg', isSpicy: false, calories: 420 },
    { id: 9, menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'คะน้ากรอบกับซีฟู้ด', image_url: '/images/kanatalay.jpg', isSpicy: false, calories: 380 },
    { id: 10, menu_name: 'ข้าวหมูกระเทียม', price: 40, category: ['เมนูอาหาร'], desc: 'หอมกระเทียมพริกไทย', image_url: '/images/mookratiem.jpg', isSpicy: false, calories: 530 },
    { id: 11, menu_name: 'ข้าวไข่เจียวหมูสับ', price: 40, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', image_url: '/images/kaijeawmoosub.jpg', isSpicy: false, calories: 600 },
    { id: 12, menu_name: 'ข้าวไข่เจียวกุ้ง', price: 50, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูกับกุ้ง', image_url: '/images/kaikung.jpg', isSpicy: false, calories: 580 },
    { id: 13, menu_name: 'ยำวุ้นเส้นทะเล', price: 70, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'เปรี้ยวเผ็ดแซ่บ', image_url: '/images/yumtalay.jpg', isSpicy: true, calories: 320 },
    { id: 14, menu_name: 'ส้มตำปูปลาร้า', price: 40, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', image_url: '/images/tumprara.jpg', isPopular: true, isSpicy: true, calories: 150 },
    { id: 15, menu_name: 'ส้มตำไทย', price: 40, category: ['เมนูอาหารอีสาน'], desc: 'เปรี้ยวหวาน สามรส', image_url: '/images/tumtai.jpg', isSpicy: true, calories: 180 },
    { id: 16, menu_name: 'ลาบหมู', price: 60, category: ['เมนูอาหารอีสาน'], desc: 'หอมข้าวคั่ว แซ่บถึงใจ', image_url: '/images/larbmoo.jpg', isSpicy: true, calories: 350 },
    { id: 17, menu_name: 'ไก่ทอด (ปีก)', price: 20, category: ['เมนูอาหารอีสาน'], desc: 'กรอบนอกนุ่มใน', image_url: '/images/wingchick.jpg', isSpicy: false, calories: 190 },
    { id: 18, menu_name: 'ไก่ทอด (สะโพก)', price: 50, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', image_url: '/images/chick.jpg', isSpicy: false, calories: 380 },
    { id: 19, menu_name: 'น้ำเก๊กฮวย', price: 20, category: ['เครื่องดื่ม', 'ขายดีที่สุด'], desc: 'หวานเย็น ชื่นใจ', image_url: '/images/gek.jpg', calories: 120 },
    { id: 20, menu_name: 'โค้ก (Coke)', price: 20, category: ['เครื่องดื่ม'], desc: 'น้ำอัดลมซ่าสดชื่น', image_url: '/images/coke.jpg', calories: 140 },
    { id: 21, menu_name: 'สไปรท์ (Sprite)', price: 20, category: ['เครื่องดื่ม'], desc: 'ซ่า สดชื่น กลิ่นเลมอน', image_url: '/images/sprite.jpg', calories: 140 },
    { id: 22, menu_name: 'น้ำเปล่า', price: 10, category: ['เครื่องดื่ม'], desc: 'น้ำดื่มบริสุทธิ์', image_url: '/images/water.jpg', calories: 0 }
  ]
  item.value = menuItems.find(i => i.id == itemId) || menuItems[0]
})

// เช็คว่าเป็นเมนูทะเลหรือไม่ (อิงจากชื่อเมนูมีคำว่า "ทะเล")
const isSeafoodItem = computed(() => {
  if (!item.value) return false
  return item.value.menu_name.includes('ทะเล')
})

// จัดการ Addon ให้เหมาะสมกับแต่ละเมนู
const computedAddons = computed(() => {
  if (!item.value) return []
  const name = item.value.menu_name
  const cats = item.value.category || []
  
  if (cats.includes('เครื่องดื่ม') || name.includes('ไก่ทอด') || name.includes('ไข่เจียว')) {
    return []
  }

  if (name.includes('ส้มตำ')) {
    return [
      { name: 'เพิ่มปู', price: 10 },
      { name: 'ขนมจีน', price: 10 }
    ]
  }

  if (name.includes('ยำวุ้นเส้น')) {
    return [
      { name: 'เพิ่มหมูยอ', price: 15 },
      { name: 'เพิ่มไก่ยอ', price: 15 }
    ]
  }

  return [
    { name: 'ไข่ดาว', price: 10 },
    { name: 'ไข่เจียว', price: 10 }
  ]
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
    let finalInstructions = specialInstructions.value
    if (isSeafoodItem.value) {
      finalInstructions = `เนื้อสัตว์: ${seafoodChoice.value} ${finalInstructions ? `(${finalInstructions})` : ''}`
    }

    addToCart(
      item.value, 
      1, 
      item.value.isSpicy ? spicyLevel.value : null, 
      finalInstructions,
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
  margin-bottom: 8px;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #3e7654;
  margin-bottom: 4px;
}

.item-calories {
  font-size: 13px;
  color: #e67e22;
  font-weight: 500;
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

input[type="radio"] {
  accent-color: #3e7654;
  width: 16px;
  height: 16px;
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