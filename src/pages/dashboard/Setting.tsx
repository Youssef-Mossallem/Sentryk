import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  Gift,
  Info,
  Loader2,
  Lock,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  Layers
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

// ===========================================================================
// 1. التعريفات الهيكلية الصارمة (TypeScript Interfaces) لبيانات السنتر والأنظمة التابعة
// ===========================================================================
interface SubscriptionSystem {
  hasSubscription: boolean;
  status: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  isExpired: boolean;
}

interface ReferralStats {
  totalInvited: number;
  successfulReferrals: number;
  pendingReferrals: number;
}

interface ReferralRewards {
  totalFreeMonthsEarned: number;
  promoMonthsUsed: number;
  isPromoPaused: boolean;
  activePromoDetails: { code: string; discountPercent: number } | null;
}

interface InvitedCenter {
  id: string;
  name: string;
  phone: string;
  plan: string;
  createdAt: string;
  referralMilestoneAchieved: boolean;
}

interface ReferralSystem {
  referralCode: string;
  referralCountInDb: number;
  stats: ReferralStats;
  rewards: ReferralRewards;
  invitedCentersList: InvitedCenter[];
  invitedBy: { id: string; name: string } | null;
}

interface CenterMetrics {
  studentsCount: number;
  teachersCount: number;
  roomsCount: number;
}

interface CenterData {
  id: string;
  name: string;
  phone: string;
  plan: string;
  maxStudents: number;
  maxUsers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics: CenterMetrics;
  subscriptionSystem: SubscriptionSystem;
  referralSystem: ReferralSystem;
}

