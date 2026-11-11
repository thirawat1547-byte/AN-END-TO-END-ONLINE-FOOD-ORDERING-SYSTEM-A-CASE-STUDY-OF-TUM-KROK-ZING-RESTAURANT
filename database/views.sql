-- Database Views ของระบบ (ดึงจาก database/tum_krok_zing.sql) ใช้สร้าง View ใหม่เมื่อฐานข้อมูลยังไม่มี
-- deploy.yml รันไฟล์นี้เฉพาะตอนที่จำนวน View น้อยกว่า 5 จึงไม่เขียนทับ View ที่ใช้งานอยู่

CREATE OR REPLACE VIEW LIVE_TABLE_STATUS_VIEW AS select `t`.`table_id` AS `table_id`,`t`.`table_number` AS `table_number`,`t`.`capacity` AS `capacity`,`t`.`status` AS `current_status`,`o`.`order_id` AS `current_order_id`,`o`.`total_price` AS `current_total` from (`TABLES` `t` left join `ORDERS` `o` on(((`t`.`table_id` = `o`.`table_id`) and (`o`.`status` in ('PENDING','PREPARING','SERVED')))));

CREATE OR REPLACE VIEW LOW_STOCK_ALERTS_VIEW AS select `i`.`ingredient_id` AS `ingredient_id`,`i`.`ingredient_name` AS `ingredient_name`,`i`.`quantity_in_stock` AS `quantity_in_stock`,`i`.`reorder_level` AS `reorder_level`,`i`.`unit` AS `unit` from `INGREDIENTS` `i` where (`i`.`quantity_in_stock` <= `i`.`reorder_level`);

CREATE OR REPLACE VIEW ORDER_SUMMARIES_VIEW AS select `o`.`order_id` AS `order_id`,`t`.`table_number` AS `table_number`,`o`.`total_price` AS `total_price`,`o`.`status` AS `status`,`o`.`created_at` AS `order_date` from (`ORDERS` `o` left join `TABLES` `t` on((`o`.`table_id` = `t`.`table_id`)));

CREATE OR REPLACE VIEW TOP_SELLING_MENUS_VIEW AS select `m`.`menu_id` AS `menu_id`,`m`.`menu_name` AS `menu_name`,coalesce(`c`.`category_name`,'ทั่วไป') AS `category_name`,cast(coalesce(sum(`oi`.`quantity`),0) as signed) AS `total_sold`,cast(coalesce(sum((`oi`.`quantity` * `oi`.`unit_price`)),0) as decimal(10,2)) AS `total_revenue` from ((`MENUS` `m` left join `CATEGORIES` `c` on((`m`.`category_id` = `c`.`category_id`))) left join `ORDER_ITEMS` `oi` on((`m`.`menu_id` = `oi`.`menu_id`))) group by `m`.`menu_id`,`m`.`menu_name`,`c`.`category_name`;

CREATE OR REPLACE VIEW TRANSACTION_RECEIPTS_VIEW AS select `tr`.`transaction_id` AS `transaction_id`,`tr`.`order_id` AS `order_id`,coalesce(`u`.`username`,'ลูกค้าทั่วไป') AS `customer_name`,`tr`.`amount` AS `total_amount`,`tr`.`payment_method` AS `payment_method`,`tr`.`payment_status` AS `payment_status`,`o`.`created_at` AS `payment_date` from ((`TRANSACTIONS` `tr` left join `ORDERS` `o` on((`tr`.`order_id` = `o`.`order_id`))) left join `USERS` `u` on((`o`.`user_id` = `u`.`user_id`)));
