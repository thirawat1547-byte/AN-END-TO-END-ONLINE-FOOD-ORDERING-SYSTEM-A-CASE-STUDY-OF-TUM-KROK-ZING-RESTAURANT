-- =======================================================
-- คำสั่ง SQL สำหรับเปิดดูข้อมูลทุกตารางในระบบร้านตำครกซิ่ง
-- วิชา Advanced Database (Tum Krok Zing)
-- =======================================================

USE tum_krok_zing;

-- -------------------------------------------------------
-- กลุ่มที่ 1: ตารางจัดการเมนู, สูตรอาหาร และวัตถุดิบ
-- -------------------------------------------------------

-- 1. ตารางหมวดหมู่อาหาร (CATEGORIES)
SELECT * FROM CATEGORIES;

-- 2. ตารางเมนูอาหาร (MENUS)
SELECT * FROM MENUS;

-- 3. ตารางคลังวัตถุดิบ (INGREDIENTS)
SELECT * FROM INGREDIENTS;

-- 4. ตารางสูตรอาหารและการตัดสต็อก (MENU_INGREDIENTS - Junction Table)
SELECT * FROM MENU_INGREDIENTS;

-- 5. ตารางข้อมูลสารก่อภูมิแพ้ (ALLERGENS)
SELECT * FROM ALLERGENS;

-- 6. ตารางเมนูกับสารก่อภูมิแพ้ (MENU_ALLERGENS - Junction Table)
SELECT * FROM MENU_ALLERGENS;


-- -------------------------------------------------------
-- กลุ่มที่ 2: ตารางการบริการโต๊ะ และรายการคำสั่งซื้อ
-- -------------------------------------------------------

-- 7. ตารางข้อมูลโต๊ะอาหาร (TABLES)
SELECT * FROM TABLES;

-- 8. ตารางคำสั่งซื้อหลัก (ORDERS)
SELECT * FROM ORDERS;

-- 9. ตารางรายการอาหารย่อยในแต่ละออเดอร์ (ORDER_ITEMS)
SELECT * FROM ORDER_ITEMS;


-- -------------------------------------------------------
-- กลุ่มที่ 3: ตารางการเงิน, สมาชิก และโปรโมชั่น
-- -------------------------------------------------------

-- 10. ตารางบันทึกการชำระเงินและสลิป (TRANSACTIONS)
SELECT * FROM TRANSACTIONS;

-- 11. ตารางโปรโมชั่นและโค้ดส่วนลด (PROMOTIONS)
SELECT * FROM PROMOTIONS;

-- 12. ตารางผู้ใช้งานและบทบาท (USERS)
SELECT * FROM USERS;


-- -------------------------------------------------------
-- กลุ่มที่ 4: ฐานข้อมูลวิว (5 Database Views)
-- -------------------------------------------------------

-- 13. วิวสรุปยอดขายภาพรวมรายบิล (ORDER_SUMMARIES_VIEW)
SELECT * FROM ORDER_SUMMARIES_VIEW;

-- 14. วิวใบเสร็จและประวัติการชำระเงิน (TRANSACTION_RECEIPTS_VIEW)
SELECT * FROM TRANSACTION_RECEIPTS_VIEW;

-- 15. วิวสถิติเมนูยอดนิยมและรายได้รวม (TOP_SELLING_MENUS_VIEW)
SELECT * FROM TOP_SELLING_MENUS_VIEW;

-- 16. วิวแจ้งเตือนวัตถุดิบใกล้หมดสต็อก (LOW_STOCK_ALERTS_VIEW)
SELECT * FROM LOW_STOCK_ALERTS_VIEW;

-- 17. วิวสถานะโต๊ะสดเรียลไทม์ (LIVE_TABLE_STATUS_VIEW)
SELECT * FROM LIVE_TABLE_STATUS_VIEW;


-- -------------------------------------------------------
-- [เพิ่มเติม] ตารางตั้งค่าระบบร้านค้า (System Config)
-- -------------------------------------------------------
-- 18. ตารางการตั้งค่าร้านค้า (STORE_SETTINGS)
SELECT * FROM STORE_SETTINGS;
