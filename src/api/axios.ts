import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { offlineStore } from '../utils/offlineStore';

// إنشاء نسخة Axios المخصصة للمنصة بنظام حماية زمني متطور
const api = axios.create({
  baseURL: 'https://sentrykbackend.onrender.com/api', // استبدل هذا بالرابط الفعلي للسيرفر الخاص بك في الإنتاج
  timeout: 100000, // 10 ثوانٍ كحد أقصى للطلب قبل اعتباره معلقاً بفعل الشبكة
});

// دمج نظام إعادة المحاولة التلقائي في حالة تذبذب الشبكة السريع (Transient Network Drops)
axiosRetry(api, {
  retries: 2, // إعادة المحاولة مرتين قبل إعلان فشل الاتصال والتحول للأوفلاين
  retryDelay: axiosRetry.exponentialDelay, // زيادة وقت الانتظار تصاعدياً بين المحاولات
  retryCondition: (error: AxiosError) => {
    // يعيد المحاولة فقط لو هناك مشكلة شبكة حقيقية أو السيرفر يعطي خطأ مؤقت (5xx)
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ? error.response.status >= 500 : false)
    );
  },
});

/**
 * ============================================================================
 * 1. Interceptor للطلبات الصادرة (Request Interceptor)
 * ============================================================================
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ============================================================================
 * 2. Interceptor للاستجابات الواردة (Response Interceptor)
 * معالجة التكنيش التلقائي وبناء الـ Optimistic Responses للـ Offline Mode
 * ============================================================================
 */
