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
        <h1 class="item-title">
          {{ item.menu_name }}
          <!-- ⚠️ มีเขียนเตือน อยุ่ตรงหลังชื่อเมนูหลังกดเลือกเมนูนั้นไป ว่ามีสารก่อภูมิแพ้ -->
          <span v-if="itemAllergens.length > 0" class="allergen-warning-inline">
            ⚠️ มีสารก่อภูมิแพ้: {{ itemAllergens.map(a => a.allergen_name).join(', ') }}
          </span>
        </h1>

        <!-- แถบแจ้งเตือนสารก่อภูมิแพ้เด่นชัด (Allergens Warning Banner) -->
        <div v-if="itemAllergens.length > 0" class="allergen-warning-banner">
          <div class="allergen-banner-header">
            <span class="allergen-alert-icon">⚠️</span>
            <strong class="allergen-alert-title">คำเตือนสำหรับผู้แพ้อาหาร (Allergens Warning):</strong>
          </div>
          <div class="allergen-badge-list">
            <span 
              v-for="al in itemAllergens" 
              :key="al.allergen_id"
              class="allergen-chip"
            >
              {{ al.icon }} {{ al.allergen_name }}
            </span>
          </div>
        </div>

        <p class="item-desc">{{ item.desc }}</p>
        <div class="item-price">฿{{ item.price.toFixed(2) }}</div>
        <!-- แสดงแคลอรีโดยประมาณใต้ราคา -->
        <div class="item-calories">🔥 พลังงานโดยประมาณ: {{ item.calories }} กิโลแคลอรี</div>
      </div>
      
      <!-- ส่วนเลือกรูปแบบอาหาร: กับข้าว หรือ ราดข้าว (ยกเว้น เครื่องดื่ม, ลาบ, ไก่ทอด, ส้มตำ, ข้าวผัด, ข้าวเปล่า) -->
      <div class="section" v-if="!isExemptDishType(item)">
        <h3 class="section-title">
          <span class="required-mark">*</span> เลือกรูปแบบอาหาร (กับข้าว / ราดข้าว)
        </h3>
        <div class="options-group row-options">
          <label class="radio-option" v-for="opt in ['ราดข้าว', 'กับข้าว']" :key="opt">
            <input type="radio" :value="opt" v-model="dishType" name="dishType" />
            <span class="radio-custom"></span>
            {{ opt }}
          </label>
        </div>
        <p v-if="!dishType" style="color: #e53935; font-size: 12px; margin-top: 6px;">* กรุณาเลือกกับข้าวหรือราดข้าว</p>
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
      
      <button 
        class="add-to-cart-btn" 
        :disabled="item.is_available === false || (!isExemptDishType(item) && !dishType)"
        :style="item.is_available === false ? 'background: #9ca3af; cursor: not-allowed;' : (!isExemptDishType(item) && !dishType ? 'background: #b0bec5; cursor: not-allowed;' : '')"
        @click="handleAddToCart"
      >
        <template v-if="item.is_available === false">
          ❌ เมนูนี้หมดชั่วคราว
        </template>
        <template v-else-if="!isExemptDishType(item) && !dishType">
          กรุณาเลือกกับข้าวหรือราดข้าว
        </template>
        <template v-else>
          + เพิ่มลงตะกร้า ฿{{ calculatedPrice.toFixed(2) }}
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import OrderHeader from '../components/OrderHeader.vue'
import { useCart } from '../composables/useCart'
import { API_BASE } from '../../config/api'
import { onMenuUpdated, DEFAULT_ALLERGENS, resolveAllergenBadges } from '../../utils/menuSync'

const route = useRoute()
const router = useRouter()
const tableId = route.params.tableId || '1'
const itemId = route.params.itemId

const { addToCart } = useCart()

const item = ref(null)
const dishType = ref(null)
const spicyLevel = ref('เผ็ดกลาง')
const specialInstructions = ref('')
const selectedAddons = ref([])

// ตรวจสอบเมนูที่ได้รับการยกเว้น
const isExemptDishType = (it) => {
  if (!it) return true;
  const name = it.menu_name || it.name || '';
  const cats = it.category || [];
  if (cats.includes('เครื่องดื่ม') || name.includes('น้ำ') || name.includes('โค้ก') || name.includes('สไปรท์')) return true;
  if (name.includes('ลาบ')) return true;
  if (name.includes('ไก่ทอด')) return true;
  if (name.includes('ส้มตำ')) return true;
  if (name.includes('ข้าวผัด')) return true;
  if (name.includes('ข้าวเปล่า')) return true;
  if (name.includes('ข้าวเหนียว')) return true;
  if (name.includes('ยำ')) return true;
  return false;
}

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

