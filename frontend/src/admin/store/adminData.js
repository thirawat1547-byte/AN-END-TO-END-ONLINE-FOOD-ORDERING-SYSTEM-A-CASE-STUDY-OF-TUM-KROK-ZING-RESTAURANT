import { reactive } from 'vue'

// ===== Backend API Configuration =====
import { API_BASE } from '../../config/api'
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

export const adminStore = reactive({
  // ===== สถิติแดชบอร์ดที่ดึงจาก Backend จริง =====
  dashboardStats: {
    grossSales: 1320,
    totalOrders: 5,
    activeTablesCount: 3,
    totalTablesCount: 5,
    avgCookingTime: 8.4
  },

  users: [
    { user_id: 1, username: 'admin', email: 'admin@tumkrokzing.com', phone_number: '0812345678', role: 'Admin' },
    { user_id: 2, username: 'chef_somchai', email: 'kitchen@tumkrokzing.com', phone_number: '0891112233', role: 'Staff' },
    { user_id: 3, username: 'waiter_nan', email: 'nan@tumkrokzing.com', phone_number: '0864445566', role: 'Staff' },
    { user_id: 4, username: 'somporn_c', email: 'customer1@gmail.com', phone_number: '0957778899', role: 'Customer' }
  ],

  tables: [
    { table_id: 1, table_number: 'T-01', capacity: 4, status: 'Occupied', activeOrderId: 101, elapsedMinutes: 24, currentBill: 460 },
    { table_id: 2, table_number: 'T-02', capacity: 4, status: 'Empty', activeOrderId: null, elapsedMinutes: 0, currentBill: 0 },
    { table_id: 3, table_number: 'T-03', capacity: 4, status: 'Occupied', activeOrderId: 103, elapsedMinutes: 12, currentBill: 890 },
    { table_id: 4, table_number: 'T-04', capacity: 4, status: 'Billing', activeOrderId: 104, elapsedMinutes: 48, currentBill: 620 },
    { table_id: 5, table_number: 'T-05', capacity: 4, status: 'Empty', activeOrderId: null, elapsedMinutes: 0, currentBill: 0 }
  ],

  categories: [
    { category_id: 1, category_name: 'อาหารจานเดียว / ผัด', icon: '🍳' },
    { category_id: 2, category_name: 'ส้มตำแซ่บซิ่ง', icon: '🌶️' },
    { category_id: 3, category_name: 'ลาบ / ยำ', icon: '🥗' },
    { category_id: 4, category_name: 'ของทอด', icon: '🍗' },
    { category_id: 5, category_name: 'เครื่องดื่ม', icon: '🥤' }
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
    { ingredient_id: 6, ingredient_name: 'เนื้อหมูสด / หมูสับ', quantity_in_stock: 14.5, unit: 'กิโลกรัม', reorder_level: 4.0, cost_per_unit: 150, last_updated: '2026-09-03 11:20' },
    { ingredient_id: 7, ingredient_name: 'หมูกรอบสูตรเด็ด', quantity_in_stock: 4.0, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 220, last_updated: '2026-09-03 08:30' },
    { ingredient_id: 8, ingredient_name: 'เนื้อไก่สะโพก', quantity_in_stock: 12.0, unit: 'กิโลกรัม', reorder_level: 4.0, cost_per_unit: 95, last_updated: '2026-09-03 08:30' },
    { ingredient_id: 9, ingredient_name: 'ปีกไก่สด', quantity_in_stock: 8.5, unit: 'กิโลกรัม', reorder_level: 3.0, cost_per_unit: 90, last_updated: '2026-09-03 08:30' },
    { ingredient_id: 10, ingredient_name: 'กุ้งสดแกะเปลือก', quantity_in_stock: 6.5, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 260, last_updated: '2026-09-03 07:45' },
    { ingredient_id: 11, ingredient_name: 'ปลาหมึกสดหั่นชิ้น', quantity_in_stock: 5.0, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 240, last_updated: '2026-09-03 07:45' },
    { ingredient_id: 12, ingredient_name: 'ไข่ไก่สด (เบอร์ 2)', quantity_in_stock: 90, unit: 'ฟอง', reorder_level: 30, cost_per_unit: 4.5, last_updated: '2026-09-03 09:15' },
    { ingredient_id: 13, ingredient_name: 'ข้าวหอมมะลิแท้', quantity_in_stock: 30.0, unit: 'กิโลกรัม', reorder_level: 10.0, cost_per_unit: 45, last_updated: '2026-09-01 16:00' },
    { ingredient_id: 14, ingredient_name: 'ผักคะน้าสด', quantity_in_stock: 6.0, unit: 'กิโลกรัม', reorder_level: 2.0, cost_per_unit: 50, last_updated: '2026-09-03 07:30' },
    { ingredient_id: 15, ingredient_name: 'ใบกะเพราสด', quantity_in_stock: 2.5, unit: 'กิโลกรัม', reorder_level: 1.0, cost_per_unit: 60, last_updated: '2026-09-03 07:30' },
    { ingredient_id: 16, ingredient_name: 'พริกแกงเผ็ดสูตรใต้', quantity_in_stock: 3.5, unit: 'กิโลกรัม', reorder_level: 1.0, cost_per_unit: 110, last_updated: '2026-09-02 14:00' },
    { ingredient_id: 17, ingredient_name: 'วุ้นเส้นเหนียวนุ่ม', quantity_in_stock: 25, unit: 'ห่อ', reorder_level: 8, cost_per_unit: 15, last_updated: '2026-09-02 11:00' },
    { ingredient_id: 18, ingredient_name: 'ถั่วลิสงคั่วบด', quantity_in_stock: 3.0, unit: 'กิโลกรัม', reorder_level: 1.0, cost_per_unit: 80, last_updated: '2026-09-02 15:00' },
    { ingredient_id: 19, ingredient_name: 'ดอกเก๊กฮวยอบแห้ง', quantity_in_stock: 10, unit: 'ห่อ', reorder_level: 3, cost_per_unit: 40, last_updated: '2026-09-01 10:00' },
    { ingredient_id: 20, ingredient_name: 'โค้ก (Coke)', quantity_in_stock: 48, unit: 'ขวด', reorder_level: 12, cost_per_unit: 12, last_updated: '2026-09-02 10:00' },
    { ingredient_id: 21, ingredient_name: 'สไปรท์ (Sprite)', quantity_in_stock: 36, unit: 'ขวด', reorder_level: 12, cost_per_unit: 12, last_updated: '2026-09-02 10:00' },
    { ingredient_id: 22, ingredient_name: 'น้ำดื่มสะอาด', quantity_in_stock: 60, unit: 'ขวด', reorder_level: 20, cost_per_unit: 5, last_updated: '2026-09-02 10:00' },
    { ingredient_id: 23, ingredient_name: 'ข้าวเหนียว', quantity_in_stock: 30.0, unit: 'กิโลกรัม', reorder_level: 8.0, cost_per_unit: 40, last_updated: '2026-09-02 10:00' }
  ],

  menus: [
    {
      menu_id: 2,
      category_id: 1,
      menu_name: 'กระเพราหมู',
      description: 'กะเพราหมูสับผัดพริกแห้ง หอมฟุ้ง อร่อยเด็ดสะใจ',
      price: 40,
      calories: 320,
      is_available: true,
      image_url: imgKapaomu,
      allergen_ids: [],
      total_sold: 145
    },
    {
      menu_id: 3,
      category_id: 1,
      menu_name: 'กระเพราทะเล/หมึก/กุ้ง',
      description: 'กะเพราซีฟู้ดสดใหม่ กุ้งปลาหมึกเด้ง เผ็ดร้อน ถึงเครื่อง',
      price: 60,
      calories: 280,
      is_available: true,
      image_url: imgKapaotaley,
      allergen_ids: [1],
      total_sold: 112
    },
    {
      menu_id: 4,
      category_id: 1,
      menu_name: 'ข้าวผัดหมู',
      description: 'ข้าวผัดหอมกรุ่นกระทะ เมล็ดข้าวร่วนสวย ใส่หมูนุ่ม',
      price: 40,
      calories: 350,
      is_available: true,
      image_url: imgKhaopadmu,
      allergen_ids: [5],
      total_sold: 98
    },
    {
      menu_id: 5,
      category_id: 1,
      menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง',
      description: 'รวมมิตรทะเลผัดข้าวหอมมะลิ รสชาติกลมกล่อม',
      price: 60,
      calories: 340,
      is_available: true,
      image_url: imgKhaopadtalay,
      allergen_ids: [1, 5],
      total_sold: 85
    },
    {
      menu_id: 6,
      category_id: 1,
      menu_name: 'ผัดพริกแกงหมู',
      description: 'พริกแกงเข้มข้นถึงเครื่องแกงใต้ ผัดถั่วฝักยาวและหมูนุ่ม',
      price: 40,
      calories: 310,
      is_available: true,
      image_url: imgPikkangmu,
      allergen_ids: [],
      total_sold: 76
    },
    {
      menu_id: 7,
      category_id: 1,
      menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง',
      description: 'ผัดพริกแกงรวมมิตรทะเล รสชาติจัดจ้านถึงใจ',
      price: 60,
      calories: 290,
      is_available: true,
      image_url: imgPrikkangtalay,
      allergen_ids: [1],
      total_sold: 68
    },
    {
      menu_id: 8,
      category_id: 1,
      menu_name: 'ผัดคะน้าหมูกรอบ',
      description: 'คะน้าสดกรอบผัดหมูกรอบชิ้นโต รสชาติกลมกล่อมหอมน้ำมันหอย',
      price: 40,
      calories: 380,
      is_available: true,
      image_url: imgKanamokrop,
      allergen_ids: [],
      total_sold: 120
    },
    {
      menu_id: 9,
      category_id: 1,
      menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง',
      description: 'คะน้าสดกรอบผัดซีฟู้ดเนื้อแน่น ปรุงร้อนๆ จานต่อจาน',
      price: 60,
      calories: 270,
      is_available: true,
      image_url: imgKanatalay,
      allergen_ids: [1],
      total_sold: 55
    },
    {
      menu_id: 10,
      category_id: 1,
      menu_name: 'ข้าวหมูกระเทียม',
      description: 'หมูหมักนุ่มผัดกระเทียมพริกไทยดำหอมเตะจมูก',
      price: 40,
      calories: 360,
      is_available: true,
      image_url: imgMookratiem,
      allergen_ids: [],
      total_sold: 110
    },
    {
      menu_id: 11,
      category_id: 1,
      menu_name: 'ข้าวไข่เจียวหมูสับ',
      description: 'ไข่เจียวฟูกรอบนอกนุ่มใน หมูสับแน่นๆ ทอดร้อนๆ',
      price: 40,
      calories: 390,
      is_available: true,
      image_url: imgKaijeawmoosub,
      allergen_ids: [5],
      total_sold: 140
    },
    {
      menu_id: 12,
      category_id: 1,
      menu_name: 'ข้าวไข่เจียวกุ้ง',
      description: 'ไข่เจียวฟูใส่กุ้งสดเด้ง ทานคู่น้ำปลาพริกมะนาว',
      price: 50,
      calories: 380,
      is_available: true,
      image_url: imgKaikung,
      allergen_ids: [1, 5],
      total_sold: 95
    },
    {
      menu_id: 13,
      category_id: 2,
      menu_name: 'ส้มตำปูปลาร้า',
      description: 'ส้มตำปลาร้าต้มสุกสูตรเฉพาะ หอม นัว ถึงเครื่อง ปรุงรสตามสั่ง',
      price: 40,
      calories: 145,
      is_available: true,
      image_url: imgTumprara,
      allergen_ids: [1],
      total_sold: 195
    },
    {
      menu_id: 14,
      category_id: 2,
      menu_name: 'ส้มตำไทย',
      description: 'ตำไทยรสกลมกล่อม เปรี้ยวหวานกำลังดี โรยถั่วคั่วหอมสดใหม่',
      price: 40,
      calories: 180,
      is_available: true,
      image_url: imgTumtai,
      allergen_ids: [2],
      total_sold: 130
    },
    {
      menu_id: 15,
      category_id: 3,
      menu_name: 'ลาบหมู',
      description: 'หมูสับนุ่มคั่วสุกใหม่ ปรุงรสด้วยข้าวคั่วหอม พริกป่น มะนาวแท้',
      price: 60,
      calories: 210,
      is_available: true,
      image_url: imgLarbmoo,
      allergen_ids: [],
      total_sold: 125
    },
    {
      menu_id: 16,
      category_id: 3,
      menu_name: 'ยำวุ้นเส้นทะเล',
      description: 'วุ้นเส้นเหนียวนุ่มคลุกเคล้าน้ำยำรสแซ่บ กุ้ง ปลาหมึก หมูสับ',
      price: 70,
      calories: 230,
      is_available: true,
      image_url: imgYumtalay,
      allergen_ids: [1],
      total_sold: 140
    },
    {
      menu_id: 17,
      category_id: 4,
      menu_name: 'ไก่ทอด (ปีก)',
      description: 'ปีกไก่หมักเครื่องเทศสูตรเด็ด ทอดกรอบนอกนุ่มใน ไม่อมน้ำมัน',
      price: 20,
      calories: 180,
      is_available: true,
      image_url: imgWingchick,
      allergen_ids: [],
      total_sold: 180
    },
    {
      menu_id: 18,
      category_id: 4,
      menu_name: 'ไก่ทอด (สะโพก)',
      description: 'สะโพกไก่ทอดกรอบชิ้นใหญ่ เนื้อฉ่ำ หนังกรอบสะใจ',
      price: 50,
      calories: 360,
      is_available: true,
      image_url: imgChick,
      allergen_ids: [],
      total_sold: 160
    },
    {
      menu_id: 19,
      category_id: 5,
      menu_name: 'น้ำเก๊กฮวย',
      description: 'น้ำเก๊กฮวยต้มสมุนไพรแท้ หวานน้อย เย็นชื่นใจ ดับกระหายคลายร้อน',
      price: 20,
      calories: 90,
      is_available: true,
      image_url: imgGek,
      allergen_ids: [],
      total_sold: 150
    },
    {
      menu_id: 20,
      category_id: 5,
      menu_name: 'โค้ก (Coke)',
      description: 'โค้กแช่เย็นซ่าชื่นใจ เสิร์ฟพร้อมแก้วน้ำแข็ง',
      price: 20,
      calories: 140,
      is_available: true,
      image_url: imgCoke,
      allergen_ids: [],
      total_sold: 170
    },
    {
      menu_id: 21,
      category_id: 5,
      menu_name: 'สไปรท์ (Sprite)',
      description: 'น้ำอัดลมใสซ่า สดชื่น กลิ่นเลมอน-ไลม์ ดื่มแล้วสดชื่นทันที',
      price: 20,
      calories: 140,
      is_available: true,
      image_url: imgSprite,
      allergen_ids: [],
      total_sold: 90
    },
    {
      menu_id: 22,
      category_id: 5,
      menu_name: 'น้ำเปล่า',
      description: 'น้ำดื่มสะอาดบริสุทธิ์ แช่เย็นชื่นใจ',
      price: 10,
      calories: 0,
      is_available: true,
      image_url: imgWater,
      allergen_ids: [],
      total_sold: 210
    },
    {
      menu_id: 23,
      category_id: 1,
      menu_name: 'ข้าวเปล่า',
      description: 'ข้าวสวยหอมมะลิหุงสุก ร้อนๆ นุ่มอร่อย',
      price: 10,
      calories: 150,
      is_available: true,
      image_url: imgKao,
      allergen_ids: [],
      total_sold: 260
    },
    {
      menu_id: 24,
      category_id: 1,
      menu_name: 'ข้าวเหนียว',
      description: 'ข้าวเหนียวนุ่ม ร้อนๆ หอมอร่อย ทานคู่กับส้มตำ ลาบ ไก่ทอด',
      price: 10,
      calories: 150,
      is_available: true,
      image_url: imgKaon,
      allergen_ids: [],
      total_sold: 180
    }
  ],

  menuIngredients: [
    { menu_id: 1, ingredient_id: 6, quantity_used: 0.12 },
    { menu_id: 1, ingredient_id: 15, quantity_used: 0.02 },
    { menu_id: 1, ingredient_id: 2, quantity_used: 0.01 },
    { menu_id: 1, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 2, ingredient_id: 10, quantity_used: 0.08 },
    { menu_id: 2, ingredient_id: 11, quantity_used: 0.08 },
    { menu_id: 2, ingredient_id: 15, quantity_used: 0.02 },
    { menu_id: 2, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 3, ingredient_id: 6, quantity_used: 0.10 },
    { menu_id: 3, ingredient_id: 12, quantity_used: 1 },
    { menu_id: 3, ingredient_id: 13, quantity_used: 0.18 },
    { menu_id: 5, ingredient_id: 10, quantity_used: 0.06 },
    { menu_id: 5, ingredient_id: 11, quantity_used: 0.06 },
    { menu_id: 5, ingredient_id: 12, quantity_used: 1 },
    { menu_id: 5, ingredient_id: 13, quantity_used: 0.18 },
    { menu_id: 6, ingredient_id: 6, quantity_used: 0.12 },
    { menu_id: 6, ingredient_id: 16, quantity_used: 0.03 },
    { menu_id: 6, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 7, ingredient_id: 10, quantity_used: 0.07 },
    { menu_id: 7, ingredient_id: 11, quantity_used: 0.07 },
    { menu_id: 7, ingredient_id: 16, quantity_used: 0.03 },
    { menu_id: 7, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 8, ingredient_id: 7, quantity_used: 0.10 },
    { menu_id: 8, ingredient_id: 14, quantity_used: 0.10 },
    { menu_id: 8, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 9, ingredient_id: 10, quantity_used: 0.07 },
    { menu_id: 9, ingredient_id: 11, quantity_used: 0.07 },
    { menu_id: 9, ingredient_id: 14, quantity_used: 0.10 },
    { menu_id: 9, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 10, ingredient_id: 6, quantity_used: 0.14 },
    { menu_id: 10, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 11, ingredient_id: 12, quantity_used: 2 },
    { menu_id: 11, ingredient_id: 6, quantity_used: 0.06 },
    { menu_id: 11, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 12, ingredient_id: 12, quantity_used: 2 },
    { menu_id: 12, ingredient_id: 10, quantity_used: 0.06 },
    { menu_id: 12, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 13, ingredient_id: 1, quantity_used: 0.20 },
    { menu_id: 13, ingredient_id: 2, quantity_used: 0.02 },
    { menu_id: 13, ingredient_id: 3, quantity_used: 0.05 },
    { menu_id: 13, ingredient_id: 4, quantity_used: 0.04 },
    { menu_id: 13, ingredient_id: 5, quantity_used: 0.04 },
    { menu_id: 14, ingredient_id: 1, quantity_used: 0.20 },
    { menu_id: 14, ingredient_id: 2, quantity_used: 0.02 },
    { menu_id: 14, ingredient_id: 5, quantity_used: 0.04 },
    { menu_id: 14, ingredient_id: 18, quantity_used: 0.02 },
    { menu_id: 15, ingredient_id: 6, quantity_used: 0.15 },
    { menu_id: 15, ingredient_id: 5, quantity_used: 0.03 },
    { menu_id: 15, ingredient_id: 2, quantity_used: 0.01 },
    { menu_id: 16, ingredient_id: 17, quantity_used: 1 },
    { menu_id: 16, ingredient_id: 10, quantity_used: 0.07 },
    { menu_id: 16, ingredient_id: 11, quantity_used: 0.07 },
    { menu_id: 16, ingredient_id: 6, quantity_used: 0.04 },
    { menu_id: 16, ingredient_id: 5, quantity_used: 0.04 },
    { menu_id: 17, ingredient_id: 9, quantity_used: 0.20 },
    { menu_id: 18, ingredient_id: 8, quantity_used: 0.25 },
    { menu_id: 19, ingredient_id: 19, quantity_used: 1 },
    { menu_id: 20, ingredient_id: 20, quantity_used: 1 },
    { menu_id: 21, ingredient_id: 21, quantity_used: 1 },
    { menu_id: 22, ingredient_id: 22, quantity_used: 1 },
    { menu_id: 23, ingredient_id: 13, quantity_used: 0.15 },
    { menu_id: 24, ingredient_id: 23, quantity_used: 0.15 }
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
      total_price: 300,
      discount_applied: 50,
      promo_code: 'ZING50',
      created_at: '2026-09-03 18:35:10',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 13, menu_name: 'ส้มตำปูปลาร้า', quantity: 2, price: 40, subtotal: 80, customization: { spicy: 'เผ็ดมาก (พริก 10 เม็ด)', no_msg: false, note: 'ใส่ปลาร้าเยอะๆ เปรี้ยวเค็ม' } },
        { menu_id: 1, menu_name: 'กระเพราหมู', quantity: 2, price: 40, subtotal: 80, customization: { spicy: 'ปกติ', no_msg: false, note: 'ไข่ดาวไม่สุก' } },
        { menu_id: 18, menu_name: 'ไก่ทอด (สะโพก)', quantity: 2, price: 50, subtotal: 100, customization: { spicy: 'ปกติ', no_msg: false, note: 'ทอดกรอบๆ' } },
        { menu_id: 19, menu_name: 'น้ำเก๊กฮวย', quantity: 2, price: 20, subtotal: 40, customization: { spicy: '-', no_msg: false, note: 'หวานน้อย' } }
      ]
    },
    {
      order_id: 103,
      user_id: null,
      customer_name: 'ลูกค้าหน้าร้าน (โต๊ะ T-03)',
      table_id: 3,
      order_type: 'In-store',
      status: 'Pending',
      total_price: 480,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 18:47:20',
      payment_method: 'Credit Card',
      payment_status: 'Completed',
      payment_slip_url: null,
      items: [
        { menu_id: 16, menu_name: 'ยำวุ้นเส้นทะเล', quantity: 2, price: 70, subtotal: 140, customization: { spicy: 'เผ็ดกลาง', no_msg: true, note: 'ไม่ใส่ชูรส' } },
        { menu_id: 18, menu_name: 'ไก่ทอด (สะโพก)', quantity: 2, price: 50, subtotal: 100, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 15, menu_name: 'ลาบหมู', quantity: 2, price: 60, subtotal: 120, customization: { spicy: 'เผ็ดมาก', no_msg: false, note: 'ข้าวคั่วเยอะๆ' } },
        { menu_id: 13, menu_name: 'ส้มตำปูปลาร้า', quantity: 2, price: 40, subtotal: 80, customization: { spicy: 'เผ็ดน้อย', no_msg: false, note: '' } },
        { menu_id: 20, menu_name: 'โค้ก (Coke)', quantity: 2, price: 20, subtotal: 40, customization: { spicy: '-', no_msg: false, note: 'เย็นๆ' } }
      ]
    },
    {
      order_id: 104,
      user_id: 4,
      customer_name: 'คุณวิชัย (โต๊ะ T-04)',
      table_id: 4,
      order_type: 'In-store',
      status: 'Served',
      total_price: 340,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 18:10:00',
      payment_method: 'Cash',
      payment_status: 'Pending',
      payment_slip_url: null,
      items: [
        { menu_id: 1, menu_name: 'กระเพราหมู', quantity: 2, price: 40, subtotal: 80, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 15, menu_name: 'ลาบหมู', quantity: 2, price: 60, subtotal: 120, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: '' } },
        { menu_id: 4, menu_name: 'ข้าวผัดกุ้ง', quantity: 2, price: 50, subtotal: 100, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 19, menu_name: 'น้ำเก๊กฮวย', quantity: 2, price: 20, subtotal: 40, customization: { spicy: '-', no_msg: false, note: '' } }
      ]
    },
    {
      order_id: 99,
      user_id: 2,
      customer_name: 'คุณกิตติศักดิ์ (Takeaway)',
      table_id: null,
      order_type: 'Takeaway',
      status: 'Completed',
      total_price: 180,
      discount_applied: 0,
      promo_code: null,
      created_at: '2026-09-03 17:25:00',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 13, menu_name: 'ส้มตำปูปลาร้า', quantity: 2, price: 40, subtotal: 80, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: 'แยกเส้น' } },
        { menu_id: 17, menu_name: 'ไก่ทอด (ปีก)', quantity: 3, price: 20, subtotal: 60, customization: { spicy: 'ปกติ', no_msg: false, note: 'ทอดใหม่ๆ' } },
        { menu_id: 20, menu_name: 'โค้ก (Coke)', quantity: 2, price: 20, subtotal: 40, customization: { spicy: '-', no_msg: false, note: 'แยกน้ำแข็ง' } }
      ]
    },
    {
      order_id: 98,
      user_id: null,
      customer_name: 'โต๊ะ T-05 (เสร็จสิ้น)',
      table_id: 5,
      order_type: 'In-store',
      status: 'Completed',
      total_price: 360,
      discount_applied: 50,
      promo_code: 'SEP10',
      created_at: '2026-09-03 16:40:00',
      payment_method: 'PromptPay',
      payment_status: 'Completed',
      payment_slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      items: [
        { menu_id: 16, menu_name: 'ยำวุ้นเส้นทะเล', quantity: 2, price: 70, subtotal: 140, customization: { spicy: 'เผ็ดมาก', no_msg: false, note: '' } },
        { menu_id: 18, menu_name: 'ไก่ทอด (สะโพก)', quantity: 2, price: 50, subtotal: 100, customization: { spicy: 'ปกติ', no_msg: false, note: '' } },
        { menu_id: 15, menu_name: 'ลาบหมู', quantity: 2, price: 60, subtotal: 120, customization: { spicy: 'เผ็ดกลาง', no_msg: false, note: '' } }
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

  // ===== Centralized Admin Initialization =====
  async initAdminData() {
    await Promise.allSettled([
      this.fetchSettingsFromAPI(),
      this.fetchMenusFromAPI(),
      this.fetchInventoryFromAPI(),
      this.fetchTablesFromAPI(),
      this.fetchOrdersFromAPI(),
      this.fetchPromotionsFromAPI()
    ])
    this.recomputeDashboardStats()
  },

  recomputeDashboardStats() {
    // 1. Gross Sales and Order Counts
    this.dashboardStats.totalOrders = this.orders.length
    this.dashboardStats.grossSales = this.orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

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
      if (Array.isArray(data) && data.length > 0) {
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
          allergen_ids: m.allergens ? m.allergens.map(a => a.allergen_id || a.allergen?.allergen_id).filter(Boolean) : [],
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
        if (allDbMenuIngredients.length > 0) {
          this.menuIngredients = allDbMenuIngredients
        }
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
        headers: { 'Content-Type': 'application/json' },
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
    try {
      const res = await fetch(`${API_BASE}/menus/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ เปลี่ยนสถานะเมนู #${menuId} เป็น ${newStatus ? 'พร้อมขาย' : 'ปิดการขาย'}`)
    } catch (err) {
      item.is_available = !newStatus
      console.error('❌ เปลี่ยนสถานะเมนูไม่สำเร็จ:', err.message)
    }
  },

  async addMenuItem(newMenu) {
    try {
      const res = await fetch(`${API_BASE}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: Number(newMenu.category_id) || 1,
          menu_name: newMenu.menu_name,
          description: newMenu.description || '',
          price: Number(newMenu.price),
          image_url: newMenu.image_url || '',
          calories: Number(newMenu.calories) || 0,
          is_available: newMenu.is_available !== false
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      this.menus.push({
        menu_id: created.menu_id,
        category_id: created.category_id,
        menu_name: created.menu_name,
        description: created.description || '',
        price: Number(created.price),
        calories: created.calories || 0,
        is_available: created.is_available,
        image_url: created.image_url || newMenu.image_url,
        allergen_ids: newMenu.allergen_ids || [],
        total_sold: 0
      })
      console.log(`✅ เพิ่มเมนูใหม่สำเร็จ: ${created.menu_name} (ID: ${created.menu_id})`)
    } catch (err) {
      console.warn('⚠️ เพิ่มเมนู API ไม่สำเร็จ:', err.message)
    }
  },

  async updateMenuItem(updatedMenu) {
    const index = this.menus.findIndex(m => m.menu_id === updatedMenu.menu_id)
    if (index === -1) return
    try {
      const res = await fetch(`${API_BASE}/menus/${updatedMenu.menu_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: Number(updatedMenu.category_id) || 1,
          menu_name: updatedMenu.menu_name,
          description: updatedMenu.description || '',
          price: Number(updatedMenu.price),
          image_url: updatedMenu.image_url || '',
          calories: Number(updatedMenu.calories) || 0,
          is_available: updatedMenu.is_available
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      this.menus[index] = { ...this.menus[index], ...updatedMenu }
      console.log(`✅ แก้ไขเมนู #${updatedMenu.menu_id} สำเร็จ`)
    } catch (err) {
      this.menus[index] = { ...this.menus[index], ...updatedMenu }
      console.warn('⚠️ แก้ไขเมนู API ไม่สำเร็จ:', err.message)
    }
  },

  async deleteMenuItem(menuId) {
    try {
      const res = await fetch(`${API_BASE}/menus/${menuId}`, {
        method: 'DELETE'
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
      if (Array.isArray(data) && data.length > 0) {
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
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API คลังวัตถุดิบได้:', err.message)
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' },
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
        method: 'DELETE'
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
      if (Array.isArray(data) && data.length > 0) {
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
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API โต๊ะอาหารได้:', err.message)
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/orders`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
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

          const txn = Array.isArray(o.transaction) && o.transaction.length > 0 ? o.transaction[0] : (o.transaction || null)
          const isPaid = normStatus === 'Completed' || txn?.payment_status === 'COMPLETED' || rawStatus === 'PAID'

          return {
            ...o,
            customer_name: o.user?.username || (o.table ? `โต๊ะ ${o.table.table_number}` : (o.table_id ? `โต๊ะ T-0${o.table_id}` : `ลูกค้า #${o.order_id}`)),
            items,
            status: normStatus,
            raw_status: rawStatus,
            order_type: o.order_type === 'DINE_IN' || o.table_id ? 'In-store' : 'Online',
            payment_method: txn?.payment_method || (o.table_id ? 'Stripe / QR' : 'PromptPay'),
            payment_status: isPaid ? 'Completed' : 'Pending',
            payment_slip_url: txn?.payment_slip_url || null,
            discount_applied: Number(o.discount_applied || 0)
          }
        })
      }
      console.log(`✅ โหลดรายการออเดอร์จาก API สำเร็จ: ${this.orders.length} ออเดอร์`)
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API ออเดอร์ได้:', err.message)
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
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      if (Array.isArray(data) && data.length > 0) {
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
    } catch (err) {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ API โปรโมชันได้:', err.message)
    }
  },

  async togglePromoStatusAPI(promoId) {
    const p = this.promotions.find(x => x.promo_id === promoId)
    if (!p) return
    p.is_active = !p.is_active
    try {
      const res = await fetch(`${API_BASE}/promotions/${promoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: p.is_active })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      console.log(`✅ สลับสถานะโปรโมชัน #${promoId} สำเร็จ`)
    } catch (err) {
      console.warn('⚠️ สลับสถานะโปรโมชัน API ไม่สำเร็จ:', err.message)
    }
  },
  togglePromoStatus(promoId) {
    return this.togglePromoStatusAPI(promoId)
  },

  async addPromotionAPI(promo) {
    try {
      const expDate = promo.expiry_date ? new Date(promo.expiry_date).toISOString() : new Date('2026-12-31T23:59:59Z').toISOString()
      const res = await fetch(`${API_BASE}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: String(promo.code || '').toUpperCase(),
          discount_type: (promo.discount_type || 'FIXED').toUpperCase(),
          discount_value: Number(promo.discount_value),
          min_order_price: Number(promo.min_order_price || 0),
          expiry_date: expDate
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
        method: 'DELETE'
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
  exportSalesCSV() {
    const link = document.createElement('a')
    link.href = `${API_BASE}/reports/export-csv`
    link.setAttribute('download', `TumKrokZing_SalesReport_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 200)
  },

  // ===== Database Views Integration =====
  async fetchReceiptsFromView() {
    try {
      const res = await fetch(`${API_BASE}/reports/receipts`)
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
      const res = await fetch(`${API_BASE}/reports/sales-summary`)
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
          vatRate: data.vat_rate !== undefined ? Number(data.vat_rate) : this.storeSettings.vatRate
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
      const res = await fetch(`${API_BASE}/settings/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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
        vat_rate: Number(customSettings.vatRate !== undefined ? customSettings.vatRate : this.storeSettings.vatRate)
      }

      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        vatRate: Number(data.vat_rate)
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

  // ===== PDF Export =====
  exportSalesPDF() {
    window.print()
  }
})
