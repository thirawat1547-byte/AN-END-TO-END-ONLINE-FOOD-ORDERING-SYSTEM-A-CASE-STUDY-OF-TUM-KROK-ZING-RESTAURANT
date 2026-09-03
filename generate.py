# -*- coding: utf-8 -*-
import os

def write_file(filename, content):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated: {filename}")

# 1. Store
write_file('src/admin/store/adminData.js', """import { reactive } from 'vue'

export const adminStore = reactive({
  users: [
    { user_id: 1, username: 'admin', email: 'admin@tumkrokzing.com', phone_number: '0812345678', role: 'Admin' },
    { user_id: 2, username: 'chef_somchai', email: 'kitchen@tumkrokzing.com', phone_number: '0891112233', role: 'Staff' },
    { user_id: 3, username: 'waiter_nan', email: 'nan@tumkrokzing.com', phone_number: '0864445566', role: 'Staff' },
    { user_id: 4, username: 'somporn_c', email: 'customer1@gmail.com', phone_number: '0957778899', role: 'Customer' }
  ],

  tables: [
    { table_id: 1, table_number: 'T-01', capacity: 4, status: 'Occupied', activeOrderId: 101, elapsedMinutes: 24, currentBill: 460 },
    { table_id: 2, table_number: 'T-02', capacity: 2, status: 'Empty', activeOrderId: null, elapsedMinutes: 0, currentBill: 0 },
    { table_id: 3, table_number: 'T-03', capacity: 6, status: 'Occupied', activeOrderId: 103, elapsedMinutes: 12, currentBill: 890 },
    { table_id: 4, table_number: 'T-04', capacity: 4, status: 'Billing', activeOrderId: 104, elapsedMinutes: 48, currentBill: 620 },
    { table_id: 5, table_number: 'T-05', capacity: 4, status: 'Occupied', activeOrderId: 105, elapsedMinutes: 8, currentBill: 340 },
    { table_id: 6, table_number: 'T-06', capacity: 8, status: 'Empty', activeOrderId: null, elapsedMinutes: 0, currentBill: 0 },
    { table_id: 7, table_number: 'T-07', capacity: 2, status: 'Empty', activeOrderId: null, elapsedMinutes: 0, currentBill: 0 },
    { table_id: 8, table_number: 'T-08', capacity: 4, status: 'Occupied', activeOrderId: 108, elapsedMinutes: 35, currentBill: 510 }
  ],

  categories: [
    { category_id: 1, category_name: 'ส้มตำแซ่บซิ่ง', icon: '🌶️' },
    { category_id: 2, category_name: 'ลาบ / ยำ / น้ำตก', icon: '🥗' },
    { category_id: 3, category_name: 'ต้ม / แกงอีสาน', icon: '🍲' },
    { category_id: 4, category_name: 'ทอด / ย่าง', icon: '🍗' },
    { category_id: 5, category_name: 'เครื่องดื่ม & ของหวาน', icon: '🥤' }
  ],

  allergens: [
    { allergen_id: 1, allergen_name: 'กุ้ง / อาหารทะเล', icon: '🦐' },
    { allergen_id: 2, allergen_name: 'ถั่วลิสง', icon: '🥜' },
    { allergen_id: 3, allergen_name: 'นม / ผลิตภัณฑ์นม', icon: '🥛' },
    { allergen_id: 4, allergen_name: 'กลูเตน / แป้งสาลี', icon: '🌾' },
    { allergen_id: 5, allergen_name: 'ไข่', icon: '🥚' }
  ],

  ingredients: [
    { ingredient_id: 1, ingredient_name: 'มะละกอดิบขูด', quantity_in_stock: 18.5, unit: 'กิโลกรัม', reorder_level: 5.0, cost_per_unit: 35, last_updated: '2026-09-03 14:30' },
    { ingredient_id: 2, ingredient_name: 'พริกสดจินดาแดง', quantity_in_stock: 4.2, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 120, last_updated: '2026-09-03 10:15' },
    { ingredient_id: 3, ingredient_name: 'น้ำปลาร้าปรุงสุกสูตรแซ่บ', quantity_in_stock: 12.0, unit: 'ขวด (1L)', reorder_level: 3.0, cost_per_unit: 45, last_updated: '2026-09-02 18:00' },
    { ingredient_id: 4, ingredient_name: 'ปูเค็ม/ปูดอง', quantity_in_stock: 1.8, unit: 'กิโลกรัม', reorder_level: 2.5, cost_per_unit: 180, last_updated: '2026-09-03 09:00' },
    { ingredient_id: 5, ingredient_name: 'มะนาวแป้นสด', quantity_in_stock: 8.0, unit: 'กิโลกรัม', reorder_level: 3.0, cost_per_unit: 60, last_updated: '2026-09-03 12:00' },
    { ingredient_id: 6, ingredient_name: 'เนื้อไก่สะโพก', quantity_in_stock: 15.0, unit: 'กิโลกรัม', reorder_level: 4.0, cost_per_unit: 95, last_updated: '2026-09-03 08:30' },
    { ingredient_id: 7, ingredient_name: 'คอหมูเกรด A', quantity_in_stock: 2.1, unit: 'กิโลกรัม', reorder_level: 3.0, cost_per_unit: 210, last_updated: '2026-09-03 11:20' },
    { ingredient_id: 8, ingredient_name: 'ข้าวเหนียวเขี้ยวงู', quantity_in_stock: 25.0, unit: 'กิโลกรัม', reorder_level: 5.0, cost_per_unit: 40, last_updated: '2026-09-01 16:00' },
    { ingredient_id: 9, ingredient_name: 'กุ้งสดแกะเปลือก', quantity_in_stock: 5.5, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 260, last_updated: '2026-09-03 07:45' },
    { ingredient_id: 10, ingredient_name: 'ถั่วลิสงคั่วบด', quantity_in_stock: 3.0, unit: 'กิโลกรัม', reorder_level: 1.0, cost_per_unit: 80, last_updated: '2026-09-02 15:00' }
  ],

  menus: [
    {
      menu_id: 1,
      category_id: 1,
      menu_name: 'ส้มตำปูปลาร้าครกซิ่ง',
      description: 'ส้มตำปลาร้าต้มสุกสูตรเฉพาะ หอม นัว ถึงเครื่อง ปรุงรสตามสั่ง',
      price: 65,
      calories: 145,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [1],
      total_sold: 142
    },
    {
      menu_id: 2,
      category_id: 1,
      menu_name: 'ส้มตำไทยไข่เค็ม',
      description: 'ตำไทยรสกลมกล่อม เปรี้ยวหวานกำลังดี โรยถั่วคั่วหอมและไข่เค็มแท้',
      price: 75,
      calories: 220,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [2, 5],
      total_sold: 98
    },
    {
      menu_id: 3,
      category_id: 4,
      menu_name: 'คอหมูย่างเตาถ่านน้ำจิ้มแจ่ว',
      description: 'คอหมูหมักสมุนไพรย่างไฟอ่อน นุ่ม ชุ่มฉ่ำ เสิร์ฟพร้อมน้ำจิ้มแจ่วมะขามเปียก',
      price: 120,
      calories: 380,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [],
      total_sold: 165
    },
    {
      menu_id: 4,
      category_id: 4,
      menu_name: 'ไก่ย่างสมุนไพรครึ่งตัว',
      description: 'ไก่หมักเครื่องเทศอีสาน หนังกรอบเนื้อนุ่มหอมกลิ่นตะไคร้ใบมะกรูด',
      price: 110,
      calories: 420,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [],
      total_sold: 84
    },
    {
      menu_id: 5,
      category_id: 2,
      menu_name: 'ยำกุ้งสดปลาร้านัว',
      description: 'กุ้งขาวสดเด้ง คลุกเคล้าน้ำยำปลาร้าสูตรเข้มข้น หอมแดง มะนาวสด',
      price: 140,
      calories: 190,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [1],
      total_sold: 110
    },
    {
      menu_id: 6,
      category_id: 3,
      menu_name: 'ต้มแซ่บกระดูกอ่อนหมู',
      description: 'ต้มแซ่บร้อนๆ สมุนไพรแน่น กระดูกอ่อนเคี้ยวกรุบ รสจัดจ้านซดคล่องคอ',
      price: 110,
      calories: 260,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [],
      total_sold: 76
    },
    {
      menu_id: 7,
      category_id: 2,
      menu_name: 'ลาบหมูสับต้นตำรับ',
      description: 'หมูสับนุ่มคั่วสุกใหม่ ปรุงรสด้วยข้าวคั่วหอม พริกป่น มะนาวแท้',
      price: 85,
      calories: 210,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [],
      total_sold: 92
    },
    {
      menu_id: 8,
      category_id: 5,
      menu_name: 'ชาไทยเย็นพรีเมียม',
      description: 'ชาไทยตรามือชงเข้มข้น หวานมันกลมกล่อม เสิร์ฟพร้อมน้ำแข็งหลอดสะอาด',
      price: 45,
      calories: 180,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      allergen_ids: [3],
      total_sold: 130
    }
  ],

  menuIngredients: [
    { menu_id: 1, ingredient_id: 1, quantity_used: 0.20 },
    { menu_id: 1, ingredient_id: 2, quantity_used: 0.03 },
    { menu_id: 1, ingredient_id: 3, quantity_used: 0.05 },
    { menu_id: 1, ingredient_id: 4, quantity_used: 0.04 },
    { menu_id: 1, ingredient_id: 5, quantity_used: 0.04 },
    { menu_id: 2, ingredient_id: 1, quantity_used: 0.20 },
    { menu_id: 2, ingredient_id: 2, quantity_used: 0.02 },
    { menu_id: 2, ingredient_id: 5, quantity_used: 0.05 },
    { menu_id: 2, ingredient_id: 10, quantity_used: 0.02 },
    { menu_id: 3, ingredient_id: 7, quantity_used: 0.25 },
    { menu_id: 4, ingredient_id: 6, quantity_used: 0.50 },
    { menu_id: 5, ingredient_id: 9, quantity_used: 0.18 }
  ],

  promotions: [
    {
      promo_id: 1,
      code: 'ZING50',
      discount_type: 'Fixed',
      discount_value: 50,
      min_order_price: 300,
      expiry_date: '2026-10-31',
      is_active: true,
      used_count: 38
    },
    {
      promo_id: 2,
      code: 'SEP10',
      discount_type: 'Percentage',
      discount_value: 10,
      min_order_price: 200,
      expiry_date: '2026-09-30',
      is_active: true,
      used_count: 64
    },
    {
      promo_id: 3,
      code: 'WELCOME100',
      discount_type: 'Fixed',
      discount_value: 100,
      min_order_price: 500,
      expiry_date: '2026-12-31',
      is_active: true,
      used_count: 15
    },
    {
      promo_id: 4,
      code: 'FREESHIP',
      discount_type: 'Fixed',
      discount_value: 30,
      min_order_price: 250,
      expiry_date: '2026-08-31',
      is_active: false,
      used_count: 89
    }
  ],

  orders: [
    {
      order_id: 101,
      user_id: 4,
      customer_name: 'คุณสมพร (โต๊ะ T-01)',
      table_id: 1,
      order_type: 'In-store',
      status: 'Cooking',
      total_price: 460,
      discount_applied: 50,
      promo_code: 'ZING50',
      created_at: '2026-09-03 18:35:10',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 1, menu_name: 'ส้มตำปูปลาร้าครกซิ่ง', quantity: 2, price: 65, subtotal: 130, customization: { spicy: 'เผ็ดมาก (พริก 10 เม็ด)', no_msg: false, note: 'ใส่ปลาร้าเยอะๆ เปรี้ยวเค็ม' } },
        { menu_id: 3, menu_name: 'คอหมูย่างเตาถ่านน้ำจิ้มแจ่ว', quantity: 2, price: 120, subtotal: 240, customization: { spicy: 'ปกติ', no_msg: false, note: 'ขอน้ำจิ้มแจ่วเพิ่ม 1 ถ้วย' } },
        { menu_id: 8, menu_name: 'ชาไทยเย็นพรีเมียม', quantity: 2, price: 45, subtotal: 90, customization: { spicy: '-', no_msg: false, note: 'หวานน้อย 50%' } }
      ]
    },
    {
      order_id: 103,
      user_id: null,
      customer_name: 'ลูกค้าหน้าร้าน (โต๊ะ T-03)',
      table_id: 3,
      order_type: 'In-store',
      status: 'Pending',
      total_price: 890,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 18:47:20',
      payment_method: 'Credit Card',
      payment_status: 'Completed',
      payment_slip_url: null,
      items: [
        { menu_id: 5, menu_name: 'ยำกุ้งสดปลาร้านัว', quantity: 2, price: 140, subtotal: 280, customization: { spicy: 'เผ็ดกลาง', no_msg: true, note: 'ไม่ใส่ชูรส' } },
        { menu_id: 4, menu_name: 'ไก่ย่างสมุนไพรครึ่งตัว', quantity: 2, price: 110, subtotal: 220, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 6, menu_name: 'ต้มแซ่บกระดูกอ่อนหมู', quantity: 2, price: 110, subtotal: 220, customization: { spicy: 'เผ็ดมาก', no_msg: false, note: 'ร้อนๆ' } },
        { menu_id: 1, menu_name: 'ส้มตำปูปลาร้าครกซิ่ง', quantity: 2, price: 65, subtotal: 130, customization: { spicy: 'เผ็ดน้อย', no_msg: false, note: '' } },
        { menu_id: 8, menu_name: 'ชาไทยเย็นพรีเมียม', quantity: 1, price: 45, subtotal: 45, customization: { spicy: '-', no_msg: false, note: '' } }
      ]
    },
    {
      order_id: 104,
      user_id: 4,
      customer_name: 'คุณวิชัย (โต๊ะ T-04)',
      table_id: 4,
      order_type: 'In-store',
      status: 'Served',
      total_price: 620,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 18:10:00',
      payment_method: 'Cash',
      payment_status: 'Pending',
      payment_slip_url: null,
      items: [
        { menu_id: 3, menu_name: 'คอหมูย่างเตาถ่านน้ำจิ้มแจ่ว', quantity: 2, price: 120, subtotal: 240, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 7, menu_name: 'ลาบหมูสับต้นตำรับ', quantity: 2, price: 85, subtotal: 170, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: '' } },
        { menu_id: 6, menu_name: 'ต้มแซ่บกระดูกอ่อนหมู', quantity: 1, price: 110, subtotal: 110, customization: { spicy: 'เผ็ดน้อย', no_msg: false, note: '' } },
        { menu_id: 8, menu_name: 'ชาไทยเย็นพรีเมียม', quantity: 2, price: 45, subtotal: 90, customization: { spicy: '-', no_msg: false, note: '' } }
      ]
    },
    {
      order_id: 99,
      user_id: 2,
      customer_name: 'คุณกิตติศักดิ์ (Takeaway)',
      table_id: null,
      order_type: 'Takeaway',
      status: 'Completed',
      total_price: 330,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 17:25:00',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 1, menu_name: 'ส้มตำปูปลาร้าครกซิ่ง', quantity: 2, price: 65, subtotal: 130, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: 'แยกเส้น' } },
        { menu_id: 4, menu_name: 'ไก่ย่างสมุนไพรครึ่งตัว', quantity: 1, price: 110, subtotal: 110, customization: { spicy: 'ปกติ', no_msg: false, note: 'สับชิ้นเล็ก' } },
        { menu_id: 8, menu_name: 'ชาไทยเย็นพรีเมียม', quantity: 2, price: 45, subtotal: 90, customization: { spicy: '-', no_msg: false, note: 'แยกน้ำแข็ง' } }
      ]
    },
    {
      order_id: 98,
      user_id: null,
      customer_name: 'โต๊ะ T-08 (เสร็จสิ้น)',
      table_id: 8,
      order_type: 'In-store',
      status: 'Completed',
      total_price: 510,
      discount_applied: 50,
      promo_code: 'SEP10',
      created_at: '2026-09-03 16:40:00',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 5, menu_name: 'ยำกุ้งสดปลาร้านัว', quantity: 2, price: 140, subtotal: 280, customization: { spicy: 'เผ็ดมาก', no_msg: false, note: '' } },
        { menu_id: 3, menu_name: 'คอหมูย่างเตาถ่านน้ำจิ้มแจ่ว', quantity: 1, price: 120, subtotal: 120, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 6, menu_name: 'ต้มแซ่บกระดูกอ่อนหมู', quantity: 1, price: 110, subtotal: 110, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: '' } }
      ]
    }
  ],

  storeSettings: {
    storeName: 'ร้านตำครกซิ่ง (Tum Krok Zing)',
    tagline: 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด',
    promptpayNumber: '081-234-5678',
    promptpayName: 'นายธีรวัฒน์ แสนคำเฮียง (ตำครกซิ่ง)',
    taxId: '0105566099881',
    address: '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
    phone: '02-987-6543, 081-234-5678',
    openTime: '10:30',
    closeTime: '22:00',
    isOpen: true,
    vatRate: 7,
    autoDeductStock: true,
    soundAlertKDS: true
  },

  toggleMenuAvailability(menuId) {
    const item = this.menus.find(m => m.menu_id === menuId)
    if (item) item.is_available = !item.is_available
  },

  addMenuItem(newMenu) {
    const id = this.menus.length > 0 ? Math.max(...this.menus.map(m => m.menu_id)) + 1 : 1
    this.menus.push({
      menu_id: id,
      total_sold: 0,
      is_available: true,
      ...newMenu
    })
  },

  updateMenuItem(updatedMenu) {
    const index = this.menus.findIndex(m => m.menu_id === updatedMenu.menu_id)
    if (index !== -1) {
      this.menus[index] = { ...this.menus[index], ...updatedMenu }
    }
  },

  deleteMenuItem(menuId) {
    this.menus = this.menus.filter(m => m.menu_id !== menuId)
  },

  updateStock(ingredientId, newQty) {
    const item = this.ingredients.find(i => i.ingredient_id === ingredientId)
    if (item) {
      item.quantity_in_stock = Math.max(0, Number(newQty))
      item.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16)
    }
  },

  addIngredient(item) {
    const id = this.ingredients.length > 0 ? Math.max(...this.ingredients.map(i => i.ingredient_id)) + 1 : 1
    this.ingredients.push({
      ingredient_id: id,
      last_updated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...item
    })
  },

  deleteIngredient(id) {
    this.ingredients = this.ingredients.filter(i => i.ingredient_id !== id)
  },

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.order_id === orderId)
    if (order) {
      order.status = newStatus
      if (newStatus === 'Completed' && order.table_id) {
        const tbl = this.tables.find(t => t.table_id === order.table_id)
        if (tbl) {
          tbl.status = 'Empty'
          tbl.activeOrderId = null
          tbl.currentBill = 0
          tbl.elapsedMinutes = 0
        }
      }
    }
  },

  toggleTableStatus(tableId, status) {
    const tbl = this.tables.find(t => t.table_id === tableId)
    if (tbl) {
      tbl.status = status
      if (status === 'Empty') {
        tbl.activeOrderId = null
        tbl.currentBill = 0
        tbl.elapsedMinutes = 0
      }
    }
  },

  togglePromoStatus(promoId) {
    const p = this.promotions.find(x => x.promo_id === promoId)
    if (p) p.is_active = !p.is_active
  },

  addPromotion(promo) {
    const id = this.promotions.length > 0 ? Math.max(...this.promotions.map(p => p.promo_id)) + 1 : 1
    this.promotions.push({
      promo_id: id,
      used_count: 0,
      ...promo
    })
  },

  deletePromotion(promoId) {
    this.promotions = this.promotions.filter(p => p.promo_id !== promoId)
  },

  exportSalesCSV() {
    const headers = ['Order ID', 'Date Time', 'Type', 'Table', 'Customer', 'Items Count', 'Payment Method', 'Discount (THB)', 'Total Amount (THB)', 'Payment Status', 'Order Status']
    const rows = this.orders.map(o => [
      '#ORD-' + o.order_id,
      '"' + o.created_at + '"',
      '"' + o.order_type + '"',
      '"' + (o.table_id ? 'T-0' + o.table_id : '-') + '"',
      '"' + o.customer_name + '"',
      o.items.reduce((s, i) => s + i.quantity, 0),
      '"' + o.payment_method + '"',
      o.discount_applied,
      o.total_price,
      '"' + o.payment_status + '"',
      '"' + o.status + '"'
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'TumKrokZing_SalesReport_' + new Date().toISOString().slice(0, 10) + '.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
})
""")

