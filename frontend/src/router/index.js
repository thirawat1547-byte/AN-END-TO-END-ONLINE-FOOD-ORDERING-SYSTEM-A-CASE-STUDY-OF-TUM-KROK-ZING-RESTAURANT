import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Home.vue'
import Login from '../Login.vue'
import Register from '../Register.vue'
import AdminLayout from '../admin/AdminLayout.vue'
import KitchenLayout from '../Kitchen/KitchenLayout.vue'
import Checkout from '../Checkout.vue'
import Tracking from '../Tracking.vue'
import Promotions from '../Promotions.vue'
import Help from '../Help.vue'
import Profile from '../Profile.vue'
import OrderHistory from '../OrderHistory.vue'

import MenuPage from '../table-ordering/views/MenuPage.vue'
import ItemDetailPage from '../table-ordering/views/ItemDetailPage.vue'
import CartPage from '../table-ordering/views/CartPage.vue'
import OrderSuccessPage from '../table-ordering/views/OrderSuccessPage.vue'
import BillPage from '../table-ordering/views/BillPage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/checkout', component: Checkout },
  { path: '/tracking', component: Tracking },
  { path: '/promotions', component: Promotions },
  { path: '/help', component: Help },
  { path: '/profile', component: Profile },
  { path: '/history', component: OrderHistory },
  { path: '/table/:tableId', component: MenuPage },
  { path: '/table/:tableId/item/:itemId', component: ItemDetailPage },
  { path: '/table/:tableId/cart', component: CartPage },
  { path: '/table/:tableId/success', component: OrderSuccessPage },
  { path: '/table/:tableId/bill', component: BillPage },
  // Admin section
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('../admin/views/AdminDashboard.vue') },
      { path: 'menus', component: () => import('../admin/views/MenuManagement.vue') },
      { path: 'inventory', component: () => import('../admin/views/InventoryManagement.vue') },
      { path: 'tables', component: () => import('../admin/views/TableController.vue') },
      { path: 'kds', component: () => import('../admin/views/KitchenKDS.vue') },
      { path: 'promotions', component: () => import('../admin/views/PromotionManagement.vue') },
      { path: 'transactions', component: () => import('../admin/views/TransactionAudit.vue') },
      { path: 'settings', component: () => import('../admin/views/AdminSettings.vue') }
    ]
  },
  // Kitchen section
  {
    path: '/kitchen',
    component: KitchenLayout,
    children: [
      { path: '', redirect: '/kitchen/monitor' },
      { path: 'inventory', component: () => import('../Kitchen/views/Inventory.vue') },
      { path: 'monitor', component: () => import('../Kitchen/views/KitchenMonitor.vue') },
      { path: 'sales', component: () => import('../Kitchen/views/SalesReport.vue') },
      { path: 'table/:tableId', component: () => import('../Kitchen/views/TableDetail.vue') },
      { path: 'tables/:tableId', component: () => import('../Kitchen/views/TableDetail.vue') },
      { path: 'tables', component: () => import('../Kitchen/views/TableManagement.vue') },
      { path: 'manage', component: () => import('../Kitchen/views/TableManagement.vue') }
    ]
  },
  // Rider section (ระบบพนักงานจัดส่งอาหาร)
  {
    path: '/rider',
    component: () => import('../rider/views/RiderView.vue'),
    meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'RIDER', 'KITCHEN'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

import { authStore } from '../store/authStore';

// ระบบตรวจสอบสิทธิ์การเข้าถึงหน้าตามบทบาท (Role-Based Access Control)
router.beforeEach((to, from, next) => {
  authStore.syncAuth();
  const token = localStorage.getItem('access_token');
  const role = authStore.role; // 'ADMIN', 'KITCHEN', 'CUSTOMER', 'GUEST'

  // 1. หน้าผู้ดูแลระบบ (/admin/*)
  // สิทธิ์: เฉพาะ ADMIN เท่านั้น (Kitchen ห้ามเข้า!)
  if (to.path.startsWith('/admin')) {
    if (!authStore.isLoggedIn || !token) {
      alert('🔒 กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลร้าน (Admin) ก่อนเข้าใช้งาน');
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
    if (role !== 'ADMIN') {
      alert('⚠️ คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลร้าน (สำหรับ Admin เท่านั้น)');
      if (role === 'KITCHEN') {
        return next('/kitchen/monitor');
      }
      return next('/');
    }
  }

  // 2. หน้าห้องครัว KDS & จัดการโต๊ะ (/kitchen/*)
  // สิทธิ์: ADMIN และ KITCHEN เท่านั้น (Customer/Guest ห้ามเข้า)
  if (to.path.startsWith('/kitchen')) {
    if (!authStore.isLoggedIn || !token) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนเข้าใช้งานส่วนของห้องครัว');
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
    if (role !== 'ADMIN' && role !== 'KITCHEN') {
      alert('⚠️ ส่วนนี้เปิดให้เฉพาะพนักงานห้องครัวและผู้ดูแลร้านเท่านั้น');
      return next('/');
    }
  }

  // 3. หน้าสั่งซื้ออาหาร / ชำระเงิน / ข้อมูลส่วนตัว
  // สิทธิ์: ต้องล็อกอิน (Customer, Admin, Kitchen, Rider) ส่วน Guest สั่งไม่ได้
  if (to.path === '/checkout' || to.path === '/profile') {
    if (!authStore.isLoggedIn || !token) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้ออาหารครับ');
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
  }

  // 4. หน้าจอพนักงานจัดส่งอาหาร (/rider)
  // สิทธิ์: ADMIN, RIDER, KITCHEN (Customer/Guest ห้ามเข้า)
  if (to.path === '/rider' || to.path.startsWith('/rider')) {
    if (!authStore.isLoggedIn || !token) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนเข้าใช้งานส่วนของพนักงานจัดส่ง (ไรเดอร์)');
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
    if (role !== 'ADMIN' && role !== 'RIDER' && role !== 'KITCHEN') {
      alert('⚠️ ส่วนนี้เปิดให้เฉพาะพนักงานจัดส่ง (Rider) และผู้ดูแลร้านเท่านั้น');
      return next('/');
    }
  }

  next();
});

// ดักจับข้อผิดพลาดเมื่อเบราว์เซอร์เรียกไฟล์ Chunk เก่าหลังการ Deploy ให้โหลดใหม่โดยอัตโนมัติ
router.onError((error, to) => {
  const isChunkError = 
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('error loading dynamically imported module');

  if (isChunkError && to) {
    console.warn('Vite chunk mismatch detected, reloading page to:', to.fullPath);
    window.location.href = to.fullPath;
  }
});

export default router;