import { reactive } from 'vue';

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

export const authStore = reactive({
  isLoggedIn: checkStoredAuth(),
  userProfile: getStoredProfile(),

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
  },

  setAuth(token, user) {
    if (token) localStorage.setItem('access_token', token);
    localStorage.setItem('isLoggedIn', 'true');
    if (user) {
      const normalizedUser = {
        ...user,
        role: (user.role || 'CUSTOMER').toUpperCase()
      };
      localStorage.setItem('userProfile', JSON.stringify(normalizedUser));
      this.userProfile = normalizedUser;
    }
    this.isLoggedIn = true;
  },

  updateProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
    if (this.userProfile.role) {
      this.userProfile.role = this.userProfile.role.toUpperCase();
    }
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('orderHistoryList');
    sessionStorage.removeItem('currentOrder');
    sessionStorage.removeItem('cartData');
    localStorage.removeItem('cartData');
    this.isLoggedIn = false;
    this.userProfile = {};
  }
});
