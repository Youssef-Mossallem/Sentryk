import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CreditCard,
  Crown,
  Gem,
  Gift,
  Loader2,
  Zap,
  Sparkles,
  Ticket,
  Users,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Building,
  AlertTriangle,
  Lock,
  MessageSquare,
  QrCode,
  Wallet,
  BarChart3,
  Layers3,
  Check,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";
import { useAuthStore } from '../../store/useAuthStore';

// ===========================================================================
// DEFINITIONS & TYPES (التعريفات الهيكلية لمنع أخطاء الـ Build والـ TypeScript)
// ===========================================================================
type PlanKey = "TRIAL" | "BASIC" | "PREMIUM" | "ELITE";

interface PlanMetadata {
  key: PlanKey;
  name: string;
  tagline: string;
  monthlyPrice: number;
  maxStudents: number;
  maxUsers: number;
  colorClass: string;
  badgeText?: string;
  popular?: boolean;
}

interface PromoValidationResult {
  valid: boolean;
  discountPercent: number;
  durationMonths: number;
  applicableCycle: "MONTHLY" | "YEARLY" | "BOTH";
  message: string;
}

// ===========================================================================
// PLAN STATIC CONSTANTS (تطابق كامل 100% مع PLAN_TIER_LIMITS في الباك اند)
// ===========================================================================
const PLAN_TIERS: PlanMetadata[] = [
  {
    key: "TRIAL",
    name: "الفترة التجريبية",
    tagline: "اتاحة فرصة كاملة لتقييم المنظومة واختبار توافقها مع نظام العمل في مركزكم مجاناً وبدون أي التزامات مسبقة.",
    monthlyPrice: 0,
    maxStudents: 100,
    maxUsers: 3,
    colorClass: "from-slate-900 via-slate-900 to-slate-950 border-slate-800/80 shadow-slate-950/50",
    badgeText: "تأهيل مجاني مؤقت"
  },
  {
    key: "BASIC",
    name: "الباقة الأساسية",
    tagline: "منظومة عمل تشغيلية وإدارية متكاملة شاملة لكافة الميزات، مخصصة للمراكز الناشئة والمدرسين المستقلين.",
    monthlyPrice: 499,
    maxStudents: 250,
    maxUsers: 4,
    colorClass: "from-blue-950/30 via-slate-900/40 to-slate-950 border-blue-500/20 shadow-blue-950/10"
  },
  {
    key: "PREMIUM",
    name: "الباقة المتقدمة",
    tagline: "الخيار التشغيلي الأمثل للمراكز التعليمية المتنامية التي تسعى للتطوير الشامل والأتمتة الإدارية والمالية بسعة أكبر.",
    monthlyPrice: 999,
    maxStudents: 1000,
    maxUsers: 10,
    colorClass: "from-amber-950/30 via-slate-900/40 to-slate-950 border-amber-500/30 shadow-amber-950/10",
    badgeText: "الخيار الموصى به إدارياً",
    popular: true
  },
  {
    key: "ELITE",
    name: "باقة النخبة (المؤسسات)",
    tagline: "حلول مؤسسية شاملة مخصصة لإدارة سلاسل المراكز والمجمعات التعليمية الكبرى ذات السعات المفتوحة والطاقات الاستيعابية الضخمة.",
    monthlyPrice: 1499,
    maxStudents: 3000000,
    maxUsers: 25000,
    colorClass: "from-purple-950/30 via-slate-900/40 to-slate-950 border-purple-500/20 shadow-purple-950/10",
    badgeText: "السعة الاستيعابية القصوى"
  }
];

