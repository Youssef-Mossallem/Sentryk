import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, X, BookOpen,
  DollarSign, Check, Loader2, 
  Edit3, ChevronRight, Hash,
  User, Phone, GraduationCap, ShieldAlert,
  Search, Users, Layers, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';

// =============================================
// الواجهات وصياغة البيانات (TypeScript Interfaces)
// =============================================
interface IPriceConfig {
  id?: number;
  stage: 'PRIMARY' | 'MIDDLE' | 'HIGH';
  grades: number[]; 
  subscriptionType: 'PER_SESSION' | 'MONTHLY' | 'HALF_MONTH' | 'COURSE';
  price: number | string;
}

interface ITeacherStats {
  totalSessionsCount: number;
  totalActiveStudentsCount: number;
  totalEstimatedRevenue: number;
}

interface ITeacher {
  id: number;
  name: string;
  subject: string;
  phone?: string | null;
  createdAt: string;
  priceConfigs: IPriceConfig[];
  stats: ITeacherStats;
}

// =============================================
// الثوابت والمصطلحات التعليمية
// =============================================
const STAGES = {
  PRIMARY: 'المرحلة الابتدائية',
  MIDDLE: 'المرحلة الإعدادية',
  HIGH: 'المرحلة الثانوية'
} as const;

const SUB_TYPES = {
  PER_SESSION: 'الحصة المفردة',
  MONTHLY: 'الاشتراك الشهري الأساسي',
  HALF_MONTH: 'نصف شهر (تلقائي)',
  COURSE: 'الكورس الكامل / الترم'
} as const;

const STAGE_GRADES_MAP = {
  PRIMARY: [1, 2, 3, 4, 5, 6], 
  MIDDLE: [1, 2, 3],          
  HIGH: [1, 2, 3]             
};

const GRADE_NAMES: Record<'PRIMARY' | 'MIDDLE' | 'HIGH', Record<number, string>> = {
  PRIMARY: {
    1: 'الأول الابتدائي',
    2: 'الثاني الابتدائي',
    3: 'الثالث الابتدائي',
    4: 'الرابع الابتدائي',
    5: 'الخامس الابتدائي',
    6: 'السادس الابتدائي',
  },
  MIDDLE: {
    1: 'الأول الإعدادي',
    2: 'الثاني الإعدادي',
    3: 'الثالث الإعدادي',
  },
  HIGH: {
    1: 'الأول الثانوي',
    2: 'الثاني الثانوي',
    3: 'الثالث الثانوي',
  }
};

