<template>
  <header class="customer-navbar">
    <!-- กลุ่มซ้าย: โลโก้ + เมนูนำทาง (พิกัดคงที่แน่นอนทุกหน้า) -->
    <div class="nav-left-group">
      <router-link to="/" class="logo-link">
        <img :src="logoImg" alt="ร้านตำครกซิ่ง" class="logo-img" />
      </router-link>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: isHomeActive }">ค้นหา</router-link>
        <router-link to="/tracking" class="nav-item" :class="{ active: isTrackingActive }">คำสั่งซื้อ</router-link>
        <router-link to="/history" class="nav-item" :class="{ active: isHistoryActive }">ประวัติคำสั่งซื้อ</router-link>
        <router-link to="/promotions" class="nav-item" :class="{ active: isPromotionsActive }">โปรโมชั่น</router-link>
        <router-link to="/help" class="nav-item" :class="{ active: isHelpActive }">ช่วยเหลือ</router-link>
      </nav>
    </div>

    <!-- ส่วนกลาง: ช่องค้นหา + ที่อยู่จัดส่ง (แสดงในหน้าแรก หรือเมื่อส่ง prop showSearch=true) -->
    <div class="nav-center-group" v-if="showSearch">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="ค้นหาของอร่อยออร์แกนิก..."
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>

      <div class="location-wrapper" ref="locationWrapper">
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
            {{ (authStore.isLoggedIn && authStore.userProfile?.address) ? authStore.userProfile.address : 'ตลาดปากเกร็ด (ค่าเริ่มต้น)' }}
          </div>
          <button class="addr-edit-btn" @click.stop="goToProfileEdit">
            ✏️ แก้ไขที่อยู่
          </button>
        </div>
      </div>
    </div>
    <div class="nav-spacer" v-else></div>

    <!-- กลุ่มขวา: แจ้งเตือน + ตะกร้า + สถานะการล็อกอิน -->
    <div class="nav-right-group">
      <!-- แสดงสถานะร้านค้า เปิด / ปิด -->
      <div 
        :class="['store-status-pill', isStoreOpen ? 'open' : 'closed']" 
        :title="isStoreOpen ? 'ร้านเปิดให้บริการตามปกติ' : 'ขณะนี้ร้านปิดให้บริการชั่วคราว'"
      >
        <span class="status-dot"></span>
        <span class="status-label">{{ isStoreOpen ? 'ร้านเปิด' : 'ร้านปิด' }}</span>
      </div>

      <button class="icon-btn" title="การแจ้งเตือน" type="button">🔔</button>
      <button class="icon-btn cart-btn" title="ตะกร้าสินค้า" type="button" @click="onCartClick">🛒</button>

      <!-- เมื่อล็อกอินแล้ว -->
      <template v-if="authStore.isLoggedIn">
        <!-- ปุ่มทางลัดสำหรับ Admin -->
        <router-link 
          v-if="authStore.isAdmin" 
          to="/admin/dashboard" 
          class="role-shortcut-btn admin-btn" 
          title="ไปที่ระบบจัดการร้านค้า (Admin Panel)"
        >
          🛠️ จัดการร้าน
        </router-link>

        <!-- ปุ่มทางลัดสำหรับ Kitchen หรือ Admin -->
        <router-link 
          v-if="authStore.isAdmin || authStore.isKitchen" 
          to="/kitchen/monitor" 
          class="role-shortcut-btn kitchen-btn" 
          title="ไปที่หน้าจอห้องครัว (Kitchen KDS)"
        >
          🍳 ครัว KDS
        </router-link>

        <!-- ปุ่มทางลัดสำหรับ Rider หรือ Admin -->
        <router-link 
          v-if="authStore.isAdmin || authStore.isRider" 
          to="/rider" 
          class="role-shortcut-btn rider-btn" 
          title="ไปที่หน้าจอพนักงานจัดส่ง (Rider)"
        >
          🛵 ไรเดอร์
        </router-link>

        <button class="logout-btn" type="button" @click="handleLogout">ออกจากระบบ</button>
        <div class="profile-avatar" @click="$router.push('/profile')" title="โปรไฟล์ของฉัน">
          <img :src="authStore.userProfile?.avatar || defaultAvatar" alt="Profile" />
        </div>
      </template>

      <!-- เมื่อยังไม่ได้ล็อกอิน -->
      <template v-else>
        <div class="auth-links">
          <router-link to="/login" class="login-text">เข้าสู่ระบบ</router-link>
          <router-link to="/register" class="reg-text">สมัครสมาชิก</router-link>
        </div>
      </template>
    </div>
  </header>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logoImg from '../assets/logo.png';
import { authStore } from '../store/authStore';
import { API_BASE } from '../config/api';

