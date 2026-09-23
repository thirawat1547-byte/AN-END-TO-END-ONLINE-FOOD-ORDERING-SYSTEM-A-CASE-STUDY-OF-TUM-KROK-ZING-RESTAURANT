-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tum_krok_zing
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `tum_krok_zing`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `tum_krok_zing` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `tum_krok_zing`;

--
-- Table structure for table `ALLERGENS`
--

DROP TABLE IF EXISTS `ALLERGENS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ALLERGENS` (
  `allergen_id` int NOT NULL AUTO_INCREMENT,
  `allergen_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`allergen_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ALLERGENS`
--

LOCK TABLES `ALLERGENS` WRITE;
/*!40000 ALTER TABLE `ALLERGENS` DISABLE KEYS */;
INSERT INTO `ALLERGENS` VALUES (1,'เธเธธเนเธ / เธญเธฒเธซเธฒเธฃเธ—เธฐเน€เธฅ','/icons/shrimp.png'),(2,'เธ–เธฑเนเธงเธฅเธดเธชเธ','/icons/peanut.png');
/*!40000 ALTER TABLE `ALLERGENS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CATEGORIES`
--

DROP TABLE IF EXISTS `CATEGORIES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CATEGORIES` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CATEGORIES`
--

LOCK TABLES `CATEGORIES` WRITE;
/*!40000 ALTER TABLE `CATEGORIES` DISABLE KEYS */;
INSERT INTO `CATEGORIES` VALUES (1,'เธญเธฒเธซเธฒเธฃเธเธฒเธเน€เธ”เธตเธขเธง / เธเธฑเธ”'),(2,'เธชเนเธกเธ•เธณเนเธเนเธเธเธดเนเธ'),(3,'เธฅเธฒเธ / เธขเธณ'),(4,'เธเธญเธเธ—เธญเธ”'),(5,'เน€เธเธฃเธทเนเธญเธเธ”เธทเนเธก');
/*!40000 ALTER TABLE `CATEGORIES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `INGREDIENTS`
--

DROP TABLE IF EXISTS `INGREDIENTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `INGREDIENTS` (
  `ingredient_id` int NOT NULL AUTO_INCREMENT,
  `ingredient_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_in_stock` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reorder_level` decimal(10,2) NOT NULL DEFAULT '5.00',
  `last_updated` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`ingredient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `INGREDIENTS`
--

LOCK TABLES `INGREDIENTS` WRITE;
/*!40000 ALTER TABLE `INGREDIENTS` DISABLE KEYS */;
INSERT INTO `INGREDIENTS` VALUES (1,'เธกเธฐเธฅเธฐเธเธญเธ”เธดเธ',15.00,'เธเธดเนเธฅเธเธฃเธฑเธก',5.00,'2026-09-05 08:18:10.609'),(2,'เธเธนเน€เธเนเธก',50.00,'เธ•เธฑเธง',10.00,'2026-09-05 08:18:10.620'),(3,'เธชเธฐเนเธเธเนเธเน',10.00,'เธเธดเนเธฅเธเธฃเธฑเธก',3.00,'2026-09-05 08:18:10.628'),(4,'เธเธธเนเธเนเธฅเธฐเธซเธกเธถเธ',8.00,'เธเธดเนเธฅเธเธฃเธฑเธก',2.00,'2026-09-05 08:18:10.637'),(5,'เธซเธกเธนเธชเธ” / เธซเธกเธนเธชเธฑเธ',19.70,'เธเธ.',5.00,'2026-09-21 16:33:56.246'),(6,'เธเธธเนเธเนเธฅเธฐเธซเธกเธถเธเธชเธ”',15.00,'เธเธ.',3.00,'2026-09-21 15:18:24.070'),(7,'เธซเธกเธนเธเธฃเธญเธ',10.00,'เธเธ.',3.00,'2026-09-21 15:18:24.081'),(8,'เน€เธเธทเนเธญเธชเธฐเนเธเธเนเธเน',18.00,'เธเธ.',4.00,'2026-09-21 15:18:24.092'),(9,'เธเธตเธเนเธเนเธชเธ”',15.00,'เธเธ.',4.00,'2026-09-21 15:18:24.103'),(10,'เธกเธฐเธฅเธฐเธเธญเธ”เธดเธเธเธนเธ”',25.00,'เธเธ.',5.00,'2026-09-21 15:18:24.114'),(11,'เธเธฃเธดเธเธชเธ”เธเธดเธเธ”เธฒเนเธ”เธ',7.98,'เธเธ.',2.00,'2026-09-21 16:33:56.250'),(12,'เธเธฃเธฐเน€เธ—เธตเธขเธกเธชเธ”',5.98,'เธเธ.',2.00,'2026-09-21 16:33:56.253'),(13,'เธเธฑเธเธเธฐเธเนเธฒเธชเธ”',10.00,'เธเธ.',3.00,'2026-09-21 15:18:24.155'),(14,'เนเธเธเธฐเน€เธเธฃเธฒเธชเธ”',4.96,'เธเธ.',1.00,'2026-09-21 16:33:56.256'),(15,'เธ–เธฑเนเธงเธเธฑเธเธขเธฒเธง',8.00,'เธเธ.',2.00,'2026-09-21 15:18:24.186'),(16,'เธกเธฐเน€เธเธทเธญเน€เธ—เธจเธชเธตเธ”เธฒ',8.00,'เธเธ.',2.00,'2026-09-21 15:18:24.199'),(17,'เธกเธฐเธเธฒเธงเธชเธ”',60.00,'เธฅเธนเธ',15.00,'2026-09-21 15:18:24.210'),(18,'เธเนเธณเธเธฅเธฒเธฃเนเธฒเธเธฃเธธเธเธชเธธเธ',15.00,'เธเธงเธ”',3.00,'2026-09-21 15:18:24.235'),(19,'เธ–เธฑเนเธงเธฅเธดเธชเธเธเธฑเนเธงเธเธ”',6.00,'เธเธ.',2.00,'2026-09-21 15:18:24.259'),(20,'เธเธธเนเธเนเธซเนเธ',4.00,'เธเธ.',1.00,'2026-09-21 15:18:24.284'),(21,'เธเธฃเธดเธเนเธเธเน€เธเนเธ”',6.00,'เธเธ.',2.00,'2026-09-21 15:18:24.305'),(22,'เธงเธธเนเธเน€เธชเนเธ',30.00,'เธซเนเธญ',10.00,'2026-09-21 15:18:24.322'),(23,'เนเธเนเนเธเนเธชเธ”',120.00,'เธเธญเธ',30.00,'2026-09-21 15:18:24.353'),(24,'เธเนเธฒเธงเธชเธฒเธฃเธซเธญเธกเธกเธฐเธฅเธด',49.85,'เธเธ.',10.00,'2026-09-21 16:33:56.259'),(25,'เธเนเธฒเธงเน€เธซเธเธตเธขเธง',30.00,'เธเธ.',8.00,'2026-09-21 15:18:24.409'),(26,'เนเธเนเธเธ—เธญเธ”เธเธฃเธญเธ',10.00,'เธเธ.',3.00,'2026-09-21 15:18:24.436'),(27,'เธเนเธฒเธงเธเธฑเนเธง',5.00,'เธเธ.',1.50,'2026-09-21 15:18:24.461'),(28,'เธเธฃเธดเธเธเนเธ',5.00,'เธเธ.',1.50,'2026-09-21 15:18:24.487'),(29,'เธ”เธญเธเน€เธเนเธเธฎเธงเธขเธญเธเนเธซเนเธ',20.00,'เธซเนเธญ',5.00,'2026-09-21 15:18:24.504'),(30,'เนเธเนเธเธเธฃเธฐเธเนเธญเธ',100.00,'เธเธฃเธฐเธเนเธญเธ',20.00,'2026-09-21 15:18:24.520'),(31,'เธชเนเธเธฃเธ—เนเธเธฃเธฐเธเนเธญเธ',100.00,'เธเธฃเธฐเธเนเธญเธ',20.00,'2026-09-21 15:18:24.537'),(32,'เธเนเธณเธ”เธทเนเธกเธเธงเธ”',100.00,'เธเธงเธ”',25.00,'2026-09-21 15:18:24.551');
/*!40000 ALTER TABLE `INGREDIENTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `LIVE_TABLE_STATUS_VIEW`
--

DROP TABLE IF EXISTS `LIVE_TABLE_STATUS_VIEW`;
/*!50001 DROP VIEW IF EXISTS `LIVE_TABLE_STATUS_VIEW`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `LIVE_TABLE_STATUS_VIEW` AS SELECT 
 1 AS `table_id`,
 1 AS `table_number`,
 1 AS `capacity`,
 1 AS `current_status`,
 1 AS `current_order_id`,
 1 AS `current_total`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `LOW_STOCK_ALERTS_VIEW`
--

DROP TABLE IF EXISTS `LOW_STOCK_ALERTS_VIEW`;
/*!50001 DROP VIEW IF EXISTS `LOW_STOCK_ALERTS_VIEW`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `LOW_STOCK_ALERTS_VIEW` AS SELECT 
 1 AS `ingredient_id`,
 1 AS `ingredient_name`,
 1 AS `quantity_in_stock`,
 1 AS `reorder_level`,
 1 AS `unit`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `MENUS`
--

DROP TABLE IF EXISTS `MENUS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MENUS` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `menu_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calories` int DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`menu_id`),
  KEY `MENUS_category_id_idx` (`category_id`),
  CONSTRAINT `MENUS_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `CATEGORIES` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MENUS`
--

LOCK TABLES `MENUS` WRITE;
/*!40000 ALTER TABLE `MENUS` DISABLE KEYS */;
INSERT INTO `MENUS` VALUES (1,1,'เธเธฃเธฐเน€เธเธฃเธฒเธซเธกเธน','เธซเธญเธกเธเธธเนเธ เธญเธฃเนเธญเธขเน€เธ”เนเธ”เธชเธฐเนเธ!',40.00,'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500',NULL,1),(2,1,'เธเธฃเธฐเน€เธเธฃเธฒเธ—เธฐเน€เธฅ/เธซเธกเธถเธ/เธเธธเนเธ','เน€เธเนเธ”เธฃเนเธญเธ เธ–เธถเธเน€เธเธฃเธทเนเธญเธ',60.00,'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500',NULL,1),(3,1,'เธเนเธฒเธงเธเธฑเธ”เธซเธกเธน','เธเนเธฒเธงเธเธฑเธ”เธซเธญเธกเธเธฃเธธเนเธ',40.00,'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500',NULL,1),(4,1,'เธเนเธฒเธงเธเธฑเธ”เธเธธเนเธ','เธเธธเนเธเธ•เธฑเธงเนเธ•เน€เธ•เนเธกเธเธณ',50.00,'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500',NULL,1),(5,1,'เธเนเธฒเธงเธเธฑเธ”เธ—เธฐเน€เธฅ/เธซเธกเธถเธ/เธเธธเนเธ','เธฃเธงเธกเธกเธดเธ•เธฃเธ—เธฐเน€เธฅเธเธฑเธ”',60.00,'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500',NULL,1),(6,1,'เธเธฑเธ”เธเธฃเธดเธเนเธเธเธซเธกเธน','เธเธฃเธดเธเนเธเธเน€เธเนเธกเธเนเธ',40.00,'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500',NULL,1),(7,1,'เธเธฑเธ”เธเธฃเธดเธเนเธเธเธ—เธฐเน€เธฅ/เธซเธกเธถเธ/เธเธธเนเธ','เธเธฑเธ”เธเนเธฒเธเธ–เธถเธเนเธ',60.00,'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=500',NULL,1),(8,1,'เธเธฑเธ”เธเธฐเธเนเธฒเธซเธกเธน','เธเธฑเธเธเธฃเธญเธ เธซเธกเธนเธเธธเนเธก',40.00,'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500',NULL,1),(9,1,'เธเธฑเธ”เธเธฐเธเนเธฒเธ—เธฐเน€เธฅ/เธซเธกเธถเธ/เธเธธเนเธ','เธเธฐเธเนเธฒเธเธฃเธญเธเธเธฑเธเธเธตเธเธนเนเธ”',60.00,'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=500',NULL,1),(10,1,'เธเนเธฒเธงเธซเธกเธนเธเธฃเธฐเน€เธ—เธตเธขเธก','เธซเธญเธกเธเธฃเธฐเน€เธ—เธตเธขเธกเธเธฃเธดเธเนเธ—เธข',40.00,'https://images.unsplash.com/photo-1606854426282-358c9735d64a?q=80&w=500',NULL,1),(11,1,'เธเนเธฒเธงเนเธเนเน€เธเธตเธขเธงเธซเธกเธนเธชเธฑเธ','เนเธเนเน€เธเธตเธขเธงเธเธนเน เธซเธกเธนเธชเธฑเธเนเธเนเธเน',40.00,'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500',NULL,1),(12,1,'เธเนเธฒเธงเนเธเนเน€เธเธตเธขเธงเธเธธเนเธ','เนเธเนเน€เธเธตเธขเธงเธเธนเธเธฑเธเธเธธเนเธ',50.00,'https://images.unsplash.com/photo-1614361556983-dbbb962de97e?q=80&w=500',NULL,1),(13,3,'เธขเธณเธงเธธเนเธเน€เธชเนเธเธ—เธฐเน€เธฅ','เน€เธเธฃเธตเนเธขเธงเน€เธเนเธ”เนเธเนเธ',70.00,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',NULL,1),(14,2,'เธชเนเธกเธ•เธณเธเธนเธเธฅเธฒเธฃเนเธฒ','เน€เธชเนเธเธกเธฐเธฅเธฐเธเธญเธ”เธดเธ เธกเธฐเน€เธเธทเธญเน€เธ—เธจ เนเธฅเธฐเธเธฃเธดเธ',40.00,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500',NULL,1),(15,2,'เธชเนเธกเธ•เธณเนเธ—เธข','เน€เธเธฃเธตเนเธขเธงเธซเธงเธฒเธ เธชเธฒเธกเธฃเธช',40.00,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500',NULL,1),(16,3,'เธฅเธฒเธเธซเธกเธน','เธซเธญเธกเธเนเธฒเธงเธเธฑเนเธง เนเธเนเธเธ–เธถเธเนเธ',60.00,'https://images.unsplash.com/photo-1544378730-8b5afcb62b88?q=80&w=500',NULL,1),(17,4,'เนเธเนเธ—เธญเธ” (เธเธตเธ)','เธเธฃเธญเธเธเธญเธเธเธธเนเธกเนเธ',20.00,'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500',NULL,1),(18,4,'เนเธเนเธ—เธญเธ” (เธชเธฐเนเธเธ)','เน€เธเธทเนเธญเธเนเธณเน เธเธดเนเธเนเธซเธเน',50.00,'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500',NULL,1),(19,5,'เธเนเธณเน€เธเนเธเธฎเธงเธข','เธซเธงเธฒเธเน€เธขเนเธ เธเธทเนเธเนเธ',20.00,'https://images.unsplash.com/photo-1622760814917-76b9dfa38a7c?q=80&w=500',NULL,1),(20,5,'เนเธเนเธ (Coke)','เธเนเธณเธญเธฑเธ”เธฅเธกเธเนเธฒเธชเธ”เธเธทเนเธ',20.00,'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500',NULL,1),(21,5,'เธชเนเธเธฃเธ—เน (Sprite)','เธเนเธฒ เธชเธ”เธเธทเนเธ เธเธฅเธดเนเธเน€เธฅเธกเธญเธ',20.00,'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500',NULL,1),(22,5,'เธเนเธณเน€เธเธฅเนเธฒ','เธเนเธณเธ”เธทเนเธกเธเธฃเธดเธชเธธเธ—เธเธดเน',10.00,'https://images.unsplash.com/photo-1548839140-29a749e1bc4c?q=80&w=500',NULL,1),(23,1,'เธเนเธฒเธงเน€เธเธฅเนเธฒ','เธเนเธฒเธงเธชเธงเธขเธซเธญเธกเธกเธฐเธฅเธดเธซเธธเธเธชเธธเธ เธฃเนเธญเธเน เธเธธเนเธกเธญเธฃเนเธญเธข',10.00,'/images/kao.jpg',150,1),(24,2,'เธเนเธฒเธงเน€เธซเธเธตเธขเธง','เธเนเธฒเธงเน€เธซเธเธตเธขเธงเธเธธเนเธก เธฃเนเธญเธเน เธซเธญเธกเธญเธฃเนเธญเธข เธ—เธฒเธเธเธนเนเธเธฑเธเธชเนเธกเธ•เธณ เธฅเธฒเธ เนเธเนเธ—เธญเธ”',10.00,'/images/kaon.jpg',160,1),(25,1,'เธเธฐเน€เธเธฃเธฒเธซเธกเธน','เธเธฐเน€เธเธฃเธฒเธซเธกเธนเธชเธฑเธเธเธฑเธ”เธเธฃเธดเธเนเธซเนเธ เธซเธญเธกเธเธธเนเธ เธญเธฃเนเธญเธขเน€เธ”เนเธ”เธชเธฐเนเธ',40.00,'/images/kapaomu.jpg',320,1),(26,1,'เธเธฐเน€เธเธฃเธฒเธ—เธฐเน€เธฅ/เธซเธกเธถเธ/เธเธธเนเธ','เธเธฐเน€เธเธฃเธฒเธเธตเธเธนเนเธ”เธชเธ”เนเธซเธกเน เธเธธเนเธเธเธฅเธฒเธซเธกเธถเธเน€เธ”เนเธ เน€เธเนเธ”เธฃเนเธญเธ เธ–เธถเธเน€เธเธฃเธทเนเธญเธ',60.00,'/images/kapaotaley.jpg',280,1),(27,1,'เธเธฑเธ”เธเธฐเธเนเธฒเธซเธกเธนเธเธฃเธญเธ','เธเธฐเธเนเธฒเธชเธ”เธเธฃเธญเธเธเธฑเธ”เธซเธกเธนเธเธฃเธญเธเธเธดเนเธเนเธ• เธฃเธชเธเธฒเธ•เธดเธเธฅเธกเธเธฅเนเธญเธกเธซเธญเธกเธเนเธณเธกเธฑเธเธซเธญเธข',40.00,'/images/kanamokrop.jpg',380,1),(28,5,'เนเธเนเธ (เธเธฃเธฐเธเนเธญเธ)','เธเนเธณเธญเธฑเธ”เธฅเธกเนเธเนเธ เน€เธขเนเธเธเนเธฒเธชเธ”เธเธทเนเธ',20.00,'/images/coke.jpg',140,1),(29,5,'เธเนเธณเธ”เธทเนเธก','เธเนเธณเธ”เธทเนเธกเธชเธฐเธญเธฒเธ” เธ•เธฃเธฒเธ•เธณเธเธฃเธเธเธดเนเธ',10.00,'/images/water.jpg',0,1),(30,3,'เธเนเธณเธ•เธเธซเธกเธน','เธซเธกเธนเธเธธเนเธก เธซเธญเธกเธกเธฐเธเธฒเธง เธเนเธฒเธงเธเธฑเนเธง เธฃเธชเธเธฑเธ”เธเนเธฒเธ',70.00,'/images/namtokmoo.jpg',200,1);
/*!40000 ALTER TABLE `MENUS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MENU_ALLERGENS`
--

DROP TABLE IF EXISTS `MENU_ALLERGENS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MENU_ALLERGENS` (
  `menu_id` int NOT NULL,
  `allergen_id` int NOT NULL,
  PRIMARY KEY (`menu_id`,`allergen_id`),
  KEY `MENU_ALLERGENS_allergen_id_idx` (`allergen_id`),
  KEY `MENU_ALLERGENS_menu_id_idx` (`menu_id`),
  CONSTRAINT `MENU_ALLERGENS_allergen_id_fkey` FOREIGN KEY (`allergen_id`) REFERENCES `ALLERGENS` (`allergen_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MENU_ALLERGENS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS` (`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MENU_ALLERGENS`
--

LOCK TABLES `MENU_ALLERGENS` WRITE;
/*!40000 ALTER TABLE `MENU_ALLERGENS` DISABLE KEYS */;
INSERT INTO `MENU_ALLERGENS` VALUES (2,1),(14,1),(14,2);
/*!40000 ALTER TABLE `MENU_ALLERGENS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MENU_INGREDIENTS`
--

DROP TABLE IF EXISTS `MENU_INGREDIENTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MENU_INGREDIENTS` (
  `menu_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity_used` decimal(10,2) NOT NULL,
  PRIMARY KEY (`menu_id`,`ingredient_id`),
  KEY `MENU_INGREDIENTS_ingredient_id_idx` (`ingredient_id`),
  KEY `MENU_INGREDIENTS_menu_id_idx` (`menu_id`),
  CONSTRAINT `MENU_INGREDIENTS_ingredient_id_fkey` FOREIGN KEY (`ingredient_id`) REFERENCES `INGREDIENTS` (`ingredient_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MENU_INGREDIENTS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS` (`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MENU_INGREDIENTS`
--

LOCK TABLES `MENU_INGREDIENTS` WRITE;
/*!40000 ALTER TABLE `MENU_INGREDIENTS` DISABLE KEYS */;
INSERT INTO `MENU_INGREDIENTS` VALUES (1,5,0.15),(1,11,0.01),(1,12,0.01),(1,14,0.02),(1,24,0.15),(2,6,0.15),(2,11,0.01),(2,12,0.01),(2,14,0.02),(2,24,0.15),(3,5,0.10),(3,13,0.02),(3,23,1.00),(3,24,0.18),(4,6,0.12),(4,13,0.02),(4,23,1.00),(4,24,0.18),(5,6,0.14),(5,13,0.02),(5,23,1.00),(5,24,0.18),(6,5,0.12),(6,15,0.03),(6,21,0.03),(6,24,0.15),(7,6,0.14),(7,15,0.03),(7,21,0.03),(7,24,0.15),(8,7,0.10),(8,11,0.01),(8,12,0.01),(8,13,0.10),(8,24,0.15),(9,6,0.14),(9,12,0.01),(9,13,0.10),(9,24,0.15),(10,5,0.14),(10,12,0.02),(10,24,0.15),(11,5,0.06),(11,23,2.00),(11,24,0.15),(12,6,0.06),(12,23,2.00),(12,24,0.15),(13,5,0.04),(13,6,0.12),(13,16,0.03),(13,17,1.00),(13,19,0.02),(13,22,1.00),(14,2,1.00),(14,10,0.20),(14,11,0.02),(14,15,0.02),(14,16,0.03),(14,17,1.00),(14,18,0.05),(15,10,0.20),(15,11,0.02),(15,16,0.03),(15,17,1.00),(15,19,0.02),(15,20,0.01),(16,5,0.15),(16,17,1.00),(16,27,0.01),(16,28,0.01),(17,9,0.20),(17,26,0.02),(18,8,0.25),(18,26,0.03),(19,29,1.00),(20,30,1.00),(21,31,1.00),(22,32,1.00),(23,24,0.15),(24,25,0.15),(25,5,0.15),(25,11,0.01),(25,12,0.01),(25,14,0.02),(25,24,0.15),(26,6,0.15),(26,11,0.01),(26,12,0.01),(26,14,0.02),(26,24,0.15),(27,7,0.10),(27,11,0.01),(27,12,0.01),(27,13,0.10),(27,24,0.15),(28,30,1.00),(29,32,1.00),(30,5,0.03),(30,7,0.15),(30,8,0.02),(30,9,0.02),(30,10,0.02),(30,11,0.01),(30,12,0.02);
/*!40000 ALTER TABLE `MENU_INGREDIENTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ORDERS`
--

DROP TABLE IF EXISTS `ORDERS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ORDERS` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `promo_id` int DEFAULT NULL,
  `order_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`order_id`),
  KEY `ORDERS_user_id_idx` (`user_id`),
  KEY `ORDERS_table_id_idx` (`table_id`),
  KEY `ORDERS_promo_id_fkey` (`promo_id`),
  KEY `ORDERS_status_idx` (`status`),
  KEY `ORDERS_created_at_idx` (`created_at`),
  CONSTRAINT `ORDERS_promo_id_fkey` FOREIGN KEY (`promo_id`) REFERENCES `PROMOTIONS` (`promo_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ORDERS_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `TABLES` (`table_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ORDERS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ORDERS`
--

LOCK TABLES `ORDERS` WRITE;
/*!40000 ALTER TABLE `ORDERS` DISABLE KEYS */;
INSERT INTO `ORDERS` VALUES (1,3,5,NULL,'In-store','Served',150.00,'2026-09-05 08:18:10.703'),(3,NULL,NULL,NULL,'DINE_IN','PENDING',40.00,'2026-09-21 16:33:56.183'),(4,NULL,NULL,NULL,'DINE_IN','PENDING',40.00,'2026-09-21 16:33:56.237');
/*!40000 ALTER TABLE `ORDERS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ORDER_ITEMS`
--

DROP TABLE IF EXISTS `ORDER_ITEMS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ORDER_ITEMS` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unit_price` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_item_id`),
  KEY `ORDER_ITEMS_order_id_idx` (`order_id`),
  KEY `ORDER_ITEMS_menu_id_idx` (`menu_id`),
  CONSTRAINT `ORDER_ITEMS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS` (`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ORDER_ITEMS_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ORDER_ITEMS`
--

LOCK TABLES `ORDER_ITEMS` WRITE;
/*!40000 ALTER TABLE `ORDER_ITEMS` DISABLE KEYS */;
INSERT INTO `ORDER_ITEMS` VALUES (1,1,14,1,NULL,'2026-09-21 16:33:01.910',0),(2,1,18,1,NULL,'2026-09-21 16:33:01.910',0),(3,1,2,1,'เน€เธเนเธ”เธเธฅเธฒเธ | เนเธเนเธ”เธฒเธงเนเธกเนเธชเธธเธ','2026-09-21 16:33:01.910',0),(4,3,25,1,'เธฃเธนเธเนเธเธ: เธเธฑเธเธเนเธฒเธง','2026-09-21 16:33:56.183',40),(5,4,25,1,'เธฃเธนเธเนเธเธ: เธฃเธฒเธ”เธเนเธฒเธง','2026-09-21 16:33:56.237',40);
/*!40000 ALTER TABLE `ORDER_ITEMS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `ORDER_SUMMARIES_VIEW`
--

DROP TABLE IF EXISTS `ORDER_SUMMARIES_VIEW`;
/*!50001 DROP VIEW IF EXISTS `ORDER_SUMMARIES_VIEW`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ORDER_SUMMARIES_VIEW` AS SELECT 
 1 AS `order_id`,
 1 AS `table_number`,
 1 AS `total_price`,
 1 AS `status`,
 1 AS `order_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `PROMOTIONS`
--

DROP TABLE IF EXISTS `PROMOTIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PROMOTIONS` (
  `promo_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `expiry_date` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`promo_id`),
  UNIQUE KEY `PROMOTIONS_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PROMOTIONS`
--

LOCK TABLES `PROMOTIONS` WRITE;
/*!40000 ALTER TABLE `PROMOTIONS` DISABLE KEYS */;
INSERT INTO `PROMOTIONS` VALUES (1,'WELCOME20','Percentage',20.00,300.00,'2026-12-31 23:59:59.000','2026-09-21 16:33:01.939'),(2,'ZING50','Fixed',50.00,300.00,'2026-10-31 23:59:59.000','2026-09-23 09:32:28.018'),(3,'SEP10','Percentage',10.00,200.00,'2026-09-30 23:59:59.000','2026-09-23 09:32:28.018'),(4,'WELCOME100','Fixed',100.00,500.00,'2026-12-31 23:59:59.000','2026-09-23 09:32:28.018'),(5,'FREESHIP','Fixed',30.00,250.00,'2026-12-31 23:59:59.000','2026-09-23 09:32:28.018');
/*!40000 ALTER TABLE `PROMOTIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STORE_SETTINGS`
--

DROP TABLE IF EXISTS `STORE_SETTINGS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `STORE_SETTINGS` (
  `id` int NOT NULL,
  `store_name` varchar(150) NOT NULL DEFAULT 'เธฃเนเธฒเธเธ•เธณเธเธฃเธเธเธดเนเธ (Tum Krok Zing)',
  `tagline` varchar(255) DEFAULT 'เนเธเนเธเธเธฑเธง เธ–เธถเธเนเธ เธญเธฒเธซเธฒเธฃเธญเธตเธชเธฒเธเนเธ—เนเธฃเธชเน€เธ”เนเธ”',
  `promptpay_number` varchar(50) DEFAULT '081-234-5678',
  `promptpay_name` varchar(150) DEFAULT 'เธเธฒเธขเธเธตเธฃเธงเธฑเธ’เธเน เนเธชเธเธเธณเน€เธฎเธตเธขเธ (เธ•เธณเธเธฃเธเธเธดเนเธ)',
  `tax_id` varchar(50) DEFAULT '0105566099881',
  `address` varchar(255) DEFAULT '123/45 เธ–เธเธเนเธเนเธเธงเธฑเธ’เธเธฐ เนเธเธงเธเธ—เธธเนเธเธชเธญเธเธซเนเธญเธ เน€เธเธ•เธซเธฅเธฑเธเธชเธตเน เธเธฃเธธเธเน€เธ—เธเธกเธซเธฒเธเธเธฃ 10210',
  `phone` varchar(100) DEFAULT '02-987-6543, 081-234-5678',
  `open_time` varchar(20) DEFAULT '10:30',
  `close_time` varchar(20) DEFAULT '22:00',
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  `vat_rate` decimal(5,2) DEFAULT '7.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STORE_SETTINGS`
--

LOCK TABLES `STORE_SETTINGS` WRITE;
/*!40000 ALTER TABLE `STORE_SETTINGS` DISABLE KEYS */;
INSERT INTO `STORE_SETTINGS` VALUES (1,'เธฃเนเธฒเธเธ•เธณเธเธฃเธเธเธดเนเธ (Tum Krok Zing)','เนเธเนเธเธเธฑเธง เธ–เธถเธเนเธ เธญเธฒเธซเธฒเธฃเธญเธตเธชเธฒเธเนเธ—เนเธฃเธชเน€เธ”เนเธ”','081-234-5678','เธเธฒเธขเธเธตเธฃเธงเธฑเธ’เธเน เนเธชเธเธเธณเน€เธฎเธตเธขเธ (เธ•เธณเธเธฃเธเธเธดเนเธ)','0105566099881','123/45 เธ–เธเธเนเธเนเธเธงเธฑเธ’เธเธฐ เนเธเธงเธเธ—เธธเนเธเธชเธญเธเธซเนเธญเธ เน€เธเธ•เธซเธฅเธฑเธเธชเธตเน เธเธฃเธธเธเน€เธ—เธเธกเธซเธฒเธเธเธฃ 10210','02-987-6543, 081-234-5678','10:30','22:00',1,7.00,'2026-09-21 16:33:47');
/*!40000 ALTER TABLE `STORE_SETTINGS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TABLES`
--

DROP TABLE IF EXISTS `TABLES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TABLES` (
  `table_id` int NOT NULL AUTO_INCREMENT,
  `table_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TABLES`
--

LOCK TABLES `TABLES` WRITE;
/*!40000 ALTER TABLE `TABLES` DISABLE KEYS */;
INSERT INTO `TABLES` VALUES (1,'T-01',4,'AVAILABLE'),(2,'T-02',2,'AVAILABLE'),(3,'T-03',4,'AVAILABLE'),(4,'T-04',8,'AVAILABLE'),(5,'T-05',2,'OCCUPIED');
/*!40000 ALTER TABLE `TABLES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `TOP_SELLING_MENUS_VIEW`
--

DROP TABLE IF EXISTS `TOP_SELLING_MENUS_VIEW`;
/*!50001 DROP VIEW IF EXISTS `TOP_SELLING_MENUS_VIEW`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `TOP_SELLING_MENUS_VIEW` AS SELECT 
 1 AS `menu_id`,
 1 AS `menu_name`,
 1 AS `category_name`,
 1 AS `total_sold`,
 1 AS `total_revenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `TRANSACTIONS`
--

DROP TABLE IF EXISTS `TRANSACTIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TRANSACTIONS` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_slip_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `TRANSACTIONS_order_id_idx` (`order_id`),
  KEY `TRANSACTIONS_payment_status_idx` (`payment_status`),
  CONSTRAINT `TRANSACTIONS_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSACTIONS`
--

LOCK TABLES `TRANSACTIONS` WRITE;
/*!40000 ALTER TABLE `TRANSACTIONS` DISABLE KEYS */;
INSERT INTO `TRANSACTIONS` VALUES (1,1,150.00,'PromptPay','Completed',NULL);
/*!40000 ALTER TABLE `TRANSACTIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `TRANSACTION_RECEIPTS_VIEW`
--

DROP TABLE IF EXISTS `TRANSACTION_RECEIPTS_VIEW`;
/*!50001 DROP VIEW IF EXISTS `TRANSACTION_RECEIPTS_VIEW`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `TRANSACTION_RECEIPTS_VIEW` AS SELECT 
 1 AS `transaction_id`,
 1 AS `order_id`,
 1 AS `customer_name`,
 1 AS `total_amount`,
 1 AS `payment_method`,
 1 AS `payment_status`,
 1 AS `payment_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `USERS`
--

DROP TABLE IF EXISTS `USERS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USERS` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Customer',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `USERS_username_key` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USERS`
--

LOCK TABLES `USERS` WRITE;
/*!40000 ALTER TABLE `USERS` DISABLE KEYS */;
INSERT INTO `USERS` VALUES (1,'admin_tumkrok','hashed_password','admin@tumkrokzing.com','0800000001',NULL,'Admin'),(2,'staff_kitchen','hashed_password','staff@tumkrokzing.com','0800000002',NULL,'Staff'),(3,'sirichok_k','hashed_password','sirichok@gmail.com','0812345678',NULL,'Customer'),(5,'test003','$2b$10$GmprtufiOLIz5.RHfEOD2uN2/Xl.ovm/.hu7LteT1Ch0z2sgf2xJC','test@gmail.com','0123456789','313/221','Customer'),(6,'admin','$2b$10$FugQm0/R2Kp.Dr0TJNw.uu3uYuCzoSH1Ta/2uoAqteENM17.cTYHy','admin@tumkrokzing.com','0812345678',NULL,'ADMIN'),(7,'kitchen','$2b$10$t.eKUzkd4zaptMnB/PvV8OkQvXKSp20uIyAdrlezT3L4ZGocHin9W','kitchen@tumkrokzing.com','0899998888',NULL,'KITCHEN'),(8,'somchai','$2b$10$CKuRb.sYoEzvvhjrDpxfw.ut5PSXxaacsumAeAQUK1DQLSK.QFSgy','somchai@example.com','0811112222','เธ•เธฅเธฒเธ”เธเธฒเธเน€เธเธฃเนเธ” เธเธเธ—เธเธธเธฃเธต','CUSTOMER'),(9,'rider','$2b$10$.5hKu./Ew4rt9qY1kgpXjuLakXtSFWzciRmMEpgA5GtFl4cBcBf/W','rider@tumkrokzing.com','0877776666','เธเธฃเธฐเธเธณเธฃเนเธฒเธเธ•เธณเธเธฃเธเธเธดเนเธ','RIDER');
/*!40000 ALTER TABLE `USERS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USER_ACTIVE_SESSIONS`
--

DROP TABLE IF EXISTS `USER_ACTIVE_SESSIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER_ACTIVE_SESSIONS` (
  `user_id` int NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER_ACTIVE_SESSIONS`
--

LOCK TABLES `USER_ACTIVE_SESSIONS` WRITE;
/*!40000 ALTER TABLE `USER_ACTIVE_SESSIONS` DISABLE KEYS */;
/*!40000 ALTER TABLE `USER_ACTIVE_SESSIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USER_CLAIMED_PROMOTIONS`
--

DROP TABLE IF EXISTS `USER_CLAIMED_PROMOTIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER_CLAIMED_PROMOTIONS` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `promo_id` int NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `claimed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_promo` (`user_id`,`promo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER_CLAIMED_PROMOTIONS`
--

LOCK TABLES `USER_CLAIMED_PROMOTIONS` WRITE;
/*!40000 ALTER TABLE `USER_CLAIMED_PROMOTIONS` DISABLE KEYS */;
/*!40000 ALTER TABLE `USER_CLAIMED_PROMOTIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('6f64eff6-006c-4e84-b22b-1d0d1c8ee140','d169f681718458b7f62399ec973e7bd6f07635de04b1f9ff8369c04a295499f4','2026-09-05 08:18:07.621','20260820142003_init_all_tables',NULL,NULL,'2026-09-05 08:18:06.514',1),('a11fb4ea-391b-49c9-a752-bb8c28318fe0','7b5fba44c3b9bae8a5df15922365f28085dd9247282c6c27d69685be4140422b','2026-09-05 08:18:09.425','20260903114343_create_views',NULL,NULL,'2026-09-05 08:18:09.374',1),('baa2452e-5a14-4455-a232-a5a0e222dab0','1269b53fffa149a8566cb13e7808ee695d6083153e339b99282104b976e8199a','2026-09-05 08:18:09.087','20260820143440_init_data_dictionary',NULL,NULL,'2026-09-05 08:18:07.636',1),('d2d7126d-85ea-4c88-a478-2a2d00d924c7','b593e06aefce3615d98c2d5aba0703190a93a8fa88e8fa4910ad8d46de967a53','2026-09-05 08:18:09.361','20260903114252_update_schema',NULL,NULL,'2026-09-05 08:18:09.102',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'tum_krok_zing'
--

--
-- Current Database: `tum_krok_zing`
--

USE `tum_krok_zing`;

--
-- Final view structure for view `LIVE_TABLE_STATUS_VIEW`
--

/*!50001 DROP VIEW IF EXISTS `LIVE_TABLE_STATUS_VIEW`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `LIVE_TABLE_STATUS_VIEW` AS select `t`.`table_id` AS `table_id`,`t`.`table_number` AS `table_number`,`t`.`capacity` AS `capacity`,`t`.`status` AS `current_status`,`o`.`order_id` AS `current_order_id`,`o`.`total_price` AS `current_total` from (`TABLES` `t` left join `ORDERS` `o` on(((`t`.`table_id` = `o`.`table_id`) and (`o`.`status` in ('PENDING','PREPARING','SERVED'))))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `LOW_STOCK_ALERTS_VIEW`
--

/*!50001 DROP VIEW IF EXISTS `LOW_STOCK_ALERTS_VIEW`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `LOW_STOCK_ALERTS_VIEW` AS select `i`.`ingredient_id` AS `ingredient_id`,`i`.`ingredient_name` AS `ingredient_name`,`i`.`quantity_in_stock` AS `quantity_in_stock`,`i`.`reorder_level` AS `reorder_level`,`i`.`unit` AS `unit` from `INGREDIENTS` `i` where (`i`.`quantity_in_stock` <= `i`.`reorder_level`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ORDER_SUMMARIES_VIEW`
--

/*!50001 DROP VIEW IF EXISTS `ORDER_SUMMARIES_VIEW`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `ORDER_SUMMARIES_VIEW` AS select `o`.`order_id` AS `order_id`,`t`.`table_number` AS `table_number`,`o`.`total_price` AS `total_price`,`o`.`status` AS `status`,`o`.`created_at` AS `order_date` from (`ORDERS` `o` left join `TABLES` `t` on((`o`.`table_id` = `t`.`table_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TOP_SELLING_MENUS_VIEW`
--

/*!50001 DROP VIEW IF EXISTS `TOP_SELLING_MENUS_VIEW`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `TOP_SELLING_MENUS_VIEW` AS select `m`.`menu_id` AS `menu_id`,`m`.`menu_name` AS `menu_name`,coalesce(`c`.`category_name`,'เธ—เธฑเนเธงเนเธ') AS `category_name`,cast(coalesce(sum(`oi`.`quantity`),0) as signed) AS `total_sold`,cast(coalesce(sum((`oi`.`quantity` * `oi`.`unit_price`)),0) as decimal(10,2)) AS `total_revenue` from ((`MENUS` `m` left join `CATEGORIES` `c` on((`m`.`category_id` = `c`.`category_id`))) left join `ORDER_ITEMS` `oi` on((`m`.`menu_id` = `oi`.`menu_id`))) group by `m`.`menu_id`,`m`.`menu_name`,`c`.`category_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TRANSACTION_RECEIPTS_VIEW`
--

/*!50001 DROP VIEW IF EXISTS `TRANSACTION_RECEIPTS_VIEW`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `TRANSACTION_RECEIPTS_VIEW` AS select `tr`.`transaction_id` AS `transaction_id`,`tr`.`order_id` AS `order_id`,coalesce(`u`.`username`,'เธฅเธนเธเธเนเธฒเธ—เธฑเนเธงเนเธ') AS `customer_name`,`tr`.`amount` AS `total_amount`,`tr`.`payment_method` AS `payment_method`,`tr`.`payment_status` AS `payment_status`,`o`.`created_at` AS `payment_date` from ((`TRANSACTIONS` `tr` left join `ORDERS` `o` on((`tr`.`order_id` = `o`.`order_id`))) left join `USERS` `u` on((`o`.`user_id` = `u`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 10:01:11
