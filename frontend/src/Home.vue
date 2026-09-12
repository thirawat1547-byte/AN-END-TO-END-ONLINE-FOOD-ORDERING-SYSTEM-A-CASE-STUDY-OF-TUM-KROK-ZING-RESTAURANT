<template>
  <div class="page-container">
    <div class="main-layout">
      <!-- ส่วนเนื้อหาหลักด้านซ้าย -->
      <div class="content-area">
        <!-- Header -->
        <header class="navbar">
          <div class="logo-section">
            <img src="./assets/logo.png" alt="Logo" class="logo-img">
          </div>
          <nav class="nav-menu">
            <router-link to="/" class="nav-item active">ค้นหา</router-link>
            <router-link to="/tracking" class="nav-item">คำสั่งซื้อ</router-link>
            <router-link to="/history" class="nav-item">ประวัติคำสั่งซื้อ</router-link>
            <router-link to="/promotions" class="nav-item">โปรโมชั่น</router-link>
            <router-link to="/help" class="nav-item">ช่วยเหลือ</router-link>
          </nav>
          
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="ค้นหาของอร่อยออร์แกนิก..." v-model="searchQuery">
          </div>

          <div class="location-wrapper">
            <div class="location-box" @click="showAddressDropdown = !showAddressDropdown">
              <span class="loc-icon">📍</span>
              <span class="loc-text">
                จัดส่งที่: <b>{{ displayAddress }}</b>
              </span>
              <span class="dropdown-arrow" :class="{ 'arrow-up': showAddressDropdown }">▼</span>
            </div>

            <div class="address-dropdown-menu" v-if="showAddressDropdown">
              <div class="addr-title">📍 ที่อยู่จัดส่งปัจจุบัน</div>
              <div class="addr-full-text">
                {{ isLoggedIn && userProfile.address ? userProfile.address : 'ตลาดปากเกร็ด (ค่าเริ่มต้น)' }}
              </div>
              <button class="addr-edit-btn" @click.stop="$router.push('/profile')">
                ✏️ แก้ไขที่อยู่
              </button>
            </div>
          </div>

          <div class="header-actions">
            <button class="icon-btn">🔔</button>
            <div class="auth-links" v-if="!isLoggedIn">
              <router-link to="/login" class="login-text">เข้าสู่ระบบ</router-link>
              <router-link to="/register" class="reg-text">สมัครสมาชิก</router-link>
            </div>
            <div class="auth-links" v-else>
              <button class="logout-btn" @click="logout">ออกจากระบบ</button>
              <div class="profile-avatar" @click="$router.push('/profile')">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Profile">
              </div>
            </div>
          </div>
        </header>

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

        <!-- Product Grid -->
        <div class="products-grid">
          <div class="food-card" v-for="item in filteredMenu" :key="item.id" @click="openModalOrAdd(item)">
            <div class="img-wrapper">
              <span class="badge-popular" v-if="item.isPopular">ยอดนิยม</span>
              <img :src="item.img" :alt="item.name">
            </div>
            <h3 class="food-title">{{ item.name }}</h3>
            <p class="food-desc">{{ item.desc }}</p>
            <div class="food-footer">
              <span class="price">B{{ item.price }}</span>
              <button class="plus-btn" @click.stop="openModalOrAdd(item)">+</button>
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
              <div class="cart-item-name">{{ item.name }}</div>
              
              <div class="cart-item-options">
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
          
          <button class="checkout-main-btn" @click="proceedToCheckout">
            ชำระเงินทันที ➔
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
            <h2>{{ selectedItem.name }}</h2>
            <div class="price-cal-box">
              <span class="modal-base-price">B{{ unitModalPrice }}</span>
              <span class="modal-cal-text" v-if="selectedItem.calories !== undefined">🔥 ~{{ unitModalCalories }} kcal</span>
            </div>
          </div>
          <p class="modal-desc">{{ selectedItem.desc }}</p>

          <div class="modal-scroll-area">
            
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

            <div class="option-group">
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
            <button class="confirm-add-btn" @click="confirmAddToCart">
              เพิ่มลงตะกร้า • B{{ calculatedModalPrice }}
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
export default {
  data() {
    return {
      isLoggedIn: false,
      showAuthModal: false,
      showAddressDropdown: false,
      searchQuery: '',
      cartItems: [],
      currentCategory: 'ขายดีที่สุด',
      tabs: ['ขายดีที่สุด', 'เมนูอาหาร', 'เมนูอาหารอีสาน', 'เครื่องดื่ม'],
      
      userProfile: { address: '' },

      showItemModal: false,
      selectedItem: null,
      spiceLevels: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'],
      
      availableAddons: [
        { name: 'ไข่ดาว', price: 10, calories: 160 },
        { name: 'ไข่เจียว', price: 10, calories: 220 }
      ],
      modalOptions: { spiceLevel: 'เผ็ดกลาง', seafoodChoice: 'รวม (หมึก+กุ้ง)', addons: [], note: '', qty: 1 },

      menuItems: [
        { id: 1, name: 'กระเพราหมู', price: 40, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'หอมฟุ้ง อร่อยเด็ดสะใจ!', img: new URL('./assets/kapaomu.jpg', import.meta.url).href, isPopular: true, isSpicy: true, calories: 550 },
        { id: 2, name: 'กระเพราทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'เผ็ดร้อน ถึงเครื่อง', img: new URL('./assets/kapaotaley.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 450 },
        { id: 3, name: 'ข้าวผัดหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ข้าวผัดหอมกรุ่น', img: new URL('./assets/khaopadmu.jpg', import.meta.url).href, isSpicy: false, calories: 550 },
        { id: 4, name: 'ข้าวผัดกุ้ง', price: 50, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'กุ้งตัวโตเต็มคำ', img: new URL('./assets/khaopadkung.jpg', import.meta.url).href, isSpicy: false, calories: 500 },
        { id: 5, name: 'ข้าวผัดทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'รวมมิตรทะเลผัด', img: new URL('./assets/khaopadtalay.jpg', import.meta.url).href, isSpicy: false, isSeafood: true, calories: 520 },
        { id: 6, name: 'ผัดพริกแกงหมู', price: 40, category: ['เมนูอาหาร'], desc: 'พริกแกงเข้มข้น', img: new URL('./assets/pikkangmu.jpg', import.meta.url).href, isSpicy: true, calories: 550 },
        { id: 7, name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'จัดจ้านถึงใจ', img: new URL('./assets/prikkangtalay.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 480 },
        { id: 8, name: 'ผัดคะน้าหมู', price: 40, category: ['เมนูอาหาร'], desc: 'ผักกรอบ หมูนุ่ม', img: new URL('./assets/kanamokrop.jpg', import.meta.url).href, isSpicy: false, calories: 450 },
        { id: 9, name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', price: 60, category: ['เมนูอาหาร'], desc: 'คะน้ากรอบกับซีฟู้ด', img: new URL('./assets/kanatalay.jpg', import.meta.url).href, isSpicy: false, isSeafood: true, calories: 400 },
        { id: 10, name: 'ข้าวหมูกระเทียม', price: 40, category: ['เมนูอาหาร'], desc: 'หอมกระเทียมพริกไทย', img: new URL('./assets/mookratiem.jpg', import.meta.url).href, isSpicy: false, calories: 500 },
        { id: 11, name: 'ข้าวไข่เจียวหมูสับ', price: 40, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูๆ หมูสับแน่นๆ', img: new URL('./assets/kaijeawmoosub.jpg', import.meta.url).href, isSpicy: false, calories: 600 },
        { id: 12, name: 'ข้าวไข่เจียวกุ้ง', price: 50, category: ['เมนูอาหาร'], desc: 'ไข่เจียวฟูกับกุ้ง', img: new URL('./assets/kaikung.jpg', import.meta.url).href, isSpicy: false, calories: 550 },
        { id: 13, name: 'ยำวุ้นเส้นทะเล', price: 70, category: ['เมนูอาหาร', 'ขายดีที่สุด'], desc: 'เปรี้ยวเผ็ดแซ่บ', img: new URL('./assets/yumtalay.jpg', import.meta.url).href, isSpicy: true, isSeafood: true, calories: 250 },
        
        { id: 14, name: 'ส้มตำปูปลาร้า', price: 40, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เส้นมะละกอดิบ มะเขือเทศ และพริก', img: new URL('./assets/tumprara.jpg', import.meta.url).href, isPopular: true, isSpicy: true, calories: 120 },
        { id: 15, name: 'ส้มตำไทย', price: 40, category: ['เมนูอาหารอีสาน'], desc: 'เปรี้ยวหวาน สามรส', img: new URL('./assets/tumtai.jpg', import.meta.url).href, isSpicy: true, calories: 150 },
        { id: 16, name: 'ลาบหมู', price: 60, category: ['เมนูอาหารอีสาน'], desc: 'หอมข้าวคั่ว แซ่บถึงใจ', img: new URL('./assets/larbmoo.jpg', import.meta.url).href, isSpicy: true, calories: 200 },
        { id: 17, name: 'ไก่ทอด (ปีก)', price: 20, category: ['เมนูอาหารอีสาน'], desc: 'กรอบนอกนุ่มใน', img: new URL('./assets/wingchick.jpg', import.meta.url).href, isSpicy: false, calories: 150 },
        { id: 18, name: 'ไก่ทอด (สะโพก)', price: 50, category: ['เมนูอาหารอีสาน', 'ขายดีที่สุด'], desc: 'เนื้อฉ่ำๆ ชิ้นใหญ่', img: new URL('./assets/chick.jpg', import.meta.url).href, isSpicy: false, calories: 250 },

        { id: 19, name: 'น้ำเก๊กฮวย', price: 20, category: ['เครื่องดื่ม', 'ขายดีที่สุด'], desc: 'หวานเย็น ชื่นใจ', img: new URL('./assets/gek.jpg', import.meta.url).href, calories: 120 },
        { id: 20, name: 'โค้ก (Coke)', price: 20, category: ['เครื่องดื่ม'], desc: 'น้ำอัดลมซ่าสดชื่น', img: new URL('./assets/coke.jpg', import.meta.url).href, calories: 140 },
        { id: 21, name: 'สไปรท์ (Sprite)', price: 20, category: ['เครื่องดื่ม'], desc: 'ซ่า สดชื่น กลิ่นเลมอน', img: new URL('./assets/sprite.jpg', import.meta.url).href, calories: 140 },
        { id: 22, name: 'น้ำเปล่า', price: 10, category: ['เครื่องดื่ม'], desc: 'น้ำดื่มบริสุทธิ์', img: new URL('./assets/water.jpg', import.meta.url).href, calories: 0 }
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
      return this.menuItems.filter(item => item.category.includes(this.currentCategory));
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
    }
  },
  mounted() {
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
  },
  methods: {
    openModalOrAdd(item) {
      if (!this.isLoggedIn) { this.showAuthModal = true; return; }
      
      // 🟢 เพิ่มเงื่อนไข: ถ้าเป็นเครื่องดื่ม หรือ ชื่อเมนูมีคำว่า "ไก่ทอด" ให้ลงตะกร้าทันที
      if (item.category.includes('เครื่องดื่ม') || item.name.includes('ไก่ทอด')) {
        this.addDirectToCart(item);
      } else {
        // เมนูอื่นๆ เปิด Pop-up เพื่อเลือกส่วนเสริมปกติ
        this.selectedItem = item;
        this.modalOptions = { 
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
      this.cartItems.push({
        name: this.selectedItem.name, 
        price: this.unitModalPrice,
        qty: this.modalOptions.qty,
        spiceLevel: this.modalOptions.spiceLevel, 
        seafoodChoice: this.modalOptions.seafoodChoice, 
        addons: [...this.modalOptions.addons], 
        note: this.modalOptions.note
      });
      this.closeItemModal();
    },
    addDirectToCart(item) {
      let found = this.cartItems.find(i => i.name === item.name && !i.spiceLevel && !i.seafoodChoice && i.addons?.length === 0);
      if (found) { found.qty++; } else { this.cartItems.push({ name: item.name, price: item.price, qty: 1, spiceLevel: null, seafoodChoice: null, addons: [] }); }
    },
    updateQty(index, change) {
      if (change === -1 && this.cartItems[index].qty <= 1) return;
      this.cartItems[index].qty += change;
    },
    removeItem(index) { this.cartItems.splice(index, 1); },
    goToLogin() { this.showAuthModal = false; this.$router.push('/login'); },
    goToRegister() { this.showAuthModal = false; this.$router.push('/register'); },
    logout() { localStorage.removeItem('isLoggedIn'); this.isLoggedIn = false; this.cartItems = []; },
    proceedToCheckout() {
      localStorage.setItem('cartData', JSON.stringify(this.cartItems));
      this.$router.push('/checkout');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.page-container { background-color: #f7f6f0; min-height: 100vh; width: 100%; padding: 20px 0; position: relative; }
.main-layout { display: flex; width: 100%; background: #f7f6f0; gap: 20px; padding: 0 30px; align-items: flex-start; }

.content-area { flex: 1; min-width: 0; }
.navbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; padding-top: 10px; gap: 15px; }
.logo-img { height: 40px; }
.nav-menu { display: flex; gap: 20px; white-space: nowrap; }
.nav-item { text-decoration: none; color: #444; font-size: 14px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { color: #557c61; }
.nav-item.active { color: #557c61; font-weight: 600; border-bottom: 2px solid #557c61; padding-bottom: 3px; }

.search-box { position: relative; width: 220px; z-index: 10; }
.search-box input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 20px; border: 1px solid #e0dfd5; background: #fff; font-size: 13px; color: #333; outline: none; position: relative; z-index: 11; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #888; z-index: 12; }

.location-wrapper { position: relative; display: inline-block; z-index: 20; }
.location-box { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #444; background: #f1ede1; padding: 6px 12px; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.2s; border: 1px solid transparent; }
.location-box:hover { background: #e8e4d5; border-color: #d6d2c4; }
.loc-icon { color: #557c61; }
.dropdown-arrow { font-size: 10px; color: #777; margin-left: 3px; transition: transform 0.3s ease; }
.dropdown-arrow.arrow-up { transform: rotate(180deg); color: #557c61; }

.address-dropdown-menu { position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: white; border: 1px solid #e5e2d5; border-radius: 16px; padding: 15px 20px; width: 260px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; cursor: default; }
.address-dropdown-menu::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: white; border-left: 1px solid #e5e2d5; border-top: 1px solid #e5e2d5; }
.addr-title { font-size: 13px; font-weight: 600; color: #557c61; margin-bottom: 6px; }
.addr-full-text { font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 12px; word-wrap: break-word; background: #faf9f5; padding: 10px; border-radius: 8px; }
.addr-edit-btn { width: 100%; background: white; border: 1px solid #557c61; color: #557c61; padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; font-family: inherit; }
.addr-edit-btn:hover { background: #f4faeb; }

.header-actions { display: flex; align-items: center; gap: 15px; white-space: nowrap; }
.icon-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
.auth-links { display: flex; gap: 12px; font-size: 13px; font-weight: 600; align-items: center; }
.login-text { color: #557c61; text-decoration: none; }
.reg-text { color: #333; text-decoration: none; }
.logout-btn { background: none; border: 1px solid #ff4d4f; color: #ff4d4f; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px; font-family: inherit; }
.profile-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; cursor: pointer; border: 1px solid transparent; margin-left: 10px; }
.profile-avatar:hover { border-color: #557c61; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.hero-banner { background: url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200') center/cover; border-radius: 24px; padding: 45px 50px; color: white; margin-bottom: 25px; position: relative; overflow: hidden; }
.hero-banner::before { content: ''; position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.35); }
.hero-text-box { position: relative; z-index: 1; }
.hero-title { font-size: 36px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
.hero-desc { font-size: 14px; opacity: 0.95; margin-bottom: 20px; line-height: 1.5; }
.hero-btn { background: #557c61; color: white; border: none; padding: 8px 22px; border-radius: 20px; font-weight: 600; font-size: 13px; cursor: pointer; }

.category-tabs { display: flex; gap: 12px; margin-bottom: 20px; }
.tab-btn { background: #e8e4d5; border: none; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 500; color: #444; cursor: pointer; transition: 0.2s; }
.tab-btn:hover { background: #d6d2c4; }
.tab-btn.active { background: #6b8e73; color: white; font-weight: 600; }

.section-heading { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; text-transform: capitalize; }

.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.food-card { background: white; border-radius: 16px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; position: relative; cursor: pointer; transition: 0.2s; }
.food-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
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
</style>