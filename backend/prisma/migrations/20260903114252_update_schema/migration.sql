/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `PROMOTIONS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `MENU_ALLERGENS_menu_id_idx` ON `MENU_ALLERGENS`(`menu_id`);

-- CreateIndex
CREATE INDEX `MENU_INGREDIENTS_menu_id_idx` ON `MENU_INGREDIENTS`(`menu_id`);

-- CreateIndex
CREATE INDEX `ORDERS_status_idx` ON `ORDERS`(`status`);

-- CreateIndex
CREATE INDEX `ORDERS_created_at_idx` ON `ORDERS`(`created_at`);

-- CreateIndex
CREATE UNIQUE INDEX `PROMOTIONS_code_key` ON `PROMOTIONS`(`code`);

-- CreateIndex
CREATE INDEX `TRANSACTIONS_payment_status_idx` ON `TRANSACTIONS`(`payment_status`);

-- RenameIndex
ALTER TABLE `MENUS` RENAME INDEX `MENUS_category_id_fkey` TO `MENUS_category_id_idx`;

-- RenameIndex
ALTER TABLE `MENU_ALLERGENS` RENAME INDEX `MENU_ALLERGENS_allergen_id_fkey` TO `MENU_ALLERGENS_allergen_id_idx`;

-- RenameIndex
ALTER TABLE `MENU_INGREDIENTS` RENAME INDEX `MENU_INGREDIENTS_ingredient_id_fkey` TO `MENU_INGREDIENTS_ingredient_id_idx`;

-- RenameIndex
ALTER TABLE `ORDERS` RENAME INDEX `ORDERS_table_id_fkey` TO `ORDERS_table_id_idx`;

-- RenameIndex
ALTER TABLE `ORDERS` RENAME INDEX `ORDERS_user_id_fkey` TO `ORDERS_user_id_idx`;

-- RenameIndex
ALTER TABLE `ORDER_ITEMS` RENAME INDEX `ORDER_ITEMS_menu_id_fkey` TO `ORDER_ITEMS_menu_id_idx`;

-- RenameIndex
ALTER TABLE `ORDER_ITEMS` RENAME INDEX `ORDER_ITEMS_order_id_fkey` TO `ORDER_ITEMS_order_id_idx`;

-- RenameIndex
ALTER TABLE `TRANSACTIONS` RENAME INDEX `TRANSACTIONS_order_id_fkey` TO `TRANSACTIONS_order_id_idx`;
