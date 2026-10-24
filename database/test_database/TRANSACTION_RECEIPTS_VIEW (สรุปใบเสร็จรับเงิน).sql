-- 14. พิสูจน์ TRANSACTION_RECEIPTS_VIEW (สรุปใบเสร็จรับเงิน)
-- การทดสอบบนเว็บ: หน้าประวัติการชำระเงิน และใบเสร็จรับเงิน
-- สิ่งที่สังเกต: ดึงชื่อลูกค้าและยอดจ่ายจาก 3 ตารางมารวมเป็นใบเสร็จเดียว
SELECT * FROM TRANSACTION_RECEIPTS_VIEW 
ORDER BY transaction_id;