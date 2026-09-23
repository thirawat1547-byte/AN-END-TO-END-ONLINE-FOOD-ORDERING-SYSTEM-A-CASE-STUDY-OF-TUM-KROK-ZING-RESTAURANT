// Centralized API configuration
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5000/api/v1'
    : '/api/v1'
);

export default API_BASE;
