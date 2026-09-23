-- 12. พิสูจน์ตาราง PROMOTIONS (โค้ดส่วนลด)
-- การทดสอบบนเว็บ: หน้าแอดมินสร้างโค้ด หรือหน้าสั่งอาหารกรอกโค้ดส่วนลด
-- สิ่งที่สังเกต: รหัสโค้ด มูลค่าลด และยอดสั่งซื้อขั้นต่ำ
SELECT promo_id, code, discount_type, discount_value, min_order_price, expiry_date 
FROM PROMOTIONS;