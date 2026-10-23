-- 16. พิสูจน์ LOW_STOCK_ALERTS_VIEW (แจ้งเตือนของใกล้หมด)
-- การทดสอบบนเว็บ: กล่องเตือนสีแดงในหน้าคลังวัตถุดิบของแอดมิน
-- สิ่งที่สังเกต: แสดงเฉพาะรายการที่ quantity_in_stock <= reorder_level
SELECT * FROM LOW_STOCK_ALERTS_VIEW;