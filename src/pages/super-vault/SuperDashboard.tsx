import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Lock,
  Building,
  ArrowUpRight,
  DollarSign,
  AlertTriangle,
  X,
  Sliders,
  Percent,
  Clock,
  Filter,
  Activity,
  UserCheck
} from "lucide-react";
import { superVaultApi } from "../../api/superVaultApi";

// ===========================================================================
// TYPE DEFINITIONS (التعريفات الهيكلية الصارمة لمنع أخطاء الـ TypeScript والـ Build)
// ===========================================================================

interface RevenueMetrics {
  total: number;
  today: number;
  weekly: number;
  currentMonth: number;
  previousMonth: number;
  currentYear: number;
  monthlyGrowthPercent: number;
}

interface CenterMetrics {
  total: number;
  active: number;
  frozen: number;
}

interface StudentMetrics {
  total: number;
}

interface DashboardMetrics {
  revenue: RevenueMetrics;
  centers: CenterMetrics;
  students: StudentMetrics;
}

interface Center {
  id: number;
  name: string;
  plan: "TRIAL" | "BASIC" | "PREMIUM" | "ELITE";
  maxStudents: number;
  maxUsers: number;
  isActive: boolean;
  isPromoPaused?: boolean;
  createdAt: string;
  _count?: {
    students?: number;
    users?: number;
  };
}

interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  durationMonths: number;
  applicableCycle: "MONTHLY" | "YEARLY" | "BOTH";
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

