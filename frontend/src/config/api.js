// Centralized API configuration
export const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api/v1'
  : '/api/v1';

export default API_BASE;
