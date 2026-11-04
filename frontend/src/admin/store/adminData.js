import { reactive } from 'vue'

// ===== Backend API Configuration =====
import { API_BASE } from '../../config/api'
import { broadcastMenuUpdated, DEFAULT_ALLERGENS } from '../../utils/menuSync'
import imgChick from '../../assets/chick.jpg'
import imgCoke from '../../assets/coke.jpg'
import imgGek from '../../assets/gek.jpg'
import imgKaijeawmoosub from '../../assets/kaijeawmoosub.jpg'
import imgKaikung from '../../assets/kaikung.jpg'
import imgKanamokrop from '../../assets/kanamokrop.jpg'
import imgKanatalay from '../../assets/kanatalay.jpg'
import imgKapaomu from '../../assets/kapaomu.jpg'
import imgKapaotaley from '../../assets/kapaotaley.jpg'
import imgKhaopadkung from '../../assets/khaopadkung.jpg'
import imgKhaopadmu from '../../assets/khaopadmu.jpg'
import imgKhaopadtalay from '../../assets/khaopadtalay.jpg'
import imgLarbmoo from '../../assets/larbmoo.jpg'
import imgMookratiem from '../../assets/mookratiem.jpg'
import imgPikkangmu from '../../assets/pikkangmu.jpg'
import imgPrikkangtalay from '../../assets/prikkangtalay.jpg'
import imgSprite from '../../assets/sprite.jpg'
import imgTumprara from '../../assets/tumprara.jpg'
import imgTumtai from '../../assets/tumtai.jpg'
import imgWater from '../../assets/water.jpg'
import imgWingchick from '../../assets/wingchick.jpg'
import imgYumtalay from '../../assets/yumtalay.jpg'
import imgKao from '../../assets/kao.jpg'
import imgKaon from '../../assets/kaon.jpg'
import imgNamtokmoo from '../../assets/namtokmoo.jpg'

// แนบ JWT Token สำหรับ fetch() ที่เรียก API ซึ่งมี Guard (axios แนบให้อัตโนมัติใน main.js แต่ fetch ไม่ผ่าน interceptor)
function authHeaders(extra = {}) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra }
}

export const MENU_IMAGE_MAP = {
  'กะเพราหมู': imgKapaomu,
  'กระเพราหมู': imgKapaomu,
  'กะเพราทะเล/หมึก/กุ้ง': imgKapaotaley,
  'กระเพราทะเล/หมึก/กุ้ง': imgKapaotaley,
  'ข้าวผัดหมู': imgKhaopadmu,
  'ข้าวผัดกุ้ง': imgKhaopadkung,
  'ข้าวผัดทะเล/หมึก/กุ้ง': imgKhaopadtalay,
  'ผัดพริกแกงหมู': imgPikkangmu,
  'ผัดพริกแกงทะเล/หมึก/กุ้ง': imgPrikkangtalay,
  'ผัดคะน้าหมู': imgKanamokrop,
  'ผัดคะน้าหมูกรอบ': imgKanamokrop,
  'ผัดคะน้าทะเล/หมึก/กุ้ง': imgKanatalay,
  'ข้าวหมูกระเทียม': imgMookratiem,
  'ข้าวไข่เจียวหมูสับ': imgKaijeawmoosub,
  'ข้าวไข่เจียวกุ้ง': imgKaikung,
  'ยำวุ้นเส้นทะเล': imgYumtalay,
  'ส้มตำปูปลาร้า': imgTumprara,
  'ส้มตำไทย': imgTumtai,
  'ลาบหมู': imgLarbmoo,
  'น้ำตกหมู': imgNamtokmoo,
  'ไก่ทอด (ปีก)': imgWingchick,
  'ไก่ทอด (สะโพก)': imgChick,
  'น้ำเก๊กฮวย': imgGek,
  'โค้ก (Coke)': imgCoke,
  'โค้ก (กระป๋อง)': imgCoke,
  'สไปรท์ (Sprite)': imgSprite,
  'น้ำเปล่า': imgWater,
  'น้ำดื่ม': imgWater,
  'ข้าวเปล่า': imgKao,
  'ข้าวเหนียว': imgKaon
}

// DB ไม่มีช่องเก็บไอคอนหมวดหมู่ จึงเลือกไอคอนจากชื่อหมวด ถ้าไม่ตรงใช้ไอคอนทั่วไป
function categoryIcon(name = '') {
  if (/ตำ/.test(name)) return '🌶️'
  if (/ลาบ|ยำ|น้ำตก/.test(name)) return '🥗'
  if (/ทอด/.test(name)) return '🍗'
  if (/เครื่องดื่ม|น้ำ/.test(name)) return '🥤'
  if (/ข้าว|ผัด|จานเดียว/.test(name)) return '🍳'
  return '🍽️'
}

