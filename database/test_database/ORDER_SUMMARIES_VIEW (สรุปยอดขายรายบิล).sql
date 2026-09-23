-- 13. พิสูจน์ ORDER_SUMMARIES_VIEW (สรุปยอดขายรายบิล)
-- การทดสอบบนเว็บ: หน้าประวัติออเดอร์ หรือรายงานยอดขายของแอดมิน
-- สิ่งที่สังเกต: ดึงเลขโต๊ะมา JOIN อัตโนมัติโดยไม่ต้องเขียนคำสั่ง JOIN เอง
SELECT * FROM ORDER_SUMMARIES_VIEW 
ORDER BY order_id DESC LIMIT 5;