let cleanupMenuSync = null

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE}/menus/${itemId}`)
    if (res.data) {
      const m = res.data
      const catName = m.category?.category_name || ''
      const cats = ['ทั้งหมด']
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

      const isSpicy = m.menu_name.includes('กะเพรา') || m.menu_name.includes('กระเพรา') || m.menu_name.includes('พริกแกง') || m.menu_name.includes('ส้มตำ') || m.menu_name.includes('ลาบ') || m.menu_name.includes('ยำ')

      const allergenIds = (m.allergens && m.allergens.length > 0)
        ? m.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean)
        : (m.allergen_ids || [])

      item.value = {
        id: m.menu_id,
        menu_id: m.menu_id,
        menu_name: m.menu_name,
        price: Number(m.price),
        category: cats,
        desc: m.description || '',
        image_url: m.image_url || imageMap[m.menu_name] || '/images/kapaomu.jpg',
        calories: m.calories || 350,
        isSpicy,
        is_available: m.is_available !== false,
        allergen_ids: allergenIds
      }
    }
  } catch (err) {
    console.warn('โหลดรายละเอียดเมนูจาก API ไม่สำเร็จ ใช้สำรอง:', err)
  }

  // ⚡ ซิงก์ข้อมูลสารก่อภูมิแพ้แบบ Real-time
  cleanupMenuSync = onMenuUpdated((updatedMenu) => {
    if (!updatedMenu || !item.value) return
    const targetId = updatedMenu.menu_id || updatedMenu.id
    const targetName = (updatedMenu.menu_name || updatedMenu.name || '').trim()

    if ((targetId && (Number(item.value.id) === Number(targetId) || Number(item.value.menu_id) === Number(targetId))) ||
        (targetName && item.value.menu_name === targetName)) {
      if (updatedMenu.allergen_ids !== undefined) {
        item.value.allergen_ids = [...updatedMenu.allergen_ids]
      }
      if (updatedMenu.price !== undefined) {
        item.value.price = Number(updatedMenu.price)
      }
      if (updatedMenu.is_available !== undefined) {
        item.value.is_available = updatedMenu.is_available
      }
      item.value = { ...item.value }
    }
  })
})

onBeforeUnmount(() => {
  if (cleanupMenuSync) cleanupMenuSync()
})

// สารก่อภูมิแพ้ของเมนูนี้ (พร้อม fallback อัตโนมัติตามชื่อเมนู)
const itemAllergens = computed(() => {
  if (!item.value) return []
  let ids = item.value.allergen_ids
  if (!ids || ids.length === 0) {
    const name = item.value.menu_name || ''
    if (name.includes('ทะเล') || name.includes('กุ้ง')) ids = [1, 6]
    else if (name.includes('ไข่เจียว')) ids = [5]
    else if (name.includes('ส้มตำปู') || name.includes('ปลาร้า')) ids = [7, 9]
    else if (name.includes('ส้มตำไทย')) ids = [1, 2]
    else if (name.includes('ไก่ทอด')) ids = [4]
  }
  return resolveAllergenBadges(ids || [], DEFAULT_ALLERGENS)
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
  
  if (cats.includes('เครื่องดื่ม') || name.includes('ไก่ทอด') || name.includes('ไข่เจียว') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว')) {
    return []
  }

  if (name.includes('ส้มตำ')) {
    return [
      { name: 'เพิ่มปู', price: 10 },
      { name: 'ขนมจีน', price: 10 }
    ]
  }

  if (name.includes('ยำวุ้นเส้น') || name.includes('ยำ')) {
    return [
      { name: 'เพิ่มหมูยอ', price: 15 },
      { name: 'เพิ่มไก่ยอ', price: 15 }
    ]
  }

  if (name.includes('ลาบ')) {
    return [
      { name: 'เพิ่มผักเคียง', price: 10 }
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
    if (item.value.is_available === false) {
      alert('ขออภัยครับ เมนูนี้ปิดการขายชั่วคราว');
      return;
    }
    if (!isExemptDishType(item.value) && !dishType.value) {
      alert('กรุณาเลือกว่าเป็น "กับข้าว" หรือ "ราดข้าว" ก่อนเพิ่มลงในตะกร้าครับ');
      return;
    }

    let finalInstructions = specialInstructions.value
    if (dishType.value) {
      finalInstructions = `รูปแบบ: ${dishType.value} ${finalInstructions ? `(${finalInstructions})` : ''}`
    }
    if (isSeafoodItem.value) {
      finalInstructions = `เนื้อสัตว์: ${seafoodChoice.value} ${finalInstructions ? `| ${finalInstructions}` : ''}`
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

/* ===== สไตล์สารก่อภูมิแพ้ (Allergens Warning Styles) ===== */
.allergen-warning-inline {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #b91c1c;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 3px 8px;
  border-radius: 6px;
  vertical-align: middle;
}

.allergen-warning-banner {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 10px;
  padding: 10px 14px;
  margin: 12px 0;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.08);
}

.allergen-banner-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.allergen-alert-icon {
  font-size: 16px;
}

.allergen-alert-title {
  font-size: 13px;
  color: #92400e;
  font-weight: 700;
}

.allergen-badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.allergen-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid #fde68a;
  color: #b45309;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
</style>