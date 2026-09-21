// src/config/socket.js
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:5000';
    }
    // หากเข้าใช้งานผ่าน Production / Cloud Server ให้เชื่อมต่อผ่าน Host Origin (Port 80/443 ผ่าน Nginx Proxy)
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
});

// Event listeners สำหรับการตรวจสอบสถานะการเชื่อมต่อ
socket.on('connect', () => {
  console.log(`🔌 [Socket.io] เชื่อมต่อไปยังเซิร์ฟเวอร์ (${SOCKET_URL}) เรียบร้อยแล้ว! Socket ID: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
  console.warn(`❌ [Socket.io] ตัดการเชื่อมต่อจากเซิร์ฟเวอร์:`, reason);
});

socket.on('connect_error', (err) => {
  console.error(`⚠️ [Socket.io] เกิดข้อผิดพลาดในการเชื่อมต่อ:`, err.message);
});

export default socket;
