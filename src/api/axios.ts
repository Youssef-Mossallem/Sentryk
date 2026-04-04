import axios from 'axios';

const api = axios.create({
  // تأكد من تغيير البورت حسب الباك إند عندك
  baseURL:'https://sentrykapi-86unvpa1.b4a.run/api',
});

// إضافة التوكن لكل طلب يخرج من الفرونت إند
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء (مثل انتهاء صلاحية التوكن)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
