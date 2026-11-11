#!/bin/bash

# ==========================================
# SSL Certificate Renewal Script for Tum Krok Zing
# ==========================================
# ต่ออายุใบรับรอง Let's Encrypt ผ่าน Webroot ที่ nginx-proxy container ให้บริการ (/.well-known/acme-challenge/)
# Certbot จะต่ออายุเฉพาะเมื่อใบรับรองเหลืออายุน้อยกว่า 30 วัน และสั่ง Nginx โหลดใบรับรองใหม่เมื่อต่ออายุสำเร็จ
#
# ตั้งให้รันอัตโนมัติวันละครั้ง (sudo crontab -e):
# 0 3 * * * /bin/bash ~/AN-END-TO-END-ONLINE-FOOD-ORDERING-SYSTEM-A-CASE-STUDY-OF-TUM-KROK-ZING-RESTAURANT/scripts/renew-cert.sh >> /var/log/renew-cert.log 2>&1

PROXY_CONTAINER="tumkrokzing_proxy"
WEBROOT="/var/www/certbot"

mkdir -p "$WEBROOT"

echo "=== Certificate renewal check at $(date '+%Y-%m-%d %H:%M:%S') ==="
certbot renew --webroot -w "$WEBROOT" --deploy-hook "docker exec $PROXY_CONTAINER nginx -s reload"
