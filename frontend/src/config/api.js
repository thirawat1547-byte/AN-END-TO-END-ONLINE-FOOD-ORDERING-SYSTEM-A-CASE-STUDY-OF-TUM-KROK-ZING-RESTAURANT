// Centralized API configuration
export const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? (import.meta.env.VITE_API_BASE_URL || 'http://161.33.43.187/api/v1')
  : '/api/v1';

export default API_BASE;