# 2. Admin Layout
write_file('src/admin/AdminLayout.vue', """<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminStore } from './store/adminData'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(true)
const isMobileOpen = ref(false)

const navLinks = [
  { name: 'ภาพรวมยอดขาย', path: '/admin/dashboard', icon: '📊', badge: null },
  { name: 'จัดการเมนูอาหาร', path: '/admin/menus', icon: '🌶️', badge: () => adminStore.menus.length },
  { name: 'คลังวัตถุดิบ & สูตร', path: '/admin/inventory', icon: '📦', badge: () => adminStore.ingredients.filter(i => i.quantity_in_stock <= i.reorder_level).length || null, badgeColor: 'bg-red-500' },
  { name: 'ผังโต๊ะอาหาร', path: '/admin/tables', icon: '🪑', badge: () => adminStore.tables.filter(t => t.status === 'Occupied').length + ' โต๊ะ' },
  { name: 'จอห้องครัว KDS', path: '/admin/kds', icon: '🍳', badge: () => adminStore.orders.filter(o => ['Pending', 'Cooking'].includes(o.status)).length || null, badgeColor: 'bg-amber-500' },
  { name: 'โปรโมชัน & ส่วนลด', path: '/admin/promotions', icon: '🏷️', badge: () => adminStore.promotions.filter(p => p.is_active).length },
  { name: 'ประวัติบิล & การเงิน', path: '/admin/transactions', icon: '💰', badge: null },
  { name: 'ตั้งค่าร้านค้า', path: '/admin/settings', icon: '⚙️', badge: null }
]

const currentTitle = computed(() => {
  const current = navLinks.find(link => route.path === link.path || (link.path !== '/admin' && route.path.startsWith(link.path)))
  return current ? current.name : 'ระบบจัดการร้าน'
})

const lowStockCount = computed(() => {
  return adminStore.ingredients.filter(i => i.quantity_in_stock <= i.reorder_level).length
})

const activeCookingOrders = computed(() => {
  return adminStore.orders.filter(o => ['Pending', 'Cooking'].includes(o.status)).length
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
    <!-- Sidebar for Desktop -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Brand Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            🌶️
          </div>
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h1 class="font-bold text-base tracking-tight leading-tight text-white flex items-center gap-1">
              ตำครกซิ่ง <span class="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">PRO</span>
            </h1>
            <p class="text-xs text-slate-400">Admin & Kitchen System</p>
          </div>
        </div>
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="ย่อ/ขยาย เมนู"
        >
          <span v-if="isSidebarOpen">◀</span>
          <span v-else>▶</span>
        </button>
      </div>

      <!-- Live Store Status Banner -->
      <div v-show="isSidebarOpen" class="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-medium text-slate-200">สถานะร้าน: <b class="text-emerald-400">{{ adminStore.storeSettings.isOpen ? 'เปิดบริการ' : 'ปิดร้าน' }}</b></span>
        </div>
        <button 
          @click="adminStore.storeSettings.isOpen = !adminStore.storeSettings.isOpen"
          class="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
        >
          สลับ
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
        <router-link
          v-for="item in navLinks"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group',
            route.path === item.path 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/30' 
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          ]"
        >
          <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
          <span v-show="isSidebarOpen" class="flex-1 truncate">{{ item.name }}</span>
          <span 
            v-if="item.badge && item.badge() && isSidebarOpen" 
            :class="[
              'text-[10px] px-2 py-0.5 rounded-full font-bold text-white',
              item.badgeColor || 'bg-slate-700'
            ]"
          >
            {{ item.badge() }}
          </span>
        </router-link>
      </nav>

      <!-- Quick Back to Customer Web -->
      <div class="p-3 border-t border-slate-800">
        <router-link 
          to="/" 
          class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
        >
          <span class="text-base">📱</span>
          <span v-show="isSidebarOpen">ไปหน้าสั่งอาหารลูกค้า</span>
        </router-link>
      </div>

      <!-- User Footer -->
      <div class="p-3 border-t border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
          AD
        </div>
        <div v-show="isSidebarOpen" class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white truncate">ผู้จัดการร้าน</p>
          <p class="text-[10px] text-slate-400 truncate">admin@tumkrokzing.com</p>
        </div>
      </div>
    </aside>

    <!-- Main Container -->
    <div 
      :class="[
        'flex-1 flex flex-col transition-all duration-300 min-w-0',
        isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
      ]"
    >
      <!-- Top Navbar -->
      <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileOpen = !isMobileOpen" 
            class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ☰
          </button>
          <div>
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              {{ currentTitle }}
            </h2>
            <p class="text-xs text-slate-500 hidden sm:block">ระบบสั่งอาหารออนไลน์แบบครบวงจร กรณีศึกษาร้านตำครกซิ่ง</p>
          </div>
        </div>

        <!-- Top Right Quick Info -->
        <div class="flex items-center gap-3">
          <!-- Kitchen Alert -->
          <router-link 
            to="/admin/kds"
            class="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100 transition"
          >
            <span>🍳 ครัวกำลังทำ: <b>{{ activeCookingOrders }}</b> ออเดอร์</span>
            <span v-if="activeCookingOrders > 0" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </router-link>

          <!-- Stock Alert Badge -->
          <router-link 
            v-if="lowStockCount > 0"
            to="/admin/inventory"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition"
          >
            <span>⚠️ วัตถุดิบใกล้หมด ({{ lowStockCount }})</span>
          </router-link>

          <!-- CSV Export Button -->
          <button 
            @click="adminStore.exportSalesCSV()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            title="ดาวน์โหลดรายงานยอดขาย"
          >
            <span>📥 Export CSV</span>
          </button>
        </div>
      </header>

      <!-- Mobile Sidebar Overlay -->
      <div 
        v-if="isMobileOpen" 
        @click="isMobileOpen = false" 
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
      >
        <div 
          @click.stop 
          class="w-64 h-full bg-slate-900 text-white p-4 flex flex-col"
        >
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 class="font-bold text-base text-amber-400">ตำครกซิ่ง Admin</h3>
            <button @click="isMobileOpen = false" class="text-slate-400 hover:text-white text-xl">✕</button>
          </div>
          <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
            <router-link
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileOpen = false"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition',
                route.path === item.path ? 'bg-amber-500 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              ]"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Main Router View -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
""")

print("AdminLayout generated.")