-- 10. พิสูจน์ตาราง ORDER_ITEMS (รายการอาหารย่อยในบิล)
-- การทดสอบบนเว็บ: รายการที่ลูกค้าสั่งลงในตะกร้า พร้อมโน้ตพิเศษ (เช่น เผ็ดน้อย)
-- สิ่งที่สังเกต: จำนวนจาน ราคาต่อหน่วย และข้อความหมายเหตุ (notes)
SELECT order_id, table_id, order_type, total_price, status, created_at 
FROM ORDERS 
ORDER BY order_id;