export const adminStore = reactive({
  // สถิติแชทบอทของวันที่เลือกในแดชบอร์ด (คำนวณจาก log จริงฝั่ง Backend)
  chatbotDayStats: {
    date: '',
    messageCount: '-',
    avgSpeedText: '-',
    speedLabel: '',
    speedClass: 'text-slate-400',
    diffText: '',
    diffClass: 'text-slate-400'
  },
  // สถานะการโหลดข้อมูลจาก API: 'idle' | 'loading' | 'ready' | 'error'
  loadStatus: 'idle',
  // ชื่อข้อมูลที่โหลดไม่สำเร็จในรอบล่าสุด (เช่น ['เมนู', 'ออเดอร์'])
  loadErrors: [],

  // ===== สถิติแดชบอร์ด (คำนวณจากออเดอร์จริงใน recomputeDashboardStats) =====
  dashboardStats: {
    grossSales: 0,
    totalOrders: 0,
    activeTablesCount: 0,
    totalTablesCount: 0
  },

  // ค่าเริ่มต้นเป็นค่าว่างทั้งหมด ข้อมูลจริงมาจาก API
  users: [],
  usersLoadStatus: 'idle',
  tables: [],
  categories: [],
  allergens: [...DEFAULT_ALLERGENS],
  ingredients: [],
  menus: [],
  menuIngredients: [],
  promotions: [],
  orders: [],

  storeSettings: {
    storeName: 'ร้านตำครกซิ่ง (Tum Krok Zing)',
    tagline: 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด',
    promptpayNumber: '',
    promptpayName: '',
    taxId: '',
    address: '',
    phone: '',
    openTime: '10:30',
    closeTime: '22:00',
    isOpen: true,
    vatRate: 7,
    baseDeliveryFee: 30,
    deliveryFeePerKm: 10,
    riderFee: 40,
    riderFreeKm: 3,
    riderFeePerKm: 7,
    storeLat: null,
    storeLng: null,
    autoDeductStock: true,
    soundAlertKDS: true
  },

  // ===== Centralized Admin Initialization =====
  async initAdminData() {
    // แสดง "กำลังโหลด" เฉพาะรอบแรก รอบ polling ถัดไปไม่ต้องกระพริบหน้าจอ
    if (this.loadStatus === 'idle') this.loadStatus = 'loading'

    const tasks = [
      ['ตั้งค่าร้าน', this.fetchSettingsFromAPI()],
      ['หมวดหมู่', this.fetchCategoriesFromAPI()],
      ['เมนู', this.fetchMenusFromAPI()],
      ['วัตถุดิบ', this.fetchInventoryFromAPI()],
      ['โต๊ะ', this.fetchTablesFromAPI()],
      ['ออเดอร์', this.fetchOrdersFromAPI()],
      ['โปรโมชัน', this.fetchPromotionsFromAPI()]
    ]
    const results = await Promise.allSettled(tasks.map(([, p]) => p))
    this.loadErrors = tasks
      .filter((_, i) => results[i].status === 'rejected' || results[i].value === false)
      .map(([name]) => name)
    this.loadStatus = this.loadErrors.length > 0 ? 'error' : 'ready'

    this.recomputeDashboardStats()
  },

  // ===== Categories API =====
  async fetchCategoriesFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/categories`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        this.categories = data.map(c => ({
          category_id: c.category_id,
          category_name: c.category_name,
          icon: categoryIcon(c.category_name)
        }))
      }
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API หมวดหมู่ได้:', err.message)
      return false
    }
  },

  // ===== Users API (ADMIN เท่านั้น) =====
  async fetchUsersFromAPI() {
    this.usersLoadStatus = 'loading'
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      this.users = Array.isArray(data) ? data : []
      this.usersLoadStatus = 'ready'
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API ผู้ใช้งานได้:', err.message)
      this.usersLoadStatus = 'error'
      return false
    }
  },

  recomputeDashboardStats() {
    // 1. Gross Sales (Today) and Order Counts
    const now = new Date()
    const todayOrders = this.orders.filter(o => {
      if (!o || !o.created_at) return false
      const d = new Date(o.created_at)
      return !isNaN(d.getTime()) &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    })
    this.dashboardStats.totalOrders = this.orders.length
    this.dashboardStats.grossSales = todayOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

    // 2. Table occupancy
    this.dashboardStats.totalTablesCount = this.tables.length
    this.dashboardStats.activeTablesCount = this.tables.filter(t => t.status === 'Occupied' || t.status === 'OCCUPIED' || t.status === 'Billing').length

    // 3. Compute menu total_sold dynamically from real orders
    const soldMap = {}
    for (const ord of this.orders) {
      for (const itm of (ord.items || [])) {
        if (itm.menu_id) {
          soldMap[itm.menu_id] = (soldMap[itm.menu_id] || 0) + Number(itm.quantity || 1)
        }
      }
    }
    for (const m of this.menus) {
      if (soldMap[m.menu_id] !== undefined) {
        m.total_sold = soldMap[m.menu_id]
      }
    }

    // 4. Update table active orders & bills dynamically
    for (const tbl of this.tables) {
      const activeOrd = this.orders.find(o => o.table_id === tbl.table_id && o.status !== 'Completed' && o.status !== 'PAID')
      if (activeOrd) {
        tbl.status = 'Occupied'
        tbl.activeOrderId = activeOrd.order_id
        tbl.currentBill = Number(activeOrd.total_price || 0)
      }
    }
  },

  async fetchAdminDashboardData() {
    await this.initAdminData()
  },

  // ===== Menus API =====
  async fetchMenusFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/menus`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        // กรองเมนูที่ซ้ำซ้อนโดยแปลงชื่อให้อยู่ในรูปแบบทางการ
        const seen = new Set()
        const uniqueData = []
        for (const m of data) {
          let canonical = (m.menu_name || '').trim()
          if (canonical === 'ไข่เจียวหมูสับ') canonical = 'ข้าวไข่เจียวหมูสับ'
          if (canonical === 'ไข่เจียวกุ้ง') canonical = 'ข้าวไข่เจียวกุ้ง'
          if (canonical === 'ปีกไก่ทอด') canonical = 'ไก่ทอด (ปีก)'

          if (!seen.has(canonical)) {
            seen.add(canonical)
            uniqueData.push({ ...m, menu_name: canonical })
          }
        }

        this.menus = uniqueData.map(m => ({
          menu_id: m.menu_id,
          category_id: m.category_id,
          menu_name: m.menu_name,
          description: m.description || '',
          price: Number(m.price),
          calories: m.calories || 0,
          is_available: m.is_available ?? true,
          image_url: MENU_IMAGE_MAP[m.menu_name] || m.image_url || 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=80',
          allergen_ids: Array.isArray(m.allergen_ids)
            ? m.allergen_ids
            : (m.allergens ? m.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean) : []),
          total_sold: m.total_sold || 0,
          ingredients: m.ingredients ? m.ingredients.map(mi => ({
            menu_id: mi.menu_id,
            ingredient_id: mi.ingredient_id,
            quantity_used: Number(mi.quantity_used),
            ingredient_name: mi.ingredient?.name || '',
            unit: mi.ingredient?.unit || '',
            in_stock: Number(mi.ingredient?.quantity || 0)
          })) : []
        }))

        // ซิงค์สูตรอาหารจากฐานข้อมูลทั้งหมดเข้า store.menuIngredients
        const allDbMenuIngredients = []
        for (const m of this.menus) {
          if (m.ingredients && m.ingredients.length > 0) {
            allDbMenuIngredients.push(...m.ingredients)
          }
        }
        this.menuIngredients = allDbMenuIngredients
      }
      console.log(`✅ โหลดเมนูจาก API สำเร็จ: ${this.menus.length} รายการ (พบสูตรอาหารในฐานข้อมูล ${this.menuIngredients.length} รายการ)`)
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API เมนูได้:', err.message)
      return false
    }
  },

  async updateMenuRecipeAPI(menuId, ingredients) {
    try {
      const res = await fetch(`${API_BASE}/menus/${menuId}/ingredients`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ingredients })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updatedMenu = await res.json()

      const target = this.menus.find(m => m.menu_id === menuId)
      if (target) {
        target.ingredients = updatedMenu.ingredients ? updatedMenu.ingredients.map(mi => ({
          menu_id: mi.menu_id,
          ingredient_id: mi.ingredient_id,
          quantity_used: Number(mi.quantity_used),
          ingredient_name: mi.ingredient?.name || '',
          unit: mi.ingredient?.unit || '',
          in_stock: Number(mi.ingredient?.quantity || 0)
        })) : []
      }

      this.menuIngredients = this.menuIngredients.filter(mi => mi.menu_id !== menuId)
      if (target && target.ingredients) {
        this.menuIngredients.push(...target.ingredients)
      }
      console.log(`✅ บันทึกสูตรอาหารของเมนู #${menuId} สำเร็จ`)
      return true
    } catch (err) {
      console.error('❌ บันทึกสูตรอาหารไม่สำเร็จ:', err.message)
      return false
    }
  },

  async toggleMenuAvailability(menuId) {
    const item = this.menus.find(m => m.menu_id === menuId)
    if (!item) return
    const newStatus = !item.is_available
    item.is_available = newStatus
    broadcastMenuUpdated({ ...item })
    try {
      const res = await fetch(`${API_BASE}/menus/${menuId}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ is_available: newStatus })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ เปลี่ยนสถานะเมนู #${menuId} เป็น ${newStatus ? 'พร้อมขาย' : 'ปิดการขาย'}`)
    } catch (err) {
      item.is_available = !newStatus
      broadcastMenuUpdated({ ...item })
      console.error('❌ เปลี่ยนสถานะเมนูไม่สำเร็จ:', err.message)
    }
  },

  async addMenuItem(newMenu) {
    const allergen_ids = newMenu.allergen_ids ? newMenu.allergen_ids.map(Number) : []
    try {
      const res = await fetch(`${API_BASE}/menus`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          category_id: Number(newMenu.category_id) || 1,
          menu_name: newMenu.menu_name,
          description: newMenu.description || '',
          price: Number(newMenu.price),
          image_url: newMenu.image_url || '',
          calories: Number(newMenu.calories) || 0,
          is_available: newMenu.is_available !== false,
          allergen_ids: allergen_ids
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      const itemToPush = {
        menu_id: created.menu_id,
        category_id: created.category_id,
        menu_name: created.menu_name,
        description: created.description || '',
        price: Number(created.price),
        calories: created.calories || 0,
        is_available: created.is_available,
        image_url: created.image_url || newMenu.image_url,
        allergen_ids: allergen_ids,
        total_sold: 0
      }
      this.menus.push(itemToPush)
      broadcastMenuUpdated(itemToPush)
      console.log(`✅ เพิ่มเมนูใหม่สำเร็จ: ${created.menu_name} (ID: ${created.menu_id})`)
    } catch (err) {
      console.warn('⚠️ เพิ่มเมนู API ไม่สำเร็จ:', err.message)
      const nextId = this.menus.length > 0 ? Math.max(...this.menus.map(m => m.menu_id)) + 1 : 1
      const itemToPush = {
        menu_id: nextId,
        category_id: Number(newMenu.category_id) || 1,
        menu_name: newMenu.menu_name,
        description: newMenu.description || '',
        price: Number(newMenu.price),
        calories: Number(newMenu.calories) || 0,
        is_available: newMenu.is_available !== false,
        image_url: newMenu.image_url || '',
        allergen_ids: allergen_ids,
        total_sold: 0
      }
      this.menus.push(itemToPush)
      broadcastMenuUpdated(itemToPush)
    }
  },

  async updateMenuItem(updatedMenu) {
    const index = this.menus.findIndex(m => m.menu_id === updatedMenu.menu_id)
    if (index === -1) return
    const allergen_ids = updatedMenu.allergen_ids ? updatedMenu.allergen_ids.map(Number) : []
    const merged = { ...this.menus[index], ...updatedMenu, allergen_ids }
    this.menus[index] = merged

    // ⚡ กระจายสัญญาณ Real-time ไปยังทุกหน้าจอทันที (Online & Dine-in)
    broadcastMenuUpdated(merged)

    try {
      const res = await fetch(`${API_BASE}/menus/${updatedMenu.menu_id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          category_id: Number(updatedMenu.category_id) || 1,
          menu_name: updatedMenu.menu_name,
          description: updatedMenu.description || '',
          price: Number(updatedMenu.price),
          image_url: updatedMenu.image_url || '',
          calories: Number(updatedMenu.calories) || 0,
          is_available: updatedMenu.is_available,
          allergen_ids: allergen_ids
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ แก้ไขเมนู #${updatedMenu.menu_id} สำเร็จพร้อมข้อมูลสารก่อภูมิแพ้`)
    } catch (err) {
      console.warn('⚠️ แก้ไขเมนู API ไม่สำเร็จ บันทึกลง Local Store เรียบร้อย:', err.message)
    }
  },

  async deleteMenuItem(menuId) {
    try {
      const res = await fetch(`${API_BASE}/menus/${menuId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      this.menus = this.menus.filter(m => m.menu_id !== menuId)
      console.log(`✅ ลบเมนู #${menuId} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ ลบเมนู API ไม่สำเร็จ:', err.message)
      this.menus = this.menus.filter(m => m.menu_id !== menuId)
    }
  },

  // ===== Inventory API =====
  async fetchInventoryFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/ingredients`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        this.ingredients = data.map(i => ({
          ingredient_id: i.ingredient_id || i.id,
          ingredient_name: i.name || i.ingredient_name,
          quantity_in_stock: Number(i.quantity ?? i.quantity_in_stock ?? 0),
          unit: i.unit || 'กก.',
          reorder_level: Number(i.min_quantity ?? i.reorder_level ?? 5),
          cost_per_unit: Number(i.cost_per_unit || 25),
          last_updated: i.updated_at ? String(i.updated_at).replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16)
        }))
      }
      console.log(`✅ โหลดคลังวัตถุดิบจาก API สำเร็จ: ${this.ingredients.length} รายการ`)
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API คลังวัตถุดิบได้:', err.message)
      return false
    }
  },

  async updateIngredientAPI(ingredientId, updateData = {}) {
    const item = this.ingredients.find(i => i.ingredient_id === ingredientId)
    if (!item) return false

    if (updateData.ingredient_name !== undefined) item.ingredient_name = updateData.ingredient_name
    if (updateData.unit !== undefined) item.unit = updateData.unit
    if (updateData.quantity_in_stock !== undefined) item.quantity_in_stock = Math.max(0, Number(updateData.quantity_in_stock))
    if (updateData.reorder_level !== undefined) item.reorder_level = Number(updateData.reorder_level)
    if (updateData.cost_per_unit !== undefined) item.cost_per_unit = Number(updateData.cost_per_unit)
    item.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16)

    try {
      const res = await fetch(`${API_BASE}/ingredients/${ingredientId}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: item.ingredient_name,
          unit: item.unit,
          quantity: item.quantity_in_stock,
          min_quantity: item.reorder_level
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ อัปเดตข้อมูลวัตถุดิบ #${ingredientId} สำเร็จ`)
      return true
    } catch (err) {
      console.warn('⚠️ อัปเดตข้อมูลวัตถุดิบ API ไม่สำเร็จ:', err.message)
      return false
    }
  },

  async updateStockAPI(ingredientId, newQty) {
    return this.updateIngredientAPI(ingredientId, { quantity_in_stock: newQty })
  },
  updateStock(ingredientId, newQty) {
    return this.updateStockAPI(ingredientId, newQty)
  },

  async translateIngredientsToThaiAPI() {
    try {
      const res = await fetch(`${API_BASE}/ingredients/translate-thai`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' })
      })
      if (res.ok) {
        await this.fetchInventoryFromAPI()
        return true
      }
    } catch (e) {
      console.warn('Translate ingredients error:', e)
    }
    return false
  },

  async addIngredientAPI(item) {
    try {
      const res = await fetch(`${API_BASE}/ingredients`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: item.ingredient_name || item.name,
          quantity: Number(item.quantity_in_stock || item.quantity || 0),
          unit: item.unit || 'กก.',
          min_quantity: Number(item.reorder_level || item.min_quantity || 5)
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      this.ingredients.push({
        ingredient_id: created.ingredient_id || created.id,
        ingredient_name: created.name,
        quantity_in_stock: Number(created.quantity),
        unit: created.unit,
        reorder_level: Number(created.min_quantity),
        cost_per_unit: Number(item.cost_per_unit || 25),
        last_updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
      })
      console.log(`✅ เพิ่มวัตถุดิบใหม่สำเร็จ: ${created.name}`)
    } catch (err) {
      console.warn('⚠️ เพิ่มวัตถุดิบ API ไม่สำเร็จ:', err.message)
      const id = this.ingredients.length > 0 ? Math.max(...this.ingredients.map(i => i.ingredient_id)) + 1 : 1
      this.ingredients.push({ ingredient_id: id, ...item })
    }
  },
  addIngredient(item) {
    return this.addIngredientAPI(item)
  },

  async deleteIngredientAPI(id) {
    try {
      const res = await fetch(`${API_BASE}/ingredients/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      this.ingredients = this.ingredients.filter(i => i.ingredient_id !== id)
      console.log(`✅ ลบวัตถุดิบ #${id} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ ลบวัตถุดิบ API ไม่สำเร็จ:', err.message)
      this.ingredients = this.ingredients.filter(i => i.ingredient_id !== id)
    }
  },
  deleteIngredient(id) {
    return this.deleteIngredientAPI(id)
  },

  // ===== Tables API =====
  async fetchTablesFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/tables`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        this.tables = data.map(t => {
          const isOcc = (t.status === 'OCCUPIED' || t.status === 'Occupied')
          const activeOrder = this.orders.find(o => o.table_id === t.table_id && o.status !== 'Completed' && o.status !== 'PAID')
          return {
            table_id: t.table_id || t.id,
            table_number: t.table_number || t.number,
            capacity: Number(t.capacity || 4),
            status: isOcc ? 'Occupied' : 'Empty',
            activeOrderId: activeOrder ? activeOrder.order_id : null,
            elapsedMinutes: isOcc ? 15 : 0,
            currentBill: activeOrder ? Number(activeOrder.total_price || 0) : 0
          }
        })
      }
      console.log(`✅ โหลดข้อมูลโต๊ะจาก API สำเร็จ: ${this.tables.length} โต๊ะ`)
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API โต๊ะอาหารได้:', err.message)
      return false
    }
  },

  async toggleTableStatusAPI(tableId, status) {
    const tbl = this.tables.find(t => t.table_id === tableId)
    if (!tbl) return

    tbl.status = status
    if (status === 'Empty' || status === 'AVAILABLE') {
      tbl.activeOrderId = null
      tbl.currentBill = 0
      tbl.elapsedMinutes = 0
    }

    const dbStatus = (status === 'Occupied' || status === 'OCCUPIED') ? 'OCCUPIED' : 'AVAILABLE'
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: dbStatus })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ อัปเดตสถานะโต๊ะ #${tableId} เป็น ${dbStatus} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ อัปเดตสถานะโต๊ะ API ไม่สำเร็จ:', err.message)
    }
  },
  toggleTableStatus(tableId, status) {
    return this.toggleTableStatusAPI(tableId, status)
  },

  // ===== Orders API =====
  async fetchOrdersFromAPI() {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        this.orders = data.map(o => {
          const rawItems = o.order_items || o.items || []
          const items = rawItems.map(oi => ({
            menu_id: oi.menu_id,
            menu_name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
            quantity: Number(oi.quantity || 1),
            price: Number(oi.unit_price || oi.menu?.price || 0),
            customization: oi.customization || (oi.notes ? { note: oi.notes } : null)
          }))

          const rawStatus = (o.status || '').toUpperCase()
          let normStatus = 'Pending'
          if (rawStatus === 'COOKING') normStatus = 'Cooking'
          else if (rawStatus === 'SERVED' || rawStatus === 'READY') normStatus = 'Served'
          else if (rawStatus === 'PAID' || rawStatus === 'COMPLETED') normStatus = 'Completed'
          else if (rawStatus === 'CANCELLED') normStatus = 'Cancelled'

          // ใช้รายการชำระเงินล่าสุดของออเดอร์ (หนึ่งออเดอร์อาจมีหลายรายการ เช่น แจ้งโอนแล้วถูกปฏิเสธ)
          const txnList = Array.isArray(o.transaction) ? [...o.transaction] : (o.transaction ? [o.transaction] : [])
          txnList.sort((a, b) => Number(b?.transaction_id || 0) - Number(a?.transaction_id || 0))
          const txn = txnList.find(t => String(t?.payment_status || '').toUpperCase() === 'COMPLETED') || txnList[0] || null
          const txnStatus = String(txn?.payment_status || '').toUpperCase()
          const isPaid = normStatus === 'Completed' || txnStatus === 'COMPLETED' || rawStatus === 'PAID'
          const isRejected = !isPaid && txnStatus === 'REJECTED'

          return {
            ...o,
            customer_name: o.user?.username || (o.table ? `โต๊ะ ${o.table.table_number}` : (o.table_id ? `โต๊ะ T-0${o.table_id}` : `ลูกค้า #${o.order_id}`)),
            items,
            status: normStatus,
            order_type: o.order_type === 'DINE_IN' || o.table_id ? 'In-store' : 'Delivery',
            raw_order_type: o.order_type || (o.table_id ? 'DINE_IN' : 'DELIVERY'),
            payment_method: txn?.payment_method || (o.table_id ? 'Stripe / QR' : 'PromptPay'),
            payment_status: isPaid ? 'Completed' : (isRejected ? 'Rejected' : 'Pending'),
            payment_slip_url: txn?.payment_slip_url || null,
            discount_applied: Number(o.discount_applied || 0)
          }
        })
      }
      console.log(`✅ โหลดรายการออเดอร์จาก API สำเร็จ: ${this.orders.length} ออเดอร์`)
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API ออเดอร์ได้:', err.message)
      return false
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.order_id === orderId)
    if (order) {
      order.status = newStatus
    }

    let dbStatus = 'PENDING'
    const s = String(newStatus).toUpperCase()
    if (s === 'COOKING') dbStatus = 'COOKING'
    else if (s === 'SERVED') dbStatus = 'SERVED'
    else if (s === 'READY') dbStatus = 'READY'
    else if (s === 'COMPLETED' || s === 'PAID') dbStatus = 'COMPLETED'
    else if (s === 'CANCELLED') dbStatus = 'CANCELLED'

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: dbStatus })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ อัปเดตสถานะออเดอร์ #${orderId} เป็น ${dbStatus} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ อัปเดตสถานะออเดอร์ API ไม่สำเร็จ:', err.message)
    }
  },

  // ===== Promotions API =====
  async fetchPromotionsFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/promotions`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        this.promotions = data.map(p => ({
          promo_id: p.promo_id || p.id,
          code: p.code,
          discount_type: (p.discount_type || 'FIXED').toUpperCase() === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
          discount_value: Number(p.discount_value || 0),
          min_order_price: Number(p.min_order_price || 0),
          expiry_date: p.expiry_date ? String(p.expiry_date).slice(0, 10) : '2026-12-31',
          is_active: p.is_active ?? true,
          used_count: p.used_count || 0
        }))
      }
      console.log(`✅ โหลดโปรโมชันจาก API สำเร็จ: ${this.promotions.length} รายการ`)
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API โปรโมชันได้:', err.message)
      return false
    }
  },

  async togglePromoStatusAPI(promoId) {
    const p = this.promotions.find(x => x.promo_id === promoId)
    if (!p) return
    const previous = p.is_active
    p.is_active = !previous
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/promotions/${promoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ is_active: p.is_active })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved = await res.json()
      // ใช้ค่าที่บันทึกจริงในฐานข้อมูล เพื่อไม่ให้สถานะเด้งกลับเมื่อโหลดใหม่
      p.is_active = saved?.is_active ?? p.is_active
      console.log(`✅ สลับสถานะโปรโมชัน #${promoId} สำเร็จ`)
    } catch (err) {
      p.is_active = previous
      console.warn('⚠️ สลับสถานะโปรโมชัน API ไม่สำเร็จ:', err.message)
    }
  },
  togglePromoStatus(promoId) {
    return this.togglePromoStatusAPI(promoId)
  },

  async addPromotionAPI(promo) {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const expDate = promo.expiry_date ? new Date(promo.expiry_date).toISOString() : new Date('2026-12-31T23:59:59Z').toISOString()
      const res = await fetch(`${API_BASE}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          code: String(promo.code || '').toUpperCase(),
          discount_type: (promo.discount_type || 'FIXED').toUpperCase(),
          discount_value: Number(promo.discount_value),
          min_order_price: Number(promo.min_order_price || 0),
          expiry_date: expDate,
          is_active: promo.is_active ?? true
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      this.promotions.push({
        promo_id: created.promo_id || created.id,
        code: created.code,
        discount_type: (created.discount_type || 'FIXED').toUpperCase() === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
        discount_value: Number(created.discount_value),
        min_order_price: Number(created.min_order_price),
        expiry_date: created.expiry_date ? String(created.expiry_date).slice(0, 10) : promo.expiry_date,
        is_active: created.is_active ?? true,
        used_count: 0
      })
      console.log(`✅ เพิ่มโปรโมชันใหม่ลง Database สำเร็จ: ${created.code}`)
    } catch (err) {
      console.warn('⚠️ เพิ่มโปรโมชัน API ไม่สำเร็จ:', err.message)
      const id = this.promotions.length > 0 ? Math.max(...this.promotions.map(p => p.promo_id)) + 1 : 1
      this.promotions.push({ promo_id: id, used_count: 0, ...promo })
    }
  },
  addPromotion(promo) {
    return this.addPromotionAPI(promo)
  },

  async deletePromotionAPI(promoId) {
    try {
      const res = await fetch(`${API_BASE}/promotions/${promoId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      this.promotions = this.promotions.filter(p => p.promo_id !== promoId)
      console.log(`✅ ลบโปรโมชัน #${promoId} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ ลบโปรโมชัน API ไม่สำเร็จ:', err.message)
      this.promotions = this.promotions.filter(p => p.promo_id !== promoId)
    }
  },
  deletePromotion(promoId) {
    return this.deletePromotionAPI(promoId)
  },

  // ===== CSV Export (ดึงตรงจาก Database View ผ่าน Backend API พร้อมชื่อไฟล์ .csv จาก Content-Disposition) =====
  async exportSalesCSV() {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/reports/export-csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `TumKrokZing_SalesReport_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 200)
    } catch (err) {
      console.error('❌ ดาวน์โหลด CSV ไม่สำเร็จ:', err)
      alert('ไม่สามารถดาวน์โหลดไฟล์รายงานยอดขาย CSV ได้ (อาจหมดอายุการใช้งานหรือไม่มีสิทธิ์)')
    }
  },

  // ===== Database Views Integration =====
  async fetchReceiptsFromView() {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/reports/receipts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        this.receipts = data
        console.log(`✅ โหลดข้อมูลใบเสร็จจาก TRANSACTION_RECEIPTS_VIEW สำเร็จ: ${data.length} รายการ`)
      }
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API TRANSACTION_RECEIPTS_VIEW ได้:', err.message)
    }
  },

  async fetchSalesSummaryFromView() {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/reports/sales-summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        this.orderSummaries = data
        console.log(`✅ โหลดข้อมูลยอดขายจาก ORDER_SUMMARIES_VIEW สำเร็จ: ${data.length} รายการ`)
      }
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API ORDER_SUMMARIES_VIEW ได้:', err.message)
    }
  },

  // ===== Store Settings API =====
  async fetchSettingsFromAPI() {
    try {
      const res = await fetch(`${API_BASE}/settings`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data) {
        this.storeSettings = {
          ...this.storeSettings,
          storeName: data.store_name || this.storeSettings.storeName,
          tagline: data.tagline || this.storeSettings.tagline,
          promptpayNumber: data.promptpay_number || this.storeSettings.promptpayNumber,
          promptpayName: data.promptpay_name || this.storeSettings.promptpayName,
          taxId: data.tax_id || this.storeSettings.taxId,
          address: data.address || this.storeSettings.address,
          phone: data.phone || this.storeSettings.phone,
          openTime: data.open_time || this.storeSettings.openTime,
          closeTime: data.close_time || this.storeSettings.closeTime,
          isOpen: data.is_open !== undefined ? Boolean(data.is_open) : this.storeSettings.isOpen,
          vatRate: data.vat_rate !== undefined ? Number(data.vat_rate) : this.storeSettings.vatRate,
          baseDeliveryFee: data.base_delivery_fee !== undefined ? Number(data.base_delivery_fee) : this.storeSettings.baseDeliveryFee,
          deliveryFeePerKm: data.delivery_fee_per_km !== undefined ? Number(data.delivery_fee_per_km) : this.storeSettings.deliveryFeePerKm,
          riderFee: data.base_rider_fee !== undefined ? Number(data.base_rider_fee) : this.storeSettings.riderFee,
          riderFreeKm: data.rider_free_km !== undefined ? Number(data.rider_free_km) : this.storeSettings.riderFreeKm,
          riderFeePerKm: data.rider_fee_per_km !== undefined ? Number(data.rider_fee_per_km) : this.storeSettings.riderFeePerKm,
          storeLat: data.store_lat ?? null,
          storeLng: data.store_lng ?? null
        }
        try {
          localStorage.setItem('tumkrok_store_settings', JSON.stringify(this.storeSettings))
        } catch (e) {}
      }
      return true
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API Settings ได้:', err.message)
      return false
    }
  },

  async toggleStoreStatus() {
    const nextStatus = !this.storeSettings.isOpen
    this.storeSettings.isOpen = nextStatus
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/settings/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      this.storeSettings.isOpen = Boolean(data.is_open)
      try {
        localStorage.setItem('tumkrok_store_settings', JSON.stringify(this.storeSettings))
      } catch (e) {}
      console.log(`✅ อัปเดตสถานะร้านค้าสำเร็จ: ${this.storeSettings.isOpen ? 'เปิดบริการ' : 'ปิดร้าน'}`)
      return this.storeSettings.isOpen
    } catch (err) {
      this.storeSettings.isOpen = !nextStatus // rollback on error
      console.error('❌ ไม่สามารถเปลี่ยนสถานะร้านค้าได้:', err.message)
      alert(`ไม่สามารถบันทึกสถานะร้านค้าไปยังเซิร์ฟเวอร์ได้: ${err.message}`)
      return this.storeSettings.isOpen
    }
  },

  async saveSettingsToAPI(customSettings = {}) {
    // ช่องพิกัดว่าง = ล้างค่า (null) ไม่ใช่ 0
    const toCoord = (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v))
    try {
      const payload = {
        store_name: customSettings.storeName || this.storeSettings.storeName,
        tagline: customSettings.tagline || this.storeSettings.tagline,
        promptpay_number: customSettings.promptpayNumber || this.storeSettings.promptpayNumber,
        promptpay_name: customSettings.promptpayName || this.storeSettings.promptpayName,
        tax_id: customSettings.taxId || this.storeSettings.taxId,
        address: customSettings.address || this.storeSettings.address,
        phone: customSettings.phone || this.storeSettings.phone,
        open_time: customSettings.openTime || this.storeSettings.openTime,
        close_time: customSettings.closeTime || this.storeSettings.closeTime,
        is_open: customSettings.isOpen !== undefined ? customSettings.isOpen : this.storeSettings.isOpen,
        vat_rate: Number(customSettings.vatRate !== undefined ? customSettings.vatRate : this.storeSettings.vatRate),
        base_delivery_fee: Number(customSettings.baseDeliveryFee !== undefined ? customSettings.baseDeliveryFee : this.storeSettings.baseDeliveryFee),
        delivery_fee_per_km: Number(customSettings.deliveryFeePerKm !== undefined ? customSettings.deliveryFeePerKm : this.storeSettings.deliveryFeePerKm),
        base_rider_fee: Number(customSettings.riderFee !== undefined ? customSettings.riderFee : this.storeSettings.riderFee),
        rider_free_km: Number(customSettings.riderFreeKm !== undefined ? customSettings.riderFreeKm : this.storeSettings.riderFreeKm),
        rider_fee_per_km: Number(customSettings.riderFeePerKm !== undefined ? customSettings.riderFeePerKm : this.storeSettings.riderFeePerKm),
        store_lat: toCoord(customSettings.storeLat !== undefined ? customSettings.storeLat : this.storeSettings.storeLat),
        store_lng: toCoord(customSettings.storeLng !== undefined ? customSettings.storeLng : this.storeSettings.storeLng)
      }

      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      
      this.storeSettings = {
        ...this.storeSettings,
        storeName: data.store_name,
        tagline: data.tagline,
        promptpayNumber: data.promptpay_number,
        promptpayName: data.promptpay_name,
        taxId: data.tax_id,
        address: data.address,
        phone: data.phone,
        openTime: data.open_time,
        closeTime: data.close_time,
        isOpen: Boolean(data.is_open),
        vatRate: Number(data.vat_rate),
        baseDeliveryFee: Number(data.base_delivery_fee),
        deliveryFeePerKm: Number(data.delivery_fee_per_km),
        riderFee: Number(data.base_rider_fee),
        riderFreeKm: Number(data.rider_free_km),
        riderFeePerKm: Number(data.rider_fee_per_km),
        storeLat: data.store_lat ?? null,
        storeLng: data.store_lng ?? null
      }
      try {
        localStorage.setItem('tumkrok_store_settings', JSON.stringify(this.storeSettings))
      } catch (e) {}
      return true
    } catch (err) {
      console.error('❌ ไม่สามารถบันทึกการตั้งค่าไปยังเซิร์ฟเวอร์ได้:', err.message)
      return false
    }
  },


  // ===== Chatbot Daily Stats =====
  async fetchChatbotStats(dateStr) {
    this.chatbotStatsRequestedDate = dateStr
    let stats = null
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await fetch(`${API_BASE}/chatbot/stats?date=${dateStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      stats = await res.json()
    } catch (err) {
      console.warn('⚠️ โหลดสถิติแชทบอทไม่สำเร็จ:', err.message)
    }
    // ผู้ใช้เปลี่ยนวันระหว่างรอ ให้ทิ้งผลลัพธ์ของวันเก่า
    if (this.chatbotStatsRequestedDate !== dateStr) return
    this.chatbotDayStats = stats || {
      date: dateStr,
      messageCount: '-',
      avgSpeedText: '-',
      speedLabel: 'โหลดข้อมูลไม่สำเร็จ',
      speedClass: 'text-slate-400',
      diffText: 'โหลดข้อมูลไม่สำเร็จ',
      diffClass: 'text-slate-400'
    }
  },

  // ===== PDF Export =====
  exportSalesPDF() {
    window.print()
  }
})
