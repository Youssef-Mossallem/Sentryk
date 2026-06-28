import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  BookOpen,
  CalendarClock,
  CreditCard,
  Download,
  MessageSquare,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Users,
  UserX,
  X,
  Zap,
  QrCode,
  Gift,
  ShieldAlert,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// ===========================================================================
// --- تعريف الواجهات الصارمة (TypeScript Interfaces) لضمان بيئة عمل خالية من الأخطاء ---
// ===========================================================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SaasLimits {
  maxStudents: number;
  currentStudents: number;
  remainingSeats: number;
}

interface ReferralSystem {
  code: string | null;
  totalReferralsAllTime: number;
  referralsThisMonth: number;
  bonusDaysEarnedThisMonth: number;
  bonusMonthsEarnedThisMonth: number;
}

interface StudentStats {
  total: number;
  active: number;
  expired: number;
  nearExpiry: number;
}

interface RevenueStats {
  thisMonth: number;
  lastMonth: number;
  difference: number;
  trend: 'up' | 'down';
}

interface CommunicationStats {
  messages: number;
  balanceInMoney: string;
  pricePerMessage: number;
  sentThisMonth: number;
}

interface ContentStats {
  teachers: number;
  sessions: number;
}

interface AttendanceStats {
  todayScans: number;
}

interface ActivityLog {
  id: number;
  time: string | null;
  user: string;
  action: string;
  target: string | null;
  details: any;
}

interface DashboardStats {
  saasLimits: SaasLimits;
  referralSystem: ReferralSystem;
  students: StudentStats;
  revenue: RevenueStats;
  whatsapp: CommunicationStats;
  sms: CommunicationStats;
  content: ContentStats;
  attendance: AttendanceStats;
  recentActivity: ActivityLog[];
}

// قاموس الألوان لضمان رندرة فاشون كلاسز (Tailwind JIT Static Utilities) بكفاءة معمارية
const colorStyles: Record<string, { bgBlur: string; bgHover: string; iconBg: string; iconText: string; activityText: string }> = {
  blue: {
    bgBlur: "bg-blue-500/5",
    bgHover: "group-hover:bg-blue-500/10",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    activityText: "text-blue-500"
  },
  emerald: {
    bgBlur: "bg-emerald-500/5",
    bgHover: "group-hover:bg-emerald-500/10",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    activityText: "text-emerald-500"
  },
  amber: {
    bgBlur: "bg-amber-500/5",
    bgHover: "group-hover:bg-amber-500/10",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
    activityText: "text-amber-500"
  },
  rose: {
    bgBlur: "bg-rose-500/5",
    bgHover: "group-hover:bg-rose-500/10",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-600 dark:text-rose-400",
    activityText: "text-rose-500"
  },
  purple: {
    bgBlur: "bg-purple-500/5",
    bgHover: "group-hover:bg-purple-500/10",
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    activityText: "text-purple-500"
  },
  sky: {
    bgBlur: "bg-sky-500/5",
    bgHover: "group-hover:bg-sky-500/10",
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-600 dark:text-sky-400",
    activityText: "text-sky-500"
  }
};

