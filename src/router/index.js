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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router