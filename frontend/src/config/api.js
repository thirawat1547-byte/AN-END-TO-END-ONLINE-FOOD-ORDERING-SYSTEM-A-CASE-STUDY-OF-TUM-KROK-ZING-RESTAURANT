// Centralized API configuration
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api/v1'
    : '/api/v1'
);

// แปลง path ไฟล์ที่อัปโหลดไว้บน Backend (เช่น /uploads/...) ให้เป็น URL ที่เปิดได้จริง
export const assetUrl = (path) => {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (/^https?:/.test(API_BASE)) {
    return new URL(API_BASE).origin + path;
  }
  return path;
};

export default API_BASE;