// =============================================
// المكون الفرعي: نافذة إضافة وتعديل المدرس (Teacher Modal)
// =============================================
const TeacherModal = ({ isOpen, onClose, onSubmit, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  initialData: ITeacher | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [priceConfigs, setPriceConfigs] = useState<IPriceConfig[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialData) {
        setName(initialData.name);
        setSubject(initialData.subject);
        setPhone(initialData.phone || '');
        
        // فلترة حزم نصف الشهر التلقائية من العرض لمنع تكرار الحزم للبرودكت أثناء التعديل
        const filteredConfigs = (initialData.priceConfigs || [])
          .filter((cfg: IPriceConfig) => cfg.subscriptionType !== 'HALF_MONTH')
          .map((cfg: IPriceConfig) => ({
            stage: cfg.stage,
            grades: Array.isArray(cfg.grades) ? cfg.grades : [],
            subscriptionType: cfg.subscriptionType,
            price: cfg.price
          }));
        setPriceConfigs(filteredConfigs.length > 0 ? filteredConfigs : [{ stage: 'HIGH', grades: [3], subscriptionType: 'MONTHLY', price: '' }]);
      } else {
        setName('');
        setSubject('');
        setPhone('');
        setPriceConfigs([{ stage: 'HIGH', grades: [3], subscriptionType: 'MONTHLY', price: '' }]);
      }
    }
  }, [initialData, isOpen]);

  const isFormValid = useMemo(() => {
    return (
      name.trim() !== '' &&
      subject.trim() !== '' &&
      priceConfigs.length > 0 &&
      priceConfigs.every(cfg => 
        cfg.grades.length > 0 && 
        cfg.price !== '' && 
        Number(cfg.price) >= 0
      )
    );
  }, [name, subject, priceConfigs]);

  const addPriceConfig = () => {
    setPriceConfigs([...priceConfigs, { stage: 'HIGH', grades: [3], subscriptionType: 'MONTHLY', price: '' }]);
  };

  const removePriceConfig = (index: number) => {
    setPriceConfigs(priceConfigs.filter((_, i) => i !== index));
  };

  const updateConfigField = (index: number, field: keyof IPriceConfig, value: any) => {
    const updated = [...priceConfigs];
    if (field === 'stage') {
      updated[index].stage = value;
      updated[index].grades = [STAGE_GRADES_MAP[value as keyof typeof STAGE_GRADES_MAP][0]];
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPriceConfigs(updated);
  };

  const toggleGradeSelection = (index: number, gradeNum: number) => {
    const updated = [...priceConfigs];
    const currentGrades = updated[index].grades;
    if (currentGrades.includes(gradeNum)) {
      updated[index].grades = currentGrades.filter(g => g !== gradeNum);
    } else {
      updated[index].grades = [...currentGrades, gradeNum].sort((a, b) => a - b);
    }
    setPriceConfigs(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        phone: phone.trim() || null,
        priceConfigs: priceConfigs.map(cfg => ({
          stage: cfg.stage,
          grades: cfg.grades.map(Number),
          subscriptionType: cfg.subscriptionType,
          price: Number(cfg.price)
        }))
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "حدث خطأ غير متوقع أثناء حفظ بيانات المدرس");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* هيدر المودال */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black dark:text-white">
                {initialData ? 'تعديل بيانات وحزم المدرس' : 'تسجيل مدرس جديد بالمنظومة'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">ربط المدرس بالمادة وتعيين استراتيجية التسعير المشتركة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all">
            <X size={22} />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1" dir="rtl">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-black">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* الحقول الأساسية للمدرس */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1.5">
                <User size={14} className="text-indigo-500" /> اسم المدرس ثلاثي
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أ. محمد أحمد علي"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" /> التخصص / المادة الدراسية
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: اللغة العربية"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1.5">
                <Phone size={14} className="text-indigo-500" /> رقم الهاتف (اختياري)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01xxxxxxxxx"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* إدارة حزم الأسعار */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black dark:text-white">إعداد حزم التسعير والسنوات المستهدفة</h4>
                <p className="text-[11px] text-slate-400 font-bold">يمكنك إضافة حزم متعددة وتعيين أسعار مختلفة حسب المرحلة والمجموعة</p>
              </div>
              <button
                type="button"
                onClick={addPriceConfig}
                className="h-9 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center gap-2 text-xs font-black transition-all"
              >
                <Plus size={14} /> إضافة حزمة سعرية
              </button>
            </div>

            <div className="space-y-4">
              {priceConfigs.map((cfg, index) => (
                <div 
                  key={index} 
                  className="p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl relative space-y-4"
                >
                  {priceConfigs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriceConfig(index)}
                      className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* المرحلة */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">المرحلة الدراسية</label>
                      <select
                        value={cfg.stage}
                        onChange={(e) => updateConfigField(index, 'stage', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="PRIMARY">{STAGES.PRIMARY}</option>
                        <option value="MIDDLE">{STAGES.MIDDLE}</option>
                        <option value="HIGH">{STAGES.HIGH}</option>
                      </select>
                    </div>

                    {/* نوع الاشتراك */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">نوع وهيكل الاشتراك</label>
                      <select
                        value={cfg.subscriptionType}
                        onChange={(e) => updateConfigField(index, 'subscriptionType', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="MONTHLY">{SUB_TYPES.MONTHLY}</option>
                        <option value="PER_SESSION">{SUB_TYPES.PER_SESSION}</option>
                        <option value="COURSE">{SUB_TYPES.COURSE}</option>
                      </select>
                    </div>

                    {/* السعر */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">قيمة الاشتراك (ج.م)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="0.00"
                          value={cfg.price}
                          onChange={(e) => updateConfigField(index, 'price', e.target.value)}
                          className="w-full h-11 pr-4 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white focus:outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* السنوات الدراسية تابعة للمرحلة */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">السنوات الدراسية المشمولة بالحزمة السعرية:</label>
                    <div className="flex flex-wrap gap-2">
                      {STAGE_GRADES_MAP[cfg.stage].map((gradeNum) => {
                        const isSelected = cfg.grades.includes(gradeNum);
                        return (
                          <button
                            type="button"
                            key={gradeNum}
                            onClick={() => toggleGradeSelection(index, gradeNum)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {GRADE_NAMES[cfg.stage][gradeNum as keyof typeof GRADE_NAMES['PRIMARY']]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
            >
              إلغاء التراجع
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {initialData ? 'حفظ التعديلات الحالية' : 'تأكيد تسجيل المعلم'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// =============================================
// المكون الرئيسي للملف الإداري لصفحة المدرسين
// =============================================
export default function Teachers() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serverErrorModal, setServerErrorModal] = useState<string | null>(null);

  const [modal, setModal] = useState<{ open: boolean; data: ITeacher | null }>({
    open: false,
    data: null,
  });

  // جلب البيانات بالكامل من السيرفر
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      if (res.data && res.data.success) {
        setTeachers(res.data.teachers || []);
      }
    } catch (err: any) {
      console.error("Error fetching teachers data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // احتساب الإحصائيات الشاملة للداشبورد العلوي فورياً للسنتر بالكامل
  const globalDashboardStats = useMemo(() => {
    return teachers.reduce((acc, current) => {
      acc.totalSessions += current.stats?.totalSessionsCount || 0;
      acc.totalActiveStudents += current.stats?.totalActiveStudentsCount || 0;
      acc.totalEstimatedRevenue += current.stats?.totalEstimatedRevenue || 0;
      return acc;
    }, { totalTeachers: teachers.length, totalSessions: 0, totalActiveStudents: 0, totalEstimatedRevenue: 0 });
  }, [teachers]);

  // معالجة البحث والتصفية الفورية
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const query = searchQuery.toLowerCase().trim();
    return teachers.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.subject.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  // إرسال البيانات المجمعة للسيرفر (إضافة أو تعديل)
  const handleTeacherActionSubmit = async (payload: any) => {
    if (modal.data && modal.data.id) {
      // حالة التعديل (PUT)
      const res = await api.put(`/teachers/${modal.data.id}`, payload);
      if (res.data && res.data.success) {
        fetchTeachers();
      }
    } else {
      // حالة الإضافة (POST)
      const res = await api.post('/teachers', payload);
      if (res.data && res.data.success) {
        fetchTeachers();
      }
    }
  };

  // معالجة وحماية عملية حذف المدرس بذكاء وأمان مطلق
  const handleTeacherDeleteClick = async (teacherItem: ITeacher) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف المدرس "${teacherItem.name}" نهائياً من المنظومة؟`)) return;

    try {
      const res = await api.delete(`/teachers/${teacherItem.id}`);
      if (res.data && res.data.success) {
        setTeachers(prev => prev.filter(t => t.id !== teacherItem.id));
      }
    } catch (err: any) {
      const backendErrorMsg = err.response?.data?.error || "حدث خطأ داخلي أثناء محاولة تنفيذ عملية حذف المدرس.";
      setServerErrorModal(backendErrorMsg);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen" dir="rtl">
      
      {/* الهيدر الرئيسي والإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">إدارة الهيئة التعليمية</h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">تسجيل المعلمين، هيكلة تسعير الاشتراكات، ومراقبة المبيعات الحية للمجموعات</p>
        </div>

        <button
          onClick={() => setModal({ open: true, data: null })}
          className="h-12 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl flex items-center gap-2.5 transition-all shadow-lg shadow-indigo-600/10"
        >
          <Plus size={16} /> تسجيل مدرس جديد
        </button>
      </div>

      {/* لوحة المؤشرات والإحصائيات الشاملة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl"><GraduationCap size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black">إجمالي المعلمين</p>
            <h3 className="text-xl font-black dark:text-white mt-0.5">{globalDashboardStats.totalTeachers}</h3>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><Layers size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black">إجمالي المجموعات والسيشنز</p>
            <h3 className="text-xl font-black dark:text-white mt-0.5">{globalDashboardStats.totalSessions}</h3>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl"><Users size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black">الطلاب المشتركين حالياً</p>
            <h3 className="text-xl font-black dark:text-white mt-0.5">{globalDashboardStats.totalActiveStudents}</h3>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl"><DollarSign size={22} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black">الدخل المتوقع للاشتراكات</p>
            <h3 className="text-xl font-black dark:text-white mt-0.5">{globalDashboardStats.totalEstimatedRevenue.toLocaleString('ar-EG')} <small className="text-[10px]">ج.م</small></h3>
          </div>
        </div>
      </div>

      {/* فلتر البحث السريع */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مدرس بالاسم أو التخصص الدراسي المكتوب..."
          className="w-full h-12 pr-11 pl-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* حالة التحميل الذكي */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-xs font-black text-slate-400">جاري تحميل بيانات لوحة المعلمين وحزم الأسعار الحية...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <GraduationCap size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">لا يوجد مدرسين مسجلين يطابقون مدخلات البحث الحالية</p>
        </div>
      ) : (
        /* كروت المعلمين الأسطورية */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <motion.div
              layout
              key={teacher.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
            >
              {/* ترويسة الكارت الأساسية */}
              <div className="p-5 flex justify-between items-start gap-3 border-b border-slate-50 dark:border-slate-800/60">
                <div className="flex gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-sm">👨‍🏫</div>
                  <div>
                    <h3 className="font-black text-base text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{teacher.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5"><BookOpen size={12} className="text-indigo-500" /> {teacher.subject}</p>
                    {teacher.phone && <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1" dir="ltr"><Phone size={11} className="text-emerald-500" /> {teacher.phone}</p>}
                  </div>
                </div>

                {/* خيارات التحكم الحصري للمدير الإداري */}
                <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModal({ open: true, data: teacher })}
                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 rounded-lg transition-all"
                    title="تعديل المدرس وحزم أسعاره"
                  >
                    <Edit3 size={15} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleTeacherDeleteClick(teacher)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition-all"
                      title="حذف المدرس نهائياً"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* الإحصائيات الحية داخل الكارت للمدرس الحالي */}
              <div className="px-5 py-4 bg-slate-50/40 dark:bg-slate-800/10 grid grid-cols-3 gap-2 text-center border-b border-slate-50 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">المجموعات</span>
                  <span className="text-xs font-black text-slate-700 dark:text-white mt-0.5 block">{teacher.stats?.totalSessionsCount || 0}</span>
                </div>
                <div className="border-x border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">الطلاب</span>
                  <span className="text-xs font-black text-slate-700 dark:text-white mt-0.5 block">{teacher.stats?.totalActiveStudentsCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">مبيعات متوقعة</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">{(teacher.stats?.totalEstimatedRevenue || 0).toLocaleString('ar-EG')} <small className="text-[9px]">ج.م</small></span>
                </div>
              </div>

              {/* قائمة حزم الأسعار الحالية والمربوطة بالمعلم */}
              <div className="p-5 flex-1 space-y-3">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block">هيكل التسعير النشط للمجموعات:</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {(teacher.priceConfigs || [])
                    .filter(c => c.subscriptionType !== 'HALF_MONTH') // إخفاء النصف شهري التلقائي من لوحة العرض لتجنب التكدس البصري
                    .map((cfg, i) => (
                      <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-xl text-xs">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-700 dark:text-slate-200 block">{STAGES[cfg.stage]}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {cfg.grades.map(g => GRADE_NAMES[cfg.stage][g]).join(' ، ')} • <span className="text-indigo-500">{SUB_TYPES[cfg.subscriptionType]}</span>
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 font-black text-slate-800 dark:text-white">
                          {cfg.price} <small className="text-[9px] text-slate-400 font-bold">ج.م</small>
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* فوتر الكارت الصغير */}
              <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Hash size={11} /> كود المعلم الفريد: {teacher.id}</span>
                <ChevronRight size={13} className="group-hover:translate-x-[-3px] text-indigo-500 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* مودال التحذير الإداري وجدار الأمان في حالة منع الحذف لربط البيانات */}
      <AnimatePresence>
        {serverErrorModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950 max-w-xl w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">جدار حماية المنظومة المستقرة 🧠</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed text-justify bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border">
                {serverErrorModal}
              </p>
              <button
                onClick={() => setServerErrorModal(null)}
                className="w-full h-11 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-xs rounded-xl hover:opacity-90"
              >
                فهمت، مراجعة ونقل الطلاب والاشتراكات أولاً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* المودال التفاعلي للإضافة والتحديث */}
      <AnimatePresence>
        {modal.open && (
          <TeacherModal
            isOpen={modal.open}
            onClose={() => setModal({ open: false, data: null })}
            initialData={modal.data}
            onSubmit={handleTeacherActionSubmit}
          />
        )}
      </AnimatePresence>

      {/* ستايل مخصص لشرائط التصفح السلسة المدمجة */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}