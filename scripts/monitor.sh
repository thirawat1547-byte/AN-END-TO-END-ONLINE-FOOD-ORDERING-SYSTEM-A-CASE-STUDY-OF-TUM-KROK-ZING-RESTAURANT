#!/bin/bash

# ==========================================
# Basic Server Monitoring Script
# ==========================================
# สคริปต์สำหรับตรวจสอบสถานะเซิร์ฟเวอร์เบื้องต้น
# แนะนำให้รันผ่าน Cron ทุกๆ 1 ชั่วโมง หรือ 1 วัน

LOG_FILE="/root/server_monitor.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "==========================================" >> "$LOG_FILE"
echo "🔍 System Check at $DATE" >> "$LOG_FILE"

# 1. เช็คพื้นที่ฮาร์ดดิสก์ (Disk Space)
# แจ้งเตือนหากใช้งานเกิน 80%
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ [WARNING] พื้นที่ฮาร์ดดิสก์เหลือน้อย! (ใช้งานไปแล้ว ${DISK_USAGE}%)" >> "$LOG_FILE"
    # คุณสามารถเพิ่มคำสั่งยิง cURL เข้า LINE Notify / Discord Webhook ตรงนี้ได้ในอนาคต
else
    echo "✅ [OK] พื้นที่ฮาร์ดดิสก์ปกติ (ใช้งาน ${DISK_USAGE}%)" >> "$LOG_FILE"
fi

# 2. เช็คการกิน RAM (Memory Usage)
MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')
echo "ℹ️ [INFO] RAM Usage: $MEMORY_USAGE" >> "$LOG_FILE"

# 3. เช็คสถานะ Docker Containers หลักของระบบ
CONTAINERS=("tumkrokzing_db" "tumkrokzing_backend" "tumkrokzing_frontend")

for container in "${CONTAINERS[@]}"; do
    if [ "$(docker inspect -f '{{.State.Running}}' $container 2>/dev/null)" == "true" ]; then
        echo "✅ [OK] Container '$container' ทำงานปกติ" >> "$LOG_FILE"
    else
        echo "❌ [ERROR] Container '$container' หยุดทำงาน หรือหาไม่พบ!" >> "$LOG_FILE"
        # คุณสามารถเพิ่มคำสั่ง restart ตรงนี้ หรือแจ้งเตือนก็ได้
        # docker restart $container
    fi
done

echo "==========================================" >> "$LOG_FILE"
