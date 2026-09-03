import { createRouter, createWebHistory } from 'vue-router'

// Customer Views
import Home from '../Home.vue'
import Login from '../Login.vue'
import Register from '../Register.vue'
import Checkout from '../Checkout.vue'
import Tracking from '../Tracking.vue'
import Promotions from '../Promotions.vue'
import Help from '../Help.vue'
import Profile from '../Profile.vue'
import OrderHistory from '../OrderHistory.vue'

// Admin Views
import AdminLayout from '../admin/AdminLayout.vue'
import AdminDashboard from '../admin/views/AdminDashboard.vue'
import MenuManagement from '../admin/views/MenuManagement.vue'
import InventoryManagement from '../admin/views/InventoryManagement.vue'
import PromotionManagement from '../admin/views/PromotionManagement.vue'
import TransactionAudit from '../admin/views/TransactionAudit.vue'
import TableController from '../admin/views/TableController.vue'
import KitchenKDS from '../admin/views/KitchenKDS.vue'
import AdminSettings from '../admin/views/AdminSettings.vue'

const routes = [
  // Customer Routes
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/checkout', component: Checkout },
  { path: '/tracking', component: Tracking },
  { path: '/promotions', component: Promotions },
  { path: '/help', component: Help },
  { path: '/profile', component: Profile },
  { path: '/history', component: OrderHistory },

  // Admin Routes with AdminLayout
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'menus', component: MenuManagement },
      { path: 'inventory', component: InventoryManagement },
      { path: 'promotions', component: PromotionManagement },
      { path: 'transactions', component: TransactionAudit },
      { path: 'tables', component: TableController },
      { path: 'kds', component: KitchenKDS },
      { path: 'settings', component: AdminSettings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
