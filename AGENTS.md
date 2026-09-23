# Project Rules & Guidelines - Tum Krok Zing

## Server Deployment Rules
เมื่อแนะนำคำสั่งในการรัน/Deploy บนเซิร์ฟเวอร์ (`161.33.43.187`):
- ให้ใช้ `sudo docker-compose` เสมอ (มี `sudo` และใช้ `docker-compose` มีขีดกลาง)
- คำสั่งอัปเดตโค้ดและ rebuild มาตรฐาน:
  ```bash
  git pull origin main
  sudo docker-compose up -d --build frontend backend
  ```
