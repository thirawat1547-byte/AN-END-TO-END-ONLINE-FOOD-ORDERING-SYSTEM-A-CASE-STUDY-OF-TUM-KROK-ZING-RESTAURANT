import { reactive } from 'vue'
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

export const adminStore = reactive({
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
    { ingredient_id: 22, ingredient_name: 'น้ำดื่มสะอาด', quantity_in_stock: 60, unit: 'ขวด', reorder_level: 20, cost_per_unit: 5, last_updated: '2026-09-02 10:00' }
  ],

  menus: [
    {
      menu_id: 1,
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
      menu_id: 2,
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
      menu_id: 3,
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
    { menu_id: 22, ingredient_id: 22, quantity_used: 1 }
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
