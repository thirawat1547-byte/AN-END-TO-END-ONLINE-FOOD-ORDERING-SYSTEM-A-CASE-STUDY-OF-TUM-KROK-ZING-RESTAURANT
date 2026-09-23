-- 8. พิสูจน์ตาราง TABLES (สถานะโต๊ะอาหาร)
-- การทดสอบบนเว็บ: ลูกค้านั่งโต๊ะ หรือพนักงานกด "เปิดโต๊ะ/เคลียร์โต๊ะ"
-- สิ่งที่สังเกต: ค่า status เปลี่ยนสลับระหว่าง 'AVAILABLE' กับ 'OCCUPIED'
SELECT table_id, table_number, capacity, status 
FROM TABLES;
