<template>
  <div 
    class="menu-item-card" 
    :class="{ 
      'is-out-of-stock': item.is_available === false,
      'is-drink-card': isPlusOnly(item)
    }"
    @click="onCardClick"
  >
    <div class="image-container">
      <img :src="item.image_url || 'https://placehold.co/400x300?text=Food'" :alt="item.menu_name" class="item-image" />
      <div v-if="item.is_available === false" class="out-of-stock-overlay">
        <span class="out-of-stock-label">❌ หมดชั่วคราว</span>
      </div>
    </div>
    <div class="item-details">
      <h3 class="item-name">
        {{ item.menu_name }}
        <span v-if="cardAllergens.length > 0" class="card-allergen-badge" :title="'มีสารก่อภูมิแพ้: ' + cardAllergens.map(a => a.allergen_name).join(', ')">
          ⚠️ มีสารก่อภูมิแพ้
        </span>
      </h3>
      <div class="price-action">
        <span class="item-price">฿{{ item.price.toFixed(2) }}</span>
      </div>
      <button 
        class="add-button" 
        :disabled="item.is_available === false"
        :class="{ 'btn-disabled': item.is_available === false }"
        @click.stop="item.is_available !== false && $emit('add', item)"
        :title="isPlusOnly(item) ? 'กด + Add เพื่อเพิ่มลงตะกร้า' : 'เลือกรายละเอียด'"
      >
        {{ item.is_available === false ? 'สินค้าหมด' : '+ Add' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DEFAULT_ALLERGENS, resolveAllergenBadges } from '../../utils/menuSync'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['select', 'add'])

const cardAllergens = computed(() => {
  if (!props.item) return []
  let ids = props.item.allergen_ids
  if (!ids || ids.length === 0) {
    const name = props.item.menu_name || props.item.name || ''
    if (name.includes('ทะเล') || name.includes('กุ้ง')) ids = [1, 6]
    else if (name.includes('ไข่เจียว')) ids = [5]
    else if (name.includes('ส้มตำปู') || name.includes('ปลาร้า')) ids = [7, 9]
    else if (name.includes('ส้มตำไทย')) ids = [1, 2]
    else if (name.includes('ไก่ทอด')) ids = [4]
  }
  return resolveAllergenBadges(ids || [], DEFAULT_ALLERGENS)
})

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

const isPlusOnly = (item) => {
  if (!item) return false;
  if (isDrink(item)) return true;
  const name = (item.menu_name || item.name || '').toString().trim();
  return name.includes('ไก่ทอด') ||
         name.includes('ปีกไก่ทอด') ||
         name.includes('ข้าวเปล่า') ||
         name.includes('ข้าวสวย') ||
         name.includes('ข้าวเหนียว');
}

const onCardClick = () => {
  if (props.item.is_available === false) return;
  // เมนูน้ำ, ไก่ทอด, ปีกไก่ทอด, ข้าวสวย, ข้าวเหนียว จะไม่สามารถกดตรงรูปภาพหรือการ์ดเพื่อเพิ่มรายการเข้าตะกร้าได้
  if (isPlusOnly(props.item)) {
    return;
  }
  emit('select', props.item);
}
</script>

<style scoped>
.menu-item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.menu-item-card.is-drink-card {
  cursor: default;
}

.menu-item-card.is-drink-card .image-container,
.menu-item-card.is-drink-card .item-name {
  cursor: default;
}

.menu-item-card.is-drink-card .add-button {
  cursor: pointer;
  transform: scale(1.03);
}

.menu-item-card.is-out-of-stock {
  opacity: 0.65;
  cursor: not-allowed;
}

.image-container {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  position: relative;
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.out-of-stock-label {
  background: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-price {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}

.add-button {
  background-color: #3e7654;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.add-button:active {
  background-color: #2c543b;
}

.card-allergen-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #c2410c;
  background: #ffedd5;
  border: 1px solid #fed7aa;
  padding: 1px 6px;
  border-radius: 6px;
  margin-left: 4px;
  vertical-align: middle;
}
</style>
