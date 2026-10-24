<template>
  <div class="page-container">
    <!-- Top Navbar มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar v-model="searchQuery" :showSearch="true" />

    <!-- 🛑 ป้ายแจ้งเตือนเมื่อร้านปิดให้บริการ -->
    <div v-if="!isStoreOpen" class="store-closed-top-banner">
      <div class="closed-banner-inner">
        <span class="closed-icon">🛑</span>
        <div class="closed-texts">
          <strong class="closed-title">ขณะนี้ร้านปิดให้บริการชั่วคราว</strong>
          <span class="closed-sub">ระบบงดรับคำสั่งซื้อทุกช่องทางในขณะนี้ (เวลาทำการปกติ 10:30 - 22:00 น.) ขออภัยในความไม่สะดวกครับ</span>
        </div>
        <span class="closed-tag">ปิดร้านชั่วคราว</span>
      </div>
    </div>

    <div class="main-layout">
      <!-- ส่วนเนื้อหาหลักด้านซ้าย -->
      <div class="content-area">
        <!-- Hero Banner -->
        <div class="hero-banner">
          <div class="hero-text-box">
            <h1 class="hero-title">ส่งฟรีเมื่อสั่งเกิน<br>B300!</h1>
            <p class="hero-desc">เติมพลังให้วันของคุณด้วยอาหารออร์แกนิกสดใหม่จากฟาร์ม ส่ง<br>ตรงถึงหน้าประตูคุณ</p>
            <button class="hero-btn">รับสิทธิ์</button>
          </div>
        </div>

        <!-- Categories Tabs -->
        <div class="category-tabs" v-if="!searchQuery">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            class="tab-btn" 
            :class="{ active: currentCategory === tab }"
            @click="currentCategory = tab"
          >
            {{ tab }}
          </button>
        </div>

        <h2 class="section-heading">{{ searchQuery ? 'ผลการค้นหา' : currentCategory }}</h2>

        <!-- Product Grid ใน Home.vue -->
        <div class="products-grid" :key="currentCategory">
          <div 
            class="food-card" 
            v-for="item in filteredMenu" 
            :key="item.id + '-' + item.name" 
            :class="{ 
              'out-of-stock-card': item.is_available === false,
              'drink-card': isDrink(item)
            }"
            @click="onCardClick(item)"
          >
            <div class="img-wrapper">
              <span class="badge-popular" v-if="item.isPopular">ยอดนิยม</span>
              <img :src="item.img" :alt="item.name" @error="onImgError($event, item)">
              
              <!-- 🛑 แสดงป้ายทับเมื่อสินค้าหมดชั่วคราว -->
              <div v-if="item.is_available === false" class="out-of-stock-overlay">
                <span class="out-of-stock-badge">❌ สินค้าหมดชั่วคราว</span>
              </div>
            </div>
            
            <h3 class="food-title">
              {{ item.name }}
              <span v-if="getItemAllergens(item).length > 0" class="card-allergen-tag" :title="'มีสารก่อภูมิแพ้: ' + getItemAllergens(item).map(a => a.allergen_name).join(', ')">
                ⚠️ มีสารก่อภูมิแพ้
              </span>
            </h3>
            <p class="food-desc">{{ item.desc }}</p>
            <div class="food-footer">
              <span class="price">B{{ item.price }}</span>
              <button 
                class="plus-btn" 
                :disabled="item.is_available === false"
                :class="{ 'disabled-btn': item.is_available === false }"
                @click.stop="onPlusClick(item)"
                :title="isDrink(item) ? 'กด + เพื่อเพิ่มลงตะกร้า' : 'เลือกรายละเอียด'"
              >
                {{ item.is_available === false ? 'หมด' : '+' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- แผงตะกร้าสินค้าด้านขวา -->
      <aside class="cart-panel" v-if="cartItems.length > 0">
        <h3 class="cart-header-title">ตะกร้าของคุณ</h3>
        <p class="cart-sub">พร้อมชำระเงินหรือยัง?</p>

        <div class="cart-list">
          <div class="cart-row" v-for="(item, index) in cartItems" :key="index">
            <div class="cart-item-info">
              <div class="cart-item-name">
                {{ item.name }}
                <span v-if="getItemAllergens(item).length > 0" class="cart-allergen-pill">
                  ⚠️ มีสารก่อภูมิแพ้: {{ getItemAllergens(item).map(a => a.allergen_name).join(', ') }}
                </span>
              </div>
              
              <div class="cart-item-options">
                <span v-if="item.dishType" class="opt-badge dish-badge">🍽️ {{ item.dishType }}</span>
                <span v-if="item.seafoodChoice" class="opt-badge">✔️ {{ item.seafoodChoice }}</span>
                <span v-if="item.spiceLevel" class="opt-badge">🌶️ {{ item.spiceLevel }}</span>
                <span v-for="addon in item.addons" :key="addon.name" class="opt-badge">+ {{ addon.name }}</span>
              </div>
              
              <div class="cart-item-price">B{{ item.price }}</div>
            </div>
            
            <div class="cart-item-actions">
              <div class="qty-box">
                <button @click="updateQty(index, -1)" :class="{ disabled: item.qty <= 1 }">-</button>
                <span>{{ item.qty }}</span>
                <button @click="updateQty(index, 1)">+</button>
              </div>
              <button class="delete-item-btn" @click="removeItem(index)" title="ลบสินค้า">✕</button>
            </div>
          </div>
        </div>

        <div class="cart-summary-section">
          <div class="summary-line">
            <span>ยอดรวม</span>
            <span>B{{ subtotal }}</span>
          </div>
          <div class="summary-line">
            <span>ค่าจัดส่ง</span>
            <span class="calc-text">คำนวณเมื่อชำระเงิน</span>
          </div>
          <div class="summary-line total-line">
            <span>ยอดสุทธิ</span>
            <span>B{{ subtotal }}</span>
          </div>
          
          <button 
            class="checkout-main-btn" 
            :disabled="!isStoreOpen"
            :class="{ 'disabled-checkout-btn': !isStoreOpen }"
            @click="proceedToCheckout"
          >
            {{ isStoreOpen ? 'ชำระเงินทันที ➔' : '🛑 ร้านปิดบริการชั่วคราว' }}
          </button>
        </div>
      </aside>
    </div>

    <!-- Pop-up เลือกรายละเอียดสินค้า (Modal) -->
    <div class="modal-overlay" v-if="showItemModal" @click.self="closeItemModal">
      <div class="item-modal-content">
        <div class="item-modal-left">
          <img :src="selectedItem.img" :alt="selectedItem.name">
        </div>
        
        <div class="item-modal-right">
          <button class="close-modal-btn" @click="closeItemModal">✕</button>
          
          <div class="modal-header">
            <div class="modal-title-wrap">
              <h2>
                {{ selectedItem.name }}
                <!-- ⚠️ เขียนเตือนอยู่ตรงหลังชื่อเมนูหลังกดเลือกเมนูนั้นไป -->
                <span v-if="getItemAllergens(selectedItem).length > 0" class="allergen-warning-inline">
                  ⚠️ มีสารก่อภูมิแพ้: {{ getItemAllergens(selectedItem).map(a => a.allergen_name).join(', ') }}
                </span>
              </h2>
            </div>
            <div class="price-cal-box">
              <span class="modal-base-price">B{{ unitModalPrice }}</span>
              <span class="modal-cal-text" v-if="selectedItem.calories !== undefined">🔥 ~{{ unitModalCalories }} kcal</span>
            </div>
          </div>

          <!-- แถบเตือนสารก่อภูมิแพ้แบบกล่องเตือนเด่นชัด (Allergens Warning Banner) -->
          <div v-if="getItemAllergens(selectedItem).length > 0" class="allergen-warning-banner">
            <div class="allergen-banner-header">
              <span class="allergen-alert-icon">⚠️</span>
              <strong class="allergen-alert-title">คำเตือนสำหรับผู้แพ้อาหาร (Allergens Warning):</strong>
            </div>
            <div class="allergen-badge-list">
              <span 
                v-for="al in getItemAllergens(selectedItem)" 
                :key="al.allergen_id"
                class="allergen-chip"
              >
                {{ al.icon }} {{ al.allergen_name }}
              </span>
            </div>
          </div>

          <p class="modal-desc">{{ selectedItem.desc }}</p>

          <div class="modal-scroll-area">
            
            <!-- ส่วนเลือก กับข้าว หรือ ราดข้าว (ทุกเมนู ยกเว้น เครื่องดื่ม, ลาบ, ไก่ทอด, ส้มตำ, ข้าวผัด, ข้าวเปล่า) -->
            <div class="option-group" v-if="!isExemptDishType(selectedItem)">
              <div class="option-group-title">
                <h3>เลือกรูปแบบอาหาร</h3>
                <span class="req-badge">จำเป็น</span>
              </div>
              <div class="dish-type-grid">
                <button 
                  type="button"
                  class="dish-type-btn" 
                  :class="{ active: modalOptions.dishType === 'ราดข้าว' }"
                  @click="modalOptions.dishType = 'ราดข้าว'"
                >
                  <span class="dish-icon">🍛</span>
                  <span class="dish-label">ราดข้าว</span>
                </button>
                <button 
                  type="button"
                  class="dish-type-btn" 
                  :class="{ active: modalOptions.dishType === 'กับข้าว' }"
                  @click="modalOptions.dishType = 'กับข้าว'"
                >
                  <span class="dish-icon">🍲</span>
                  <span class="dish-label">กับข้าว</span>
                </button>
              </div>
              <p v-if="!modalOptions.dishType" class="dish-req-note">* กรุณาเลือกว่าเป็นกับข้าวหรือราดข้าว</p>
            </div>

            <div class="option-group" v-if="selectedItem.isSeafood">
              <div class="option-group-title">
                <h3>เลือกเนื้อสัตว์</h3>
                <span class="req-badge">จำเป็น</span>
              </div>
              <div class="spice-grid">
                <button 
                  v-for="choice in ['รวม (หมึก+กุ้ง)', 'เฉพาะหมึก', 'เฉพาะกุ้ง']" :key="choice"
                  class="spice-btn" 
                  :class="{ active: modalOptions.seafoodChoice === choice }"
                  @click="modalOptions.seafoodChoice = choice"
                >
                  <span class="leaf-icon" v-if="choice === 'รวม (หมึก+กุ้ง)'">🦑🦐</span>
                  <span class="leaf-icon" v-else-if="choice === 'เฉพาะหมึก'">🦑</span>
                  <span class="leaf-icon" v-else>🦐</span>
                  {{ choice }}
                </button>
              </div>
            </div>

            <div class="option-group" v-if="selectedItem.isSpicy">
              <div class="option-group-title">
                <h3>ระดับความเผ็ด</h3>
                <span class="req-badge">จำเป็น</span>
              </div>
              <div class="spice-grid">
                <button 
                  v-for="level in spiceLevels" :key="level"
                  class="spice-btn" 
                  :class="{ active: modalOptions.spiceLevel === level }"
                  @click="modalOptions.spiceLevel = level"
                >
                  <span class="leaf-icon" v-if="level === 'เผ็ดน้อย'">🌶️</span>
                  <span class="leaf-icon" v-else-if="level === 'เผ็ดกลาง'">🌶️🌶️</span>
                  <span class="leaf-icon" v-else>🌶️🌶️🌶️</span>
                  {{ level }}
                </button>
              </div>
            </div>

            <div class="option-group" v-if="availableAddons.length > 0">
              <div class="option-group-title">
                <h3>ส่วนเสริม</h3>
                <span class="opt-badge-text">ไม่บังคับ</span>
              </div>
              <div class="addon-list">
                <label class="addon-item" v-for="addon in availableAddons" :key="addon.name">
                  <div class="addon-left">
                    <input type="checkbox" :value="addon" v-model="modalOptions.addons">
                    <span>
                      {{ addon.name }} 
                      <span class="addon-cal-mini">(+{{ addon.calories }} kcal)</span>
                    </span>
                  </div>
                  <span class="addon-price">+B{{ addon.price }}</span>
                </label>
              </div>
            </div>

            <div class="option-group">
              <input type="text" class="note-input" placeholder="เช่น แพ้อาหาร, ขอทิชชู่เพิ่ม..." v-model="modalOptions.note">
            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-qty-box">
              <button @click="modalOptions.qty > 1 ? modalOptions.qty-- : null">-</button>
              <span>{{ modalOptions.qty }}</span>
              <button @click="modalOptions.qty++">+</button>
            </div>
            <button 
              class="confirm-add-btn" 
              :class="{ disabled: !canAddToCart }"
              :disabled="!canAddToCart"
              @click="confirmAddToCart"
            >
              <template v-if="!canAddToCart && !isExemptDishType(selectedItem)">
                กรุณาเลือกกับข้าวหรือราดข้าว
              </template>
              <template v-else>
                เพิ่มลงตะกร้า • B{{ calculatedModalPrice }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pop-up แจ้งเตือนบังคับเข้าสู่ระบบ -->
    <div class="modal-overlay" v-if="showAuthModal">
      <div class="auth-modal-content">
        <span class="close-modal" @click="showAuthModal = false">✕</span>
        <h2 class="auth-title">กรุณาเข้าสู่ระบบ</h2>
        <p class="auth-desc">คุณจำเป็นต้องเข้าสู่ระบบหรือสมัครสมาชิกก่อนจึงจะสามารถสั่งอาหารได้</p>
        <button class="auth-btn primary" @click="goToLogin">เข้าสู่ระบบ</button>
        <button class="auth-btn secondary" @click="goToRegister">สมัครสมาชิก</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE } from './config/api';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { authStore } from './store/authStore';
import { onMenuUpdated, DEFAULT_ALLERGENS, resolveAllergenBadges } from './utils/menuSync';

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      authStore,
      isLoggedIn: false,
      isStoreOpen: true,
      showAuthModal: false,
      showAddressDropdown: false,
      searchQuery: '',
      cartItems: [],
      currentCategory: 'ขายดีที่สุด',
      tabs: ['ขายดีที่สุด', 'ทั้งหมด', 'อาหารจานเดียว / ผัด', 'ส้มตำแซ่บซิ่ง', 'ลาบ / ยำ', 'ของทอด', 'เครื่องดื่ม'],
      
      userProfile: { address: '' },

      showItemModal: false,
      selectedItem: null,
      spiceLevels: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'],
      
      modalOptions: { dishType: null, spiceLevel: 'เผ็ดกลาง', seafoodChoice: 'รวม (หมึก+กุ้ง)', addons: [], note: '', qty: 1 },

      // รายการเมนูพร้อม Path รูปที่ Vite โหลดได้สมบูรณ์
      menuItems: [
        { id: 1, name: 'กระเพราหมู', price: 40, category: ['อาหารจานเดียว / ผัด', 'ขายดีที่สุด'], desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', img: new URL('./assets/kapaomu.jpg', import.meta.url).href, isPopular: true, isSpicy: true, calories: 550, is_available: true, allergen_ids: [] },
        { id: 2, name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, category: ['อาหารจานเดียว / ผัด'], desc: 'เผ็ดร้อน ถึงเครื่อง', img: new URL('./assets/kapaotaley.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 450, is_available: true, allergen_ids: [1, 6] },
        { id: 3, name: 'ข้าวผัดหมู', price: 40, category: ['อาหารจานเดียว / ผัด'], desc: 'ข้าวผัดหอมกรุ่น', img: new URL('./assets/khaopadmu.jpg', import.meta.url).href, isSpicy: false, calories: 550, is_available: true, allergen_ids: [5] },
        { id: 4, name: 'ข้าวผัดกุ้ง', price: 50, category: ['อาหารจานเดียว / ผัด'], desc: 'ข้าวผัดกุ้งสดเด้ง รสชาติกลมกล่อม', img: new URL('./assets/khaopadkung.jpg', import.meta.url).href, isSpicy: false, calories: 510, is_available: true, allergen_ids: [1, 5] },
        { id: 5, name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, category: ['อาหารจานเดียว / ผัด'], desc: 'รวมมิตรทะเลผัด', img: new URL('./assets/khaopadtalay.jpg', import.meta.url).href, isSpicy: false, isSeafood: true, calories: 520, is_available: true, allergen_ids: [1, 5, 6] },
        { id: 6, name: 'ผัดพริกแกงหมู', price: 40, category: ['อาหารจานเดียว / ผัด'], desc: 'พริกแกงเข้มข้น', img: new URL('./assets/pikkangmu.jpg', import.meta.url).href, isSpicy: true, calories: 550, is_available: true, allergen_ids: [] },
        { id: 7, name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, category: ['อาหารจานเดียว / ผัด'], desc: 'จัดจ้านถึงใจ', img: new URL('./assets/prikkangtalay.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 480, is_available: true, allergen_ids: [1, 6] },
        { id: 8, name: 'ผัดคะน้าหมูกรอบ', price: 40, category: ['อาหารจานเดียว / ผัด'], desc: 'ผักกรอบ หมูกรอบชิ้นโต', img: new URL('./assets/kanamokrop.jpg', import.meta.url).href, isSpicy: false, calories: 450, is_available: true, allergen_ids: [] },
        { id: 9, name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, category: ['อาหารจานเดียว / ผัด'], desc: 'คะน้ากรอบกับซีฟู้ด', img: new URL('./assets/kanatalay.jpg', import.meta.url).href, isSpicy: false, isSeafood: true, calories: 400, is_available: true, allergen_ids: [1, 6] },
        { id: 10, name: 'ข้าวหมูกระเทียม', price: 40, category: ['อาหารจานเดียว / ผัด'], desc: 'หอมกระเทียมพริกไทย', img: new URL('./assets/mookratiem.jpg', import.meta.url).href, isSpicy: false, calories: 500, is_available: true, allergen_ids: [] },
        { id: 11, name: 'ข้าวไข่เจียวหมูสับ', price: 40, category: ['อาหารจานเดียว / ผัด'], desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', img: new URL('./assets/kaijeawmoosub.jpg', import.meta.url).href, isSpicy: false, calories: 600, is_available: true, allergen_ids: [5] },
        { id: 12, name: 'ข้าวไข่เจียวกุ้ง', price: 50, category: ['อาหารจานเดียว / ผัด'], desc: 'ไข่เจียวฟูกับกุ้ง', img: new URL('./assets/kaikung.jpg', import.meta.url).href, isSpicy: false, calories: 550, is_available: true, allergen_ids: [1, 5] },
        { id: 13, name: 'ยำวุ้นเส้นทะเล', price: 70, category: ['ลาบ / ยำ', 'ขายดีที่สุด'], desc: 'เปรี้ยวเผ็ดแซ่บ กุ้ง หมึก หมูสับ', img: new URL('./assets/yumtalay.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 250, is_available: true, allergen_ids: [1, 6] },
        
        { id: 14, name: 'ส้มตำปูปลาร้า', price: 40, category: ['ส้มตำแซ่บซิ่ง', 'ขายดีที่สุด'], desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', img: new URL('./assets/tumprara.jpg', import.meta.url).href, isPopular: true, isSpicy: true, calories: 120, is_available: true, allergen_ids: [7, 9] },
        { id: 15, name: 'ส้มตำไทย', price: 40, category: ['ส้มตำแซ่บซิ่ง'], desc: 'เปรี้ยวหวาน สามรส', img: new URL('./assets/tumtai.jpg', import.meta.url).href, isSpicy: true, calories: 150, is_available: true, allergen_ids: [1, 2] },
        { id: 16, name: 'ลาบหมู', price: 60, category: ['ลาบ / ยำ'], desc: 'หอมข้าวคั่ว แซ่บถึงใจ', img: new URL('./assets/larbmoo.jpg', import.meta.url).href, isSpicy: true, calories: 200, is_available: true, allergen_ids: [] },
        { id: 17, name: 'ไก่ทอด (ปีก)', price: 20, category: ['ของทอด'], desc: 'กรอบนอกนุ่มใน', img: new URL('./assets/wingchick.jpg', import.meta.url).href, isSpicy: false, calories: 150, is_available: true, allergen_ids: [4] },
        { id: 18, name: 'ไก่ทอด (สะโพก)', price: 50, category: ['ของทอด', 'ขายดีที่สุด'], desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', img: new URL('./assets/chick.jpg', import.meta.url).href, isSpicy: false, calories: 250, is_available: true, allergen_ids: [4] },

        { id: 19, name: 'น้ำเก๊กฮวย', price: 20, category: ['เครื่องดื่ม', 'ขายดีที่สุด'], desc: 'หวานเย็น ชื่นใจ', img: new URL('./assets/gek.jpg', import.meta.url).href, calories: 120, is_available: true, allergen_ids: [] },
        { id: 20, name: 'โค้ก (Coke)', price: 20, category: ['เครื่องดื่ม'], desc: 'น้ำอัดลมซ่าสดชื่น', img: new URL('./assets/coke.jpg', import.meta.url).href, calories: 140, is_available: true, allergen_ids: [] },
        { id: 21, name: 'สไปรท์ (Sprite)', price: 20, category: ['เครื่องดื่ม'], desc: 'ซ่า สดชื่น กลิ่นเลมอน', img: new URL('./assets/sprite.jpg', import.meta.url).href, calories: 140, is_available: true, allergen_ids: [] },
        { id: 22, name: 'น้ำเปล่า', price: 10, category: ['เครื่องดื่ม'], desc: 'น้ำดื่มบริสุทธิ์', img: new URL('./assets/water.jpg', import.meta.url).href, calories: 0, is_available: true, allergen_ids: [] },
        { id: 23, name: 'ข้าวเปล่า', price: 10, category: ['อาหารจานเดียว / ผัด'], desc: 'ข้าวสวยหอมมะลิ ร้อนๆ นุ่มอร่อย', img: new URL('./assets/kao.jpg', import.meta.url).href, isSpicy: false, calories: 150, is_available: true, allergen_ids: [] },
        { id: 24, name: 'ข้าวเหนียว', price: 10, category: ['ส้มตำแซ่บซิ่ง', 'อาหารจานเดียว / ผัด'], desc: 'ข้าวเหนียวนุ่ม ร้อนๆ หอมอร่อย', img: new URL('./assets/kaon.jpg', import.meta.url).href, isSpicy: false, calories: 150, is_available: true, allergen_ids: [] },
        { id: 25, name: 'น้ำตกหมู', price: 70, category: ['ลาบ / ยำ'], desc: 'หมูนุ่ม หอมมะนาว ข้าวคั่ว รสจัดจ้าน', img: new URL('./assets/namtokmoo.jpg', import.meta.url).href, isSpicy: true, calories: 200, is_available: true, allergen_ids: [] }
      ]
    }
  },
  computed: {
    subtotal() { return this.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0); },
    filteredMenu() {
      const searchWord = this.searchQuery.trim().toLowerCase();
      if (searchWord !== '') {
        return this.menuItems.filter(item => item.name.toLowerCase().includes(searchWord));
      }
      if (this.currentCategory === 'ทั้งหมด') {
        return this.menuItems;
      }
      if (this.currentCategory === 'ขายดีที่สุด') {
        return this.menuItems.filter(item => {
          const cats = Array.isArray(item.category) ? item.category : [item.category];
          return item.isPopular || cats.includes('ขายดีที่สุด');
        });
      }
      return this.menuItems.filter(item => {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        return cats.includes(this.currentCategory);
      });
    },
    canAddToCart() {
      if (!this.selectedItem) return false;
      if (!this.isExemptDishType(this.selectedItem)) {
        return !!this.modalOptions.dishType;
      }
      return true;
    },
    unitModalPrice() {
      if (!this.selectedItem) return 0;
      let addonTotal = this.modalOptions.addons.reduce((sum, addon) => sum + addon.price, 0);
      return this.selectedItem.price + addonTotal;
    },
    unitModalCalories() {
      if (!this.selectedItem || this.selectedItem.calories === undefined) return 0;
      let addonCal = this.modalOptions.addons.reduce((sum, addon) => sum + (addon.calories || 0), 0);
      return this.selectedItem.calories + addonCal;
    },
    calculatedModalPrice() {
      return this.unitModalPrice * this.modalOptions.qty;
    },
    displayAddress() {
      if (!this.isLoggedIn) return 'ตลาดปากเกร็ด';
      if (this.userProfile && this.userProfile.address) {
        let addr = this.userProfile.address;
        return addr.length > 20 ? addr.substring(0, 20) + '...' : addr;
      }
      return 'กรุณาเพิ่มที่อยู่';
    },
    availableAddons() {
      if (!this.selectedItem) return [];
      const name = this.selectedItem.name;
      const cats = this.selectedItem.category || [];

      if (cats.includes('เครื่องดื่ม') || name.includes('ไก่ทอด') || name.includes('ไข่เจียว') || name.includes('ข้าวเปล่า') || name.includes('ข้าวเหนียว')) {
        return [];
      }

      if (name.includes('ส้มตำ')) {
        return [
          { name: 'เพิ่มปู', price: 10, calories: 30 },
          { name: 'ขนมจีน', price: 10, calories: 80 }
        ];
      }

      if (name.includes('ยำวุ้นเส้น') || name.includes('ยำ')) {
        return [
          { name: 'เพิ่มหมูยอ', price: 15, calories: 120 },
          { name: 'เพิ่มไก่ยอ', price: 15, calories: 100 }
        ];
      }

      if (name.includes('ลาบ')) {
        return [
          { name: 'เพิ่มผักเคียง', price: 10, calories: 20 }
        ];
      }

      return [
        { name: 'ไข่ดาว', price: 10, calories: 160 },
        { name: 'ไข่เจียว', price: 10, calories: 220 }
      ];
    }
  },
  async mounted() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      this.userProfile = JSON.parse(profileData);
    } else if (this.isLoggedIn) {
      this.userProfile = { address: '35/369 หมู่ 1 ต.บ้านใหม่ อ.เมืองปทุมธานี จ.ปทุมธานี 12000' };
    }
    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }

    // ซิงก์ราคาและข้อมูลสดจาก Database Backend
    await this.fetchMenus();
    await this.fetchStoreSettings();

    // ⚡ ดักฟังสัญญาณอัปเดตเมนูและสารก่อภูมิแพ้แบบ Real-time (Socket.io + BroadcastChannel + Storage)
    this.cleanupMenuSync = onMenuUpdated((updatedMenu) => {
      if (!updatedMenu) return;
      const targetId = updatedMenu.menu_id || updatedMenu.id;
      const targetName = (updatedMenu.menu_name || updatedMenu.name || '').trim();

      for (const item of this.menuItems) {
        if ((targetId && item.id === targetId) || (targetName && item.name === targetName)) {
          if (updatedMenu.allergen_ids !== undefined) {
            item.allergen_ids = [...updatedMenu.allergen_ids];
          }
          if (updatedMenu.is_available !== undefined) {
            item.is_available = updatedMenu.is_available;
          }
          if (updatedMenu.price !== undefined) {
            item.price = Number(updatedMenu.price);
          }
        }
      }

      // ถ้าเปิด Modal เมนูนี้อยู่ ให้อัปเดตข้อมูลสารก่อภูมิแพ้ทันทีแบบ Real-time
      if (this.selectedItem && ((targetId && this.selectedItem.id === targetId) || (targetName && this.selectedItem.name === targetName))) {
        if (updatedMenu.allergen_ids !== undefined) {
          this.selectedItem.allergen_ids = [...updatedMenu.allergen_ids];
        }
        if (updatedMenu.price !== undefined) {
          this.selectedItem.price = Number(updatedMenu.price);
        }
        this.selectedItem = { ...this.selectedItem };
      }
    });
  },
  beforeUnmount() {
    if (this.cleanupMenuSync) {
      this.cleanupMenuSync();
    }
  },
  methods: {
    getItemAllergens(item) {
      if (!item) return [];
      let ids = item.allergen_ids;
      if ((!ids || ids.length === 0) && item.allergens && Array.isArray(item.allergens)) {
        ids = item.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean);
      }
      return resolveAllergenBadges(ids || [], DEFAULT_ALLERGENS);
    },
    async fetchStoreSettings() {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        if (res.data && res.data.is_open !== undefined) {
          this.isStoreOpen = Boolean(res.data.is_open);
        }
      } catch (err) {
        console.warn('ไม่สามารถโหลดสถานะร้านค้าจาก Backend ได้:', err);
      }
    },
    
    findMatchingDbMenu(localItem, dbMenus) {
      if (!dbMenus || !Array.isArray(dbMenus)) return null;

      const clean = (str) => (str || '').toString().trim().toLowerCase().replace(/\s+/g, '');
      const localName = clean(localItem.name);

      // 1. ตรวจสอบชื่อตรงกันเป๊ะ
      let found = dbMenus.find(d => {
        const dbName = clean(d.menu_name || d.name);
        return dbName === localName;
      });
      if (found) return found;

      // 2. ปรับตัวสะกด กะเพรา / กระเพรา
      const normLocal = localName.replace(/กะเพรา/g, 'กระเพรา');
      found = dbMenus.find(d => {
        const dbName = clean(d.menu_name || d.name).replace(/กะเพรา/g, 'กระเพรา');
        return dbName === normLocal;
      });
      if (found) return found;

      // 3. แมปตามคีย์เวิร์ดเฉพาะ เช่น เครื่องดื่ม หรือเมนูทางเลือก
      if (normLocal.includes('เก๊กฮวย')) {
        return dbMenus.find(d => clean(d.menu_name || d.name).includes('เก๊กฮวย'));
      }
      if (normLocal.includes('โค้ก') || normLocal.includes('coke')) {
        return dbMenus.find(d => {
          const dbName = clean(d.menu_name || d.name);
          return dbName.includes('โค้ก') || dbName.includes('coke');
        });
      }
      if (normLocal.includes('สไปรท์') || normLocal.includes('sprite')) {
        return dbMenus.find(d => {
          const dbName = clean(d.menu_name || d.name);
          return dbName.includes('สไปรท์') || dbName.includes('sprite');
        });
      }
      if (normLocal.includes('น้ำเปล่า') || normLocal.includes('น้ำดื่ม')) {
        return dbMenus.find(d => {
          const dbName = clean(d.menu_name || d.name);
          return dbName.includes('น้ำดื่ม') || dbName.includes('น้ำเปล่า');
        });
      }
      if (normLocal.includes('คะน้าหมู')) {
        return dbMenus.find(d => clean(d.menu_name || d.name).includes('คะน้าหมู'));
      }
      if (normLocal.includes('ไก่ทอด') && normLocal.includes('ปีก')) {
        return dbMenus.find(d => {
          const dbName = clean(d.menu_name || d.name);
          return (dbName.includes('ไก่ทอด') && dbName.includes('ปีก')) || dbName.includes('ปีกไก่ทอด');
        });
      }
      if (normLocal.includes('ไก่ทอด') && normLocal.includes('สะโพก')) {
        return dbMenus.find(d => {
          const dbName = clean(d.menu_name || d.name);
          return dbName.includes('ไก่ทอด') && dbName.includes('สะโพก');
        });
      }

      return null;
    },
    async fetchMenus() {
      try {
        const response = await axios.get(`${API_BASE}/menus`);
        if (response.data && response.data.length > 0) {
          const matchedIds = new Set();
          this.menuItems = this.menuItems.map(localItem => {
            const dbItem = this.findMatchingDbMenu(localItem, response.data);

            if (dbItem) {
              matchedIds.add(dbItem.menu_id || dbItem.id);
              const dbAllergens = (dbItem.allergens && dbItem.allergens.length > 0)
                ? dbItem.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean)
                : (dbItem.allergen_ids !== undefined ? dbItem.allergen_ids : localItem.allergen_ids || []);

              return {
                ...localItem,
                id: dbItem.menu_id || dbItem.id || localItem.id,
                price: Number(dbItem.price) || localItem.price,
                // คงคำอธิบายของเมนูให้ตรงกับเมนูและการ์ดอาหารเสมอ ไม่นำคำอธิบายผิดเมนูมาทับ
                desc: localItem.desc || dbItem.description,
                // 🛑 บรรทัดนี้สำคัญมาก: ดึงสถานะเปิด-ปิดจริงจาก Backend มาทับ
                is_available: dbItem.is_available !== undefined ? dbItem.is_available : true,
                allergen_ids: dbAllergens
              };
            }
            return localItem;
          });

          // เพิ่มเมนูใหม่จากฐานข้อมูลที่ยังไม่มีในรายการ local และคัดกรองเมนูซ้ำซ้อน
          const seenNames = new Set(this.menuItems.map(i => i.name));
          for (const dbItem of response.data) {
            const id = dbItem.menu_id || dbItem.id;
            let canonical = (dbItem.menu_name || '').trim();
            if (canonical === 'ไข่เจียวหมูสับ') canonical = 'ข้าวไข่เจียวหมูสับ';
            if (canonical === 'ไข่เจียวกุ้ง') canonical = 'ข้าวไข่เจียวกุ้ง';
            if (canonical === 'ปีกไก่ทอด') canonical = 'ไก่ทอด (ปีก)';

            if (!matchedIds.has(id) && !seenNames.has(canonical)) {
              seenNames.add(canonical);
              const catName = dbItem.category?.category_name || '';
              const cats = [];
              if (catName.includes('เครื่องดื่ม') || dbItem.category_id === 5) cats.push('เครื่องดื่ม');
              else if (catName.includes('ส้มตำ') || dbItem.category_id === 2) cats.push('ส้มตำแซ่บซิ่ง');
              else if (catName.includes('ลาบ') || catName.includes('ยำ') || dbItem.category_id === 3) cats.push('ลาบ / ยำ');
              else if (catName.includes('ของทอด') || dbItem.category_id === 4) cats.push('ของทอด');
              else cats.push('อาหารจานเดียว / ผัด');

              const newAllergenIds = (dbItem.allergens && dbItem.allergens.length > 0)
                ? dbItem.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean)
                : (dbItem.allergen_ids || []);

              this.menuItems.push({
                id: id,
                name: canonical,
                price: Number(dbItem.price) || 0,
                category: cats,
                desc: dbItem.description || '',
                img: dbItem.image_url || '/images/kapaomu.jpg',
                isSpicy: canonical.includes('ตำ') || canonical.includes('ลาบ') || canonical.includes('เพรา') || canonical.includes('ตก'),
                calories: dbItem.calories || 200,
                is_available: dbItem.is_available !== false,
                allergen_ids: newAllergenIds
              });
              matchedIds.add(id);
            }
          }
        }
      } catch (error) {
        console.warn('ไม่สามารถเชื่อมต่อ Backend เพื่อดึงสถานะเมนูได้:', error);
      }
    },

    onImgError(e, item) {
      if (e.target.dataset.tried) {
        // Fallback ขั้นสุดท้ายตามชื่อเมนู
        const name = (item.name || item.menu_name || '').toLowerCase();
        if (name.includes('น้ำตก')) e.target.src = '/images/namtokmoo.jpg';
        else if (name.includes('ลาบ')) e.target.src = '/images/larbmoo.jpg';
        else if (name.includes('ยำ')) e.target.src = '/images/yumtalay.jpg';
        else if (name.includes('ส้มตำ')) e.target.src = '/images/tumtai.jpg';
        else e.target.src = '/images/kapaomu.jpg';
        return;
      }
      e.target.dataset.tried = 'true';
      const filename = item.img ? item.img.split('/').pop().split('?')[0] : '';
      if (filename && !filename.startsWith('menu-')) {
        e.target.src = `/images/${filename}`;
      } else {
        const name = (item.name || item.menu_name || '').toLowerCase();
        if (name.includes('น้ำตก')) e.target.src = '/images/namtokmoo.jpg';
        else if (name.includes('ลาบ')) e.target.src = '/images/larbmoo.jpg';
        else if (name.includes('ยำ')) e.target.src = '/images/yumtalay.jpg';
        else if (name.includes('ส้มตำ')) e.target.src = '/images/tumtai.jpg';
        else e.target.src = '/images/kapaomu.jpg';
      }
    },

    isExemptDishType(item) {
      if (!item) return true;
      const name = item.name || item.menu_name || '';
      const cats = item.category || [];

      if (cats.includes('เครื่องดื่ม') || name.includes('น้ำ') || name.includes('โค้ก') || name.includes('สไปรท์')) {
        return true;
      }
      if (name.includes('ลาบ')) return true;
      if (name.includes('ไก่ทอด')) return true;
      if (name.includes('ส้มตำ')) return true;
      if (name.includes('ข้าวผัด')) return true;
      if (name.includes('ข้าวเปล่า')) return true;
      if (name.includes('ข้าวเหนียว')) return true;
      if (name.includes('ยำ')) return true;

      return false;
    },

    isDrink(item) {
      if (!item) return false;
      const name = item.name || item.menu_name || '';
      const cats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
      return cats.includes('เครื่องดื่ม') ||
             cats.some(c => String(c).includes('เครื่องดื่ม')) ||
             name.includes('น้ำ') ||
             name.includes('โค้ก') ||
             name.includes('สไปรท์') ||
             name.toLowerCase().includes('coke') ||
             name.toLowerCase().includes('sprite') ||
             name.includes('เก๊กฮวย');
    },

    onCardClick(item) {
      if (!item || item.is_available === false) return;
      // 🛑 เมนูน้ำจะไม่สามารถกดตรงรูปภาพหรือการ์ดเพื่อเพิ่มรายการเข้าตะกร้าได้
      // จะต้องกดที่ + ตรงการ์ดเท่านั้นจึงจะเพิ่มเข้าตะกร้า
      if (this.isDrink(item)) {
        return;
      }
      this.openModalOrAdd(item);
    },

    onPlusClick(item) {
      if (!item || item.is_available === false) return;
      if (!this.isStoreOpen) {
        alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้');
        return;
      }
      this.authStore.syncAuth();
      if (!this.authStore.isLoggedIn) {
        this.showAuthModal = true;
        return;
      }

      if (this.isDrink(item)) {
        // กดปุ่ม + ตรงการ์ดเท่านั้น จึงจะเพิ่มเมนูน้ำเข้าตะกร้า
        this.addDirectToCart(item);
      } else {
        this.openModalOrAdd(item);
      }
    },
    openModalOrAdd(item) {
      if (!this.isStoreOpen) {
        alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้');
        return;
      }
      if (item.is_available === false) return;
      this.authStore.syncAuth();
      if (!this.authStore.isLoggedIn) { 
        this.showAuthModal = true; 
        return; 
      }
      
      // เมนูน้ำห้าม add จากการคลิกการ์ด
      if (this.isDrink(item)) {
        return;
      }

      if (item.name.includes('ไก่ทอด') || item.name === 'ข้าวเปล่า' || item.name === 'ข้าวเหนียว') {
        this.addDirectToCart(item);
      } else {
        this.selectedItem = item;
        this.modalOptions = { 
          dishType: null,
          spiceLevel: item.isSpicy ? 'เผ็ดกลาง' : null, 
          seafoodChoice: item.isSeafood ? 'รวม (หมึก+กุ้ง)' : null, 
          addons: [], 
          note: '', 
          qty: 1 
        };
        this.showItemModal = true;
      }
    },
    closeItemModal() { this.showItemModal = false; this.selectedItem = null; },
    confirmAddToCart() {
      if (!this.canAddToCart) {
        alert('กรุณาเลือกว่าต้องการเป็น "กับข้าว" หรือ "ราดข้าว" ก่อนเพิ่มลงในตะกร้าครับ');
        return;
      }

      this.cartItems.push({
        name: this.selectedItem.name, 
        price: this.unitModalPrice,
        qty: this.modalOptions.qty,
        dishType: this.isExemptDishType(this.selectedItem) ? null : this.modalOptions.dishType,
        spiceLevel: this.modalOptions.spiceLevel, 
        seafoodChoice: this.modalOptions.seafoodChoice, 
        addons: [...this.modalOptions.addons], 
        note: this.modalOptions.note
      });
      this.closeItemModal();
    },
    addDirectToCart(item) {
      if (!this.isStoreOpen) {
        alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้');
        return;
      }
      if (item.is_available === false) return;
      let found = this.cartItems.find(i => i.name === item.name && !i.dishType && !i.spiceLevel && !i.seafoodChoice && (!i.addons || i.addons.length === 0));
      if (found) { found.qty++; } else { this.cartItems.push({ name: item.name, price: item.price, qty: 1, dishType: null, spiceLevel: null, seafoodChoice: null, addons: [] }); }
    },
    updateQty(index, change) {
      if (change === -1 && this.cartItems[index].qty <= 1) return;
      this.cartItems[index].qty += change;
    },
    removeItem(index) { this.cartItems.splice(index, 1); },
    goToLogin() { this.showAuthModal = false; this.$router.push('/login'); },
    goToRegister() { this.showAuthModal = false; this.$router.push('/register'); },
    logout() { 
      this.authStore.logout(); 
      this.isLoggedIn = false; 
      this.cartItems = []; 
    },
    proceedToCheckout() {
      if (!this.isStoreOpen) {
        alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถดำเนินการชำระเงินหรือสั่งอาหารได้ในขณะนี้');
        return;
      }
      this.authStore.syncAuth();
      if (!this.authStore.isLoggedIn) {
        this.showAuthModal = true;
        return;
      }
      localStorage.setItem('cartData', JSON.stringify(this.cartItems));
      this.$router.push('/checkout');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; width: 100%; padding: 0 0 20px 0; position: relative; }
.main-layout { display: flex; width: 100%; background: #f7f6f0; gap: 20px; padding: 25px 40px 0 40px; align-items: flex-start; }

.out-of-stock-card { opacity: 0.7; background: #faf9f5; cursor: not-allowed; }
.out-of-stock-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; border-radius: 10px; z-index: 5; }
.out-of-stock-badge { background: #dc2626; color: white; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.disabled-btn { background: #cbd5e1 !important; color: #64748b !important; cursor: not-allowed !important; }

/* 🛑 Store Closed Top Banner */
.store-closed-top-banner {
  background: #fee2e2;
  border-bottom: 2px solid #ef4444;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}
.closed-banner-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.closed-icon { font-size: 22px; }
.closed-texts { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.closed-title { font-size: 14px; font-weight: 700; color: #991b1b; }
.closed-sub { font-size: 12px; color: #7f1d1d; }
.closed-tag {
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  white-space: nowrap;
}
.disabled-checkout-btn {
  background: #94a3b8 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.content-area { flex: 1; min-width: 0; }

.hero-banner { background: url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200') center/cover; border-radius: 24px; padding: 45px 50px; color: white; margin-bottom: 25px; position: relative; overflow: hidden; }
.hero-banner::before { content: ''; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.35); }
.hero-text-box { position: relative; z-index: 1; }
.hero-title { font-size: 36px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
.hero-desc { font-size: 14px; opacity: 0.95; margin-bottom: 20px; line-height: 1.5; }
.hero-btn { background: #557c61; color: white; border: none; padding: 8px 22px; border-radius: 20px; font-weight: 600; font-size: 13px; cursor: pointer; }

.category-tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.tab-btn { background: #e8e4d5; border: none; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 500; color: #444; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.tab-btn:hover { background: #d6d2c4; }
.tab-btn.active { background: #6b8e73; color: white; font-weight: 600; }

.section-heading { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; text-transform: capitalize; }

.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.food-card { background: white; border-radius: 16px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; position: relative; cursor: pointer; transition: 0.2s; }
.food-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.food-card.drink-card { cursor: default; }
.food-card.drink-card .img-wrapper { cursor: default; }
.food-card.drink-card .food-title { cursor: default; }
.food-card.drink-card .food-desc { cursor: default; }
.food-card.drink-card .plus-btn { cursor: pointer; transform: scale(1.05); }
.food-card.drink-card .plus-btn:hover { background: #557c61; transform: scale(1.15); box-shadow: 0 2px 6px rgba(85, 124, 97, 0.4); }
.img-wrapper { position: relative; width: 100%; height: 130px; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.badge-popular { position: absolute; top: 8px; right: 8px; background: #6b8e73; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.food-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; }
.food-desc { font-size: 11px; color: #777; line-height: 1.3; margin-bottom: 10px; flex-grow: 1; }
.food-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.price { font-size: 14px; font-weight: 600; color: #333; }
.plus-btn { background: #6b8e73; color: white; border: none; width: 26px; height: 26px; border-radius: 50%; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.plus-btn:hover { background: #557c61; }

.cart-panel { width: 340px; background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 20px; max-height: calc(100vh - 40px); }
.cart-header-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px; }
.cart-sub { font-size: 12px; color: #777; margin-bottom: 20px; }
.cart-list { display: flex; flex-direction: column; gap: 15px; flex-grow: 1; overflow-y: auto; padding-right: 5px; }
.cart-row { display: flex; justify-content: space-between; align-items: center; }
.cart-item-info { font-size: 13px; flex-grow: 1; display: flex; flex-direction: column; gap: 3px; }
.cart-item-name { font-weight: 600; color: #333; }
.cart-item-options { display: flex; flex-direction: column; gap: 2px; }
.opt-badge { font-size: 11px; color: #666; }
.cart-item-price { font-size: 12px; color: #333; font-weight: 500; margin-top: 2px; }

.cart-item-actions { display: flex; align-items: center; gap: 10px; }
.qty-box { display: flex; align-items: center; gap: 8px; background: white; padding: 2px 8px; border-radius: 12px; border: 1px solid #e0dfd5; }
.qty-box button { background: none; border: none; font-weight: bold; cursor: pointer; color: #557c61; font-size: 14px; }
.qty-box button.disabled { opacity: 0.3; cursor: not-allowed; } 
.qty-box span { font-size: 12px; font-weight: 600; width: 14px; text-align: center; }
.delete-item-btn { background: none; border: none; color: #ff4d4f; font-size: 13px; font-weight: bold; cursor: pointer; padding: 4px; transition: 0.2s; }
.delete-item-btn:hover { color: #d9363e; transform: scale(1.1); }

.cart-summary-section { border-top: 1px solid #e5e2d5; padding-top: 15px; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.summary-line { display: flex; justify-content: space-between; font-size: 13px; color: #666; }
.calc-text { font-size: 11px; color: #888; }
.total-line { font-weight: 600; color: #333; font-size: 15px; margin-top: 5px; margin-bottom: 15px; }
.checkout-main-btn { background: #557c61; color: white; border: none; width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: 0.2s; }
.checkout-main-btn:hover { background: #405e49; }

/* Modal General Overlay */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }

/* Item Modal */
.item-modal-content { background: #fdfbf7; border-radius: 16px; width: 750px; max-width: 95vw; height: 500px; display: flex; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); position: relative; }
.item-modal-left { width: 45%; background: #eee; }
.item-modal-left img { width: 100%; height: 100%; object-fit: cover; }
.item-modal-right { width: 55%; padding: 30px; display: flex; flex-direction: column; position: relative; }
.close-modal-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 18px; color: #888; cursor: pointer; }
.close-modal-btn:hover { color: #333; }

.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.modal-header h2 { font-size: 22px; font-weight: 600; color: #333; margin-right: 15px; }
.price-cal-box { display: flex; flex-direction: column; align-items: flex-end; }
.modal-base-price { font-size: 18px; font-weight: 600; color: #557c61; }
.modal-cal-text { font-size: 11px; color: #f59e0b; font-weight: 600; margin-top: -2px; }

.modal-desc { font-size: 13px; color: #777; margin-bottom: 20px; }

.modal-scroll-area { flex-grow: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 20px; }
.option-group-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.option-group-title h3 { font-size: 15px; font-weight: 600; color: #333; }
.req-badge { background: #eef2ed; color: #557c61; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.opt-badge-text { font-size: 11px; color: #888; }

.spice-grid { display: flex; gap: 10px; }
.spice-btn { flex: 1; border: 1px solid #ddd; background: white; padding: 12px 5px; border-radius: 12px; font-size: 13px; color: #555; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 5px; font-family: inherit; }
.spice-btn.active { border-color: #557c61; color: #557c61; font-weight: 600; box-shadow: 0 0 0 1px #557c61; background: #fdfbf7; }
.leaf-icon { font-size: 18px; }

.addon-list { display: flex; flex-direction: column; gap: 10px; }
.addon-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: white; border: 1px solid #eee; border-radius: 12px; cursor: pointer; transition: 0.2s; }
.addon-item:hover { border-color: #ddd; }
.addon-left { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #444; }
.addon-left input[type="checkbox"] { accent-color: #557c61; width: 16px; height: 16px; cursor: pointer; }
.addon-cal-mini { color: #f59e0b; font-size: 11px; margin-left: 4px; font-weight: 500;}
.addon-price { font-size: 13px; color: #666; font-weight: 500; }

.note-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 12px; font-size: 13px; font-family: inherit; outline: none; background: white; }
.note-input:focus { border-color: #557c61; }

.modal-footer { margin-top: 20px; display: flex; gap: 15px; padding-top: 15px; border-top: 1px solid #eee; align-items: center; }
.modal-qty-box { display: flex; align-items: center; justify-content: space-between; background: #eee; border-radius: 12px; padding: 0 15px; width: 100px; height: 44px; }
.modal-qty-box button { background: none; border: none; font-size: 18px; cursor: pointer; color: #555; }
.modal-qty-box span { font-weight: 600; font-size: 14px; }
.confirm-add-btn { flex-grow: 1; background: #557c61; color: white; border: none; border-radius: 12px; height: 44px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit; }
.confirm-add-btn:hover { background: #405e49; }

/* Auth Modal */
.auth-modal-content { background: white; padding: 35px 30px; border-radius: 20px; width: 380px; text-align: center; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.auth-title { font-size: 18px; font-weight: 600; color: #557c61; margin-bottom: 8px; }
.auth-desc { font-size: 13px; color: #666; margin-bottom: 25px; line-height: 1.4; }
.auth-btn { width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 10px; font-family: inherit; border: none; }
.auth-btn.primary { background: #557c61; color: white; }
.auth-btn.primary:hover { background: #405e49; }
.auth-btn.secondary { background: white; color: #557c61; border: 1px solid #557c61; }
.auth-btn.secondary:hover { background: #f7f6f0; }

/* Dish Type Selection Styles */
.dish-type-grid { display: flex; gap: 12px; }
.dish-type-btn {
  flex: 1;
  border: 1.5px solid #e0dfd5;
  background: white;
  padding: 12px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s all;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}
.dish-type-btn:hover {
  border-color: #557c61;
  background: #fbfbf9;
}
.dish-type-btn.active {
  border-color: #557c61;
  background: #f4faeb;
  color: #557c61;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(85, 124, 97, 0.2);
}
.dish-icon { font-size: 24px; }
.dish-label { font-size: 14px; font-weight: 500; }
.dish-req-note {
  font-size: 12px;
  color: #e53935;
  margin-top: 8px;
  font-weight: 500;
}
.dish-badge {
  background: #e8f5e9 !important;
  color: #2e7d32 !important;
  font-weight: 600 !important;
  border-radius: 4px;
  padding: 2px 6px;
}
.confirm-add-btn.disabled, .confirm-add-btn:disabled {
  background: #b0bec5 !important;
  cursor: not-allowed !important;
  opacity: 0.85;
  box-shadow: none !important;
}

/* ===== สไตล์สารก่อภูมิแพ้ (Allergens Warning Styles) ===== */
.modal-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.allergen-warning-inline {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  font-size: 12px;
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
  padding: 10px 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.08);
}

.allergen-banner-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.allergen-alert-icon {
  font-size: 15px;
}

.allergen-alert-title {
  font-size: 12px;
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
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.card-allergen-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #c2410c;
  background: #ffedd5;
  border: 1px solid #fed7aa;
  padding: 1px 6px;
  border-radius: 6px;
  margin-left: 6px;
  vertical-align: middle;
}

.cart-allergen-pill {
  display: block;
  font-size: 10px;
  color: #dc2626;
  font-weight: 600;
  margin-top: 3px;
  line-height: 1.3;
}

</style>