const SYSTEM_FEATURES_MATRIX = [
  { category: "أمن وحوكمة البيانات", name: "عزل رقمي سيادي كامل لبيانات السنتر وحماية صلاحيات فريق العمل والسكرتارية لمنع تسريب البيانات الحساسة", trial: true, basic: true, premium: true, elite: true },
  { category: "تنظيم الطلاب والـ QR", name: "إصدار وتوليد كروت الهوية الذكية المشفرة المربوطة بالسحابة (QR Code) لتنظيم الدخول السريع ومنع التلاعب", trial: true, basic: true, premium: true, elite: true },
  { category: "إدارة الاشتراكات المرنة", name: "محرك التشغيل التكيفي لحساب التحصيلات والاشتراكات (حصص منفصلة، باقات شهرية، أو كورسان كاملة)", trial: true, basic: true, premium: true, elite: true },
  { category: "تنظيم القاعات والمجموعات", name: "منظومة الحوكمة التنظيمية للقاعات لمنع التداخل الزمني وحماية السعة الاستيعابية للمجموعات التعليمية تلقائياً", trial: true, basic: true, premium: true, elite: true },
  { category: "الابتكار الإداري (الحضور الذكي)", name: "آلية ترحيل الحضور التلقائي المستدام (Carry-Forward) للمجموعات المتتالية لتجنب الازدحام وطوابير الانتظار في السنتر", trial: true, basic: true, premium: true, elite: true },
  { category: "الابتكار الإداري (الحضور الذكي)", name: "رصد الحضور الذكي في وضع الأوفلاين (بدون إنترنت) وإعادة المزامنة التلقائية فوراً مع احتساب دقائق التأخير بدقة", trial: true, basic: true, premium: true, elite: true },
  { category: "التواصل والربط مع أولياء الأمور", name: "محرك الربط والاتصال التلقائي بـ WhatsApp Cloud API لإرسال رسائل ترحيب، غياب فوري، وتنبيهات تجديد فوري للمحفظة", trial: true, basic: true, premium: true, elite: true },
  { category: "التواصل والربط مع أولياء الأمور", name: "التقارير الرقابية الشهرية الآلية المرسلة لأولياء الأمور لتتبع معدلات الانضباط، والتقييمات الدورية، وتنبيهات نسب الغياب الحرجة", trial: true, basic: true, premium: true, elite: true },
  { category: "الإدارة المالية والرقابة", name: "إدارة وتوثيق ميزانية رصيد محفظة رسائل الواتساب مع تسجيل مالي دقيق لكافة الحركات والخصم الآلي المستقل", trial: true, basic: true, premium: true, elite: true },
  { category: "الإدارة المالية والرقابة", name: "نظام تثبيت وحماية الفواتير والتحصيلات (Price Snapshot) لمنع التعديل الرجعي أو التلاعب في القيمة المالية للاشتراكات القائمة", trial: true, basic: true, premium: true, elite: true },
  { category: "سجلات المتابعة والتدقيق", name: "سجل المراقبة والرقابة الإدارية الشامل (Activity Log) لتتبع وتوثيق عمليات السكرتارية بالتوقيت والتفاصيل لمنع الأخطاء البشرية", trial: true, basic: true, premium: true, elite: true },
  { category: "سجلات المتابعة والتدقيق", name: "لوحة تحكم مؤشرات الأداء الفورية (Dashboard) القائمة على الاستعلام المتوازي فائق السرعة لرصد الإيرادات بدقة تفصيلية", trial: true, basic: true, premium: true, elite: true },
];

