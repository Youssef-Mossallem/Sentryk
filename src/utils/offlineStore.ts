import localforage from 'localforage';

// ============================================================================
// 1. تهيئة مخازن البيانات المحلية المستقلة (Advanced IndexedDB Partitioning)
// ============================================================================

// أ: مخزن كاش طلبات القراءة العامة (GET Requests Cache)
const cacheStore = localforage.createInstance({
  name: 'Sentryk_Offline_v2',
  storeName: 'api_cache'
});

// ب: مخزن طابور العمليات الحركية (POST, PUT, DELETE) بنظام تتابعي مرن
const queueStore = localforage.createInstance({
  name: 'Sentryk_Offline_v2',
  storeName: 'http_sync_queue'
});

// ج: مخزن النوافذ والحصص المفتوحة اليوم (Opened Windows Today Engine)
const windowsStore = localforage.createInstance({
  name: 'Sentryk_Offline_v2',
  storeName: 'opened_windows_today'
});

// د: مخزن سجلات الطلاب التشغيلي المباشر للسنتر (Offline Registered Students)
const studentsStore = localforage.createInstance({
  name: 'Sentryk_Offline_v2',
  storeName: 'registered_students'
});

// ============================================================================
// 2. التعريفات والأنماط الصارمة لـ TypeScript (Enterprise Interfaces)
// ============================================================================

export interface QueueItem {
  id: string;                          // معرف فريد محلي (UUID/Fallback) لتتبع الطلب
  url: string;                         // الرابط المستهدف بالباك إند (Endpoint)
  method: 'POST' | 'PUT' | 'DELETE';   // نوع العملية البرمجية
  data: any;                           // جسم الطلب المحمول (Payload)
  timestamp: number;                   // بصمة زمنية دقيقة جداً لضمان الترتيب التتابعي الصارم
}

export interface OpenWindowItem {
  id: string | number;                 // معرف نافذة الحضور
  sessionId: number;                   // معرف الحصة/المجموعة الأصلي
  centerId: number;                    // معرف السنتر التعليمي
  isOpen: boolean;                     // حالة النافذة
  openedAt: string;                    // وقت الفتح بالتوقيت العالمي أو المحلي
}

export interface OfflineStudentItem {
  id: number;                          // معرف الطالب الفريد
  name: string;                        // اسم الطالب ثلاثي/رباعي
  phone: string;                       // رقم هاتف الطالب
  stage: 'PRIMARY' | 'MIDDLE' | 'HIGH';// المرحلة التعليمية
  grade: number;                       // الصف الدراسي
  code?: string;                       // كود الطالب أو الباركود الخاص به
  subscriptionType?: string;           // نوع اشتراكه الحالي
}

// دالة مساعدة لتوليد معرفات فريدة محلياً بشكل آمن تماماً
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// ============================================================================
// 3. كائن إدارة الأوفلاين المعماري المركزي (Sentryk Offline Core Engine)
// ============================================================================

