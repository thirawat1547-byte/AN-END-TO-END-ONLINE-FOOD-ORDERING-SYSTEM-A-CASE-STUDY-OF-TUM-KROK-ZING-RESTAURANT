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

  syncAuth() {
    this.isLoggedIn = checkStoredAuth();
    this.userProfile = getStoredProfile();
  },

  setAuth(token, user) {
    if (token) localStorage.setItem('access_token', token);
    localStorage.setItem('isLoggedIn', 'true');
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
      this.userProfile = user;
    }
    this.isLoggedIn = true;
  },

  updateProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
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
