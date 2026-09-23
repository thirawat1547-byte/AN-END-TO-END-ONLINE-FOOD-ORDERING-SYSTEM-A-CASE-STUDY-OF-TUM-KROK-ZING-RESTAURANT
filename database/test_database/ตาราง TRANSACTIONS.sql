-- 11. ข้อมูลตาราง TRANSACTIONS (การชำระเงินและบิล)
-- การทดสอบบนเว็บ: ลูกค้าหรือพนักงานกด "ชำระเงิน / ปิดบิล"
-- สิ่งที่สังเกต: บันทึกรหัสออเดอร์ ยอดเงิน ช่องทางชำระ และสถานะชำระเงิน (ตามเล่มรายงานล่าสุด 5 คอลัมน์)
SELECT transaction_id, order_id, amount, payment_method, payment_status
FROM TRANSACTIONS 
ORDER BY transaction_id;