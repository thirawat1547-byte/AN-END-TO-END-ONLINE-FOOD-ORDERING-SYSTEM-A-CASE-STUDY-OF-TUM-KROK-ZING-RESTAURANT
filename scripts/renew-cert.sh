#!/bin/bash

# ==========================================
# SSL Certificate Renewal Script for Tum Krok Zing
# ==========================================
# ต่ออายุใบรับรอง Let's Encrypt ผ่าน Webroot ที่ nginx-proxy container ให้บริการ (/.well-known/acme-challenge/)
# Certbot จะต่ออายุเฉพาะเมื่อใบรับรองเหลืออายุน้อยกว่า 30 วัน และสั่ง Nginx โหลดใบรับรองใหม่เมื่อต่ออายุสำเร็จ
#
# deploy.yml ตั้ง Cron ให้รันสคริปต์นี้อัตโนมัติวันละครั้งตอนตี 3 (ดูได้ด้วย sudo crontab -l)
# ถ้าตั้งเอง ต้องใช้ path เต็มของโฟลเดอร์โปรเจค เพราะ sudo crontab รันในชื่อ root (~ จะชี้ไปที่ /root)

PROXY_CONTAINER="tumkrokzing_proxy"
WEBROOT="/var/www/certbot"

mkdir -p "$WEBROOT"

echo "=== Certificate renewal check at $(date '+%Y-%m-%d %H:%M:%S') ==="
certbot renew --webroot -w "$WEBROOT" --deploy-hook "docker exec $PROXY_CONTAINER nginx -s reload"
