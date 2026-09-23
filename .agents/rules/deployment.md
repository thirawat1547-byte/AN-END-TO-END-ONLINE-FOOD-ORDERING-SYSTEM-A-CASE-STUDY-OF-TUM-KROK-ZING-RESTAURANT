# Server Deployment & Docker Rules

สำหรับคำสั่งการ Deploy หรือ Build คอนเทนเนอร์บนเซิร์ฟเวอร์ (`161.33.43.187`):

1. **คำสั่ง Docker Compose ที่ถูกต้องสำหรับเซิร์ฟเวอร์นี้**:
   - ต้องใช้ `sudo docker-compose` (มี `sudo` นำหน้า และใช้ `docker-compose` แบบมีขีดกลางเสมอ)
   - ห้ามแนะนำ `docker compose` แบบไม่มีขีดกลาง

2. **คำสั่งมาตรฐานสำหรับการอัปเดตและ Build คอนเทนเนอร์**:
   ```bash
   git pull origin main
   sudo docker-compose up -d --build frontend backend
   ```
   หรือหากต้องการ Rebuild ทั้งระบบ:
   ```bash
   sudo docker-compose up -d --build
   ```
