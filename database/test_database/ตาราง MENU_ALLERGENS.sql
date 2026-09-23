-- 7. พิสูจน์ตาราง MENU_ALLERGENS (ความสัมพันธ์เมนูกับสารก่อภูมิแพ้ - Junction Table)
-- การทดสอบบนเว็บ: หน้าแอดมินติ๊กเลือกสารก่อภูมิแพ้ให้เมนู
-- สิ่งที่สังเกต: เชื่อมโยงเมนูกับสารก่อภูมิแพ้ที่ถูกต้อง
SELECT m.menu_name AS 'ชื่อเมนู', a.allergen_name AS 'สารก่อภูมิแพ้ที่มี'
FROM MENU_ALLERGENS ma
JOIN MENUS m ON ma.menu_id = m.menu_id
JOIN ALLERGENS a ON ma.allergen_id = a.allergen_id;