export default function CenterSettings() {
  // --- حالات المكون (Component States) ---
  const [center, setCenter] = useState<CenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plan: ''
  });

  // المزامنة الفورية عند التحميل الأول
  useEffect(() => {
    fetchCenterData();
  }, []);

  // --- جلب البيانات المعمارية الكبرى للسنتر من السيرفر ---
  const fetchCenterData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/centers');
      if (res.data.success) {
        const centerData = res.data.center as CenterData;
        setCenter(centerData);
        setFormData({
          name: centerData.name || '',
          phone: centerData.phone || '',
          plan: centerData.plan || ''
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشل في تحميل بيانات السنتر التحليلية");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- تحديث معلومات الهوية والبيانات العامة ---
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("اسم المركز الدراسي مطلوب قانوناً");
    if (!formData.phone.trim()) return toast.error("رقم التواصل الرسمي مطلوب للتنسيق");
    
    setSaving(true);
    try {
      const res = await api.put('/centers', formData);
      if (res.data.success) {
        toast.success("تم تحديث البيانات المعمارية وتأمين المزامنة التلقائية بنجاح ✅");
        // إعادة جلب البيانات لتحديث واجهة المستخدم بالكامل بناءً على مخرجات السيرفر
        await fetchCenterData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ غير متوقع أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  // --- توليد أو إعادة بناء كود الإحالة يدوياً ---
  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const res = await api.post('/centers/generate-code');
      if (res.data.success) {
        toast.success("تم توليد وتأصيل كود الإحالة القيادي الجديد الخاص بك 🎯");
        await fetchCenterData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشل توليد الكود التسويقي");
    } finally {
      setGeneratingCode(false);
    }
  };

  // --- تفعيل آلية النسخ السريع لكود الإحالة لحافظة الجهاز ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ كود الإحالة، يمكنك مشاركته وبدء جني المكافآت 🎁");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- التدمير الذري والمسح النهائي الشامل للمنشأة التعليمية ---
  const handleDeleteCenter = async () => {
    try {
      const res = await api.delete('/centers');
      if (res.data.success) {
        toast.success("تم تدمير السنتر وتطهير السجلات بيقين بياني تام 🧨");
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.replace('/register');
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشلت عملية الحذف الكبرى لوجود قيود نشطة");
      setShowDeleteConfirm(false);
    }
  };

  // --- واجهة التحميل الملحمية الرائعة (Loading Skeleton Animation) ---
  if (loading && !center) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-primary-600" size={60} />
        <Settings className="absolute inset-0 m-auto text-primary-300 animate-pulse" size={24} />
      </div>
      <p className="font-black text-slate-500 tracking-wide animate-pulse text-lg">جاري جلب البنية التحتية واستخراج الإعدادات العظمى...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-right" dir="rtl">
      
      {/* ===========================================================================
          HEADER SECTION - لوحة التحكم والترويسة العلوية السيادية
          =========================================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-[1.8rem] shadow-md border border-slate-100 dark:border-slate-800 text-primary-600">
            <Settings size={36} className="animate-spin-slow text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">إعدادات المنصة الحركية</h1>
            <p className="text-slate-400 text-sm font-bold mt-1">إدارة الهوية المؤسسية، الصلاحيات البيانية، لوحة الاشتراكات والإحالات السيادية</p>
          </div>
        </div>
        <button 
          onClick={fetchCenterData}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-black text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> تحديث وتحليل البيانات
        </button>
      </div>

      {/* ===========================================================================
          NAVIGATION TABS - أزرار التنقل الراديكالية الكبرى
          =========================================================================== */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-800/40 w-fit rounded-[1.8rem] border border-slate-200 dark:border-slate-800/80 backdrop-blur-md mx-4 md:mx-0">
        {[
          { id: 'general', label: 'البيانات العامة والهوية', icon: <Building2 size={16}/> },
          { id: 'subscription', label: 'أنظمة ومراقبة الصلاحية', icon: <Award size={16}/> },
          { id: 'referral', label: 'المنظومة التسويقية والإحالات', icon: <Sparkles size={16}/> },
          { id: 'danger', label: 'منطقة الخطر والتدمير المعزول', icon: <ShieldAlert size={16}/> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab.id 
                ? (tab.id === 'danger' ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30' : 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md') 
                : 'text-slate-500 hover:bg-white/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===========================================================================
          MAIN CONTENT ZONE - حاوية العرض والتحريك الفاخرة للتبويبات
          =========================================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[450px] mx-4 md:mx-0">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <motion.form 
              key="general"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleUpdate} className="p-8 md:p-12 space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 pr-2">
                    <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" /> اسم المركز الدراسي السيادي
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: أكاديمية الأوائل التعليمية"
                    className="w-full p-5 rounded-[1.6rem] bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold dark:text-white outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 pr-2">
                    <Phone size={18} className="text-indigo-600 dark:text-indigo-400" /> رقم التواصل والخط الساخن للمركز
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="010xxxxxxx"
                    className="w-full p-5 rounded-[1.6rem] bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold dark:text-white outline-none text-left shadow-inner"
                  />
                </div>
              </div>

              {/* لوحة استعراض حدود النظام التشغيلية المغلقة */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><Users size={22} /></div>
                  <div>
                    <h5 className="text-xs font-black text-slate-400">الحد الأقصى للطلاب بالنظام</h5>
                    <p className="text-lg font-black text-slate-700 dark:text-white mt-1">{center?.maxStudents?.toLocaleString() || '---'} طالب</p>
                  </div>
                  <Lock size={14} className="mr-auto text-slate-300" />
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500"><Layers size={22} /></div>
                  <div>
                    <h5 className="text-xs font-black text-slate-400">الحد الأقصى لحسابات السكرتارية / الإداريين</h5>
                    <p className="text-lg font-black text-slate-700 dark:text-white mt-1">{center?.maxUsers || '---'} مستخدمين إداريين</p>
                  </div>
                  <Lock size={14} className="mr-auto text-slate-300" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  type="submit" disabled={saving}
                  className="group flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/25 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} className="group-hover:scale-110 transition-transform" />}
                  حفظ وتأصيل التعديلات الجديدة
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 2: SUBSCRIPTION SYSTEMS */}
          {activeTab === 'subscription' && (
            <motion.div 
              key="subscription"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-8 md:p-12 space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* كارت الاشتراك الملحمي الرئيسي */}
                <div className="lg:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 flex flex-col justify-between min-h-[260px]">
                  <Award className="absolute -bottom-10 -left-10 w-56 h-56 text-white/10 -rotate-12 pointer-events-none" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md">خطة الاشتراك الحالية في SaaS</span>
                      <h3 className="text-4xl font-black mt-4 tracking-tight text-white dark:text-white">{center?.plan || 'الباقة القياسية Standard'}</h3>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 ${center?.subscriptionSystem?.isExpired ? 'bg-rose-500/30 text-rose-200' : 'bg-emerald-500/30 text-emerald-200'}`}>
                      <CheckCircle2 size={16} />
                      {center?.subscriptionSystem?.status}
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-white/5">
                      <Calendar size={16} className="text-indigo-200" />
                      <span className="font-bold opacity-80">بداية الدورة المالية:</span>
                      <span className="font-black">{center?.subscriptionSystem?.startDate ? new Date(center.subscriptionSystem.startDate).toLocaleDateString('ar-EG') : '---'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl border border-white/5">
                      <Calendar size={16} className="text-indigo-200" />
                      <span className="font-bold opacity-80">تاريخ انتهاء الصلاحية:</span>
                      <span className="font-black">{center?.subscriptionSystem?.endDate ? new Date(center.subscriptionSystem.endDate).toLocaleDateString('ar-EG') : '---'}</span>
                    </div>
                  </div>
                </div>

                {/* كارت عداد الأيام المتبقية الدقيق */}
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/60 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-black text-2xl border-4 border-indigo-500/20 shadow-md">
                    {center?.subscriptionSystem?.daysRemaining}
                  </div>
                  <h4 className="text-lg font-black dark:text-white">الأيام المتبقية على التجديد</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px]">يتم تحديث هذه المؤشرات والعدادات لحظياً لضمان استقرار عمليات الفحص ومزامنة البيانات السحابية للسنتر</p>
                </div>
              </div>

              {/* جدول الإحصائيات التراكمية السريعة لموارد المركز الحالية */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 px-2 flex items-center gap-2"><Layers size={16}/> إحصائيات الاستهلاك الإجمالي للسنتر حالياً</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'إجمالي الطلاب المقيدين', count: center?.metrics?.studentsCount, desc: 'طالب مسجل بقاعدة البيانات' },
                    { label: 'المدرسين والأكاديميين', count: center?.metrics?.teachersCount, desc: 'معلم يمتلك حصص ومجموعات نَشطة' },
                    { label: 'القاعات والمقرات التدريبية', count: center?.metrics?.roomsCount, desc: 'غرفة صفية مجهزة هندسياً' }
                  ].map((metric, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs font-black text-slate-400">{metric.label}</span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white my-3">{metric.count ?? 0}</span>
                      <span className="text-[10px] font-bold text-slate-400">{metric.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MARKETING AND REFERRAL SYSTEM */}
          {activeTab === 'referral' && (
            <motion.div 
              key="referral"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-8 md:p-12 space-y-10"
            >
              {/* لوحة توليد ومشاركة كود الإحالة التلقائي / اليدوي */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div className="lg:col-span-2 p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <Gift className="absolute -bottom-12 -left-12 w-48 h-48 text-white/10 rotate-12 pointer-events-none" />
                  <div className="space-y-2">
                    <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-black">نظام التسويق وبناء المكافآت التشاركي</span>
                    <h3 className="text-2xl font-black mt-2">شارك كود الإحالة واكسب شهوراً مجانية!</h3>
                    <p className="text-xs text-emerald-100 font-bold max-w-xl leading-relaxed">قانون المنصة السيادي: كل مركز جديد يسجل من خلال الرابط أو الكود الخاص بك ويقوم بتسديد اشتراكه الأول، يمنحك تلقائياً شهراً كاملاً مجانياً يضاف مباشرة لحساب صلاحيتك.</p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="w-full bg-black/15 border border-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md">
                      <span className="text-xs font-black tracking-wider text-emerald-200">كود الإحالة النشط:</span>
                      <span className="text-lg font-black tracking-widest font-mono text-white select-all px-2">{center?.referralSystem?.referralCode}</span>
                    </div>
                    <button 
                      onClick={() => center?.referralSystem?.referralCode && copyToClipboard(center.referralSystem.referralCode)}
                      className="w-full sm:w-auto px-6 py-4 bg-white text-emerald-700 font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 shadow-lg whitespace-nowrap"
                    >
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} النسخ السريع لكود الإحالة
                    </button>
                  </div>
                </div>

                {/* كارت الخيارات اليدوية لكود الأدمن */}
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-black dark:text-white flex items-center gap-2"><Settings size={14}/> خيارات تحكم الإدارة العليا</h4>
                    <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">يتم إنشاء كود الإحالة تلقائياً بمجرد إنشاء الحساب، إذا كنت تريد إتلاف الكود القديم وإعادة بناء هيكل الكود من جديد، يمكنك النقر هنا:</p>
                  </div>
                  <button
                    disabled={generatingCode}
                    onClick={handleGenerateCode}
                    className="w-full p-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {generatingCode ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />} إعادة توليد وبناء الكود هندسياً
                  </button>
                </div>
              </div>

              {/* شبكة إحصائيات الإحالة التحليلية المتقدمة */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 px-2">📊 لوحة أداء الروابط والمكافآت المكتسبة</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'إجمالي السناتر المسجلة بسببك', value: center?.referralSystem?.stats?.totalInvited, color: 'text-indigo-600 dark:text-indigo-400' },
                    { label: 'إحالات ناجحة (فعّالة ماليّاً)', value: center?.referralSystem?.stats?.successfulReferrals, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'إحالات معلّقة (قيد التجربة)', value: center?.referralSystem?.stats?.pendingReferrals, color: 'text-amber-500' },
                    { label: 'شهور مجانية مكتسبة', value: center?.referralSystem?.rewards?.totalFreeMonthsEarned, color: 'text-rose-600 dark:text-rose-400', isReward: true }
                  ].map((stat, i) => (
                    <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl relative overflow-hidden">
                      {stat.isReward && <Gift className="absolute right-2 bottom-2 w-16 h-16 text-slate-400/5 -rotate-12 pointer-events-none" />}
                      <span className="text-xs font-black text-slate-400 block min-h-[32px]">{stat.label}</span>
                      <span className={`text-4xl font-black block mt-2 ${stat.color}`}>{stat.value ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* القائمة التفصيلية للمراكز التي استخدمت كود السنتر */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 px-2 flex items-center gap-2">📋 سجل السناتر المدعوة وتأكيد التحقق</h4>
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {center?.referralSystem?.invitedCentersList && center.referralSystem.invitedCentersList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs font-black border-b border-slate-100 dark:border-slate-800">
                            <th className="p-4">اسم السنتر المدعو</th>
                            <th className="p-4">رقم الهاتف للتحقق</th>
                            <th className="p-4">الباقة المختارة</th>
                            <th className="p-4">تاريخ الانضمام للـ SaaS</th>
                            <th className="p-4 text-center">حالة الهدف المالي والمكافأة</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600 dark:text-slate-300 divide-y divide-slate-50 dark:divide-slate-800/40">
                          {center.referralSystem.invitedCentersList.map((invited) => (
                            <tr key={invited.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="p-4 font-black text-slate-800 dark:text-white">{invited.name}</td>
                              <td className="p-4 font-mono text-left" dir="ltr">{invited.phone}</td>
                              <td className="p-4"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] font-black">{invited.plan || 'Standard'}</span></td>
                              <td className="p-4">{new Date(invited.createdAt).toLocaleDateString('ar-EG')}</td>
                              <td className="p-4 text-center">
                                {invited.referralMilestoneAchieved ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-black">
                                    <CheckCircle2 size={12} /> ناجحة ومحتسبة ✅
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl font-black">
                                    <Loader2 size={12} className="animate-spin" /> قيد المراجعة والدفع ⏳
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-2">
                      <p className="text-sm font-black text-slate-400">لا توجد سناتر أو مراكز مسجلة تحت كود الإحالة الخاص بك حتى الآن</p>
                      <p className="text-xs font-bold text-slate-400/70">ابدأ بنسخ ومشاركة الكود مع زملائك الأكاديميين وأصحاب المراكز التعليمية لجني الشهور المجانية وبناء مجتمعك</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DANGER ZONE */}
          {activeTab === 'danger' && (
            <motion.div 
              key="danger"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 md:p-12"
            >
              <div className="bg-rose-50/40 dark:bg-rose-950/10 border-2 border-rose-100 dark:border-rose-900/40 p-8 md:p-10 rounded-[2.5rem] text-center md:text-right">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl shadow-rose-600/30">
                    <ShieldAlert size={48} className="animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-2xl font-black text-rose-600">التدمير الذري للسنتر وتصفية الحساب نهائياً</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed max-w-2xl">
                      إن هذا الإجراء خطير وسيادي ومحمي بـ <span className="text-rose-600 font-black">جداول متسلسلة صارمة (Prisma Transactions)</span>. بمجرد تأكيد التنفيذ، سيقوم النظام باقتلاع ومسح السنتر وكل ما يرتبط به من طلاب، معلمين، غرف، سجلات حضور وذكاء اصطناعي، ومحافظ واتساب. لا يمكن الرجوع عن هذه الخطوة تحت أي ظرف من الظروف الرقمية.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-10 py-5 bg-rose-600 text-white rounded-[1.5rem] font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/25 active:scale-95 whitespace-nowrap"
                  >
                    بدء عملية الحذف الشامل
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===========================================================================
          METADATA INFO - هوامش السجل الزمني التوثيقي السفلي
          =========================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
             <Info size={22} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الانضمام والتأسيس الرقمي للسنتر</p>
             <p className="text-sm font-black text-slate-600 dark:text-slate-300 mt-0.5">
               {center?.createdAt ? new Date(center.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' }) : '---'}
             </p>
           </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500 bg-amber-500/10">
             <AlertTriangle size={22} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر تحديث معقّد للملف التعريفي بالـ DB</p>
             <p className="text-sm font-black text-slate-600 dark:text-slate-300 mt-0.5">
               {center?.updatedAt ? new Date(center.updatedAt).toLocaleDateString('ar-EG', { dateStyle: 'full' }) : '---'}
             </p>
           </div>
        </div>
      </div>

      {/* ===========================================================================
          CONFIRMATION MODAL - مودال التأكيد الحاسم والمحمي للتدمير والمسح النهائي
          =========================================================================== */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/60">
            <motion.div 
              initial={{ scale: 0.94, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.8rem] p-10 text-center space-y-8 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-rose-600" />
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trash2 size={46} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black dark:text-white">تأكيد عملية الحذف والتصفية النهائية</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">
                  أنت على وشك اقتلاع سنتر <span className="text-rose-600 font-black px-1 underline text-base">{center?.name}</span> بالكامل من جذوره. سيقوم النظام بعمل خروج آمن وتصفية فورية لكافة بيانات الاعتماد والـ Tokens من متصفحك.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-4.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black transition-all text-sm"
                >
                  إلغاء وتراجع فوراً
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteCenter}
                  className="p-4.5 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/30 hover:bg-rose-700 active:scale-95 transition-all text-sm"
                >
                  تأكيد الحذف النهائي والمحو والتطهير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}