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
  { path: '/table/:tableId/bill', component: BillPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router