export default {
  name: 'CustomerNavbar',
  props: {
    showSearch: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'cart-click'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();

    const showAddressDropdown = ref(false);
    const locationWrapper = ref(null);
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
    const isStoreOpen = ref(true);

    const isHomeActive = computed(() => route.path === '/');
    const isTrackingActive = computed(() => route.path === '/tracking');
    const isHistoryActive = computed(() => route.path === '/history');
    const isPromotionsActive = computed(() => route.path === '/promotions');
    const isHelpActive = computed(() => route.path === '/help');

    const displayAddress = computed(() => {
      if (authStore.isLoggedIn && authStore.userProfile?.address) {
        const full = authStore.userProfile.address.trim();
        return full.length > 15 ? full.substring(0, 15) + '...' : full;
      }
      return 'ตลาดปากเกร็ด';
    });

    const handleClickOutside = (e) => {
      if (locationWrapper.value && !locationWrapper.value.contains(e.target)) {
        showAddressDropdown.value = false;
      }
    };

    onMounted(async () => {
      authStore.syncAuth();
      document.addEventListener('click', handleClickOutside);
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.is_open !== undefined) {
            isStoreOpen.value = Boolean(data.is_open);
          }
        }
      } catch (err) {
        console.warn('ไม่สามารถโหลดสถานะร้านค้าใน Navbar ได้:', err);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    const handleLogout = () => {
      authStore.logout();
      router.push('/login');
    };

    const goToProfileEdit = () => {
      showAddressDropdown.value = false;
      router.push('/profile');
    };

    const onCartClick = () => {
      emit('cart-click');
      if (route.path !== '/') {
        router.push('/');
      }
    };

    return {
      logoImg,
      authStore,
      defaultAvatar,
      showAddressDropdown,
      locationWrapper,
      displayAddress,
      isHomeActive,
      isTrackingActive,
      isHistoryActive,
      isPromotionsActive,
      isHelpActive,
      handleLogout,
      goToProfileEdit,
      onCartClick,
      isStoreOpen
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');

.customer-navbar {
  width: 100%;
  height: 68px;
  min-height: 68px;
  background-color: #f7f6f0;
  border-bottom: 1px solid #e5e2d5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-sizing: border-box;
  font-family: 'Prompt', sans-serif;
  position: relative;
  z-index: 1000;
}

/* กลุ่มซ้าย: โลโก้ + เมนู */
.store-status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}
.store-status-pill.open {
  background-color: #e6f4ea;
  color: #137333;
  border: 1px solid #ceead6;
}
.store-status-pill.closed {
  background-color: #fce8e6;
  color: #c5221f;
  border: 1px solid #fad2cf;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.store-status-pill.open .status-dot {
  background-color: #34a853;
  box-shadow: 0 0 0 2px rgba(52, 168, 83, 0.2);
}
.store-status-pill.closed .status-dot {
  background-color: #ea4335;
}

.nav-left-group {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 40px;
  width: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.03);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
  white-space: nowrap;
}

.nav-item {
  text-decoration: none;
  color: #444;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.nav-item:hover {
  color: #557c61;
}

.nav-item.active {
  color: #557c61;
  font-weight: 600;
  border-bottom: 2px solid #557c61;
}

/* ส่วนกลาง */
.nav-center-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  margin: 0 24px;
  min-width: 0;
}

.nav-spacer {
  flex: 1;
}

.search-box {
  position: relative;
  width: 230px;
}

.search-box input {
  width: 100%;
  padding: 8px 14px 8px 34px;
  border-radius: 20px;
  border: 1px solid #e0dfd5;
  background: #ffffff;
  font-size: 13px;
  color: #333;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #557c61;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #888;
  pointer-events: none;
}

.location-wrapper {
  position: relative;
  display: inline-block;
}

.location-box {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #444;
  background: #f1ede1;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
  border: 1px solid transparent;
}

.location-box:hover {
  background: #e8e4d5;
  border-color: #d6d2c4;
}

.loc-icon {
  color: #557c61;
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 10px;
  color: #777;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
  color: #557c61;
}

.address-dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background: white;
  border: 1px solid #e5e2d5;
  border-radius: 16px;
  padding: 16px;
  width: 270px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 1050;
  cursor: default;
}

.address-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 20px;
  transform: rotate(45deg);
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid #e5e2d5;
  border-top: 1px solid #e5e2d5;
}

.addr-title {
  font-size: 13px;
  font-weight: 600;
  color: #557c61;
  margin-bottom: 6px;
}

.addr-full-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 12px;
  word-wrap: break-word;
  background: #faf9f5;
  padding: 10px;
  border-radius: 8px;
}

.addr-edit-btn {
  width: 100%;
  background: white;
  border: 1px solid #557c61;
  color: #557c61;
  padding: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
}

.addr-edit-btn:hover {
  background: #f4faeb;
}

/* กลุ่มขวา */
.nav-right-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  margin-left: auto;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #ede9dc;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.login-text {
  color: #557c61;
  text-decoration: none;
  transition: opacity 0.2s;
}

.login-text:hover {
  opacity: 0.8;
}

.reg-text {
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.reg-text:hover {
  color: #557c61;
}

.logout-btn {
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 4px 12px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #fff1f0;
  border-color: #ff7875;
}

.profile-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ddd;
}

.profile-avatar:hover {
  border-color: #557c61;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.role-shortcut-btn {
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.role-shortcut-btn.admin-btn {
  background: #2d5a43;
  color: white;
  box-shadow: 0 2px 6px rgba(45, 90, 67, 0.25);
}

.role-shortcut-btn.admin-btn:hover {
  background: #224432;
  transform: translateY(-1px);
}

.role-shortcut-btn.kitchen-btn {
  background: #eef2ed;
  color: #2d5a43;
  border: 1px solid #557c61;
}

.role-shortcut-btn.kitchen-btn:hover {
  background: #dfe8de;
  transform: translateY(-1px);
}

.role-shortcut-btn.rider-btn {
  background: #00b14f;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 177, 79, 0.25);
}

.role-shortcut-btn.rider-btn:hover {
  background: #008b3e;
  transform: translateY(-1px);
}
</style>
