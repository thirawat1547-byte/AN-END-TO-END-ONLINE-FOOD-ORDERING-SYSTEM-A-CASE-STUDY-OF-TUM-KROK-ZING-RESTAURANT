import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Home.vue'
import Login from '../Login.vue'
import Register from '../Register.vue'
import Checkout from '../Checkout.vue'
import Tracking from '../Tracking.vue'
import Promotions from '../Promotions.vue'
import Help from '../Help.vue'
import Profile from '../Profile.vue'
import OrderHistory from '../OrderHistory.vue'

// Table Ordering Views
import MenuPage from '../table-ordering/views/MenuPage.vue'
import ItemDetailPage from '../table-ordering/views/ItemDetailPage.vue'
import CartPage from '../table-ordering/views/CartPage.vue'
import OrderSuccessPage from '../table-ordering/views/OrderSuccessPage.vue'

// Kitchen Staff Views
import KitchenLayout from '../Kitchen/KitchenLayout.vue'
import KitchenMonitor from '../Kitchen/views/KitchenMonitor.vue'
import Inventory from '../Kitchen/views/Inventory.vue'
import SalesReport from '../Kitchen/views/SalesReport.vue'
import TableManagement from '../Kitchen/views/TableManagement.vue'
import TableDetail from '../Kitchen/views/TableDetail.vue'

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

  // Table Ordering Routes
  { path: '/table/:tableId/menu', component: MenuPage },
  { path: '/table/:tableId/item/:itemId', component: ItemDetailPage },
  { path: '/table/:tableId/cart', component: CartPage },
  { path: '/table/:tableId/success', component: OrderSuccessPage },

  // Kitchen Staff Routes (nested with sidebar layout)
  {
    path: '/kitchen',
    component: KitchenLayout,
    children: [
      { path: '', component: KitchenMonitor },
      { path: 'inventory', component: Inventory },
      { path: 'reports', component: SalesReport },
      { path: 'tables', component: TableManagement },
      { path: 'tables/:id', component: TableDetail },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
