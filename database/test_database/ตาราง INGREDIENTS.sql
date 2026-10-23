-- 4. พิสูจน์ตาราง INGREDIENTS (คลังวัตถุดิบและสต็อก)
-- การทดสอบบนเว็บ: แอดมินกด "เติมสต็อก" หรือเมื่อมีลูกค้าสั่งอาหาร (สต็อกจะลด)
-- สิ่งที่สังเกต: ค่า quantity_in_stock ลดลงอัตโนมัติเมื่อสั่งอาหาร
SELECT ingredient_id, ingredient_name, quantity_in_stock, unit, reorder_level 
FROM INGREDIENTS 
ORDER BY ingredient_id;