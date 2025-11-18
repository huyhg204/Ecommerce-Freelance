// Service để quản lý authentication
export const authService = {
  // Lưu token vào localStorage
  setToken: (token) => {
    localStorage.setItem('access_token', token);
  },

  // Lấy token từ localStorage
  getToken: () => {
    return localStorage.getItem('access_token');
  },

  // Xóa token (logout)
  removeToken: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Lưu thông tin user
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Lấy thông tin user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

