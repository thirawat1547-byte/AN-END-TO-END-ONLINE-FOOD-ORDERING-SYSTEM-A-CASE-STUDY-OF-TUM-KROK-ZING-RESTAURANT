-- 3. พิสูจน์ตาราง MENUS (เมนูอาหารและสถานะการขาย)
-- การทดสอบบนเว็บ: แอดมินกด "เพิ่มเมนู" หรือสวิตช์ "เปิด/ปิดขายเมนู"
-- สิ่งที่สังเกต: ราคา แคลอรี่ และฟิลด์ is_available เปลี่ยนตามสวิตช์
SELECT menu_id, menu_name, price, calories, is_available, image_url 
FROM MENUS 
ORDER BY menu_id DESC LIMIT 5;