api.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { config } = response;

    // 🟢 [استراتيجية أونلاين ناجحة]: لو العملية هي جلب بيانات (GET) والنت مستقر، كشها فوراً للرحلات القادمة
    if (config.method?.toLowerCase() === 'get' && config.url) {
      // تفادي كاش طلبات التحقق من الحساب والتسجيل، نكش فقط البيانات التشغيلية كـ الطلاب والحضور
      if (!config.url.includes('/auth/')) {
        await offlineStore.setCache(config.url, response.data);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const { config, response } = error;
    const status = response?.status;

    // [أولاً]: معالجة انتهاء الجلسة الأمنية أو الصلاحيات المحظورة (401 / 403)
    if (status === 401 || status === 403) {
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        console.warn('⚠️ الجلسة انتهت أو غير مصرح لك. جاري التوجيه لصفحة تسجيل الدخول...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // [ثانياً]: 🔴 معالجة حالة الأوفلاين الكامل وانقطاع الشبكة (Network Error / Timeout)
    const isNetworkError =
      !response ||
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK';

    if (isNetworkError && config && config.url) {
      const method = config.method?.toLowerCase();
      const urlPath = config.url.toLowerCase();

      // 🔄 (أ) حالة طلب بيانات [GET]: قم بجلبها فوراً من الـ IndexedDB المحلي
      if (method === 'get') {
        console.warn(`🌐 [وضع الأوفلاين]: جلب بيانات الرابط [${config.url}] من الكاش المحلي.`);
        const cachedData = await offlineStore.getCache(config.url);

        if (cachedData !== null) {
          return Promise.resolve({
            data: cachedData,
            status: 200,
            statusText: 'OK (From Local Cache)',
            headers: {},
            config,
          } as AxiosResponse);
        }
      }

      // 📥 (ب) حالة العمليات الحركية [POST, PUT, DELETE]: (حضور، إضافة، تعديل، حذف طلاب)
      if (method === 'post' || method === 'put' || method === 'delete') {
        // استثناء عمليات تسجيل الدخول والتوثيق من الطابور (لأنها تتطلب أونلاين حتمي)
        if (!config.url.includes('/auth/')) {
          console.warn(`📦 [وضع الأوفلاين]: انقطاع شبكة أثناء عملية [${method.toUpperCase()}]. جاري الجدولة حركياً.`);

          try {
            // استخراج وتجهيز البيانات المرسلة (Payload)
            let requestData = config.data;
            if (typeof requestData === 'string') {
              try {
                requestData = JSON.parse(requestData);
              } catch (e) {
                // نتركه كما هو إن لم يكن نص جيسون
              }
            }

            // إرسال العملية إلى طابور الأوفلاين المعماري الموحد للحفظ المؤقت
            const queuedItem = await offlineStore.addToQueue(
              config.url,
              method.toUpperCase() as 'POST' | 'PUT' | 'DELETE',
              requestData
            );

            // 🌟 هندسة الاستجابات الوهمية الذكية (Optimistic Responses Engine) 🌟
            // تهيئة استجابة افتراضية عادية وتعديلها بحسب مسار الـ API المستهدف
            let optimisticData: any = {
              success: true,
              offline: true,
              queuedId: queuedItem.id,
              message: 'تم حفظ العملية في طابور التزامن المحلي بنجاح لحين عودة الاتصال.',
            };

            // 1️⃣ اعتراض عمليات مسح الحضور (Scan / QR / Attendance Mark)
            if (urlPath.includes('/attendance/scan') || urlPath.includes('/attendance/mark')) {
              let resolvedStudentName = "طالب (أوفلاين)";
              let resolvedStudentPhone = "";

              // 🧠 حركة ذكاء برمجية فائقة: محاولة العثور على اسم الطالب من كاش الـ GET الحالي لمنع الوميض بالفرونت إند
              try {
                const cachedStudents = await offlineStore.getCache('/students');
                // فحص هيكلية البيانات المخزنة للوصول لمصفوفة الطلاب وفلترتها بالـ ID أو الكود
                const studentsList = cachedStudents?.data || cachedStudents;
                if (Array.isArray(studentsList)) {
                  const targetStudent = studentsList.find(
                    (s: any) => String(s.id) === String(requestData.studentId)
                  );
                  if (targetStudent) {
                    resolvedStudentName = targetStudent.name;
                    resolvedStudentPhone = targetStudent.phone || "";
                  }
                }
              } catch (cacheErr) {
                console.error('⚠️ خطأ تتبع الكاش لاسم الطالب أوفلاين:', cacheErr);
              }

              // بناء الكائن المتوقع تماماً داخل الـ Attendance.tsx
              optimisticData = {
                success: true,
                offline: true,
                queuedId: queuedItem.id,
                message: '⚡ [وضع الأوفلاين] تم إثبات الحضور بالدفتر المحلي وجاري جدولته للبث على السيرفر فوراً.',
                record: {
                  id: `mock-att-${Math.random().toString(36).substring(2, 11)}`,
                  studentId: requestData.studentId,
                  sessionId: requestData.sessionId,
                  status: requestData.status || 'PRESENT',
                  scannedAt: new Date().toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }),
                  markedAt: new Date().toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }),
                  autoMarked: true,
                  markedBySystem: false,
                  lateMinutes: requestData.lateMinutes || 0,
                  student: {
                    id: requestData.studentId,
                    name: resolvedStudentName,
                    phone: resolvedStudentPhone
                  }
                }
              };
            }

            // 2️⃣ اعتراض عمليات فتح الحصص ومجموعات البث المباشر (Open Session Window)
            else if (urlPath.includes('/attendance/window') || urlPath.includes('/attendance/live')) {
              optimisticData = {
                success: true,
                offline: true,
                queuedId: queuedItem.id,
                message: '⚡ [وضع الأوفلاين] تم تفعيل نظام النقل الذكي وفتح مجموعة الحضور محلياً.',
                window: {
                  id: `mock-win-${Math.random().toString(36).substring(2, 11)}`,
                  sessionId: requestData.sessionId,
                  centerId: requestData.centerId,
                  isOpen: true,
                  openedAt: new Date().toISOString()
                }
              };
            }

            // 3️⃣ اعتراض عمليات إضافة وإدارة الطلاب (Create / Register Student)
            else if (urlPath.includes('/students') && method === 'post') {
              optimisticData = {
                success: true,
                offline: true,
                queuedId: queuedItem.id,
                message: '🧨 [وضع الأوفلاين] تم تسجيل الطالب الجديد مؤقتاً بالخادم المحلي وإنشاء كود الحساب.',
                student: {
                  id: `mock-std-${Math.random().toString(36).substring(2, 11)}`,
                  name: requestData.name || 'طالب جديد غير مسمى',
                  phone: requestData.phone || '',
                  stage: requestData.stage || 'HIGH',
                  grade: requestData.grade || 1,
                  createdAt: new Date().toISOString(),
                  qrCodeUrl: '' // يتم توليده وتحديثه لاحقاً بواسطة السيرفر عند التزامن الفعلي
                }
              };
            }

            // 4️⃣ اعتراض عمليات تجديد الاشتراكات المالية والدفع (Renew Subscriptions)
            else if (urlPath.includes('/subscriptions') || urlPath.includes('/renew')) {
              optimisticData = {
                success: true,
                offline: true,
                queuedId: queuedItem.id,
                message: '💰 [وضع الأوفلاين] تم قيد العملية المالية وتجديد اشتراك الطالب بالدفتر المؤقت بنجاح.',
                data: {
                  id: `mock-sub-${Math.random().toString(36).substring(2, 11)}`,
                  studentId: requestData.studentId,
                  subscriptionType: requestData.subscriptionType || 'MONTHLY',
                  totalPrice: requestData.totalPrice || 0,
                  status: 'ACTIVE',
                  startDate: new Date().toISOString(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // تمديد افتراضي لـ 30 يوم
                }
              };
            }

            // إرجاع الاستجابة الوهمية الذكية بكود (202 Accepted) لجعل الفرونت إند يظن أن العملية تمت بالكامل
            return Promise.resolve({
              data: optimisticData,
              status: 202,
              statusText: 'Accepted (Queued Optimistic)',
              headers: {},
              config,
            } as AxiosResponse);

          } catch (queueErr) {
            console.error('❌ فشل حرج في جدولة عملية الأوفلاين أو بناء الاستجابة الوهمية:', queueErr);
          }
        }
      }
    }

    // لو الخطأ ليس له علاقة بالشبكة (مثلاً خطأ 400 سوء إدخال أو 422)، نمرره ليعالجه الفرونت إند يدوياً
    return Promise.reject(error);
  }
);

export default api;