export default function SuperDashboard() {
  // ===========================================================================
  // STATE MANAGEMENT (إدارة الحالة الشاملة والذكية للوحة التحكم)
  // ===========================================================================
  const [activeTab, setActiveTab] = useState<"overview" | "centers" | "promo-codes">("overview");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  // حالات التحميل الشاملة والجزئية
  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  // محركات البحث والفلترة المتقدمة (Client-Side Reactive Filters)
  const [centerSearch, setCenterSearch] = useState("");
  const [centerPlanFilter, setCenterPlanFilter] = useState<string>("ALL");
  const [centerStatusFilter, setCenterStatusFilter] = useState<string>("ALL");

  const [promoSearch, setPromoSearch] = useState("");
  const [promoCycleFilter, setPromoCycleFilter] = useState<string>("ALL");

  // حالات إدارة الموديلات المفتوحة (Modals State)
  const [controlCenterTarget, setControlCenterTarget] = useState<Center | null>(null);
  const [promoCodeTarget, setPromoCodeTarget] = useState<{ mode: "CREATE" | "EDIT"; data: Partial<PromoCode> | null } | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<{ id: number; verificationName: string; input: string } | null>(null);

  // ===========================================================================
  // DATA FETCHING ENGINE (محرك جلب البيانات المتزامن عالي الكفاءة)
  // ===========================================================================
  const fetchAllDashboardData = async (silent = false) => {
    if (!silent) setGlobalLoading(true);
    else setIsRefreshing(true);
    setSystemError(null);

    try {
      // تنفيذ الطلبات بالتوازي لسرعة فائقة واستهلاك مثالي للبنية التحتية
      const [statsRes, centersRes, promoRes] = await Promise.all([
        superVaultApi.getDashboardStats().catch(err => ({ success: false, error: err })),
        superVaultApi.getCenters().catch(err => ({ success: false, error: err })),
        superVaultApi.getPromoCodes().catch(err => ({ success: false, error: err }))
      ]);

      if (statsRes.success) setMetrics(statsRes.stats || statsRes.data);
      else console.error("Error fetching stats:", statsRes.error);

      if (centersRes.success) setCenters(centersRes.centers || centersRes.data || []);
      else console.error("Error fetching centers:", centersRes.error);

      if (promoRes.success) setPromoCodes(promoRes.promoCodes || promoRes.data || []);
      else console.error("Error fetching promo codes:", promoRes.error);

      // إذا فشلت كل الطلبات الأساسية
      if (!statsRes.success && !centersRes.success && !promoRes.success) {
        setSystemError("فشل الاتصال بالبنية التحتية للخزنة الكبرى. يرجى التحقق من مفاتيح الحماية والشبكة.");
      }
    } catch (err: any) {
      console.error("Critical Dashboard Error:", err);
      setSystemError(err?.response?.data?.error || "حدث خطأ غير متوقع أثناء الاتصال بخوادم الـ SaaS السيادية.");
    } finally {
      setGlobalLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // ===========================================================================
  // INTERACTION HANDLERS (معالجات العمليات والتحكم السيادي المطلق)
  // ===========================================================================

  // 1. تحديث وصيانة وتعديل قيود باقة السنتر التعليمي
  const handleControlCenterExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!controlCenterTarget) return;

    setActionLoading(true);
    try {
      const response = await superVaultApi.controlCenter(controlCenterTarget.id, {
        plan: controlCenterTarget.plan,
        maxStudents: Number(controlCenterTarget.maxStudents),
        maxUsers: Number(controlCenterTarget.maxUsers),
        isActive: controlCenterTarget.isActive
      });

      if (response.success) {
        setControlCenterTarget(null);
        await fetchAllDashboardData(true);
      } else {
        alert(response.error || "فشل تحديث بيانات السنتر.");
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "حدث خطأ خادم داخلي أثناء التعديل.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. الحذف الهيكلي الكامل والمطلق للسنتر (التدمير الفوري الحذر)
  const handleHardDeleteExecute = async () => {
    if (!hardDeleteTarget || hardDeleteTarget.input.trim() !== hardDeleteTarget.verificationName) return;

    setActionLoading(true);
    try {
      const response = await superVaultApi.deleteCenter(hardDeleteTarget.id);
      if (response.success) {
        setHardDeleteTarget(null);
        await fetchAllDashboardData(true);
      } else {
        alert(response.error || "فشل مسح السنتر من النظام.");
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "خطأ سيادي: تعذر تنفيذ الـ Cascade Delete.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. معالج الحفظ لأكواد الخصم والبروموكود (إنشاء وتعديل)
  const handlePromoCodeExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeTarget || !promoCodeTarget.data) return;

    const { mode, data } = promoCodeTarget;
    setActionLoading(true);

    try {
      if (mode === "CREATE") {
        const response = await superVaultApi.createPromoCode({
          code: data.code!.toUpperCase().trim(),
          discountPercent: Number(data.discountPercent),
          durationMonths: Number(data.durationMonths || 1),
          applicableCycle: data.applicableCycle || "BOTH",
          maxUses: Number(data.maxUses || 100),
          expiresAt: new Date(data.expiresAt!).toISOString()
        });

        if (response.success) {
          setPromoCodeTarget(null);
          await fetchAllDashboardData(true);
        } else {
          alert(response.error || "فشل إنشاء كود الخصم.");
        }
      } else {
        // وضع التعديل (EDIT)
        const response = await superVaultApi.updatePromoCode(data.id!, {
          discountPercent: Number(data.discountPercent),
          durationMonths: Number(data.durationMonths),
          applicableCycle: data.applicableCycle,
          maxUses: Number(data.maxUses),
          expiresAt: new Date(data.expiresAt!).toISOString()
        });

        if (response.success) {
          setPromoCodeTarget(null);
          await fetchAllDashboardData(true);
        } else {
          alert(response.error || "فشل تعديل كود الخصم.");
        }
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "خطأ أثناء حفظ الكود الترويجي.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. حذف كود خصم نهائياً
  const handleDeletePromoCode = async (id: number) => {
    if (!window.confirm("هل أنت متأكد مطلقاً من رغبتك في سحب وإلغاء كود الخصم هذا نهائياً من قاعدة البيانات؟")) return;

    try {
      const response = await superVaultApi.deletePromoCode(id);
      if (response.success) {
        await fetchAllDashboardData(true);
      } else {
        alert(response.error || "فشل حذف الكود.");
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "خطأ في حذف الكود الترويجي.");
    }
  };

  // ===========================================================================
  // SMART PERFORMANCE FILTERS (محركات الفرز والبحث الفوري المعتمدة على الـ Memo)
  // ===========================================================================
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const matchesSearch = center.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.id.toString() === centerSearch.trim();
      const matchesPlan = centerPlanFilter === "ALL" || center.plan === centerPlanFilter;

      let matchesStatus = true;
      if (centerStatusFilter === "ACTIVE") matchesStatus = center.isActive === true;
      if (centerStatusFilter === "FROZEN") matchesStatus = center.isActive === false;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [centers, centerSearch, centerPlanFilter, centerStatusFilter]);

  const filteredPromoCodes = useMemo(() => {
    return promoCodes.filter((promo) => {
      const matchesSearch = promo.code.toLowerCase().includes(promoSearch.toLowerCase());
      const matchesCycle = promoCycleFilter === "ALL" || promo.applicableCycle === promoCycleFilter;
      return matchesSearch && matchesCycle;
    });
  }, [promoCodes, promoSearch, promoCycleFilter]);

  // ===========================================================================
  // UI RENDERERS (مكونات الواجهة الفخمة والمنظمة هندسياً)
  // ===========================================================================

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 dir-rtl font-sans">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          <ShieldAlert className="absolute text-primary-500 animate-pulse" size={32} />
        </div>
        <h2 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
          جاري فتح الغرفة المحصنة وفحص البنية السيادية...
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-widest">Initialising Secure SaaS Vault Telemetry</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-4 md:p-8 font-sans antialiased selection:bg-primary-500/30 selection:text-white" style={{ direction: "rtl" }}>

      {/* الترويسة العليا للمنصة (Imperial Header) */}
      <header className="mb-8 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-primary-500/10 to-emerald-500/10 border border-primary-500/20 rounded-2xl shadow-xl shadow-primary-500/5 text-primary-400">
            <ShieldAlert size={36} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">خزنة التحكم السيادي المطلق</h1>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono px-2 py-0.5 rounded-md font-bold tracking-widest uppercase">PROD_VAULT</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">اللوحة العليا لإدارة البنية التحتية، السناتر، وأكواد الخصم التنافسية لمنصة <span className="text-primary-400 font-bold">Sentryk</span>.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => fetchAllDashboardData(true)}
            disabled={isRefreshing}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl font-bold text-xs text-slate-300 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary-400" : ""} />
            <span>تحديث البيانات الحية</span>
          </button>
        </div>
      </header>

      {/* شريط الإشعار بالخطأ إن وجد */}
      {systemError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 font-bold text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{systemError}</span>
        </div>
      )}

      {/* لوحة التبويبات الكبرى (Main Navigation Matrix) */}
      <div className="flex p-1.5 bg-slate-900/50 border border-slate-800/80 rounded-2xl mb-8 max-w-lg shadow-inner">
        {(["overview", "centers", "promo-codes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/15"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
          >
            {tab === "overview" && <TrendingUp size={16} />}
            {tab === "centers" && <Building size={16} />}
            {tab === "promo-codes" && <Percent size={16} />}
            <span>
              {tab === "overview" && "التحليلات والمؤشرات الكبرى"}
              {tab === "centers" && "إدارة ومراقبة السناتر"}
              {tab === "promo-codes" && "قسائم وأكواد الخصم"}
            </span>
          </button>
        ))}
      </div>

      {/* محتوى اللوحة النشطة (Tab Views Canvas) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* ===========================================================================
              TAB 1: OVERVIEW & SYSTEM METRICS (عرض الإحصائيات الفخمة والتحليلات)
              =========================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* شبكة البيانات المالية الرقمية العملاقة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-slate-400 tracking-wide">إجمالي العوائد المحققة للمنصة</p>
                    <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shadow-inner"><DollarSign size={18} /></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{(metrics?.revenue?.total || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-400">ج.م</span></h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ArrowUpRight size={14} />
                    <span>+{metrics?.revenue?.monthlyGrowthPercent || 0}% نمو هذا الشهر</span>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-slate-400 tracking-wide">عوائد الشهر الحالي</p>
                    <span className="p-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl shadow-inner"><Activity size={18} /></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{(metrics?.revenue?.currentMonth || 0).toLocaleString()} <span className="text-xs font-bold text-primary-400">ج.م</span></h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-2">الشهر السابق: {(metrics?.revenue?.previousMonth || 0).toLocaleString()} ج.م</p>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-slate-400 tracking-wide">السناتر التعليمية المشتركة</p>
                    <span className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl shadow-inner"><Building size={18} /></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{(metrics?.centers?.total || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">سنتر</span></h3>
                  <div className="mt-2 flex items-center gap-3 text-[11px] font-bold">
                    <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle size={10} /> {metrics?.centers?.active || 0} نشط</span>
                    <span className="text-red-400 flex items-center gap-0.5"><XCircle size={10} /> {metrics?.centers?.frozen || 0} موقوف</span>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-slate-400 tracking-wide">إجمالي الطلاب المخدومين بالـ SaaS</p>
                    <span className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl shadow-inner"><Users size={18} /></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{(metrics?.students?.total || 0).toLocaleString()} <span className="text-xs font-bold text-violet-400">طالب نشط</span></h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-2">متوسط الكثافة السحابية لكل سنتر مستدام</p>
                </div>
              </div>

              {/* قسم التحليل البياني الفريد والتقارير المالية السريعة */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/20 border border-slate-800/60 p-6 rounded-2xl lg:col-span-2">
                  <h4 className="text-base font-black text-white mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-primary-400" />
                    <span>التوزيع الهيكلي للأرباح والتدفق المالي عبر الزمن</span>
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                        <span>مبيعات وتجديدات اليوم</span>
                        <span className="text-white">{(metrics?.revenue?.today || 0).toLocaleString()} ج.م</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-primary-500 to-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, ((metrics?.revenue?.today || 0) / Math.max(1, metrics?.revenue?.currentMonth || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                        <span>الحصاد المالي الإجمالي للأسبوع الحالي</span>
                        <span className="text-white">{(metrics?.revenue?.weekly || 0).toLocaleString()} ج.م</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, ((metrics?.revenue?.weekly || 0) / Math.max(1, metrics?.revenue?.currentMonth || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                        <span>إجمالي التجميع السنوي الحالي</span>
                        <span className="text-white">{(metrics?.revenue?.currentYear || 0).toLocaleString()} ج.م</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/20 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-black text-white mb-2 flex items-center gap-2">
                      <Lock size={18} className="text-red-400" />
                      <span>الحالة الأمنية الفورية للبنية التحية</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">جدار حماية المنصة الذاتي نشط بكفاءة 100%. يتم التحقق من جميع طلبات الـ API عبر التوقيعات التشفيرية المشددة والمفاتيح السرية الكبرى المستمدة من الـ البيئة العميقة للأدمن.</p>
                  </div>
                  <div className="mt-6 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between"><span className="text-emerald-400">● GATEWAY_SHIELD</span> <span>ACTIVE</span></div>
                    <div className="flex justify-between"><span className="text-emerald-400">● RATE_LIMITER</span> <span>COMPLIANT</span></div>
                    <div className="flex justify-between"><span className="text-emerald-400">● PRISMA_CASCADE</span> <span>ENFORCED</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===========================================================================
              TAB 2: CENTERS CONTROL STUDIO (لوحة مراقبة وإدارة السناتر والفواتير)
              =========================================================================== */}
          {activeTab === "centers" && (
            <div className="space-y-6">
              {/* فلتر وأدوات تحكم السناتر المتقدمة */}
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute right-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={centerSearch}
                    onChange={(e) => setCenterSearch(e.target.value)}
                    placeholder="ابحث عن سنتر بالاسم أو المعرّف الرقمي (ID)..."
                    className="w-full bg-slate-950/80 border border-slate-800 pr-11 pl-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      value={centerPlanFilter}
                      onChange={(e) => setCenterPlanFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">كل الباقات التشغيلية</option>
                      <option value="TRIAL">خطة الـ TRIAL</option>
                      <option value="BASIC">خطة الـ BASIC</option>
                      <option value="PREMIUM">خطة الـ PREMIUM</option>
                      <option value="ELITE">خطة الـ ELITE</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
                    <UserCheck size={14} className="text-slate-400" />
                    <select
                      value={centerStatusFilter}
                      onChange={(e) => setCenterStatusFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">كل الحالات القانونية</option>
                      <option value="ACTIVE">السناتر النشطة فقط</option>
                      <option value="FROZEN">السناتر الموقوفة والمجمدة</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* جدول السناتر المطور والمبهر بصرياً */}
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">المعرّف المعماري (ID)</th>
                        <th className="py-4 px-6">اسم السنتر التعليمي</th>
                        <th className="py-4 px-6">الباقة الحالية للمنصة</th>
                        <th className="py-4 px-6">حدود الطلاب الحالية</th>
                        <th className="py-4 px-6">حدود الإداريين</th>
                        <th className="py-4 px-6">حالة المنظومة</th>
                        <th className="py-4 px-6 text-center">التحكم السيادي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-medium text-sm">
                      {filteredCenters.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center font-bold text-slate-500">
                            لا توجد سناتر تعليمية تطابق معايير البحث والفرز المحددة حالياً.
                          </td>
                        </tr>
                      ) : (
                        filteredCenters.map((center) => (
                          <tr key={center.id} className="hover:bg-slate-900/40 transition-colors group">
                            <td className="py-4 px-6 font-mono font-bold text-slate-400">#{center.id}</td>
                            <td className="py-4 px-6 font-black text-white group-hover:text-primary-400 transition-colors">{center.name}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide ${center.plan === "ELITE" ? "bg-purple-500/10 border border-purple-500/30 text-purple-400" :
                                  center.plan === "PREMIUM" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
                                    center.plan === "BASIC" ? "bg-blue-500/10 border border-blue-500/30 text-blue-400" :
                                      "bg-slate-500/10 border border-slate-500/30 text-slate-400"
                                }`}>
                                {center.plan}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-300">
                              {center.maxStudents >= 1000000 ? "لامحدود ♾️" : `${center.maxStudents?.toLocaleString()} طالب`}
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-300">{center.maxUsers} مستخدمين</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs font-bold ${center.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${center.isActive ? "bg-emerald-400" : "bg-red-400"}`}></span>
                                {center.isActive ? "نشط ومفعّل" : "مجمد / موقوف"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setControlCenterTarget({ ...center })}
                                  className="p-2 bg-slate-800/60 hover:bg-primary-600/20 hover:text-primary-400 border border-slate-700/60 hover:border-primary-500/30 rounded-xl transition-all font-bold text-xs flex items-center gap-1 text-slate-300"
                                  title="تعديل الباقة والحدود التشغيلية"
                                >
                                  <Sliders size={14} />
                                  <span>تعديل الصلاحيات</span>
                                </button>

                                <button
                                  onClick={() => setHardDeleteTarget({ id: center.id, verificationName: center.name, input: "" })}
                                  className="p-2 bg-slate-800/60 hover:bg-red-600/20 hover:text-red-400 border border-slate-700/60 hover:border-red-500/30 rounded-xl transition-all font-bold text-xs text-red-400/80"
                                  title="حذف وسحق سنتر بالكامل من الـ Database"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===========================================================================
              TAB 3: PROMO CODES MATRIX (منظومة إدارة الكوبونات وأكواد الخصم والتحليلات)
              =========================================================================== */}
          {activeTab === "promo-codes" && (
            <div className="space-y-6">
              {/* شريط الإجراءات والبحث لأكواد الخصم */}
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute right-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={promoSearch}
                    onChange={(e) => setPromoSearch(e.target.value)}
                    placeholder="ابحث عن رمز كود الخصم (Promo Code)..."
                    className="w-full bg-slate-950/80 border border-slate-800 pr-11 pl-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
                    <Clock size={14} className="text-slate-400" />
                    <select
                      value={promoCycleFilter}
                      onChange={(e) => setPromoCycleFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">كل الدورات الفاتورية</option>
                      <option value="MONTHLY">الاشتراكات الشهرية فقط</option>
                      <option value="YEARLY">الاشتراكات السنوية فقط</option>
                      <option value="BOTH">كلا الدورتين (BOTH)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setPromoCodeTarget({ mode: "CREATE", data: { applicableCycle: "BOTH", discountPercent: 15, durationMonths: 1, maxUses: 100 } })}
                    className="py-3 px-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary-600/10"
                  >
                    <Plus size={16} />
                    <span>توليد كود خصم سيادي جديد</span>
                  </button>
                </div>
              </div>

              {/* شبكة عرض الكوبونات الفاخرة (Promo Grid System) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromoCodes.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-2xl font-bold text-slate-500">
                    لا توجد رموز ترويجية مسجلة تطابق اختياراتك الحالية.
                  </div>
                ) : (
                  filteredPromoCodes.map((promo) => {
                    const isExpired = new Date(promo.expiresAt) < new Date();
                    const isMaxed = promo.usedCount >= promo.maxUses;

                    return (
                      <div key={promo.id} className={`bg-slate-900/30 border rounded-2xl p-6 relative overflow-hidden group shadow-xl flex flex-col justify-between transition-all ${isExpired || isMaxed ? "border-slate-800/60 opacity-60" : "border-slate-800 hover:border-slate-700"
                        }`}>
                        {/* خط التصميم الجمالي للكوبون */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-cyan-500"></div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-mono font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400 tracking-wider bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner select-all">
                              {promo.code}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setPromoCodeTarget({ mode: "EDIT", data: promo })}
                                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                                title="تعديل الكود المالي"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeletePromoCode(promo.id)}
                                className="p-2 bg-slate-950 hover:bg-red-950 border border-slate-800 text-slate-400 hover:text-red-400 transition-all"
                                title="إلغاء وسحب الكود نهائياً"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2.5 my-4 text-xs font-bold text-slate-400">
                            <div className="flex justify-between items-center">
                              <span>قيمة الخصم الممنوح:</span>
                              <span className="text-emerald-400 text-sm font-black flex items-center gap-0.5"><Percent size={12} />{promo.discountPercent} خصم</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>مدة الاستفادة المستدامة:</span>
                              <span className="text-white font-black">{promo.durationMonths} شهور فاتورية</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>الدورة الفاتورية المؤهلة:</span>
                              <span className="text-blue-400 font-black">{promo.applicableCycle === "BOTH" ? "شهري + سنوي" : promo.applicableCycle === "MONTHLY" ? "شهري فقط" : "سنوي فقط"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>تاريخ نهاية الصلاحية:</span>
                              <span className={`font-mono ${isExpired ? "text-red-400" : "text-slate-300"}`}>
                                {new Date(promo.expiresAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* مؤشر تقدم وتتبع الاستهلاك (Usage Gauge Tracker) */}
                        <div className="mt-4 pt-4 border-t border-slate-800/60">
                          <div className="flex justify-between text-[11px] font-black text-slate-500 mb-1.5">
                            <span>حجم الاستهلاك والطلبات المحققة</span>
                            <span>{promo.usedCount} / {promo.maxUses} استخدام</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isMaxed ? "bg-red-500" : "bg-gradient-to-r from-primary-500 to-cyan-500"}`}
                              style={{ width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%` }}
                            ></div>
                          </div>
                          {isExpired && <p className="text-[10px] text-red-400 font-bold mt-1.5 text-center">⛔ انتهت صلاحية هذا الكود تزامناً مع الوقت الحاضر</p>}
                          {isMaxed && !isExpired && <p className="text-[10px] text-amber-500 font-bold mt-1.5 text-center">⚠️ وصل الكود للحد الأقصى المسموح به من الاستخدام</p>}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ===========================================================================
          MODAL 1: ENTERPRISE CENTER CONTROL STUDIO (نافذة تعديل صلاحيات السنتر)
          =========================================================================== */}
      <AnimatePresence>
        {controlCenterTarget && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Sliders size={18} className="text-primary-400" />
                  <h3 className="text-lg font-black">تعديل باقة وصلاحيات السنتر السيادية</h3>
                </div>
                <button onClick={() => setControlCenterTarget(null)} className="p-1 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleControlCenterExecute} className="p-6 space-y-5 text-right">
                <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl space-y-1">
                  <p className="text-xs text-slate-500 font-bold">اسم السنتر الحالي:</p>
                  <p className="text-base font-black text-white">{controlCenterTarget.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">الرقم التعريفي الفريد: #{controlCenterTarget.id}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">الباقة السحابية للمنصة (Plan Tier)</label>
                  <select
                    value={controlCenterTarget.plan}
                    onChange={(e) => setControlCenterTarget({ ...controlCenterTarget, plan: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="TRIAL">خطة التجربة المجانية (TRIAL)</option>
                    <option value="BASIC">الباقة الأساسية المحدودة (BASIC)</option>
                    <option value="PREMIUM">الباقة الممتازة الأكثر مبيعاً (PREMIUM)</option>
                    <option value="ELITE">الباقة الإمبراطورية المفتوحة (ELITE)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">الحد الأقصى للطلاب المسموح بهم</label>
                    <input
                      type="number"
                      required
                      value={controlCenterTarget.maxStudents}
                      onChange={(e) => setControlCenterTarget({ ...controlCenterTarget, maxStudents: Number(e.target.value) })}
                      placeholder="مثال: 400"
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">اكتب 1000000 لجعل الباقة غير محدودة</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">الحد الأقصى للإداريين والسكرتارية</label>
                    <input
                      type="number"
                      required
                      value={controlCenterTarget.maxUsers}
                      onChange={(e) => setControlCenterTarget({ ...controlCenterTarget, maxUsers: Number(e.target.value) })}
                      placeholder="مثال: 5"
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">الحالة القانونية وصلاحية الدخول للسنتر</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setControlCenterTarget({ ...controlCenterTarget, isActive: true })}
                      className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-all ${controlCenterTarget.isActive
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      مفعّل ونشط بالكامل (Active)
                    </button>
                    <button
                      type="button"
                      onClick={() => setControlCenterTarget({ ...controlCenterTarget, isActive: false })}
                      className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-all ${!controlCenterTarget.isActive
                          ? "bg-red-500/10 border-red-500 text-red-400"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      تجميد الحساب فوراً (Frozen)
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-sm rounded-xl transition-all shadow-lg disabled:opacity-50"
                  >
                    {actionLoading ? "جاري التحديث والحفظ..." : "حفظ التعديلات الكبرى 🛡️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setControlCenterTarget(null)}
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all"
                  >
                    إلغاء التعديل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===========================================================================
          MODAL 2: PROMO CODE AUTHORIZATION STUDIO (نافذة توليد وتعديل أكواد الخصم)
          =========================================================================== */}
      <AnimatePresence>
        {promoCodeTarget && promoCodeTarget.data && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Percent size={18} className="text-primary-400" />
                  <h3 className="text-lg font-black">
                    {promoCodeTarget.mode === "CREATE" ? "توليد كود خصم ترويجي جديد" : "تعديل بنود وتوقيت كود الخصم الحالي"}
                  </h3>
                </div>
                <button onClick={() => setPromoCodeTarget(null)} className="p-1 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePromoCodeExecute} className="p-6 space-y-4 text-right">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">رمز كود الخصم (Unique Code String)</label>
                  <input
                    type="text"
                    required
                    disabled={promoCodeTarget.mode === "EDIT"}
                    value={promoCodeTarget.data.code || ""}
                    onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, code: e.target.value.toUpperCase().replace(/\s+/g, '') } })}
                    placeholder="مثال: SENTRYK30"
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-black tracking-wider text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-all disabled:opacity-40"
                  />
                  {promoCodeTarget.mode === "CREATE" && <p className="text-[10px] text-slate-500 mt-1 font-bold">يفضل استخدام حروف وأرقام واضحة ومميزة للماركت المصرى.</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">نسبة الخصم المئوية (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-3 text-slate-500" size={16} />
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        step="0.1"
                        value={promoCodeTarget.data.discountPercent || ""}
                        onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, discountPercent: Number(e.target.value) } })}
                        placeholder="مثال: 20"
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">عدد شهور تطبيق الخصم المستمر</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="48"
                      value={promoCodeTarget.data.durationMonths || ""}
                      onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, durationMonths: Number(e.target.value) } })}
                      placeholder="مثال: 1 (لشهر واحد)"
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">الدورة الفاتورية المسموح بتطبيق الكود عليها</label>
                  <select
                    value={promoCodeTarget.data.applicableCycle || "BOTH"}
                    onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, applicableCycle: e.target.value as any } })}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="BOTH">كلاهما معاً - الخطط الشهرية والسنوية (BOTH)</option>
                    <option value="MONTHLY">العمليات والدفع من النوع الشهري فقط (MONTHLY)</option>
                    <option value="YEARLY">العمليات والدفع من النوع السنوي فقط (YEARLY)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">الحد الأقصى الكلي للاستخدامات</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={promoCodeTarget.data.maxUses || ""}
                      onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, maxUses: Number(e.target.value) } })}
                      placeholder="مثال: 100"
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">تاريخ انتهاء الصلاحية الكلية للكود</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3 text-slate-500" size={16} />
                      <input
                        type="date"
                        required
                        value={promoCodeTarget.data.expiresAt ? new Date(promoCodeTarget.data.expiresAt).toISOString().split('T')[0] : ""}
                        onChange={(e) => setPromoCodeTarget({ ...promoCodeTarget, data: { ...promoCodeTarget.data!, expiresAt: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-sm rounded-xl transition-all shadow-lg disabled:opacity-50"
                  >
                    {actionLoading ? "جاري الحفظ الآمن..." : promoCodeTarget.mode === "CREATE" ? "تأكيد وإطلاق كود الخصم 🚀" : "حفظ البنود الفاتورية المعدلة 💾"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoCodeTarget(null)}
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all"
                  >
                    إلغاء الأمر
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===========================================================================
          MODAL 3: ABSOLUTE CRITICAL HARD DELETE GATE (جدار الحماية الفوري والتحقق الصارم من الحذف)
          =========================================================================== */}
      <AnimatePresence>
        {hardDeleteTarget && (
          <div className="fixed inset-0 bg-red-950/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-slate-950 border-2 border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 bg-red-500/10 border-b border-red-500/20 text-red-400 flex items-center gap-3">
                <ShieldAlert size={24} className="animate-bounce" />
                <div>
                  <h3 className="text-base font-black">تحذير أمني حرج: تدمير هيكلي وشيك!</h3>
                  <p className="text-[10px] font-bold text-red-400/70 uppercase font-mono tracking-wider">Cascade Core Deletion Protocol</p>
                </div>
              </div>

              <div className="p-6 text-right space-y-4">
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  أنت على وشك مسح وإزالة سنتر التعليم <span className="text-red-400 font-black">[{hardDeleteTarget.verificationName}]</span> نهائياً.
                  هذا الإجراء سيقوم بحذف السنتر وكل ما يتعلق به من طلاب، مستندات، حسابات، وجلسات فوراً وبشكل مطلق عبر ميزة الـ <span className="font-mono text-red-400 bg-red-500/5 px-1 py-0.5 rounded">Cascade Delete</span> المحددة في ملف الـ Prisma. لا يمكن التراجع عن هذا الإجراء أبداً.
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <p className="text-[11px] font-bold text-slate-400 mb-1">لتأكيد الهوية وتخطي جدار الحماية، اكتب اسم السنتر بدقة أدناه:</p>
                  <p className="text-sm font-black font-mono text-white tracking-wide bg-slate-950 py-1.5 rounded-lg border border-slate-800 select-none">{hardDeleteTarget.verificationName}</p>
                </div>

                <input
                  type="text"
                  value={hardDeleteTarget.input}
                  onChange={(e) => setHardDeleteTarget({ ...hardDeleteTarget, input: e.target.value })}
                  placeholder="اكتب اسم التحقق الفعلي هنا للتمكين..."
                  className="w-full bg-slate-950 border border-red-500/20 px-4 py-3 rounded-xl text-sm font-bold text-white text-center focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex gap-3">
                <button
                  disabled={actionLoading || hardDeleteTarget.input.trim() !== hardDeleteTarget.verificationName}
                  onClick={handleHardDeleteExecute}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-20 disabled:hover:bg-red-600 text-white font-black text-sm rounded-xl transition-all shadow-lg"
                >
                  {actionLoading ? "جاري المسح والسحق الهيكلي..." : "نعم، قم بالتدمير الفوري والمطلق الآن 💥"}
                </button>
                <button
                  onClick={() => setHardDeleteTarget(null)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 rounded-xl transition-all"
                >
                  إلغاء التدمير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}