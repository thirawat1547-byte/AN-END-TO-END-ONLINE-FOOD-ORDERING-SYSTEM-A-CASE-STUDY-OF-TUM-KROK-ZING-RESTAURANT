import { reactive } from 'vue'

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

    const csvContent = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
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
