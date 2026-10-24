-- 5. พิสูจน์ตาราง MENU_INGREDIENTS (สูตรอาหารตัดสต็อก - Junction Table)
-- การทดสอบบนเว็บ: หน้าแอดมินคลิก "สูตรอาหาร" (Recipe) ของแต่ละเมนู
-- สิ่งที่สังเกต: แสดงว่าเมนูนี้ (เช่น ส้มตำไทย) ผูกกับวัตถุดิบอะไรกี่กรัม/หน่วย
-- --------------------------------------------------------------------
SELECT m.menu_name AS 'ชื่อเมนู', i.ingredient_name AS 'วัตถุดิบที่ใช้', mi.quantity_used AS 'ปริมาณต่อจาน', i.unit AS 'หน่วย'
FROM MENU_INGREDIENTS mi
JOIN MENUS m ON mi.menu_id = m.menu_id
JOIN INGREDIENTS i ON mi.ingredient_id = i.ingredient_id
WHERE m.menu_id = 1; -- ดูสูตรกระเพราหมู