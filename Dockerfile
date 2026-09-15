# ขั้นตอนที่ 1: Build โค้ด Vue.js
FROM node:22-alpine AS builder
WORKDIR /app

# ติดตั้ง Dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดและทำการ Build
COPY . .
RUN npm run build

# ขั้นตอนที่ 2: นำไฟล์ที่ Build เสร็จไปรันบน Nginx
FROM nginx:alpine
# คัดลอกไฟล์คอนฟิก Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# คัดลอกไฟล์จากโฟลเดอร์ dist ไปวางใน Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# เปิดพอร์ต 80
EXPOSE 80

# สั่งให้ Nginx ทำงาน
CMD ["nginx", "-g", "daemon off;"]