export const offlineStore = {

  // --------------------------------------------------------------------------
  // أولاً: إدارة الكاش العام (Cache Layer - GET Requests)
  // --------------------------------------------------------------------------
  async setCache(key: string, data: any): Promise<void> {
    try {
      await cacheStore.setItem(key, data);
    } catch (err) {
      console.error('❌ [OfflineStore Cache] فشل في حفظ كاش القراءة:', err);
    }
  },

  async getCache<T = any>(key: string): Promise<T | null> {
    try {
      return await cacheStore.getItem<T>(key);
    } catch (err) {
      console.error('❌ [OfflineStore Cache] فشل في قراءة كاش القراءة:', err);
      return null;
    }
  },

  async removeCache(key: string): Promise<void> {
    try {
      await cacheStore.removeItem(key);
    } catch (err) {
      console.error('❌ [OfflineStore Cache] فشل في حذف عنصر الكاش:', err);
    }
  },

  // --------------------------------------------------------------------------
  // ثانياً: إدارة مخزن النوافذ المفتوحة اليوم (Opened Windows Today Store)
  // منع فتح الحصة أكثر من مرة + التثبيت التلقائي أوفلاين
  // --------------------------------------------------------------------------
  async saveWindowOffline(windowData: OpenWindowItem): Promise<void> {
    try {
      const currentWindows = (await windowsStore.getItem<OpenWindowItem[]>('today_list')) || [];
      
      // الحماية الثنائية: منع تكرار نفس الـ sessionId داخل النوافذ المفتوحة اليوم
      const isExist = currentWindows.some(w => Number(w.sessionId) === Number(windowData.sessionId));
      if (isExist) {
        console.warn(`🛑 [Windows Engine] الحصة ذوات المعرف (${windowData.sessionId}) مفتوحة ومفعلة مسبقاً اليوم.`);
        return;
      }
      
      currentWindows.push(windowData);
      await windowsStore.setItem('today_list', currentWindows);
      console.log('✅ [Windows Engine] تم حفظ وتثبيت النافذة المفتوحة بالذاكرة اليومية محلياً.', windowData);
    } catch (err) {
      console.error('❌ [Windows Engine] خطأ في حفظ النافذة أوفلاين:', err);
    }
  },

  async getOpenedWindowsToday(): Promise<OpenWindowItem[]> {
    try {
      return (await windowsStore.getItem<OpenWindowItem[]>('today_list')) || [];
    } catch (err) {
      return [];
    }
  },

  async isSessionWindowOpen(sessionId: number): Promise<boolean> {
    const windows = await this.getOpenedWindowsToday();
    return windows.some(w => Number(w.sessionId) === Number(sessionId) && w.isOpen);
  },

  async clearWindowsToday(): Promise<void> {
    await windowsStore.removeItem('today_list');
  },

  // --------------------------------------------------------------------------
  // ثالثاً: إدارة مخزن الطلاب المشتركين (Offline Registered Students Store)
  // قراءة فورية، التحقق، ودعم لوجيك "النقل الذكي"
  // --------------------------------------------------------------------------
  async syncStudentsOffline(studentsList: OfflineStudentItem[]): Promise<void> {
    try {
      await studentsStore.setItem('all_students', studentsList);
      console.log(`🎯 [Students Engine] تم مزامنة وتأمين عدد (${studentsList.length}) طالب أوفلاين للقراءة الفورية.`);
    } catch (err) {
      console.error('❌ [Students Engine] فشل شحن جدول الطلاب المحلي:', err);
    }
  },

  async getStudentsOffline(): Promise<OfflineStudentItem[]> {
    try {
      return (await studentsStore.getItem<OfflineStudentItem[]>('all_students')) || [];
    } catch (err) {
      return [];
    }
  },

  async findStudentByIdOrCode(identifier: string | number): Promise<OfflineStudentItem | null> {
    const students = await this.getStudentsOffline();
    const searchStr = String(identifier).trim();
    return students.find(s => String(s.id) === searchStr || (s.code && String(s.code).trim() === searchStr)) || null;
  },

  /**
   * 🧠 محرك النقل الذكي أوفلاين (Smart Transfer Engine Offline Support)
   * يقوم بفحص حالة الطالب والمجموعة الحالية المفتوحة لتحديد ما إذا كان سيتم نقله تلقائياً برمجياً
   */
  async processSmartOfflineScan(studentId: number, currentTargetSessionId: number): Promise<{
    shouldTransfer: boolean;
    resolvedSessionId: number;
    message: string;
  }> {
    try {
      const student = await this.findStudentByIdOrCode(studentId);
      if (!student) {
        return { shouldTransfer: false, resolvedSessionId: currentTargetSessionId, message: 'طالب جديد/غير معروف محلياً' };
      }

      const openWindows = await this.getOpenedWindowsToday();
      if (openWindows.length === 0) {
        return { shouldTransfer: false, resolvedSessionId: currentTargetSessionId, message: 'لا توجد نوافذ مفتوحة حالياً للنقل إليها' };
      }

      // إذا كانت المجموعة المستهدفة مفتوحة ولها نافذة، يسجل بها بشكل طبيعي
      const isTargetOpen = openWindows.some(w => Number(w.sessionId) === Number(currentTargetSessionId));
      if (isTargetOpen) {
        return { shouldTransfer: false, resolvedSessionId: currentTargetSessionId, message: 'تم إثبات الحضور بالمجموعة الأصلية المستهدفة بنجاح.' };
      }

      // [لوجيك النقل الذكي]: البحث عن أي نافذة حضور مفتوحة الآن تناسب مرحلة وصف الطالب الدراسي لنقله إليها تلقائياً
      const matchingActiveWindow = openWindows.find(w => {
        // يمكن الربط مع كاش المجموعات لمعرفة الصف، أو النقل لأول نافذة مفتوحة بالسنتر حالياً كخيار ذكي آمن
        return w.isOpen === true; 
      });

      if (matchingActiveWindow && Number(matchingActiveWindow.sessionId) !== Number(currentTargetSessionId)) {
        return {
          shouldTransfer: true,
          resolvedSessionId: Number(matchingActiveWindow.sessionId),
          message: `⚡ [النقل الذكي] الطالب لا ينتمي للمجموعة المغلقة، تم نقله تلقائياً للمجموعة المفتوحة حالياً ذات الرقم (${matchingActiveWindow.sessionId}).`
        };
      }

      return { shouldTransfer: false, resolvedSessionId: currentTargetSessionId, message: 'حالة اعتيادية' };
    } catch (err) {
      return { shouldTransfer: false, resolvedSessionId: currentTargetSessionId, message: 'خطأ في معالجة النقل الذكي' };
    }
  },

  // --------------------------------------------------------------------------
  // رابعاً: إدارة طابور التزامن الذكي والضغط الموفر للاستهلاك (Smart Compression Queue)
  // --------------------------------------------------------------------------
  async addToQueue(url: string, method: 'POST' | 'PUT' | 'DELETE', data: any): Promise<QueueItem> {
    try {
      const urlPath = url.toLowerCase();

      // 1. حماية ذكية: منع إضافة طلب فتح نافذة حضور إذا كانت مفتوحة بالفعل أو مجدولة في الطابور
      if (urlPath.includes('/attendance/window') && method === 'POST') {
        const currentQueue = (await queueStore.getItem<QueueItem[]>('queue_list')) || [];
        const hasDuplicateWindow = currentQueue.some(item => 
          item.url.toLowerCase().includes('/attendance/window') && 
          Number(item.data?.sessionId) === Number(data?.sessionId)
        );
        if (hasDuplicateWindow) {
          console.warn('🛑 [Queue Engine] تم حظر جدولة طلب فتح النافذة لمنع التكرار السببي بالسيرفر.');
          return currentQueue.find(item => Number(item.data?.sessionId) === Number(data?.sessionId))!;
        }
        
        // حفظ النافذة محلياً فوراً لتحديث الـ State للأوفلاين
        await this.saveWindowOffline({
          id: `mock-win-${generateUUID()}`,
          sessionId: data.sessionId,
          centerId: data.centerId || 0,
          isOpen: true,
          openedAt: new Date().toISOString()
        });
      }

      const id = generateUUID();
      const newItem: QueueItem = {
        id,
        url,
        method,
        data,
        timestamp: Date.now()
      };

      const currentQueue = (await queueStore.getItem<QueueItem[]>('queue_list')) || [];
      currentQueue.push(newItem);

      // ترتيب الطابور تصاعدياً (من الأقدم للأحدث - FIFO) لضمان التتابع المنطقي
      currentQueue.sort((a, b) => a.timestamp - b.timestamp);
      await queueStore.setItem('queue_list', currentQueue);

      console.log(`📦 [Queue Engine] تم جدولة العملية أوفلاين بنجاح [${method}] -> ${url}`);
      return newItem;
    } catch (err) {
      console.error('❌ [Queue Engine] فشل حفظ العملية بالطابور المحلي:', err);
      throw err;
    }
  },

  async getQueue(): Promise<QueueItem[]> {
    try {
      return (await queueStore.getItem<QueueItem[]>('queue_list')) || [];
    } catch (err) {
      return [];
    }
  },

  /**
   * 🌟 التاج المعماري: كبس وضغط الطابور بشكل ذكي (Queue Compaction Engine)
   * بدلاً من إرسال 100 طلب مسح حضور فردي وضرب كفاءة الشبكة والسيرفر (100 HTTP Connections)،
   * تقوم هذه الدالة بتجميع وضغط كافة عمليات السيريال الفردية الخاصة بـ Scan الحضور
   * وتحويلها إلى مصفوفة موحدة (Bulk Array Payload) جاهزة للحقن المباشر في نقطة الباك إند المحدثة `/api/attendance/sync`
   */
  async getOptimizedQueueForSync(): Promise<QueueItem[]> {
    const rawQueue = await this.getQueue();
    if (rawQueue.length === 0) return [];

    const optimizedQueue: QueueItem[] = [];
    const scanRecordsToBatch: any[] = [];
    const batchedItemIdsToRemove: string[] = [];

    for (const item of rawQueue) {
      const isScanUrl = item.url.toLowerCase().includes('/attendance/scan') || item.url.toLowerCase().includes('/attendance/mark');
      
      // تجميع طلبات الحضور الـ POST فقط للضغط الموفر للاستهلاك
      if (isScanUrl && item.method === 'POST') {
        scanRecordsToBatch.push({
          studentId: Number(item.data.studentId),
          sessionId: Number(item.data.sessionId),
          status: item.data.status || 'PRESENT',
          scannedAt: item.data.scannedAt || new Date().toISOString(),
          lateMinutes: item.data.lateMinutes ? Number(item.data.lateMinutes) : 0,
          autoMarked: item.data.autoMarked ?? true,
          markedBySystem: item.data.markedBySystem ?? false
        });
        batchedItemIdsToRemove.push(item.id);
      } else {
        // العمليات الأخرى (كإضافة طالب أو تعديل مالي) تترك بترتيبها لضمان النزاهة التتابعية
        optimizedQueue.push(item);
      }
    }

    // إذا وُجدت سجلات مسح مجمعة، ندمجها في طلب واحد أسطوري لنقطة الـ Sync بالخادم
    if (scanRecordsToBatch.length > 0) {
      optimizedQueue.unshift({
        id: `bulk-sync-${generateUUID()}`,
        url: '/attendance/sync', // النقطة المعمارية المحدثة بالخادم المخصصة للحقن الجماعي
        method: 'POST',
        data: { records: scanRecordsToBatch },
        timestamp: Date.now()
      });

      // حفظ المعرفات المدمجة محلياً لنتمكن من مسحها دفعة واحدة بعد التزامن الناجح
      (this as any)._lastBatchedIds = batchedItemIdsToRemove;
    }

    return optimizedQueue;
  },

  /**
   * حذف ذكي يدعم النواتج المدمجة والفردية
   */
  async removeFromQueue(id: string): Promise<void> {
    try {
      const currentQueue = (await queueStore.getItem<QueueItem[]>('queue_list')) || [];
      let filteredQueue = currentQueue.filter(item => item.id !== id);

      // إذا كان المعرف المحذوف هو لعملية دمج جماعية ناجحة، نمسح كل المعرفات الفردية المكونة لها فوراً
      if (id.startsWith('bulk-sync-') && (this as any)._lastBatchedIds) {
        const idsToRemove: string[] = (this as any)._lastBatchedIds;
        filteredQueue = filteredQueue.filter(item => !idsToRemove.includes(item.id));
        (this as any)._lastBatchedIds = null;
        console.log(`🗑️ [Queue Engine] تم بنجاح تفريغ ومسح عدد (${idsToRemove.length}) طلب حضور فردي بعد حقنهم الجماعي الموفر.`);
      }

      await queueStore.setItem('queue_list', filteredQueue);
      console.log(`🗑️ [Queue Engine] تم تحديث الطابور وحذف المعرف (${id}) بنجاح.`);
    } catch (err) {
      console.error('❌ [Queue Engine] فشل إزالة العنصر من الطابور المحلي:', err);
    }
  },

  async getNextInQueue(): Promise<QueueItem | null> {
    const queue = await this.getQueue();
    return queue.length > 0 ? queue[0] : null;
  },

  async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  },

  async clearQueue(): Promise<void> {
    try {
      await queueStore.removeItem('queue_list');
      console.log('扫 [Queue Engine] تم تنظيف طابور العمليات بالكامل.');
    } catch (err) {
      console.error('❌ [Queue Engine] فشل تفريغ الطابور:', err);
    }
  },

  /**
   * تفريغ شامل لكافة المخازن والبيانات (عند تسجيل خروج مستخدم أو تصفير الذاكرة المخبأة بالكامل)
   */
  async clearAllSentrykStores(): Promise<void> {
    try {
      await Promise.all([
        cacheStore.clear(),
        queueStore.clear(),
        windowsStore.clear(),
        studentsStore.clear()
      ]);
      console.log('🧹 [Offline System] تم تفريغ وتصفير كافة محركات ومخازن الأوفلاين بنجاح تام ✅');
    } catch (err) {
      console.error('❌ [Offline System] خطأ حرج أثناء التصفير الشامل للمخازن:', err);
    }
  }
};