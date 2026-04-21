import axios from 'axios';

const api = axios.create({
  // الرابط الأساسي للباك إند الخاص بك
  baseURL: 'https://sentrykbackend.onrender.com/api',
});

/**
 * Interceptor للطلبات الصادرة (Request)
 * يقوم بحقن التوكن في الـ Headers إذا كان موجوداً في الـ localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor للاستجابات الواردة (Response)
 * يعالج الأخطاء المركزية مثل الـ 401 والـ 403
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // نتحقق من حالة الخطأ 401 (غير مصرح) أو 403 (محظور/انتهت الجلسة)
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      
      /* التحقق مما إذا كان المستخدم حالياً في صفحة تسجيل الدخول:
         - إذا كان في صفحة Login ووصله الخطأ، نترك الصفحة تتعامل معه (إظهار رسالة خطأ).
         - إذا كان في أي صفحة أخرى (dashboard, students, etc)، نقوم بعمل Logout.
      */
      const isLoginPage = window.location.pathname.includes('/login');

      if (!isLoginPage) {
        // رسالة تنبيه اختيارية في الكونسول للتصحيح
        console.warn("Session expired or forbidden. Redirecting to login...");

        // 1. مسح بيانات الجلسة بالكامل من التخزين المحلي
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 2. توجيه المستخدم لصفحة اللوجين
        // استخدمنا window.location.href لعمل إعادة تحميل كاملة للتخلص من أي بيانات عالقة في الـ States
        window.location.href = '/login';
      }
    }

    // إرسال الخطأ للـ Catch الموجودة في الكود الذي استدعى الـ API
    return Promise.reject(error);
  }
);

export default api;
