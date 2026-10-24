-- 15. พิสูจน์ TOP_SELLING_MENUS_VIEW (เมนูขายดี)
-- การทดสอบบนเว็บ: แดชบอร์ดสรุป 5 อันดับเมนูขายดี
-- สิ่งที่สังเกต: คำนวณ SUM ยอดขาย และจัดอันดับเมนูให้อัตโนมัติ
SELECT * FROM TOP_SELLING_MENUS_VIEW 
ORDER BY total_sold DESC LIMIT 5;