export default function Plans() {
  const { center, setCenter } = useAuthStore() as any;
  const navigate = useNavigate();

  // إدارة الحالات التشغيلية
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [loadingType, setLoadingType] = useState<'promo' | 'checkout' | 'trial' | null>(null);
  const [uiError, setUiError] = useState<string>('');
  const [uiSuccess, setUiSuccess] = useState<string>('');
  const [promoInput, setPromoInput] = useState<string>('');
  const [activePromo, setActivePromo] = useState<PromoValidationResult | null>(null);

  // إعادة تعيين الإشعارات والمدخلات عند التنقل بين الدورات التعاقدية
  useEffect(() => {
    setUiError('');
    setUiSuccess('');
    setPromoInput('');
    setActivePromo(null);
  }, [isYearly, selectedPlan]);

  // تصفية الباقات: إخفاء الباقة التجريبية تماماً إذا تم استخدامها مسبقاً
  const visiblePlans = useMemo(() => {
    return PLAN_TIERS.filter(plan => !(plan.key === "TRIAL" && center?.trialUsed));
  }, [center?.trialUsed]);

  /**
   * محرك الحسابات المالي والخصومات الديناميكي الفوري
   * يحاكي منطق الباك إند بالملي للتأكد من حساب الفاتورة الصفرية بدقة متناهية قبل الإرسال
   */
  const calculatePlanPrice = useMemo(() => {
    return (planKey: PlanKey, currentTemporaryPromo: PromoValidationResult | null = null) => {
      const target = PLAN_TIERS.find(p => p.key === planKey);
      if (!target) return { originalBase: 0, baseAfterCycle: 0, final: 0, savings: 0, appliedDiscounts: [] as string[] };

      if (target.monthlyPrice === 0) {
        return { originalBase: 0, baseAfterCycle: 0, final: 0, savings: 0, appliedDiscounts: [] };
      }

      let originalBase = target.monthlyPrice * (isYearly ? 12 : 1);
      let price = target.monthlyPrice;

      // 1. تطبيق الحساب التعاقدي السنوي الخاص بالباك اند (السنة 9 أشهر دراسية مع خصم 15% إضافي لتأكيد الاستدامة)
      if (isYearly) {
        price = Number((price * 9 * 0.85).toFixed(2));
      }

      let baseAfterCycle = price;
      let appliedDiscounts: string[] = [];
      let totalSavings = originalBase - baseAfterCycle;

      // 2. تطبيق نظام الخصم الديناميكي للأشهر المجانية المعلقة (Pending Free Months)
      if (center?.pendingFreeMonths > 0) {
        let freeMonthsConsumed = 0;
        let freeMonthsDiscountAmount = 0;

        if (isYearly) {
          freeMonthsConsumed = Math.min(center.pendingFreeMonths, 12);
          const effectiveMonthlyRate = price / 12;
          freeMonthsDiscountAmount = Number((effectiveMonthlyRate * freeMonthsConsumed).toFixed(2));
        } else {
          freeMonthsConsumed = 1;
          freeMonthsDiscountAmount = price;
        }

        price = Math.max(0, price - freeMonthsDiscountAmount);
        totalSavings += freeMonthsDiscountAmount;
        appliedDiscounts.push(`إعفاء مالي مقابل شهور مجانية (${freeMonthsConsumed} شهر)`);
      }

      // 3. محرك الأكواد وعروض الإحالة الترحيبية (يطبق فقط إذا كان هناك مبلغ مستحق أكبر من صفر)
      if (price > 0 && center?.isPromoPaused !== true) {
        let discountPercent = 0;

        // أ. الأولوية الأولى: كود الخصم المدخل مؤقتاً بالموديول
        if (currentTemporaryPromo && currentTemporaryPromo.valid) {
          discountPercent = currentTemporaryPromo.discountPercent;
          appliedDiscounts.push(`كود ترويجي جديد (-${discountPercent}%)`);
        }
        // ب. الأولوية الثانية: كود الخصم الممتد والنشط مسبقاً على حساب السنتر من الباك اند
        else if (center?.activePromoCode) {
          discountPercent = center.activePromoCode.discountPercent;
          appliedDiscounts.push(`كود ممتد مفعّل (-${discountPercent}%)`);
        }
        // ج. الأولوية الثالثة: تطبيق كود الإحالة التلقائي (20%) المكتوب عند تسجيل الحساب
        else if (center?.referredById && !center?.referralMilestoneAchieved) {
          discountPercent = 20;
          appliedDiscounts.push(`خصم رمز الإحالة الترحيبي (-20%)`);
        }

        if (discountPercent > 0) {
          const discountAmount = price * (discountPercent / 100);
          price = Number((price - discountAmount).toFixed(2));
          totalSavings += discountAmount;
        }
      }

      const finalPrice = Math.max(0, Math.round(price));

      return {
        originalBase,
        baseAfterCycle: Math.round(baseAfterCycle),
        final: finalPrice,
        savings: Math.round(totalSavings),
        appliedDiscounts
      };
    };
  }, [center, isYearly]);

  // دالة التحقق من كود الخصم الجديد عبر راوت الباك اند الفعلي
  const handleValidatePromo = async () => {
    if (!promoInput.trim()) {
      setUiError("يرجى إدخال كود الخصم المعتمد لتطبيقه بنجاح.");
      return;
    }

    setLoadingType('promo');
    setUiError('');
    setUiSuccess('');

    try {
      const response = await api.post('/promo-codes/validate', {
        code: promoInput,
        billingCycle: isYearly ? "YEARLY" : "MONTHLY"
      });

      if (response.data?.success && response.data?.valid) {
        setActivePromo({
          valid: true,
          discountPercent: response.data.discountPercent,
          durationMonths: response.data.durationMonths,
          applicableCycle: response.data.applicableCycle,
          message: response.data.message
        });
        setUiSuccess(response.data.message || "تم التحقق وتطبيق نسبة الخصم الإداري بنجاح.");
      } else {
        setUiError(response.data?.error || "كود الخصم غير صحيح أو منتهي الصلاحية.");
      }
    } catch (err: any) {
      setUiError(err?.response?.data?.error || "فشل التحقق من كود الخصم، يرجى إعادة المحاولة.");
      setActivePromo(null);
    } finally {
      setLoadingType(null);
    }
  };

  // معالجة إصدار الفاتورة البرمجية والتفرع الذكي بين التفعيل الفوري (للسعر 0 والـ TRIAL) والتحويل لصفحة الدفع
  const handleSubscriptionSubmit = async (planKey: PlanKey) => {
    setUiError('');
    setUiSuccess('');

    // [1] تفعيل الفترة التجريبية (TRIAL) بشكل معزول وفوري تماشياً مع الباك اند
    if (planKey === "TRIAL") {
      if (center?.trialUsed) {
        setUiError("نحيط سيادتكم علماً بأن هذا المركز التعليمي قد استفاد بالفعل من الفترة التجريبية المجانية مسبقاً.");
        return;
      }

      setLoadingType('trial');
      try {
        const response = await api.post('/payments/create', {
          type: "SUBSCRIPTION",
          plan: "TRIAL",
          billingCycle: "MONTHLY"
        });

        if (response.data?.success) {
          if (setCenter) {
            const targetLimits = PLAN_TIERS.find(p => p.key === "TRIAL");
            setCenter({
              ...center,
              plan: "TRIAL",
              trialUsed: true,
              isActive: true,
              maxStudents: targetLimits?.maxStudents || 100,
              maxUsers: targetLimits?.maxUsers || 3
            });
          }
          setUiSuccess(response.data?.message || "تم تفعيل الفترة التجريبية بنجاح، جاري توجيهكم...");
          setSelectedPlan(null);
          setTimeout(() => { window.location.href = '/dashboard'; }, 800);
        }
      } catch (err: any) {
        setUiError(err?.response?.data?.error || "تعذر تفعيل الفترة التجريبية حالياً.");
      } finally {
        setLoadingType(null);
      }
      return;
    }

    // [2] بناء أمر الفاتورة للباقات المدفوعة العادية (تشمل التجديد والترقية بحرية كاملة)
    setLoadingType('checkout');
    try {
      const response = await api.post('/payments/create', {
        type: "SUBSCRIPTION",
        plan: planKey,
        billingCycle: isYearly ? "YEARLY" : "MONTHLY",
        promoCodeStr: activePromo ? promoInput : null
      });

      if (response.data?.success) {
        // 🔥 فحص التفرع الهيكلي الذكي للفواتير الصفرية (instantActivation / isFreeInstantActivation)
        if (response.data?.instantActivation || response.data?.isFreeInstantActivation) {
          setUiSuccess(response.data?.message || "تم تفعيل الباقة بنجاح من خلال رصيدكم المتاح! جاري التوجيه للداشبورد...");

          if (setCenter) {
            const targetLimits = PLAN_TIERS.find(p => p.key === planKey);
            const nextFreeMonths = center.pendingFreeMonths > 0 ? Math.max(0, center.pendingFreeMonths - (isYearly ? Math.min(center.pendingFreeMonths, 12) : 1)) : 0;

            setCenter({
              ...center,
              plan: planKey,
              isActive: true,
              maxStudents: targetLimits?.maxStudents || center.maxStudents,
              maxUsers: targetLimits?.maxUsers || center.maxUsers,
              pendingFreeMonths: nextFreeMonths
            });
          }

          setSelectedPlan(null);
          setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
          return;
        }

        // [3] إذا كانت القيمة أكبر من 0، يتم التوجيه الآمن لصفحة الدفع المنفصلة مع تمرير البيانات بالـ State
        const {
          clientSecret,
          paymobIntentionId,
          paymentId,
          amount,
          walletCharge
        } = response.data;

        setUiSuccess("تم تسجيل بنود الفاتورة، جاري تحويلكم لصفحة إتمام السداد الآمن...");

        setTimeout(() => {
          navigate(`/checkout?paymentId=${paymentId}`, {
            state: {
              clientSecret,
              paymobIntentionId,
              paymentId,
              amount,
              planKey,
              isYearly,
              promoCode: activePromo ? promoInput : null,
              walletCharge: !!walletCharge
            }
          });
        }, 800);
      } else {
        setUiError("حدث خطأ غير متوقع أثناء معالجة أمر إصدار الفاتورة من الخادم.");
      }
    } catch (err: any) {
      setUiError(err?.response?.data?.error || "تعذر تسجيل وإصدار بنود الفاتورة، يرجى مراجعة الإدارة.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans py-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden selection:bg-blue-600 selection:text-white" dir="rtl">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ركائز ضوئية خلفية للتصميم الفاخر */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-5%] w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

        {/* قسم الهيدر التسويقي */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md shadow-lg"
          >
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
            <span>نظام الحوكمة التنظيمية والمالية المتكامل • إصدار المؤسسات والسناتر الذكية</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400"
          >
            بنية إدارية مرنة تتكامل <br /> وتتلاءم مع حجم منشأتكم التعليمية
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            تمنحكم كافة الفئات والخطط المتاحة وصولاً مطلقاً وغير مشروط لجميع الميزات الفنية، والذكاء التشغيلي، ومحركات الربط الفني للواتساب. تمايز الخطط يعتمد حصرياً على الطاقة الاستيعابية لطلابكم النشطين وحسابات فريق العمل.
          </motion.p>
        </div>

        {/* 💡 البانر الأسطوري لشرح نظام الأشهر المجانية كود الإحالة بأسلوب احترافي وشيك */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start gap-4 backdrop-blur-md"
        >
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
            <Info size={24} className="animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              شفافية تشغيلية: دليل رصيد الحساب ومكافآت الإحالة (Referral Reward System)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1.5">
              إذا كنت تمتلك <span className="text-emerald-400 font-bold">شهراً واحداً مجانياً</span> برصيدك، فسيقوم النظام بتطبيقه تلقائياً لإعفائك من كامل قيمة التجديد المالي للدورة الحالية. أما إذا كنت تمتلك <span className="text-blue-400 font-bold">أشهراً مجانية متعددة</span>، فيمكنك استخدامها بالتتابع شهراً تلو الآخر عند الاشتراك الدوري، أو يمكنك الانتقال للتعاقد المؤسسي <span className="text-amber-400 font-bold">(السنوي)</span> ليقوم النظام تلقائياً بخصم القيمة المعادلة لعدد الأشهر المجانية المتاحة بحسابك مباشرة من الإجمالي السنوي، لضمان استدامة منشأتك بأعلى وفر مالي ممكن.
            </p>
            {center?.pendingFreeMonths > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold">
                <CheckCircle2 size={13} />
                <span>رصيدك الحالي المتاح للنظام: {center.pendingFreeMonths} شهر مجاني معلق بحسابك.</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* أداة تبديل الفترات التعاقدية */}
        <div className="flex justify-center items-center mb-16">
          <div className="bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-xl relative">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${!isYearly ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              الترخيص الإداري الدوري (شهري)
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>التعاقد المؤسسي المستدام (سنوي)</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-extrabold animate-pulse">
                وفر 20%
              </span>
            </button>
          </div>
        </div>

        {/* شبكة استعراض فئات الاشتراكات بالأسعار الديناميكية المباشرة */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${visiblePlans.length === 3 ? 'lg:grid-cols-3 max-w-5xl mx-auto' : 'lg:grid-cols-4'} gap-8 mb-24 items-stretch`}>
          {visiblePlans.map((plan, index) => {
            const isCurrentPlan = center?.plan === plan.key;

            const priceCalculation = plan.key !== "TRIAL" ? calculatePlanPrice(plan.key, null) : null;
            const hasActiveDiscount = priceCalculation ? priceCalculation.final < priceCalculation.originalBase : false;

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`bg-slate-900/30 border rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 backdrop-blur-md shadow-xl ${plan.popular ? 'ring-2 ring-amber-500 bg-slate-900/70 scale-[1.02] lg:scale-[1.03] shadow-amber-950/20' : 'hover:border-slate-700/60'} ${plan.colorClass}`}
              >
                {plan.badgeText && (
                  <span className={`absolute -top-3.5 left-6 text-[11px] font-extrabold tracking-wide px-3 py-1 rounded-full border shadow-lg ${plan.popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {plan.badgeText}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <div className={`p-2.5 rounded-xl ${plan.popular ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800/80 text-slate-400'}`}>
                      {plan.key === "TRIAL" ? <Gift size={20} /> : plan.key === "BASIC" ? <Zap size={20} /> : plan.key === "PREMIUM" ? <Crown size={20} /> : <Gem size={20} />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 min-h-[48px]">
                    {plan.tagline}
                  </p>

                  {/* المنظومة المالية للباقات وعرض الخصومات فورياً */}
                  <div className="mb-6 pb-6 border-b border-slate-800/80">
                    {plan.monthlyPrice === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">0.00</span>
                        <span className="text-xs font-bold text-slate-500 mr-1">ج.م / فترة تقييمية</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {hasActiveDiscount && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500 line-through font-mono">
                              {priceCalculation?.originalBase} ج.م
                            </span>
                            {priceCalculation?.appliedDiscounts.length ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                                خصم مفعّل تلقائياً ✓
                              </span>
                            ) : null}
                          </div>
                        )}

                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-white tracking-tight font-mono">
                            {priceCalculation?.final}
                          </span>
                          <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
                          <span className="text-xs font-semibold text-slate-500 mr-1">/ {isYearly ? 'سنوياً' : 'شهرياً'}</span>
                        </div>

                        {priceCalculation?.final === 0 && (
                          <span className="text-[11px] text-amber-400 font-bold mt-1.5 block">
                            🎁 مشمول بالكامل في العرض المجاني المتاح لحسابكم
                          </span>
                        )}

                        {isYearly && plan.monthlyPrice > 0 && (
                          <span className="text-[11px] text-emerald-400 font-bold mt-2 block">
                            (محتسبة على 9 أشهر دراسية شاملة خصم الاستدامة)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* الطاقات الاستيعابية ومقاييس الحوكمة */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Users size={14} className="text-blue-400" />
                        الحد الأقصى للطلاب النشطين:
                      </span>
                      <span className="text-slate-200 font-extrabold text-sm">
                        {plan.maxStudents >= 1000000 ? "سعة تشغيلية مفتوحة" : `${plan.maxStudents.toLocaleString()} طالب`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Building size={14} className="text-purple-400" />
                        تراخيص فريق السكرتارية:
                      </span>
                      <span className="text-slate-200 font-extrabold text-sm">
                        {plan.maxUsers >= 25000 ? "إدارة مؤسسية مفتوحة" : `${plan.maxUsers} حسابات عمل`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* أزرار اتخاذ القرار الإداري للمنشأة */}
                <div>
                  <button
                    type="button"
                    disabled={loadingType !== null}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 ${isCurrentPlan
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-xl shadow-emerald-500/10'
                        : plan.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 shadow-xl shadow-orange-500/10'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60'
                      }`}
                  >
                    {isCurrentPlan ? (
                      <>
                        <Check size={16} />
                        <span>تجديد / تمديد الاشتراك الحالي</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.key === "TRIAL" ? "بدء فترة التقييم الفوري" : "اعتماد فئة الباقة وبدء التفعيل"}</span>
                        <ChevronLeft size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* جدول المقارنة التفصيلي الموحد لإثبات الشفافية */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-24 shadow-2xl relative backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                <Layers3 className="text-blue-500" size={22} />
                مصفوفة الميزات والوظائف الرقابية الموحدة
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                فلسفة المنظومة مبنية على عدم حجب أي أدوات ذكاء مالي أو تنظيمي عن أي معلم؛ نمنحك كافة الميزات والحلول في جميع الباقات بلا استثناء.
              </p>
            </div>
            <span className="text-[11px] font-extrabold bg-slate-800/90 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-700 self-start sm:self-center">
              التحديثات الإدارية للربع الحالي معتمدة ونشطة ⚙️
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                  <th className="py-4 px-5 text-slate-300 font-black">الحل الإداري والميزات التنظيمية المشتركة</th>
                  <th className="py-4 px-5 text-center font-bold">تقييم مجاني</th>
                  <th className="py-4 px-5 text-center font-bold">الباقة الأساسية</th>
                  <th className="py-4 px-5 text-center font-bold">الباقة المتقدمة</th>
                  <th className="py-4 px-5 text-center text-purple-400 font-black bg-purple-500/5">باقة النخبة للمؤسسات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {SYSTEM_FEATURES_MATRIX.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-5 text-white font-bold">
                      <span className="block text-[10px] text-slate-500 font-bold mb-0.5">{feat.category}</span>
                      {feat.name}
                    </td>
                    <td className="py-4 px-5 text-center">{feat.trial ? <CheckCircle2 size={16} className="text-blue-500 inline" /> : <span className="text-slate-700">-</span>}</td>
                    <td className="py-4 px-5 text-center">{feat.basic ? <CheckCircle2 size={16} className="text-blue-500 inline" /> : <span className="text-slate-700">-</span>}</td>
                    <td className="py-4 px-5 text-center">{feat.premium ? <CheckCircle2 size={16} className="text-amber-500 inline" /> : <span className="text-slate-700">-</span>}</td>
                    <td className="py-4 px-5 text-center bg-purple-500/5">{feat.elite ? <CheckCircle2 size={16} className="text-purple-500 inline" /> : <span className="text-slate-700">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* قسم الركائز التشغيلية الأربعة الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <QrCode size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-200 mb-2">تنظيم تشغيلي لمنع الازدحام</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              منظومة الحضور والانصراف بالـ QR المشفر ونوافذ التحقق التلقائية تضمن انسيابية فائقة للطلاب وتمنع التكدس تماماً أمام البوابات والقاعات التعليمية.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <MessageSquare size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-200 mb-2">اتصال فوري ومؤتمت مع الأسر</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              ربط سحابي مباشر بـ WhatsApp Cloud API لإرسال إشعارات الغياب اللحظية والتقارير الشهرية التحليلية المفصلة لأولياء الأمور تلقائياً وبدون تدخل بشري.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Wallet size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-200 mb-2">حوكمة وضبط مالي صارم</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              آلية تثبيت الأسعار وحماية التحصيلات وعزل ميزانية محفظة رسائل الواتساب لكل مركز بشكل مستقل يحمي الإيرادات ويمنع الأخطاء الحسابية والتلاعب.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-200 mb-2">رقابة إدارية مانعة للأخطاء</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              سجل أنشطة مركزي دقيق (Activity Log) يرصد ويوثق كافة تحركات فريق السكرتارية بالتفاصيل، لحماية المنشأة وضمان الالتزام التام بالتعليمات الإدارية.
            </p>
          </div>
        </div>

        {/* قسم الأسئلة الشائعة */}
        <div className="max-w-3xl mx-auto border-t border-slate-800/80 pt-16">
          <h4 className="text-center text-lg font-black text-white mb-10 flex items-center justify-center gap-2">
            <HelpCircle size={20} className="text-blue-400" />
            تساؤلات شائعة حول حوكمة التراخيص والاشتراكات للمراكز التعليمية
          </h4>
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm">
              <h5 className="font-bold text-slate-200 mb-2">ما الإجراء التنظيمي المتبع عند بلوغ الحد الأقصى لسعة الطلاب المقررة بالباقة؟</h5>
              <p className="text-slate-400 leading-relaxed font-medium">
                تضمن المنظومة استقرار سير العمل الإداري تماماً والحفاظ على كافة سجلات وبيانات الطلاب الحالية دون أي مساس بها، مع إرسال تنبيه آمن لإشعاركم بضرورة ترقية فئة السعة لفتح مساحة إضافية تتيح تسجيل الطلاب الجدد بسلاسة.
              </p>
            </div>
          </div>
        </div>

        {/* النافذة التفاعلية لمراجعة الفاتورة وتطبيق الكود الترويجي (Modal Invoice Overview) */}
        <AnimatePresence>
          {selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              {/* واجهة الخلفية المعتمة */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (loadingType !== 'checkout' && loadingType !== 'trial') {
                    setSelectedPlan(null);
                    setActivePromo(null);
                    setPromoInput('');
                  }
                }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              {/* بطاقة مراجعة تفاصيل الحساب المالي للفاتورة */}
              {(() => {
                const currentInvoice = calculatePlanPrice(selectedPlan, activePromo);
                const hasActiveBackendPromo = !!center?.activePromoCode;

                // حساب السعر قبل إدخال الكود الجديد للتأكد من حظره إذا كان السعر صفريًا مسبقًا
                const priceBeforePromoInput = calculatePlanPrice(selectedPlan, null).final;
                const isPromoDisabledDueToZeroPrice = priceBeforePromoInput === 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    className="bg-[#0c101f] border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col justify-between"
                  >
                    {/* رأس النافذة */}
                    <div className="p-6 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-white text-base">مراجعة تفاصيل الاعتماد المالي</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">يرجى مراجعة تفاصيل السعة التشغيلية المقررة قبل الانتقال لبوابة السداد.</p>
                        </div>
                      </div>
                    </div>

                    {/* محتوى الاستمارات ورموز الخصم المعتمدة */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                      {uiError && (
                        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                          <span>{uiError}</span>
                        </motion.div>
                      )}

                      {uiSuccess && (
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start gap-3 text-xs font-bold leading-relaxed">
                          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                          <span>{uiSuccess}</span>
                        </motion.div>
                      )}

                      {/* ملخص البيانات الوصفية للفاتورة */}
                      <div className="p-4 bg-slate-950/80 border border-slate-800/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">الفئة التشغيلية المطلوبة:</span>
                          <span className="text-white text-sm font-black">{PLAN_TIERS.find(p => p.key === selectedPlan)?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">النظام التعاقدي المعتمد:</span>
                          <span className="text-blue-400 font-bold">{isYearly ? "تعاقد مؤسسي مستدام (سنوي)" : "ترخيص إداري دوري (شهري)"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold border-t border-slate-800/60 pt-3 mt-1">
                          <span className="text-slate-400">السعة الاستيعابية المتاحة:</span>
                          <span className="text-slate-200 font-extrabold">
                            {Number(PLAN_TIERS.find(p => p.key === selectedPlan)?.maxStudents) >= 1000000 ? "سعة مفتوحة بالكامل بدون قيود" : `${PLAN_TIERS.find(p => p.key === selectedPlan)?.maxStudents.toLocaleString()} طالب كحد أقصى`}
                          </span>
                        </div>
                      </div>

                      {/* معالجة وحظر تطبيق كود الخصم في حال وجود كود ممتد نشط مسبقاً أو إذا كان السعر أساساً صفر ج.م */}
                      {selectedPlan !== "TRIAL" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300">هل تمتلك منشأتكم كود خصم ترويجي معتمد؟</label>

                          {isPromoDisabledDueToZeroPrice ? (
                            <div className="p-3.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl flex items-start gap-2.5 text-xs font-bold">
                              <Lock size={16} className="shrink-0 text-slate-600 mt-0.5" />
                              <span>
                                بما أن صافي قيمة الترخيص الحالي لمركزكم هو <span className="text-emerald-400">0 ج.م</span> (نتيجة إعفاء الأشهر المجانية ورصيد الإحالة المباشر لحسابكم)، فقد تم حجب إمكانية إدخال كود الخصم لعدم وجود قيمة مالية مستحقة للخصم منها.
                              </span>
                            </div>
                          ) : hasActiveBackendPromo ? (
                            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-2.5 text-xs font-bold">
                              <Lock size={16} className="shrink-0 mt-0.5" />
                              <span>
                                حظر دمج الأكواد: تملك منشأتكم كود خصم نشط ومستمر لعدة أشهر مسبقاً وهو
                                <span className="text-white bg-slate-950 px-1.5 py-0.5 rounded mx-1 font-mono font-black">{center.activePromoCode.code}</span>
                                بنسبة (-{center.activePromoCode.discountPercent}%). لا يمكن كتابة أو تطبيق أكواد ترويجية إضافية تماشياً مع معايير الحوكمة المالية.
                              </span>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Ticket size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="text"
                                  value={promoInput}
                                  disabled={loadingType === 'promo' || loadingType === 'checkout'}
                                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                  placeholder="أدخل رمز الخصم الإداري هنا"
                                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 pr-10 rounded-xl text-xs font-extrabold text-white tracking-widest uppercase focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                                />
                              </div>
                              <button
                                type="button"
                                disabled={loadingType === 'promo' || loadingType === 'checkout' || !promoInput.trim()}
                                onClick={handleValidatePromo}
                                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 disabled:opacity-20 flex items-center justify-center min-w-[100px]"
                              >
                                {loadingType === 'promo' ? <Loader2 className="animate-spin" size={14} /> : "تطبيق الرمز"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* الفواتير والوفورات المطبقة تفصيلياً بناءً على الحساب الذكي */}
                      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2.5 text-xs font-bold">
                        <div className="flex justify-between text-slate-400">
                          <span>قيمة الترخيص الأساسي المعتمد:</span>
                          <span className="line-through text-slate-500 font-mono">{currentInvoice.originalBase} ج.م</span>
                        </div>

                        {currentInvoice.appliedDiscounts.map((discountText, i) => (
                          <div key={i} className="flex justify-between text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <TrendingUp size={12} />
                              {discountText}:
                            </span>
                            <span className="font-bold">مفعّل ✓</span>
                          </div>
                        ))}

                        {currentInvoice.savings > 0 && (
                          <div className="flex justify-between text-emerald-400/90 border-t border-slate-900 pt-2">
                            <span>إجمالي الوفر المالي المطبق لمركزكم:</span>
                            <span className="font-mono">-{currentInvoice.savings} ج.م</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 text-sm font-bold">
                          <span className="text-white font-black">صافي القيمة المستحقة للسداد المالي:</span>
                          <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-black font-mono">
                            {currentInvoice.final} ج.م
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* أزرار الاعتماد النهائي وتصدير البيانات أو التفعيل الفوري للمجاني */}
                    <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-3">
                      <button
                        type="button"
                        onClick={() => handleSubscriptionSubmit(selectedPlan)}
                        disabled={loadingType === 'checkout' || loadingType === 'trial'}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                      >
                        {loadingType === 'checkout' || loadingType === 'trial' ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            <span>
                              {selectedPlan === 'TRIAL'
                                ? 'تأكيد تفعيل فترة التقييم المجانية وبدء العمل'
                                : currentInvoice.final === 0
                                  ? 'تأكيد التفعيل المجاني الفوري والبث المباشر'
                                  : selectedPlan === center?.plan
                                    ? 'تأكيد تجديد الترخيص الحالي والانتقال الآمن لبوابة السداد'
                                    : 'اعتماد بنود الفاتورة والانتقال الآمن لبوابة السداد'}
                            </span>
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-center font-bold text-slate-500 flex items-center justify-center gap-1.5">
                        <Lock size={11} className="text-slate-600" />
                        <span>
                          {selectedPlan === 'TRIAL' || currentInvoice.final === 0
                            ? 'سيتم تفعيل كامل صلاحيات الباقة المختارة وحقن الحدود التشغيلية فوراً وتوجيهكم للداشبورد دون أي متطلبات مالية.'
                            : 'معاملاتكم المالية مشفرة ومؤمنة بالكامل بالتعاون مع بوابة الدفع الإلكتروني المعتمدة من البنك المركزي المصري.'}
                        </span>
                      </p>
                    </div>

                  </motion.div>
                );
              })()}
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
