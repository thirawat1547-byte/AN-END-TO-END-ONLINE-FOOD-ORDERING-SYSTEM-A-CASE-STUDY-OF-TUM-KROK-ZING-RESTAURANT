import { reactive } from 'vue';
import { API_BASE } from '../config/api';

const checkStoredAuth = () => {
  const token = localStorage.getItem('access_token');
  const loggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
  return !!(token || loggedInFlag);
};

const getStoredProfile = () => {
  try {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

let sessionMonitorTimer = null;

export const authStore = reactive({
  isLoggedIn: checkStoredAuth(),
  userProfile: getStoredProfile(),
  sessionId: localStorage.getItem('session_id') || null,

  // ควบคุม Modal แจ้งเตือนเมื่อถูกเตะออกจากระบบเนื่องจากมีการล็อกอินซ้ำซ้อน
  isSessionTerminatedModalOpen: false,
  sessionTerminateMessage: '',

  get role() {
    if (!this.isLoggedIn) return 'GUEST';
    return (this.userProfile?.role || 'CUSTOMER').toUpperCase();
  },

  get isAdmin() {
    return this.role === 'ADMIN';
  },

  get isKitchen() {
    return this.role === 'KITCHEN';
  },

  get isRider() {
    return this.role === 'RIDER';
  },

  get isCustomer() {
    return this.role === 'CUSTOMER';
  },

  get isGuest() {
    return !this.isLoggedIn;
  },

  syncAuth() {
    this.isLoggedIn = checkStoredAuth();
    this.userProfile = getStoredProfile();
    this.sessionId = localStorage.getItem('session_id') || null;
  },

  setAuth(token, user, sessionId) {
    if (token) localStorage.setItem('access_token', token);
    localStorage.setItem('isLoggedIn', 'true');
    if (sessionId) {
      localStorage.setItem('session_id', sessionId);
      this.sessionId = sessionId;
    }
    if (user) {
      const normalizedUser = {
        ...user,
        role: (user.role || 'CUSTOMER').toUpperCase()
      };
      localStorage.setItem('userProfile', JSON.stringify(normalizedUser));
      this.userProfile = normalizedUser;
    }
    this.isLoggedIn = true;
    this.isSessionTerminatedModalOpen = false;
    this.startSessionMonitor();
  },

  updateProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
    if (this.userProfile.role) {
      this.userProfile.role = this.userProfile.role.toUpperCase();
    }
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
  },

  // 🛑 ฟังก์ชันดักจับเมื่อเซสชันถูกปิดกั้นเพราะมีอุปกรณ์อื่นเข้าสู่ระบบ
  handleSessionTerminated(msg) {
    this.sessionTerminateMessage =
      msg || '⚠️ บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว ระบบได้ทำการออกจากระบบโดยอัตโนมัติ เพื่อความปลอดภัย';
    this.isSessionTerminatedModalOpen = true;
    this.logout(false);
  },

  // เริ่มต้นการตรวจสอบเซสชันแบบ Real-time (Single Active Session Polling)
  startSessionMonitor() {
    this.stopSessionMonitor();
    if (!this.isLoggedIn) return;

    // ตรวจสอบทันทีรอบแรก
    this.checkSessionNow();

    // วนตรวจสถานะเซสชันกับเซิร์ฟเวอร์ทุกๆ 3 วินาที
    sessionMonitorTimer = setInterval(() => {
      this.checkSessionNow();
    }, 3000);
  },

  async checkSessionNow() {
    const token = localStorage.getItem('access_token');
    if (!token || !this.isLoggedIn) {
      this.stopSessionMonitor();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/session-check`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        const errDetail = data.message || '';
        this.stopSessionMonitor();
        this.handleSessionTerminated(
          errDetail.includes('SESSION_TERMINATED')
            ? '⚠️ บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว ระบบได้ทำการออกจากระบบโดยอัตโนมัติ เพื่อความปลอดภัย'
            : undefined
        );
      }
    } catch (err) {
      // หากเกิดปัญหาชั่วคราวทางเครือข่าย ให้ข้ามไปรอบถัดไป
    }
  },

  stopSessionMonitor() {
    if (sessionMonitorTimer) {
      clearInterval(sessionMonitorTimer);
      sessionMonitorTimer = null;
    }
  },

  logout(callApi = true) {
    const token = localStorage.getItem('access_token');
    if (callApi && token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    this.stopSessionMonitor();
    localStorage.removeItem('access_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('session_id');
    localStorage.removeItem('orderHistoryList');
    sessionStorage.removeItem('currentOrder');
    sessionStorage.removeItem('cartData');
    localStorage.removeItem('cartData');
    sessionStorage.removeItem('active_tracking_order_id');
    localStorage.removeItem('active_tracking_order_id');
    this.isLoggedIn = false;
    this.userProfile = {};
    this.sessionId = null;
  }
});

// เริ่มต้น Session Monitor ทันทีหากมีการล็อกอินค้างไว้อยู่แล้ว
if (authStore.isLoggedIn) {
  authStore.startSessionMonitor();
}
