/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiningTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ingredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Menu` DROP FOREIGN KEY `Menu_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `MenuIngredient` DROP FOREIGN KEY `MenuIngredient_ingredientId_fkey`;

-- DropForeignKey
ALTER TABLE `MenuIngredient` DROP FOREIGN KEY `MenuIngredient_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_promotionId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_tableId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_orderId_fkey`;

-- DropTable
DROP TABLE `Category`;

-- DropTable
DROP TABLE `DiningTable`;

-- DropTable
DROP TABLE `Ingredient`;

-- DropTable
DROP TABLE `Member`;

-- DropTable
DROP TABLE `Menu`;

-- DropTable
DROP TABLE `MenuIngredient`;

-- DropTable
DROP TABLE `Order`;

-- DropTable
DROP TABLE `OrderItem`;

-- DropTable
DROP TABLE `Payment`;

-- DropTable
DROP TABLE `Promotion`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `USERS` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(150) NULL,
    `phone_number` VARCHAR(15) NULL,
    `role` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TABLES` (
    `table_id` INTEGER NOT NULL AUTO_INCREMENT,
    `table_number` VARCHAR(10) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`table_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CATEGORIES` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MENUS` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `menu_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `calories` INTEGER NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ALLERGENS` (
    `allergen_id` INTEGER NOT NULL AUTO_INCREMENT,
    `allergen_name` VARCHAR(100) NOT NULL,
    `icon_url` VARCHAR(255) NULL,

    PRIMARY KEY (`allergen_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MENU_ALLERGENS` (
    `menu_id` INTEGER NOT NULL,
    `allergen_id` INTEGER NOT NULL,

    PRIMARY KEY (`menu_id`, `allergen_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROMOTIONS` (
    `promo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `discount_type` VARCHAR(20) NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `min_order_price` DECIMAL(10, 2) NOT NULL,
    `expiry_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`promo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ORDERS` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `table_id` INTEGER NULL,
    `promo_id` INTEGER NULL,
    `order_type` VARCHAR(20) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ORDER_ITEMS` (
    `order_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `customization` JSON NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`order_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TRANSACTIONS` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` VARCHAR(20) NOT NULL,
    `payment_slip_url` VARCHAR(255) NULL,

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `INGREDIENTS` (
    `ingredient_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ingredient_name` VARCHAR(100) NOT NULL,
    `quantity_in_stock` DECIMAL(10, 2) NOT NULL,
    `unit` VARCHAR(50) NOT NULL,
    `reorder_level` DECIMAL(10, 2) NOT NULL,
    `last_updated` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MENU_INGREDIENTS` (
    `menu_id` INTEGER NOT NULL,
    `ingredient_id` INTEGER NOT NULL,
    `quantity_used` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`menu_id`, `ingredient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MENUS` ADD CONSTRAINT `MENUS_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `CATEGORIES`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENU_ALLERGENS` ADD CONSTRAINT `MENU_ALLERGENS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENU_ALLERGENS` ADD CONSTRAINT `MENU_ALLERGENS_allergen_id_fkey` FOREIGN KEY (`allergen_id`) REFERENCES `ALLERGENS`(`allergen_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ORDERS` ADD CONSTRAINT `ORDERS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ORDERS` ADD CONSTRAINT `ORDERS_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `TABLES`(`table_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ORDERS` ADD CONSTRAINT `ORDERS_promo_id_fkey` FOREIGN KEY (`promo_id`) REFERENCES `PROMOTIONS`(`promo_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ORDER_ITEMS` ADD CONSTRAINT `ORDER_ITEMS_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ORDERS`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ORDER_ITEMS` ADD CONSTRAINT `ORDER_ITEMS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRANSACTIONS` ADD CONSTRAINT `TRANSACTIONS_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ORDERS`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENU_INGREDIENTS` ADD CONSTRAINT `MENU_INGREDIENTS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENU_INGREDIENTS` ADD CONSTRAINT `MENU_INGREDIENTS_ingredient_id_fkey` FOREIGN KEY (`ingredient_id`) REFERENCES `INGREDIENTS`(`ingredient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
