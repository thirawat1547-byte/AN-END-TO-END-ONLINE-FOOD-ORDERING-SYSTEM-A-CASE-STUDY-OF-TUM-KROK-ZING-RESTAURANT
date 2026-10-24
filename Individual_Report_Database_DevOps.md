# รายงานผลงานรายบุคคล (Individual Report)
# ส่วนที่ 4: Database & DevOps
## ระบบสั่งอาหารออนไลน์แบบครบวงจร — กรณีศึกษาร้านตำครกซิ่ง (Tum Krok Zing)

---

## สารบัญ

1. [ข้อมูลทั่วไปของโปรเจค](#1-ข้อมูลทั่วไปของโปรเจค)
2. [ส่วนของฐานข้อมูล (Database)](#2-ส่วนของฐานข้อมูล-database)
   - 2.1 ระบบจัดการฐานข้อมูลที่ใช้ (DBMS)
   - 2.2 โครงสร้างตาราง (Database Schema / Data Dictionary)
   - 2.3 ER-Diagram / แบบจำลองความสัมพันธ์
   - 2.4 Database Views
   - 2.5 ORM / Migration Strategy
   - 2.6 Seed Data (ข้อมูลเริ่มต้น)
   - 2.7 SQL Dump File
3. [ส่วนของ DevOps](#3-ส่วนของ-devops)
   - 3.1 Version Control (Git / GitHub)
   - 3.2 Branching Strategy
   - 3.3 Containerization (Docker)
   - 3.4 CI/CD Pipeline (GitHub Actions)
   - 3.5 Reverse Proxy (Nginx)
   - 3.6 Cloud Infrastructure (OCI)
   - 3.7 Automated Backup
   - 3.8 Server Monitoring
   - 3.9 Environment Management
4. [สรุปภาพรวม Architecture](#4-สรุปภาพรวม-architecture)

---

## 1. ข้อมูลทั่วไปของโปรเจค

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อโปรเจค** | ระบบสั่งอาหารออนไลน์แบบครบวงจร — กรณีศึกษาร้านตำครกซิ่ง (An End-to-End Online Food Ordering System — A Case Study of Tum Krok Zing Restaurant) |
| **ประเภทระบบ** | Full-Stack Web Application (Online Food Ordering System) |
| **URL ระบบ** | https://tumkrokzing.duckdns.org |
| **GitHub Repository** | https://github.com/thirawat1547-byte/AN-END-TO-END-ONLINE-FOOD-ORDERING-SYSTEM-A-CASE-STUDY-OF-TUM-KROK-ZING-RESTAURANT |
| **Technology Stack** | Frontend: Vue.js + Vite / Backend: NestJS (TypeScript) / Database: MySQL 8.0 / ORM: Prisma |
| **Deployment** | Oracle Cloud Infrastructure (OCI) + Docker + Nginx |

---

## 2. ส่วนของฐานข้อมูล (Database)

### 2.1 ระบบจัดการฐานข้อมูลที่ใช้ (DBMS)

| รายการ | รายละเอียด |
|--------|-----------|
| **DBMS** | MySQL 8.0 |
| **Docker Image** | `mysql:8.0` |
| **Character Set** | `utf8mb4` (รองรับภาษาไทยและอิโมจิ) |
| **Collation** | `utf8mb4_unicode_ci` |
| **Storage Engine** | InnoDB (รองรับ Transaction และ Foreign Key) |
| **ORM** | Prisma Client 5.22+ (ใช้จัดการ Schema, Migration, และ Query) |
| **Connection Port** | 3306 (ภายใน Docker) / 3307 (Production Host) / 3308 (Staging Host) |

**เหตุผลที่เลือก MySQL 8.0:**
- เป็น RDBMS ที่เป็นมาตรฐานอุตสาหกรรม มีความเสถียรสูง เหมาะกับระบบร้านอาหารที่ต้องจัดการข้อมูลคำสั่งซื้อ สต็อกวัตถุดิบ และธุรกรรมการเงินอย่างถูกต้อง
- รองรับ ACID Transaction อย่างสมบูรณ์ ทำให้การชำระเงินและตัดสต็อกมีความน่าเชื่อถือ
- รองรับ Database Views ซึ่งใช้สรุปข้อมูลเชิงวิเคราะห์สำหรับหน้า Admin Dashboard

---

### 2.2 โครงสร้างตาราง (Database Schema / Data Dictionary)

ระบบมีตารางทั้งหมด **17 ตาราง** ตามหลักสถาปัตยกรรมฐานข้อมูลเชิงสัมพันธ์ระดับ 3NF (Third Normal Form) แบ่งออกเป็นหมวดหมู่ดังนี้:

#### 1. ตารางหลักและจัดการอาหาร (Core & Menu Management: 6 ตาราง)

| # | ชื่อตาราง | คำอธิบาย | Primary Key | สัมพันธ์กับตารางอื่น |
|---|----------|---------|-------------|-------------------|
| 1 | **USERS** | ข้อมูลผู้ใช้งานระบบ (Admin, Staff, Customer, Rider) | `user_id` (Auto Increment) | → ORDERS, DELIVERIES |
| 2 | **TABLES** | ข้อมูลโต๊ะอาหารภายในร้าน (ความจุ, สถานะว่าง/ใช้งาน/รอเช็คบิล) | `table_id` (Auto Increment) | → ORDERS |
| 3 | **CATEGORIES** | หมวดหมู่อาหาร 5 หมวด | `category_id` (Auto Increment) | → MENUS |
| 4 | **MENUS** | เมนูอาหาร ราคา รูปภาพ แคลอรี สถานะพร้อมขาย | `menu_id` (Auto Increment) | → CATEGORIES, ORDER_ITEMS, MENU_ALLERGENS, MENU_INGREDIENTS, MENU_OPTION_GROUPS |
| 5 | **ALLERGENS** | สารก่อภูมิแพ้ 5 ชนิด | `allergen_id` (Auto Increment) | → MENU_ALLERGENS |
| 6 | **MENU_ALLERGENS** | ตาราง Junction เชื่อมเมนูกับสารก่อภูมิแพ้ (Many-to-Many) | `(menu_id, allergen_id)` Composite PK | → MENUS, ALLERGENS |

#### 2. ตารางตัวเลือกอาหารและท็อปปิ้ง (Menu Options & Customizations: 3 ตาราง)

| # | ชื่อตาราง | คำอธิบาย | Primary Key | สัมพันธ์กับตารางอื่น |
|---|----------|---------|-------------|-------------------|
| 7 | **MENU_OPTION_GROUPS** | กลุ่มตัวเลือกอาหาร (เช่น ระดับความเผ็ด, รูปแบบจาน, ท็อปปิ้งไข่) พร้อมกฎ required/multiple | `group_id` (Auto Increment) | → MENUS, MENU_OPTIONS |
| 8 | **MENU_OPTIONS** | รายการตัวเลือกย่อยและราคาบวกเพิ่ม (เช่น ไม่เผ็ด 0฿, กับข้าว +15฿, ไข่ดาว +10฿) | `option_id` (Auto Increment) | → MENU_OPTION_GROUPS, ORDER_ITEM_OPTIONS |
| 9 | **ORDER_ITEM_OPTIONS** | ประวัติ Snapshot ตัวเลือกและราคาของจานที่สั่งจริง ณ เวลาทำรายการ (Audit Trail) | `item_option_id` (Auto Increment) | → ORDER_ITEMS (Cascade Delete), MENU_OPTIONS |

#### 3. ตารางสูตรและคลังวัตถุดิบ (Inventory & Recipe: 2 ตาราง)

| # | ชื่อตาราง | คำอธิบาย | Primary Key | สัมพันธ์กับตารางอื่น |
|---|----------|---------|-------------|-------------------|
| 10 | **INGREDIENTS** | คลังวัตถุดิบ จำนวนคงเหลือ หน่วยนับ จุดสั่งซื้อซ้ำ | `ingredient_id` (Auto Increment) | → MENU_INGREDIENTS |
| 11 | **MENU_INGREDIENTS** | สูตรอาหาร ปริมาณวัตถุดิบที่ใช้ตัดสต็อกต่อเมนู (Many-to-Many) | `(menu_id, ingredient_id)` Composite PK | → MENUS, INGREDIENTS |

#### 4. ตารางการสั่งซื้อ ธุรกรรม และการจัดส่ง (Orders, Payments & Logistics: 5 ตาราง)

| # | ชื่อตาราง | คำอธิบาย | Primary Key | สัมพันธ์กับตารางอื่น |
|---|----------|---------|-------------|-------------------|
| 12 | **PROMOTIONS** | โค้ดส่วนลดและโปรโมชั่น (ส่วนลดแบบ % และบาท, ยอดสั่งขั้นต่ำ) | `promo_id` (Auto Increment) | → ORDERS |
| 13 | **ORDERS** | คำสั่งซื้อของลูกค้า/โต๊ะ บันทึกยอดการเงินแยกมิติ (subtotal, discount, delivery_fee) | `order_id` (Auto Increment) | → USERS, TABLES, PROMOTIONS, ORDER_ITEMS, TRANSACTIONS, DELIVERIES |
| 14 | **ORDER_ITEMS** | รายการอาหารย่อยในแต่ละออเดอร์ (จำนวน, ราคาต่อหน่วย, โน้ต) | `order_item_id` (Auto Increment) | → ORDERS (Cascade Delete), MENUS, ORDER_ITEM_OPTIONS |
| 15 | **TRANSACTIONS** | ประวัติการชำระเงิน (ยอดเงิน, ช่องทาง PromptPay/บัตร/เงินสด, สถานะ) | `transaction_id` (Auto Increment) | → ORDERS |
| 16 | **DELIVERIES** | ข้อมูลการจัดส่งเดลิเวอรี (สถานะ, ไรเดอร์ที่รับงาน, พิกัด GPS, ค่ารอบ rider_fee) (1:1) | `delivery_id` (Auto Increment) | → ORDERS (1:1), USERS (Rider) |

#### 5. ตารางตั้งค่าระบบ (Configuration: 1 ตาราง)

| # | ชื่อตาราง | คำอธิบาย | Primary Key |
|---|----------|---------|-------------|
| 17 | **STORE_SETTINGS** | ข้อมูลร้านค้า เวลาเปิด/ปิด (open_time, close_time), สวิตช์เปิด/ปิดร้าน (is_open), ค่าจัดส่งพื้นฐาน (base_delivery_fee), ค่าส่งต่อ กม. (delivery_fee_per_km), ค่ารอบไรเดอร์ (rider_fee), PromptPay, VAT (Singleton Pattern) | `id` (Default = 1) |

---

#### รายละเอียดโครงสร้างตารางทางการเงินและการจัดส่ง

**สูตรการคำนวณทางการเงิน (Financial Formula):**
$$\text{total_price} = \text{subtotal} - \text{discount_amount} + \text{delivery_fee}$$

**ตาราง ORDERS (คำสั่งซื้อ):**

| คอลัมน์ | ชนิดข้อมูล | ข้อจำกัด | คำอธิบาย |
|---------|-----------|---------|---------|
| order_id | INT | PK, Auto Increment | รหัสคำสั่งซื้อ |
| user_id | INT | FK → USERS, NULL | รหัสลูกค้าสมาชิก (NULL หากเป็นลูกค้าโต๊ะทั่วไป) |
| table_id | INT | FK → TABLES, NULL | รหัสโต๊ะ (NULL หากเป็นออเดอร์เดลิเวอรี) |
| promo_id | INT | FK → PROMOTIONS, NULL | รหัสโปรโมชั่นที่ใช้ |
| order_type | VARCHAR(20) | NOT NULL | ประเภท (`DINE_IN`, `DELIVERY`, `TAKEAWAY`) |
| status | VARCHAR(30) | NOT NULL, INDEXED | สถานะการเตรียมอาหาร (`PENDING` → `COOKING` → `READY` → `SERVED` / `IN_DELIVERY` → `COMPLETED`) |
| subtotal | DECIMAL(10,2) | DEFAULT 0 | ยอดรวมค่าอาหารและท็อปปิ้งก่อนหักส่วนลด |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | ยอดส่วนลดโปรโมชั่น |
| delivery_fee | DECIMAL(10,2) | DEFAULT 0 | ค่าจัดส่งเดลิเวอรี |
| total_price | DECIMAL(10,2) | NOT NULL | ยอดสุทธิหลังคำนวณตามสูตรทางการเงิน |
| delivery_address | VARCHAR(255) | NULL | ที่อยู่จัดส่งเดลิเวอรีประจำบิล |
| delivery_phone | VARCHAR(20) | NULL | เบอร์โทรศัพท์ผู้รับประจำบิล |
| order_notes | VARCHAR(255) | NULL | บันทึกคำสั่งพิเศษประจำบิล |
| created_at | DATETIME | DEFAULT NOW() | วันเวลาที่สร้างออเดอร์ |
| updated_at | DATETIME | Auto Update | วันเวลาที่อัปเดตสถานะล่าสุด |

**ตาราง DELIVERIES (การจัดส่งเดลิเวอรี):**

| คอลัมน์ | ชนิดข้อมูล | ข้อจำกัด | คำอธิบาย |
|---------|-----------|---------|---------|
| delivery_id | INT | PK, Auto Increment | รหัสการจัดส่ง |
| order_id | INT | FK → ORDERS, UNIQUE | รหัสออเดอร์ (เชื่อมโยงแบบ 1:1) |
| rider_id | INT | FK → USERS, NULL | รหัสผู้ขับขี่ไรเดอร์ที่กดรับงาน |
| delivery_status | VARCHAR(30) | DEFAULT 'PENDING_RIDER' | สถานะจัดส่ง (`PENDING_RIDER`, `CLAIMED`, `PICKED_UP`, `DELIVERED`, `CANCELLED`) |
| delivery_address | VARCHAR(255) | NULL | ที่อยู่ส่งมอบ |
| delivery_phone | VARCHAR(20) | NULL | เบอร์โทรผู้รับ |
| delivery_lat | DECIMAL(10,7) | NULL | ละติจูด GPS ปักหมุด |
| delivery_lng | DECIMAL(10,7) | NULL | ลองจิจูด GPS ปักหมุด |
| rider_fee | DECIMAL(10,2) | DEFAULT 25.00 | ค่ารอบตอบแทนสำหรับไรเดอร์ต่อเที่ยว |
| proof_image_url | VARCHAR(255) | NULL | ลิงก์รูปถ่ายส่งมอบอาหารเป็นหลักฐาน |
| claimed_at | DATETIME | NULL | เวลาที่ไรเดอร์กดรับงาน |
| delivered_at | DATETIME | NULL | เวลาที่ส่งมอบอาหารสำเร็จ |

---

### 2.3 ER-Diagram / แบบจำลองความสัมพันธ์ และ Unified State Lifecycle Matrix

#### 1. ความสัมพันธ์หลักระหว่างตาราง (17 Tables Architecture)

```
USERS (1) ──────── (N) ORDERS
TABLES (1) ──────── (N) ORDERS
PROMOTIONS (1) ──── (N) ORDERS
CATEGORIES (1) ──── (N) MENUS
ORDERS (1) ──────── (N) ORDER_ITEMS          [Cascade Delete]
ORDERS (1) ──────── (N) TRANSACTIONS         [1:N Architecture for Re-attempts & Split-Bill]
ORDERS (1) ──────── (1) DELIVERIES           [1:1 Dedicated Delivery Record]
USERS (Rider) (1) ─ (N) DELIVERIES           [Rider Delivery Assignment]
MENUS (1) ───────── (N) ORDER_ITEMS
MENUS (1) ───────── (N) MENU_OPTION_GROUPS   [Cascade Delete]
MENU_OPTION_GROUPS (1) ── (N) MENU_OPTIONS   [Cascade Delete]
ORDER_ITEMS (1) ─── (N) ORDER_ITEM_OPTIONS   [Cascade Delete Price Snapshot]
MENU_OPTIONS (1) ── (N) ORDER_ITEM_OPTIONS   [Set Null Audit Snapshot]

MENUS (M) ←──── MENU_ALLERGENS ────→ (N) ALLERGENS      [Many-to-Many]
MENUS (M) ←──── MENU_INGREDIENTS ──→ (N) INGREDIENTS    [Many-to-Many]
```

#### 2. Unified State Lifecycle Matrix (แยกขอบเขตสถานะเด็ดขาด)

เพื่อความถูกต้องตามหลักสถาปัตยกรรม ระบบแยกมิติของ **สถานะการปรุงอาหาร (Fulfillment)** ออกจาก **สถานะทางการเงิน (Payment)** และ **สถานะการจัดส่ง (Delivery)** อย่างเด็ดขาด:

| มิติระบบ | ฟิลด์สถานะ | ค่าสถานะที่เป็นไปได้ | ความหมายและบทบาท |
|---------|-----------|--------------------|-----------------|
| **การปรุงอาหาร (Kitchen)** | `ORDERS.status` | `PENDING` → `COOKING` → `READY` → `SERVED` / `IN_DELIVERY` → `COMPLETED` (หรือ `CANCELLED`) | สถานะการเตรียมอาหารในครัว ห้ามนำสถานะ `PAID` มาปะปนในฟิลด์นี้ |
| **การเงิน (Finance)** | `TRANSACTIONS.payment_status` | `PENDING` → `COMPLETED` / `FAILED` / `REFUNDED` | สถานะการชำระเงินจริง รองรับการทำรายการซ้ำ (Re-attempt) หากยอดแรกไม่สำเร็จ |
| **การจัดส่ง (Logistics)** | `DELIVERIES.delivery_status` | `PENDING_RIDER` → `CLAIMED` → `PICKED_UP` → `DELIVERED` | สถานะวงจรชีวิตงานของไรเดอร์ |
| **โต๊ะอาหาร (Table POS)** | `TABLES.status` | `EMPTY` (ว่าง) / `OCCUPIED` (มีลูกค้านั่ง) / `BILLING` (รอชำระเงิน) | การบริหารจัดการโต๊ะอาหารภายในร้าน |

#### 3. ความสัมพันธ์ 1:N ระหว่าง ORDERS และ TRANSACTIONS
ความสัมพันธ์แบบ 1 ต่อกลุ่ม (1 : N) ระหว่างคำสั่งซื้อและธุรกรรมการชำระเงิน ออกแบบไว้เพื่อวัตถุประสงค์ทางสถาปัตยกรรม 2 ประการ:
1. **Payment Re-attempt:** รองรับกรณีที่ลูกค้าทำรายการชำระเงินไม่สำเร็จ (เช่น QR หมดอายุ, บัตรถูกปฏิเสธ) ทำให้สามารถสร้างธุรกรรมการเงินรายการใหม่ภายใต้ออเดอร์เดิมได้โดยไม่ต้องยกเลิกและสั่งอาหารใหม่
2. **Future Split-bill Extensibility:** รองรับการต่อยอดสู่ฟังก์ชันการแยกชำระเงินหลายบิล (Split-bill) ตามสัดส่วนยอดเงินรวมของออเดอร์ในอนาคตได้อย่างสมบูรณ์ โดยไม่กระทบต่อความสอดคล้องของข้อมูลบัญชี

---

### 2.4 Database Views (5 วิว)

ฐานข้อมูลมี View จำนวน **5 วิว** เพื่อสรุปข้อมูลเชิงวิเคราะห์สำหรับหน้า Admin Dashboard และรายงานต่างๆ โดยไม่ต้องเขียน JOIN ซับซ้อนทุกครั้ง:

#### รายละเอียดแต่ละ View

**1. ORDER_SUMMARIES_VIEW — สรุปยอดขายรายบิล**

| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
|---------|-----------|---------|
| order_id | INT | รหัสคำสั่งซื้อ |
| table_number | VARCHAR | เลขโต๊ะ (JOIN จาก TABLES) |
| total_price | DECIMAL(10,2) | ยอดรวม |
| status | VARCHAR | สถานะออเดอร์ |
| order_date | DATETIME | วันเวลาที่สั่ง |

```sql
CREATE OR REPLACE VIEW ORDER_SUMMARIES_VIEW AS
SELECT
    o.order_id,
    t.table_number,
    o.total_price,
    o.status,
    o.created_at AS order_date
FROM ORDERS o
LEFT JOIN TABLES t ON o.table_id = t.table_id;
```

**การใช้งานจริง:** หน้าประวัติออเดอร์และรายงานยอดขายของ Admin

---

**2. TRANSACTION_RECEIPTS_VIEW — สรุปใบเสร็จรับเงิน**

| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
|---------|-----------|---------|
| transaction_id | INT | รหัสธุรกรรม |
| order_id | INT | รหัสออเดอร์ |
| customer_name | VARCHAR | ชื่อลูกค้า (COALESCE เป็น 'ลูกค้าทั่วไป') |
| total_amount | DECIMAL(10,2) | ยอดเงิน |
| payment_method | VARCHAR | ช่องทางชำระเงิน |
| payment_status | VARCHAR | สถานะการชำระ |
| payment_date | DATETIME | วันที่ชำระ |

```sql
CREATE OR REPLACE VIEW TRANSACTION_RECEIPTS_VIEW AS
SELECT
    tr.transaction_id,
    tr.order_id,
    COALESCE(u.username, 'ลูกค้าทั่วไป') AS customer_name,
    tr.amount AS total_amount,
    tr.payment_method,
    tr.payment_status,
    o.created_at AS payment_date
FROM TRANSACTIONS tr
LEFT JOIN ORDERS o ON tr.order_id = o.order_id
LEFT JOIN USERS u ON o.user_id = u.user_id;
```

**การใช้งานจริง:** หน้าเช็คบิลและพิมพ์ใบเสร็จ

---

**3. TOP_SELLING_MENUS_VIEW — เมนูขายดี (สถิติยอดนิยม)**

| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
|---------|-----------|---------|
| menu_id | INT | รหัสเมนู |
| menu_name | VARCHAR | ชื่อเมนู |
| category_name | VARCHAR | หมวดหมู่ |
| total_sold | INT | จำนวนที่ขายได้ทั้งหมด |
| total_revenue | DECIMAL(10,2) | รายได้รวมจากเมนูนั้น |

```sql
CREATE OR REPLACE VIEW TOP_SELLING_MENUS_VIEW AS
SELECT
    m.menu_id,
    m.menu_name,
    COALESCE(c.category_name, 'ทั่วไป') AS category_name,
    CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS total_sold,
    CAST(COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS DECIMAL(10,2)) AS total_revenue
FROM MENUS m
LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
LEFT JOIN ORDER_ITEMS oi ON m.menu_id = oi.menu_id
GROUP BY m.menu_id, m.menu_name, c.category_name;
```

**การใช้งานจริง:** แผนภูมิเมนูยอดนิยมในหน้า Admin Dashboard

---

**4. LOW_STOCK_ALERTS_VIEW — แจ้งเตือนวัตถุดิบใกล้หมดสต็อก**

| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
|---------|-----------|---------|
| ingredient_id | INT | รหัสวัตถุดิบ |
| ingredient_name | VARCHAR | ชื่อวัตถุดิบ |
| quantity_in_stock | DECIMAL(10,2) | จำนวนคงเหลือ |
| reorder_level | DECIMAL(10,2) | จุดสั่งซื้อซ้ำ |
| unit | VARCHAR | หน่วยนับ |

**เงื่อนไข:** แสดงเฉพาะรายการที่ `quantity_in_stock <= reorder_level`

**การใช้งานจริง:** กล่องแจ้งเตือนสีแดงในหน้าคลังวัตถุดิบของ Admin

---

**5. LIVE_TABLE_STATUS_VIEW — สถานะโต๊ะอาหารแบบเรียลไทม์**

| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
|---------|-----------|---------|
| table_id | INT | รหัสโต๊ะ |
| table_number | VARCHAR | เลขโต๊ะ |
| capacity | INT | ความจุ (จำนวนที่นั่ง) |
| current_status | VARCHAR | สถานะปัจจุบัน (AVAILABLE / OCCUPIED) |
| current_order_id | INT | ออเดอร์ที่กำลังอยู่บนโต๊ะ |
| current_total | DECIMAL(10,2) | ยอดค้างจ่ายปัจจุบัน |

**การใช้งานจริง:** ผังโต๊ะของพนักงานเสิร์ฟ, หน้าจัดการโต๊ะ Admin, หน้าเช็คบิล

---

### 2.5 ORM / Migration Strategy

#### Prisma ORM

ระบบใช้ **Prisma** เป็น ORM หลัก โดยจัดการโครงสร้างฐานข้อมูลผ่าน Prisma Schema ที่ไฟล์ `backend/prisma/schema.prisma`

**คุณสมบัติที่ใช้:**
- **Prisma Client** (`@prisma/client` v5.22+) — สำหรับ Query ข้อมูลแบบ Type-safe
- **Preview Feature: Views** — รองรับการอ่านข้อมูลจาก Database Views ผ่าน Prisma
- **Binary Targets** — `["native", "linux-musl-openssl-3.0.x"]` รองรับทั้ง Windows (Dev) และ Alpine Linux (Docker Production)

#### Migration History

| # | Migration | วันที่ | คำอธิบาย |
|---|-----------|------|---------|
| 1 | `20260820142003_init_all_tables` | 20 ส.ค. 2569 | สร้างตารางทั้งหมดเริ่มต้น |
| 2 | `20260820143440_init_data_dictionary` | 20 ส.ค. 2569 | ปรับโครงสร้างให้ตรง Data Dictionary |
| 3 | `20260903114252_update_schema` | 3 ก.ย. 2569 | อัปเดต Schema เพิ่มเติม |
| 4 | `20260903114343_create_views` | 3 ก.ย. 2569 | สร้าง Database Views ทั้ง 5 ตัว |

#### กลยุทธ์ Sync ฐานข้อมูล (Production)

ใน Production ใช้คำสั่ง `prisma db push --accept-data-loss` แทน `prisma migrate deploy` เนื่องจากระบบนี้เป็นโปรเจคขนาดเล็ก-กลาง ที่ต้องการความยืดหยุ่นในการปรับโครงสร้างระหว่างพัฒนา

---

### 2.6 Seed Data (ข้อมูลเริ่มต้น)

ระบบมีไฟล์ Seed Data ที่ `backend/prisma/seed.ts` (ขนาด ~790 บรรทัด) เพื่อใส่ข้อมูลทดสอบเริ่มต้นเมื่อ Deploy ระบบ:

#### ข้อมูลที่ Seed

| ลำดับ | ประเภทข้อมูล | รายละเอียด |
|-------|-------------|-----------|
| 1 | **ผู้ใช้ (Users)** | Admin (admin/admin1234), Kitchen (kitchen/kitchen1234), Customer (somchai/password123) — รหัสผ่านทั้งหมดเข้ารหัสด้วย bcrypt |
| 2 | **หมวดหมู่อาหาร (Categories)** | 5 หมวด: อาหารจานเดียว/ผัด, ส้มตำแบบอีสาน, ลาบ/ยำ, ของทอด, เครื่องดื่ม |
| 3 | **เมนูอาหาร (Menus)** | 23 เมนู พร้อมราคา คำอธิบาย แคลอรี URL รูปภาพ |
| 4 | **สารก่อภูมิแพ้ (Allergens)** | 5 ชนิด: กุ้ง/อาหารทะเล, ถั่วลิสง, นม/กลูเตน, กลูเตน/แป้งสาลี, ไข่ |
| 5 | **วัตถุดิบ (Ingredients)** | 32 รายการ พร้อมจำนวนคงเหลือ หน่วยนับ จุดสั่งซื้อซ้ำ |
| 6 | **สูตรอาหาร (Menu-Ingredients)** | ความสัมพันธ์ปริมาณวัตถุดิบที่ใช้ต่อเมนูทั้ง 23 เมนู |
| 7 | **โต๊ะอาหาร (Tables)** | โต๊ะภายในร้านพร้อมความจุ |
| 8 | **โปรโมชั่น (Promotions)** | โค้ดส่วนลดตัวอย่าง |
| 9 | **การตั้งค่าร้าน (Store Settings)** | ชื่อร้าน, เลข PromptPay, ที่อยู่, เวลาเปิด/ปิด, อัตราภาษี 7% |

**การรันคำสั่ง Seed:**
```bash
npx prisma db seed
# หรือผ่าน tsx:
tsx prisma/seed.ts
```

---

### 2.7 SQL Dump File

ไฟล์ `database/tum_krok_zing.sql` (ขนาด ~61 KB, 689 บรรทัด) เป็น SQL Dump ฉบับสมบูรณ์สำหรับส่งงานและนำเข้าฐานข้อมูล ประกอบด้วย:

- สร้างฐานข้อมูล `tum_krok_zing`
- สร้างตารางทั้ง 13 ตาราง พร้อม Constraints, Foreign Keys, Indexes
- ข้อมูล Seed Data ทั้งหมด
- Database Views ทั้ง 5 ตัว

**วิธีนำเข้า:**
```bash
mysql -u root -p < database/tum_krok_zing.sql
```

---

## 3. ส่วนของ DevOps

### 3.1 Version Control (Git / GitHub)

| รายการ | รายละเอียด |
|--------|-----------|
| **Platform** | GitHub |
| **Repository** | https://github.com/thirawat1547-byte/AN-END-TO-END-ONLINE-FOOD-ORDERING-SYSTEM-A-CASE-STUDY-OF-TUM-KROK-ZING-RESTAURANT |
| **จำนวน Commits ทั้งหมด** | 134 commits |
| **Branch หลัก** | `main` |

---

### 3.2 Branching Strategy

ระบบใช้ Feature Branch Strategy โดยแยก Branch ตามหน้าที่ของสมาชิกแต่ละคน:

| Branch | หน้าที่ |
|--------|--------|
| `main` | Branch หลักสำหรับ Production (Auto Deploy เมื่อ Push) |
| `FRONTEND` | พัฒนาส่วนหน้าเว็บ (Vue.js) |
| `BACKEND` | พัฒนาส่วน API (NestJS) |
| `DATABASE` | พัฒนาส่วนฐานข้อมูลและ Schema |
| `ADMIN-DOM` | พัฒนาหน้า Admin Dashboard |
| `Kitchen` | พัฒนาหน้า Kitchen Display System (KDS) |
| `Table-ordering` | พัฒนาระบบสั่งอาหารบนโต๊ะ |
| `Lineman` | พัฒนาระบบส่งอาหาร (Rider) |
| `feature/social-login` | พัฒนา OAuth Social Login (Google, Facebook, LINE) |
| `feature/websocket` | พัฒนาระบบ Real-time WebSocket |
| `fix-cloud-api` | แก้ไขปัญหา Cloud API Deployment |
| `Dom-apimenu` | พัฒนา API เมนูอาหาร |

---

### 3.3 Containerization (Docker)

ระบบใช้ Docker Compose ในการจัดการ Containers ทั้งหมด โดยแบ่งเป็น 2 สภาพแวดล้อม:

#### 3.3.1 Production Environment (`docker-compose.yml`)

มี 3 Services หลัก:

| Service | Image / Build | Container Name | Port (Host:Container) | Volume |
|---------|--------------|---------------|----------------------|--------|
| **mysql-db** | `mysql:8.0` | `tumkrokzing_db` | 3307:3306 | `mysql_data` → `/var/lib/mysql` |
| **backend** | Build จาก `./backend/dockerfile` | `tumkrokzing_backend` | 5000:5000, 3000:5000 | `uploads_data` → `/app/uploads` |
| **frontend** | Build จาก `./frontend/Dockerfile` | `tumkrokzing_frontend` | 8080:80 | — |

**คุณสมบัติ Production:**
- `restart: always` — รีสตาร์ทอัตโนมัติเมื่อ Container ล้ม
- Named Volumes (`mysql_data`, `uploads_data`) — เก็บข้อมูลถาวรข้ามการ Rebuild
- Environment Variables — อ่านจากไฟล์ `.env` สำหรับ OAuth Credentials

#### 3.3.2 Staging Environment (`docker-compose.staging.yml`)

แยก Staging ออกจาก Production อย่างชัดเจน เพื่อทดสอบก่อน Deploy จริง:

| รายการ | Production | Staging |
|--------|------------|---------|
| DB Port | 3307 | **3308** |
| Backend Port | 3000 | **3001** |
| Frontend Port | 8080 | **8081** |
| DB Name | `tum_krok_zing` | **`tum_krok_zing_staging`** |
| Volume | `mysql_data` | **`mysql_data_staging`** |
| Logging | Default | **json-file** (max 10MB, 3 files) |

#### 3.3.3 Dockerfiles

**Backend Dockerfile (`backend/dockerfile`):**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN apk add --no-cache openssl       # จำเป็นสำหรับ Prisma บน Alpine
RUN npx prisma generate              # สร้าง Prisma Client
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
```

**Frontend Dockerfile (Multi-Stage Build):**
```dockerfile
# Stage 1: Build Vue.js
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve ด้วย Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**หมายเหตุ:** Frontend ใช้ **Multi-Stage Build** เพื่อลดขนาด Image สุดท้าย — Build ด้วย Node.js แต่ Serve ด้วย Nginx เท่านั้น

---

### 3.4 CI/CD Pipeline (GitHub Actions)

ไฟล์: `.github/workflows/deploy.yml`

#### Trigger

```yaml
on:
  push:
    branches: ["main"]
```
→ ทุกครั้งที่ Push โค้ดเข้า Branch `main` จะ Deploy อัตโนมัติ

#### ขั้นตอนการ Deploy (Steps)

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions Runner (ubuntu-latest)              │
│                                                     │
│  1. SSH เข้าเซิร์ฟเวอร์ OCI ผ่าน SSH Key           │
│     ↓                                               │
│  2. git fetch origin main                           │
│     git reset --hard origin/main                    │
│     ↓                                               │
│  3. ตรวจสอบไฟล์ .env (OAuth credentials)            │
│     ↓                                               │
│  4. sudo docker-compose up -d --build               │
│     ↓                                               │
│  5. sleep 8 (รอ DB พร้อม)                           │
│     ↓                                               │
│  6. prisma db push --accept-data-loss               │
│     (ซิงค์โครงสร้างตาราง)                            │
│     ↓                                               │
│  7. prisma db seed                                  │
│     (ใส่ข้อมูลสูตรอาหารและวัตถุดิบ)                  │
│     ↓                                               │
│  8. docker-compose restart backend                  │
│     (รีสตาร์ท Backend โหลดข้อมูลใหม่)                │
│     ↓                                               │
│  9. docker logs --tail 20                           │
│     (ตรวจสอบ Startup Logs)                           │
└─────────────────────────────────────────────────────┘
```

#### GitHub Secrets ที่ใช้

| Secret | ใช้สำหรับ |
|--------|---------|
| `HOST` | IP Address ของเซิร์ฟเวอร์ OCI |
| `USERNAME` | ชื่อผู้ใช้ SSH |
| `SSH_PRIVATE_KEY` | Private Key สำหรับเข้าถึงเซิร์ฟเวอร์ |

---

### 3.5 Reverse Proxy (Nginx)

ไฟล์: `nginx.conf`

Nginx ทำหน้าที่เป็น **Reverse Proxy** และ **Static File Server** ดังนี้:

| Location | การทำงาน | รายละเอียด |
|----------|---------|-----------|
| `/` | Vue Router History Mode | `try_files $uri $uri/ /index.html` — ป้องกัน 404 เมื่อ Refresh หน้า SPA |
| `^~ /api/` | Proxy → Backend (NestJS) | ส่งต่อ API Request ไปที่ `http://backend:5000` |
| `/socket.io` | WebSocket Proxy | รองรับ Real-time (polling + WebSocket upgrade) ด้วย timeout 86400s |
| `^~ /uploads/` | Proxy → Backend Uploads | ส่งต่อไฟล์รูปภาพอาหารที่อัปโหลด |
| `~* \.(ico\|css\|js\|...)$` | Static Asset Cache | Cache 6 เดือน + `immutable` + ปิด Access Log |
| Error Pages | Custom 50x | แสดง `/50x.html` เมื่อเกิด Server Error |

**Headers ที่ตั้งค่า:**
- `X-Real-IP` / `X-Forwarded-For` — ส่ง IP ของ Client จริงไปให้ Backend
- `Upgrade` / `Connection` — รองรับ WebSocket Handshake
- `Cache-Control: public, max-age=15552000, immutable` — เพิ่มประสิทธิภาพ Static Assets

---

### 3.6 Cloud Infrastructure (OCI — Oracle Cloud Infrastructure)

| รายการ | รายละเอียด |
|--------|-----------|
| **Cloud Provider** | Oracle Cloud Infrastructure (OCI) — Always Free Tier |
| **OS** | Ubuntu Linux |
| **Domain** | tumkrokzing.duckdns.org (DuckDNS Dynamic DNS) |
| **Protocol** | HTTPS (สถาปัตยกรรมรองรับ Let's Encrypt SSL) |
| **Docker** | Docker + Docker Compose |

---

### 3.7 Automated Backup

ไฟล์: `scripts/backup.sh`

#### กลไกการ Backup

```
┌─────────────────────────────────────────────────────────┐
│  Backup Script (backup.sh)                              │
│                                                         │
│  1. mysqldump จาก Container "tumkrokzing_db"            │
│  2. บีบอัดเป็น .sql.gz (gzip) เพื่อประหยัดพื้นที่        │
│  3. ตั้งชื่อไฟล์ตามวันเวลา:                               │
│     backup_tum_krok_zing_2569-10-09_14-30-00.sql.gz     │
│  4. เก็บไว้ที่ /root/db_backups/                         │
│  5. Retention Policy: ลบไฟล์เก่ากว่า 90 วัน (~3 เดือน)  │
│  6. [ทางเลือก] อัปโหลดไปยัง OCI Object Storage           │
└─────────────────────────────────────────────────────────┘
```

**คำสั่งหลัก:**
```bash
docker exec tumkrokzing_db /usr/bin/mysqldump -u root -prootpassword tum_krok_zing | gzip > $BACKUP_FILE
```

**การตั้งเวลา (Cron):**
```bash
# Backup ทุกวัน เวลา 03:00 น.
0 3 * * * /root/AN-END-TO-END-ONLINE-FOOD-ORDERING-SYSTEM-A-CASE-STUDY-OF-TUM-KROK-ZING-RESTAURANT/scripts/backup.sh
```

---

### 3.8 Server Monitoring

ไฟล์: `scripts/monitor.sh`

#### รายการที่ตรวจสอบ

| # | รายการตรวจสอบ | เงื่อนไขแจ้งเตือน | รายละเอียด |
|---|-------------|-----------------|-----------|
| 1 | **พื้นที่ฮาร์ดดิสก์ (Disk Space)** | ใช้งานเกิน 80% | ใช้คำสั่ง `df -h /` |
| 2 | **การใช้งาน RAM (Memory)** | แสดงค่า % ปัจจุบัน | ใช้คำสั่ง `free -m` |
| 3 | **สถานะ Docker Containers** | Container หยุดทำงาน | ตรวจสอบ 3 containers: `tumkrokzing_db`, `tumkrokzing_backend`, `tumkrokzing_frontend` |

**Log File:** `/root/server_monitor.log`

**ตัวอย่าง Output ใน Log:**
```
==========================================
🔍 System Check at 2569-10-09 10:00:00
✅ [OK] พื้นที่ฮาร์ดดิสก์ปกติ (ใช้งาน 45%)
ℹ️ [INFO] RAM Usage: 62.50%
✅ [OK] Container 'tumkrokzing_db' ทำงานปกติ
✅ [OK] Container 'tumkrokzing_backend' ทำงานปกติ
✅ [OK] Container 'tumkrokzing_frontend' ทำงานปกติ
==========================================
```

---

### 3.9 Environment Management

#### ไฟล์ `.env.example`

จัดการ Environment Variables อย่างปลอดภัย:

| ตัวแปร | ใช้สำหรับ |
|--------|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Login |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Facebook OAuth Login |
| `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` | LINE Login |
| `*_CALLBACK_URL` | URL Callback สำหรับแต่ละ Provider |

**กฎความปลอดภัย:**
- ✅ ไฟล์ `.env.example` อยู่ใน Git (เป็นตัวอย่างให้ทีม)
- ❌ ไฟล์ `.env` ถูกใส่ใน `.gitignore` ห้าม Commit ขึ้น GitHub
- ✅ Docker Compose อ่านค่าจากไฟล์ `.env` อัตโนมัติ (`${VARIABLE_NAME}`)

#### ไฟล์ `.gitignore`

```
node_modules/
.env
dist/
```

---

## 4. สรุปภาพรวม Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        OCI Cloud Server                          │
│                    (Ubuntu + Docker Engine)                       │
│                                                                  │
│  ┌─────────────┐     ┌─────────────────┐     ┌───────────────┐  │
│  │   Frontend   │     │     Backend      │     │   MySQL 8.0   │  │
│  │  (Vue.js +   │────▶│   (NestJS +      │────▶│  (Container)  │  │
│  │   Nginx)     │     │    Prisma ORM)   │     │               │  │
│  │  Port: 80    │     │   Port: 5000     │     │  Port: 3306   │  │
│  │              │     │                  │     │               │  │
│  │  Static SPA  │     │  REST API +      │     │  13 Tables    │  │
│  │  + Reverse   │     │  WebSocket +     │     │  5 Views      │  │
│  │  Proxy       │     │  OAuth 2.0       │     │  Volume:      │  │
│  │              │     │                  │     │  mysql_data    │  │
│  └─────────────┘     └─────────────────┘     └───────────────┘  │
│         │                    │                                    │
│  ┌──────┴────────────────────┴──────────────────────────────┐    │
│  │              Docker Compose (docker-compose.yml)          │    │
│  │  - restart: always (Auto-recovery)                        │    │
│  │  - Named Volumes (Data Persistence)                       │    │
│  │  - Internal Network (Container ↔ Container)               │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Scripts (Automation)                                     │    │
│  │  - backup.sh    → mysqldump + gzip + 90-day retention    │    │
│  │  - monitor.sh   → disk, RAM, containers health check     │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS
                              │
                    ┌─────────┴─────────┐
                    │  DuckDNS (DDNS)   │
                    │  tumkrokzing.      │
                    │  duckdns.org       │
                    └───────────────────┘
                              ▲
                              │
                    ┌─────────┴─────────┐
                    │  GitHub Actions    │
                    │  (CI/CD Pipeline)  │
                    │  - SSH Deploy      │
                    │  - Auto Build      │
                    │  - DB Sync + Seed  │
                    └───────────────────┘
```

### CI/CD Pipeline Flow

```
Developer Push to 'main'
        │
        ▼
GitHub Actions Trigger
        │
        ▼
SSH into OCI Server
        │
        ▼
git fetch + reset --hard
        │
        ▼
docker-compose up -d --build
        │
        ▼
prisma db push (Schema Sync)
        │
        ▼
prisma db seed (Data Seed)
        │
        ▼
Backend Restart + Health Check
        │
        ▼
✅ Live at tumkrokzing.duckdns.org
```

---

### สรุปเทคโนโลยีทั้งหมดที่ใช้ (Technology Summary)

| หมวด | เทคโนโลยี | เวอร์ชัน/รายละเอียด |
|------|----------|-------------------|
| **Database** | MySQL | 8.0 |
| **ORM** | Prisma | 5.22+ |
| **Containerization** | Docker + Docker Compose | Multi-container |
| **CI/CD** | GitHub Actions | `appleboy/ssh-action@v1.0.3` |
| **Web Server** | Nginx | Alpine |
| **Runtime** | Node.js | 22 (Alpine) |
| **Backend Framework** | NestJS | 10.x |
| **Frontend Framework** | Vue.js + Vite | Vue 3 |
| **Cloud** | Oracle Cloud Infrastructure (OCI) | Always Free Tier |
| **DNS** | DuckDNS | Dynamic DNS |
| **Version Control** | Git + GitHub | 134 commits, 12 branches |
| **Authentication** | Passport.js | Google, Facebook, LINE OAuth 2.0 |
| **Real-time** | Socket.io | WebSocket + Polling |
| **Backup** | mysqldump + gzip + cron | 90-day retention |
| **Monitoring** | Custom Shell Script | Disk, RAM, Container health |

---

> **หมายเหตุ:** รายงานฉบับนี้จัดทำจากข้อมูลจริงในซอร์สโค้ดของโปรเจค ณ วันที่ 9 ตุลาคม 2569