// ===========================================================================
// --- مكون توست التثبيت لنسخة سطح المكتب الـ PWA ---
// ===========================================================================
const InstallAppToast = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkIsInstalled = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');
      setIsStandalone(isPWA);
    };

    checkIsInstalled();

    const handler = (e: any) => {
      if (isStandalone) return;
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt' as any, handler);
    return () => window.removeEventListener('beforeinstallprompt' as any, handler);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && !isStandalone && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-[450px] z-[200] pointer-events-none"
        >
          <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-6 flex items-center gap-5 relative overflow-hidden pointer-events-auto border-b-4 border-b-primary-600">
            <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-4 rounded-[1.5rem] text-white shadow-xl relative border border-white/20">
                <Smartphone size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
            </div>
            <div className="flex-1 text-right">
              <h4 className="text-lg font-black dark:text-white leading-tight">نسخة سطح المكتب</h4>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                ثبت Sentryk كبرنامج مستقل للوصول السريع وتحسين الأداء الإداري.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-3.5 rounded-2xl text-xs font-black hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-all shadow-lg flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Download size={16} />
              تثبيت
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 left-5 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===========================================================================
// --- مكون مودال استعراض الطلاب الفاخر المنبثق ---
// ===========================================================================
const StudentsModal = ({ isOpen, onClose, title, students, type }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
          dir="rtl"
        >
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${type === 'expiry' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-500/10 text-slate-600'}`}>
                {type === 'expiry' ? <CalendarClock size={24} /> : <UserX size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-black dark:text-white">{title}</h3>
                <p className="text-xs font-bold text-slate-500">إجمالي العدد: {students?.length || 0}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
            {students && students.length > 0 ? (
              students.map((student: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-600 flex items-center justify-center font-black text-lg">
                      {student.name?.charAt(0) || "ط"}
                    </div>
                    <div>
                      <p className="font-black dark:text-white text-sm">{student.name}</p>
                      <p className="text-xs font-bold text-slate-400">{student.phone}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${type === 'expiry' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}>
                      {type === 'expiry' ? 'تنتهي قريباً' : 'منتهي'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold">لا يوجد طلاب في هذه القائمة حالياً</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ===========================================================================
// --- مكون مودال نظام الإحالة والمكافآت الترحيبي الفريد (Referral Intro) ---
// ===========================================================================
const ReferralIntroModal = ({ isOpen, onClose, referralCode }: { isOpen: boolean; onClose: () => void; referralCode: string | null }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto">
          {/* الخلفية المضببة المحسنة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          {/* جسم المودال المتجاوب بالكامل مع الهواتف */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 w-full max-w-md rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.4)] relative z-10 overflow-hidden border border-slate-200 dark:border-white/10 p-5 sm:p-7 text-center my-auto"
            dir="rtl"
          >
            {/* اللمسات الجمالية العلوية */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* أيقونة الهدية الاحترافية بحركة نابضة */}
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-3.5 relative">
              <Gift size={28} className="animate-bounce" style={{ animationDuration: '3s' }} />
              <div className="absolute -bottom-1 -left-1 bg-white dark:bg-slate-900 p-1 rounded-full shadow border border-slate-100 dark:border-slate-800">
                <Sparkles size={12} className="text-amber-500" />
              </div>
            </div>

            {/* نصوص تسويقية محفزة وواضحة */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              شارك النجاح واكسب شهوراً مجانية! 🚀
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto mb-4">
              لا تدير سنترك بمفردك، دعنا نتوسع معاً! أرسل كود الإحالة لأصدقائك من أصحاب المراكز التعليمية، لتمنحهم خصماً حصرياً وتفتح لنفسك رصيد اشتراك مجاني لا ينتهي.
            </p>

            {/* تفاصيل الشروط مصاغة بذكاء واحترافية لقراءتها بسهولة على الموبايل */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800/80 text-right space-y-3 shadow-inner text-xs mb-4">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">١</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">مكسب متبادل وفوري:</span> لكل سنتر جديد ينضم عن طريقك، ستحصل أنت على <span className="underline decoration-emerald-500/40 font-bold">شهر كامل مجاناً (30 يوماً رصيد)</span>، ويحصل السنتر الجديد على <span className="text-indigo-500 dark:text-indigo-400 font-bold">خصم 20% ممتد لأول شهرين</span> من رحلته معنا.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">٢</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">شرط تفعيل الهدية:</span> تضاف الشهور المجانية تلقائياً إلى حسابك فور قيام السنتر المُحال بالاشتراك الفعلي في <span className="border-b border-dashed border-amber-500 font-bold text-amber-600 dark:text-amber-400">إحدى الباقات المدفوعة</span> بعد انتهاء فترته التجريبية.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">٣</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">آلية التوفير الذكي والتجديد:</span> رصيدك محفوظ! عند نهاية اشتراكك، إذا اخترت تجديداً شهرياً وكان لديك رصيد، تصبح قيمة اشتراكك <span className="text-emerald-600 dark:text-emerald-400 font-bold">0 جنيه تماماً</span>. أما إذا اخترت خطة سنوية، فسيتم <span className="text-indigo-500 dark:text-indigo-400 font-bold">خصم القيمة النقدية المقابلة لشهورك المجانية</span> من السعر الإجمالي فوراً!
                </p>
              </div>
            </div>

            {/* صندوق كود الإحالة والنسخ المتجاوب */}
            {referralCode && (
              <div className="mb-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl p-2.5 flex items-center justify-between border border-slate-200 dark:border-slate-800 gap-2">
                <div className="text-right pr-1">
                  <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">كود الإحالة الحصري الخاص بك</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white select-all font-mono tracking-wide">{referralCode}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95 shrink-0 ${
                    copied 
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>
            )}

            {/* 🔄 خط التشغيل الهيكلي للسنتر: متجاوب 100% (شبكة على الموبايل، وخط أفقي على الشاشات الأكبر) */}
            <div className="mb-5 border-t border-slate-200/60 dark:border-slate-800/80 pt-3.5 text-right">
              <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 items-center gap-1.5">
                <AlertCircle size={13} className="text-amber-500" /> الترتيب الهيكلي الصحيح لتشغيل السنتر بنجاح:
              </span>
              
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between bg-slate-100/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                {/* 1. القاعات */}
                <div className="flex flex-col items-center justify-center p-1.5 bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent rounded-lg flex-1 text-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm mb-1">
                    <Activity size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">1. القاعات والغرف</span>
                </div>

                <div className="hidden sm:block text-slate-400 text-xs font-bold shrink-0">←</div>

                {/* 2. المدرسين */}
                <div className="flex flex-col items-center justify-center p-1.5 bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent rounded-lg flex-1 text-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm mb-1">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">2. المدرسين والمواد</span>
                </div>

                <div className="hidden sm:block text-slate-400 text-xs font-bold shrink-0">←</div>

                {/* 3. الحصص */}
                <div className="flex flex-col items-center justify-center p-1.5 bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent rounded-lg flex-1 text-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm mb-1">
                    <CalendarClock size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">3. الحصص والمجموعات</span>
                </div>

                <div className="hidden sm:block text-slate-400 text-xs font-bold shrink-0">←</div>

                {/* 4. الطلاب */}
                <div className="flex flex-col items-center justify-center p-1.5 bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent rounded-lg flex-1 text-center">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-sm mb-1">
                    <Users size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">4. إضافة الطلاب</span>
                </div>
              </div>
            </div>

            {/* زر الاستكمال والإغلاق الاحترافي والتسويقي */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-slate-950 to-slate-850 dark:from-white dark:to-slate-100 text-white dark:text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-xl shadow-indigo-950/10 dark:shadow-white/5 transition-all duration-200 active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-2 group border border-transparent dark:border-slate-200"
            >
              <span>ابدأ رحلة التميز واستكشف لوحتك الآن</span>
              <Sparkles size={14} className="text-amber-400 dark:text-amber-500 animate-pulse group-hover:rotate-12 transition-transform" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ===========================================================================
// --- مكون الكارت الذكي للوحة التحكم (Dashboard Card) ---
// ===========================================================================
const DashboardCard = ({ title, value, icon, color, footerText, trend, subtitle, isCritical }: any) => {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border shadow-sm relative overflow-hidden group flex flex-col justify-between h-full transition-all ${
        isCritical 
          ? 'border-rose-500 dark:border-rose-600 shadow-[0_10px_30px_rgba(244,63,94,0.15)] ring-2 ring-rose-500/20' 
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isCritical ? 'bg-rose-500/10' : styles.bgBlur} rounded-full blur-2xl group-hover:bg-opacity-20 transition-colors`} />
      
      <div>
        <div className="flex justify-between items-start relative z-10">
          <div className={`p-4 rounded-2xl shadow-inner ${
            isCritical ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : `${styles.iconBg} ${styles.iconText}`
          }`}>
            {icon}
          </div>
          {trend && !isCritical && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend === 'up' ? 'صعود' : 'هبوط'}
            </div>
          )}
          {isCritical && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter bg-rose-500 text-white animate-pulse">
              <ShieldAlert size={14} />
              حرج وسقفي
            </div>
          )}
        </div>
        
        <div className="mt-6 relative z-10">
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-black tracking-tight ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'dark:text-white'}`}>
              {value ?? 0}
            </h3>
            {subtitle && <span className="text-xs font-bold text-slate-400">{subtitle}</span>}
          </div>
        </div>
      </div>

      {footerText && (
        <div className={`mt-4 flex items-center gap-2 text-[11px] font-bold p-2 rounded-xl relative z-10 ${
          isCritical ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300' : 'text-slate-400 bg-slate-50 dark:bg-slate-800/50'
        }`}>
          <Activity size={12} className={isCritical ? 'text-rose-500' : styles.activityText} />
          {footerText}
        </div>
      )}
    </motion.div>
  );
};

// ===========================================================================
// --- المكون الرئيسي الأسطوري للوحة التحكم (Dashboard Component) ---
// ===========================================================================
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isFirstVisitReferralModalOpen, setIsFirstVisitReferralModalOpen] = useState(false);
  
  const [filteredStudents, setFilteredStudents] = useState<{ expiry: any[]; expired: any[] }>({ expiry: [], expired: [] });

  // الحالات التنبيهية الفاخرة لرسائل الواتساب والحد السعري للطلاب
  const [smsAlert, setSmsAlert] = useState<{ show: boolean; type: 'warning' | 'critical'; message: string } | null>(null);
  const [capacityAlert, setCapacityAlert] = useState<{ show: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          const dashboardData: DashboardStats = res.data.stats;
          setStats(dashboardData);
          
          // ١. فحص ومراقبة رصيد المحفظة الإلكترونية لإطلاق اليرت التنبيه الذكي
          const currentSmsMessages = dashboardData.sms?.messages ?? 0;
          if (currentSmsMessages === 0) {
            setSmsAlert({
              show: true,
              type: 'critical',
              message: 'برجاء شحن رصيد محفظتك الآن بشكل عاجل لتجنب توقف جميع رسائل الغياب وتأكيدات الحضور التلقائية للطلاب.'
            });
          } else if (currentSmsMessages < 50) {
            setSmsAlert({
              show: true,
              type: 'warning',
              message: `متبقي ${currentSmsMessages} رسالة فقط داخل المحفظة الإلكترونية، يرجى إعادة الشحن قريباً تفادياً لقطع الخدمة المباشرة.`
            });
          }

          // ٢. فحص ومراقبة السعة الاستيعابية للطلاب لتفعيل بروتوكول التنبيه السقفي والحرج للـ SaaS
          const maxStudents = dashboardData.saasLimits?.maxStudents || 0;
          const currentStudents = dashboardData.saasLimits?.currentStudents || 0;
          if (maxStudents > 0) {
            const utilizationRate = currentStudents / maxStudents;
            if (utilizationRate >= 0.9) {
              setCapacityAlert({
                show: true,
                message: `تنبيه سيادي: لقد استهلكت ${Math.round(utilizationRate * 100)}% من السعة الإجمالية للسنتر المتاحة باشتراكك الحالي (${currentStudents}/${maxStudents} طالب). يرجى ترقية الخطة التوسعية فوراً لضمان عدم توقف عمليات التسجيل ومسح الكروت.`
              });
            }
          }

          // ٣. إدارة المودال الترحيبي لنظام الإحالة (تظهر لمرة واحدة لكل حساب عبر الـ LocalStorage)
          const referralSeen = localStorage.getItem('sentryk_referral_intro_seen');
          if (!referralSeen) {
            setIsFirstVisitReferralModalOpen(true);
          }

          // ٤. تجميع الطلاب محلياً لبناء بيانات القوائم المنبثقة للـ Modals بكفاءة متوازية
          const studentsRes = await api.get('/students?limit=1000'); 
          if (studentsRes.data.success) {
            const allStudents = studentsRes.data.data;
            const now = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(now.getDate() + 3);

            const expiry = allStudents.filter((s: any) => {
              const activeSub = s.subscriptions?.find((sub: any) => sub.status === "ACTIVE");
              if (!activeSub) return false;
              const endDate = new Date(activeSub.endDate);
              return endDate > now && endDate <= threeDaysFromNow;
            });

            const expired = allStudents.filter((s: any) => s.computedStatus === "EXPIRED");
            setFilteredStudents({ expiry, expired });
          }
        }
      } catch (err) {
        console.error("Dashboard Integration Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCloseReferralModal = () => {
    setIsFirstVisitReferralModalOpen(false);
    localStorage.setItem('sentryk_referral_intro_seen', 'true');
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Zap className="text-primary-600 animate-bounce" size={48} />
      <p className="font-black text-slate-400 text-sm animate-pulse">جاري تحضير واستعلام البيانات الفورية للوحة التحكم الإدارية...</p>
    </div>
  );

  const { students, revenue, sms, content, attendance, recentActivity, saasLimits, referralSystem } = stats || {};

  // حساب الحالات الديناميكية لألوان ومؤشرات استهلاك الطلاب
  const maxLimit = saasLimits?.maxStudents || 0;
  const totalCount = saasLimits?.currentStudents || 0;
  const isCapacityCritical = maxLimit > 0 && (totalCount / maxLimit) >= 0.9;

  const smsMessagesCount = sms?.messages ?? 0;
  const smsCardColor = smsMessagesCount === 0 ? "rose" : (smsMessagesCount < 50 ? "amber" : "blue");

  return (
    <div className="space-y-8 pb-10 px-2 md:px-0" dir="rtl">
      
      {/* ===========================================================================
          --- طبقة التنبيهات المنبثقة الذكية والفوقية (Top Toasts & Alerts Banner) ---
          =========================================================================== */}
      <AnimatePresence>
        {/* أ) اليرت رصيد محفظة الواتساب */}
        {smsAlert && smsAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -70, scale: 0.9 }}
            className="fixed top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[250] pointer-events-none max-w-xl w-full"
          >
            <div className={`p-5 rounded-[2rem] backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] pointer-events-auto flex items-center gap-5 border-b-4 ${
              smsAlert.type === 'critical' 
                ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200/60 dark:border-rose-900/40 border-b-rose-600' 
                : 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200/60 dark:border-amber-900/40 border-b-amber-500'
            }`}>
              <div className={`p-3 rounded-2xl shrink-0 ${
                smsAlert.type === 'critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                <AlertCircle size={26} className={smsAlert.type === 'critical' ? 'animate-bounce' : 'animate-pulse'} />
              </div>
              <div className="flex-1 text-right">
                <h5 className={`font-black text-sm ${smsAlert.type === 'critical' ? 'text-rose-900 dark:text-rose-200' : 'text-amber-900 dark:text-amber-200'}`}>
                  {smsAlert.type === 'critical' ? '⛔ نفاد رصيد محفظة الواتساب بالكامل!' : '⚠️ رصيد رسائل الواتساب يوشك على الانتهاء!'}
                </h5>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {smsAlert.message}
                </p>
              </div>
              <button 
                onClick={() => setSmsAlert(null)}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-sm"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ب) اليرت بلوغ السعة القصوى للطلاب (الحدود السيادية للـ SaaS) */}
        {capacityAlert && capacityAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -70, scale: 0.9 }}
            className="fixed top-28 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[240] pointer-events-none max-w-xl w-full"
          >
            <div className="p-5 rounded-[2rem] backdrop-blur-3xl shadow-[0_30px_80px_rgba(244,63,94,0.2)] pointer-events-auto flex items-center gap-5 border border-rose-200/60 dark:border-rose-900/40 border-b-4 border-b-rose-500 bg-rose-50/95 dark:bg-rose-950/90">
              <div className="p-3 rounded-2xl shrink-0 bg-rose-500 text-white animate-pulse">
                <ShieldAlert size={26} />
              </div>
              <div className="flex-1 text-right">
                <h5 className="font-black text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <span>🚨 سعة السنتر اوشكت على الامتلاء التام!</span>
                </h5>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {capacityAlert.message}
                </p>
              </div>
              <button 
                onClick={() => setCapacityAlert(null)}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-sm"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودالات العرض والتحكم الذكي */}
      <InstallAppToast />
      
      <ReferralIntroModal 
        isOpen={isFirstVisitReferralModalOpen}
        onClose={handleCloseReferralModal}
        referralCode={referralSystem?.code || null}
      />

      <StudentsModal 
        isOpen={isExpiryModalOpen} 
        onClose={() => setIsExpiryModalOpen(false)} 
        title="طلاب تنتهي اشتراكاتهم خلال 72 ساعة"
        students={filteredStudents.expiry}
        type="expiry"
      />
      <StudentsModal 
        isOpen={isExpiredModalOpen} 
        onClose={() => setIsExpiredModalOpen(false)} 
        title="طلاب انتهت اشتراكاتهم تماماً"
        students={filteredStudents.expired}
        type="expired"
      />

      {/* ===========================================================================
          --- الهيدر العلوي الاستراتيجي للوحة التحكم ---
          =========================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight flex items-center gap-3">
            <span>لوحة التحكم المهندسية</span>
            <span className="text-xs font-black px-3 py-1 bg-primary-600/10 text-primary-600 rounded-full border border-primary-500/20">SaaS v2.0</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">أهلاً بك، إليك التلخيص الشامل والذكي لأداء ونشاط السنتر التعليمي والمالي الفوري.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">النظام المتوازي والمزامنة الفورية تعمل بكفاءة قصوى</span>
        </div>
      </div>

      {/* ===========================================================================
          --- شبكة الإحصائيات الشاملة والمحدثة بناءً على استعلامات قاعدة البيانات ---
          =========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* ١. كارت الطلاب والقدرة الاستيعابية المتكاملة */}
        <DashboardCard 
          title="إجمالي الطلاب المسجلين" 
          value={students?.total} 
          icon={<Users size={24} />} 
          color={isCapacityCritical ? "rose" : "blue"} 
          isCritical={isCapacityCritical}
          footerText={
            maxLimit > 0 
              ? `السعة: تم استهلاك ${totalCount} من أصل ${maxLimit} مقعد` 
              : `${students?.active ?? 0} طالب نشط حالياً`
          } 
        />
        
        {/* ٢. حضور اليوم عبر ماسح الكروت الذكي QR */}
        <DashboardCard 
          title="حضور اليوم (Scans)" 
          value={attendance?.todayScans} 
          icon={<QrCode size={24} />} 
          color="sky" 
          footerText="مزامنة حية من قارئ الـ QR والغياب التلقائي" 
        />

        {/* ٣. الأرباح والإيرادات المالية وتحليل النمو */}
        <DashboardCard 
          title="إيرادات الشهر الحالي" 
          value={revenue?.thisMonth?.toLocaleString()} 
          subtitle="ج.م" 
          icon={<CreditCard size={24} />} 
          color="emerald" 
          trend={revenue?.trend} 
          footerText={`مقارنة بالشهر الماضي: ${revenue?.difference != null ? (revenue.difference >= 0 ? '+' : '') + revenue.difference.toLocaleString() : '0'} ج.م`} 
        />

        {/* ٤. رصيد محفظة رسائل الواتساب التفاعلي */}
        <DashboardCard 
          title="رصيد محفظة الرسائل" 
          value={smsMessagesCount} 
          subtitle="رسالة" 
          icon={<MessageSquare size={24} />} 
          color={smsCardColor} 
          footerText={`القيمة المالية للمحفظة: ${sms?.balanceInMoney} ج.م`} 
        />

        {/* ٥. الطاقم التعليمي والمجموعات المشغلة */}
        <DashboardCard 
          title="الطاقم التعليمي والقدرة" 
          value={content?.teachers} 
          subtitle="معلم" 
          icon={<BookOpen size={24} />} 
          color="purple" 
          footerText={`${content?.sessions ?? 0} حصة ومجموعة إدارية فعالة`} 
        />
      </div>

      {/* ===========================================================================
          --- القسم التكتيكي السفلي: نظام الإحالة، الأنشطة، والتنبيهات المتقدمة ---
          =========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* أ) جدول وسجل الأنشطة والعمليات الفورية للنظام */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                <ArrowRightLeft className="text-primary-600" size={24} />
                سجل آخر 10 عمليات فورية بالنظام (Activity Logs)
              </h3>
            </div>
            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[510px] custom-scrollbar">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((log: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-primary-600 shrink-0 shadow-inner">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:justify-between gap-1">
                        <p className="text-sm font-bold dark:text-white leading-relaxed">
                          <span className="text-primary-600 font-black ml-1">{log.user}</span> 
                          {log.action}
                          {log.target && <span className="text-xs text-slate-400 block md:inline md:mr-1">({log.target})</span>}
                        </p>
                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap md:self-center bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold">
                  لا توجد سجلات أنشطة حالية في قاعدة بيانات هذا المركز.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ب) الكروت والتنبيهات الجانبية الفاخرة ونظام المكافآت */}
        <div className="space-y-6">
          
          {/* كارت تنبيه ذكي: قرب انتهاء الاشتراكات للطلاب */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-rose-600 to-rose-700 dark:from-rose-600/20 dark:to-rose-700/20 p-8 rounded-[3.5rem] border border-rose-500/20 shadow-2xl shadow-rose-500/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <AlertCircle size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-rose-100 dark:text-rose-400 mb-4">
                <Zap size={20} fill="currentColor" />
                <span className="font-black text-xs uppercase tracking-widest">تنبيه المتابعة والتجديد الدورية</span>
              </div>
              <h4 className="text-white font-black text-2xl mb-1">{students?.nearExpiry ?? 0} طلاب أوضحوا قرب الانتهاء</h4>
              <p className="text-rose-100/70 text-xs font-bold mb-8 italic">تنتهي صلاحية اشتراكاتهم التلقائية خلال الـ 72 ساعة القادمة</p>
              
              <button 
                onClick={() => setIsExpiryModalOpen(true)}
                className="w-full py-4 bg-white dark:bg-rose-600 text-rose-600 dark:text-white rounded-[2rem] font-black text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 hover:opacity-90"
              >
                عرض القائمة الاستباقية بالكامل
                <ArrowRightLeft size={14} className="rotate-180" />
              </button>
            </div>
          </motion.div>

          {/* كارت نظام الإحالة والمكافآت الزمنية الصادر من الـ SaaS */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            
            <h4 className="font-black dark:text-white mb-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-amber-500 rounded-full" />
                <span>عائدات كود الإحالة والمكافآت</span>
              </div>
              <Gift size={18} className="text-amber-500 animate-bounce" />
            </h4>

            <div className="space-y-4">
              
              {/* المكاسب الزمنية بالشهر الحالي */}
              <div className="flex justify-between items-center p-4 rounded-[2rem] bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">مكافأة هذا الشهر</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">أيام اشتراك مجانية مكسوبة</span>
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">+{referralSystem?.bonusDaysEarnedThisMonth ?? 0}</span>
                  <span className="text-[10px] font-bold text-slate-400 block">({referralSystem?.bonusMonthsEarnedThisMonth ?? 0} شهر مجاني)</span>
                </div>
              </div>

              {/* إجمالي الإحالات الناجحة مدى الحياة */}
              <div className="flex justify-between items-center p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">إجمالي الإحالات الكلي</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">سناتر سجلت بواسطتك</span>
                </div>
                <span className="text-xl font-black text-primary-500">{referralSystem?.totalReferralsAllTime ?? 0} سنتر</span>
              </div>

              {/* كارت الاشتراكات المنتهية بالكامل */}
              <div className="flex justify-between items-center p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الاشتراكات المنقطعة</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">منتهية تماماً ولم تجدد</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-rose-500">{students?.expired ?? 0}</span>
                  <button 
                    onClick={() => setIsExpiredModalOpen(true)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:text-primary-600 transition-colors shadow-sm"
                  >
                    <ArrowRightLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </div>
              
              {/* إجمالي الرسائل الصادرة المرسلة للشهر الحالي */}
              <div className="flex justify-between items-center p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">أجزاء الرسائل المرسلة</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">معدل الاستهلاك الشهري</span>
                </div>
                <span className="text-xl font-black text-slate-700 dark:text-slate-300">{sms?.sentThisMonth ?? 0}</span>
              </div>
               
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}