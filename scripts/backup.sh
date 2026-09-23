#!/bin/bash

# ==========================================
# MySQL Automated Backup Script for Tum Krok Zing
# ==========================================

# ตั้งค่าพื้นฐาน (อิงตาม docker-compose.yml ของคุณ)
CONTAINER_NAME="tumkrokzing_db"
DB_USER="root"
DB_PASS="rootpassword"
DB_NAME="tum_krok_zing"

# โฟลเดอร์สำหรับเก็บไฟล์ Backup (สร้างถ้ายังไม่มี)
BACKUP_DIR="/root/db_backups"
mkdir -p "$BACKUP_DIR"

# ดึงวันที่และเวลาปัจจุบันเป็นชื่อไฟล์
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql.gz"

echo "⏳ [$(date +"%Y-%m-%d %H:%M:%S")] เริ่มทำการ Backup ฐานข้อมูล: $DB_NAME..."

# สั่งรัน mysqldump เข้าไปใน Docker Container และบีบอัดเป็น .gz เพื่อประหยัดพื้นที่
docker exec "$CONTAINER_NAME" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"

# เช็คว่า Backup สำเร็จหรือไม่
if [ $? -eq 0 ]; then
    echo "✅ Backup สำเร็จ! ไฟล์ถูกจัดเก็บที่: $BACKUP_FILE"
else
    echo "❌ เกิดข้อผิดพลาดในการ Backup ฐานข้อมูล!"
    exit 1
fi

# ---------------------------------------------------------
# [ทางเลือกเสริม] การอัปโหลดไฟล์ไปที่ OCI Object Storage
# หากตั้งค่า OCI CLI บนเซิร์ฟเวอร์แล้ว ให้นำเครื่องหมาย # ออกด้านล่าง
# ---------------------------------------------------------
# BUCKET_NAME="tumkrokzing-backups"
# echo "☁️ อัปโหลดไปยัง OCI Object Storage..."
# oci os object put -bn "$BUCKET_NAME" --file "$BACKUP_FILE" --name "backup_${DB_NAME}_${DATE}.sql.gz"

# ---------------------------------------------------------
# การลบไฟล์ Backup เก่า (Retention Policy)
# ตั้งให้ลบไฟล์ Backup ที่เก่ากว่า 7 วันทิ้ง เพื่อไม่ให้เซิร์ฟเวอร์พื้นที่เต็ม
# ---------------------------------------------------------
echo "🧹 ทำการลบไฟล์ Backup ที่เก่ากว่า 7 วัน..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;

echo "🎉 กระบวนการ Backup เสร็จสิ้นเรียบร้อย!"
