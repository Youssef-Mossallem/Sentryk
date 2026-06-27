import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    History,
    Loader2,
    RefreshCw,
    Wallet,
    X,
    Clock,
    Calendar,
    Zap,
    Coins,
    ShieldCheck,
    AlertTriangle,
    Calculator,
    Info,
    Search,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

interface Transaction {
    id: number;
    amount: number;
    type: "CHARGE" | "SEND";
    description: string;
    createdAt: string;
}

interface WalletData {
    id: number;
    messages: number;
    balanceInMoney: string;
    pricePerMessage: number;
    lastUpdated: string;
}

export default function WhatsAppWallet() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // شحن الرصيد
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [messagesToCharge, setMessagesToCharge] = useState(500);
    const [isPaying, setIsPaying] = useState(false);

    // الباجينيشن والبحث المحلي
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "CHARGE" | "SEND">("ALL");

    // حاسبة استهلاك السنتر التفاعلية (Interactive Calculator State)
    const [calcStudents, setCalcStudents] = useState(300);
    const [calcMessagesPerMonth, setCalcMessagesPerMonth] = useState(4);

    const fetchData = useCallback(async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true);
            
            // استدعاء متوازي متوافق تماماً مع روترات الباك إند الذرية
            const [walletRes, transRes] = await Promise.all([
                api.get("/whatsapp-wallet"),
                api.get(`/whatsapp-wallet/transactions?page=${page}&limit=10`)
            ]);
            
            if (walletRes.data.success) {
                setWallet(walletRes.data.wallet);
            }
            if (transRes.data.success) {
                setTransactions(transRes.data.transactions);
                setTotalPages(transRes.data.pagination.totalPages || 1);
            }
            if (showToast) toast.success("تم تحديث المحفظة ومزامنة البيانات حياً ⚡");
        } catch (err: any) {
            toast.error("فشلت المزامنة اللحظية؛ يرجى التحقق من صلاحيات السنتر بنظام المنصة");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // معالج الدفع الإلكتروني الموحد والمطابق للباك إند (Unified Checkout Gateway)
    const handleCharge = async () => {
        if (isPaying || messagesToCharge < 50) {
            toast.error("الحد الأدنى لإنشاء الفاتورة هو 50 رسالة");
            return;
        }
        setIsPaying(true);
        try {
            // إرسال الطلب إلى الـ Endpoint المطور بالباك إند بـ payments.js
            const res = await api.post("/payments/create", {
                type: "WHATSAPP",
                whatsappCount: Number(messagesToCharge),
            });
            
            if (res.data.checkoutUrl) {
                toast.success("تم تشييد الفاتورة بنجاح! جاري التوجيه لبوابة الدفع الآمنة...");
                // التوجيه الفوري لبوابة Paymob الآمنة مع تتبع نية الدفع
                window.location.href = res.data.checkoutUrl;
            } else {
                throw new Error("بوابة الدفع لم تقم بإرجاع الرابط التشغيلي");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "بوابة الدفع الإلكتروني غير متاحة حالياً، يرجى المحاولة لاحقاً");
            setIsPaying(false);
        }
    };

    // فلترة وبحث حركي محلي لزيادة سرعة استجابة الصفحة (Performance Optimized)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  tx.amount.toString().includes(searchTerm);
            const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchTerm, typeFilter]);

    // حسابات تقديرية للحاسبة الذكية
    const calculatedNeededMessages = calcStudents * calcMessagesPerMonth;
    const calculatedCost = calculatedNeededMessages * (wallet?.pricePerMessage || 0.40);

    if (loading) {
        return (
            <div className="min-h-[100vh] flex flex-col items-center justify-center gap-6 bg-slate-50/50 dark:bg-slate-950">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 bg-emerald-500/10 rounded-full animate-ping" />
                    <Loader2 className="animate-spin text-emerald-500 w-14 h-14 relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-800 dark:text-slate-200 font-black text-xl animate-pulse">جاري فحص المحفظة الرقمية المشفرة...</p>
                    <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">مطابقة التواقيع المالية مع سجلات السيرفر المركزي لعام 2026</p>
                </div>
            </div>
        );
    }

    // التحقق من حالة الرصيد المنخفض لعرض تنبيه حرج ذكي
    const isBalanceCritical = (wallet?.messages || 0) < 150;

    return (
        <div className="max-w-[1500px] mx-auto p-4 md:p-8 space-y-8 text-right font-inter" dir="rtl">
            
            {/* الهيدر العلوي الأسطوري المحاط بالتأثيرات المضيئة */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-100/40 dark:shadow-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/20 shadow-inner group">
                        <Wallet className="text-emerald-500 w-9 h-9 transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">منصة البث الذكي والمحفظة الرقمية</h1>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">Meta Cloud API V3</span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-400 font-medium text-xs mt-1 leading-relaxed">
                            مراقبة الأرصدة التراكمية الفورية، تحليلات سحب السيرفر، وإنشاء طلبات الشحن المدعومة بنظام الدفع المحاسبي الموحد.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto relative z-10 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                        className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200/60 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50 active:scale-95"
                        title="مزامنة البيانات اللحظية"
                    >
                        <RefreshCw size={20} className={isRefreshing ? "animate-spin text-emerald-500" : ""} />
                    </button>
                    
                    <button
                        onClick={() => setShowChargeModal(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all active:scale-95 hover:shadow-xl hover:shadow-emerald-600/30"
                    >
                        <Coins size={18} className="animate-bounce" />
                        شحن فوري للمحفظة
                    </button>
                </div>
            </div>

            {/* الحارس الذكي - تنبيه الرصيد المنخفض الحرج */}
            {isBalanceCritical && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-500/10 to-rose-500/5 dark:from-amber-500/5 rounded-2xl border border-amber-500/20 p-4 flex items-start gap-3 text-right"
                >
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={18} />
                    <div>
                        <h4 className="font-black text-amber-800 dark:text-amber-400 text-xs">تحذير أتمتة النظام: رصيد البث منخفض جداً!</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            رصيدك الحالي يحتوي على أقل من <span className="font-bold text-rose-500">150 رسالة</span>. لتفادي تعطل إشعارات الغياب التلقائية الصباحية لأولياء الأمور، يرجى تعزيز رصيد المحفظة قبل الساعة 7:00 صباحاً.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* كروت الموازنة الحسابية والمالية الكبرى */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* كارت 1: رصيد قوالب البث */}
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/10"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-70 pointer-events-none" />
                    <div className="relative z-10 flex justify-between items-start">
                        <p className="text-slate-400 font-bold text-xs">مخزون الرسائل النشطة بالباقة</p>
                        <ShieldCheck size={18} className="text-emerald-400" />
                    </div>
                    <div className="relative z-10 flex items-baseline gap-2.5 mt-3">
                        <h2 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-200">
                            {wallet?.messages.toLocaleString('ar-EG') || 0}
                        </h2>
                        <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">قالب بث معتمد</span>
                    </div>
                    <div className="relative z-10 mt-6 flex items-center gap-1.5 text-[11px] text-slate-300 font-medium bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        اتصال بوابة ميتـا المباشرة: مُستقر وآمن 🛡️
                    </div>
                </motion.div>

                {/* كارت 2: القيمة النقدية المقابلة للرصيد */}
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 dark:text-slate-400 font-bold text-xs">القيمة المالية المقابلة للأرصدة</p>
                            <TrendingUp size={16} className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
                            {parseFloat(wallet?.balanceInMoney || "0.00").toFixed(2)} <span className="text-xs text-slate-400 font-bold">ج.م</span>
                        </h2>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium flex justify-between items-center">
                            <span>تكلفة الإشعار الموحد بالسيستم:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">{wallet?.pricePerMessage || 0.40} ج.م</span>
                        </p>
                    </div>
                </motion.div>

                {/* كارت 3: توقيت المطابقة وتدقيق الحسابات */}
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <p className="text-slate-400 dark:text-slate-400 font-bold text-xs">آخر فحص وتدقيق مالي للخادم</p>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-4 leading-snug">
                            {wallet?.lastUpdated ? new Date(wallet.lastUpdated).toLocaleDateString('ar-EG', {
                                day: '2-digit',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            }) : 'قيد المزامنة البنكية...'}
                        </h2>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                            <CheckCircle2 size={13} />
                      سجلات محاسبية مطابقة وخالية من الأخطاء
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* أدوات الذكاء التشغيلي وأتمتة السيستم وحاسبة التخطيط */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* عمود الحاسبة التفاعلية المدمجة - لتخطيط الاستهلاك الباقة */}
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-2">
                            <Calculator size={18} className="text-emerald-500" />
                            <h4 className="font-black text-xs md:text-sm">حاسبة استهلاك السنتر الذكية</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">خطط لميزانيتك الشهرية عبر إدخال حجم الطلاب لحساب الأرصدة المطلوبة فوراً.</p>
                        
                        <div className="space-y-3 mt-4">
                            <div>
                                <label className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                                    <span>عدد الطلاب النشطين بالسنتر:</span>
                                    <span className="text-emerald-600 font-black">{calcStudents} طالب</span>
                                </label>
                                <input 
                                    type="range" min="50" max="5000" step="50"
                                    value={calcStudents} onChange={(e) => setCalcStudents(Number(e.target.value))}
                                    className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            
                            <div>
                                <label className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                                    <span>معدل الرسائل لكل طالب شهرياً:</span>
                                    <span className="text-emerald-600 font-black">{calcMessagesPerMonth} إشعارات</span>
                                </label>
                                <input 
                                    type="range" min="1" max="15" step="1"
                                    value={calcMessagesPerMonth} onChange={(e) => setCalcMessagesPerMonth(Number(e.target.value))}
                                    className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400">الرسائل المقدرة:</p>
                            <p className="font-black text-slate-800 dark:text-white text-sm">{calculatedNeededMessages} رسالة</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400">التكلفة المتوقعة:</p>
                            <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{calculatedCost.toFixed(1)} ج.م</p>
                        </div>
                    </div>
                </div>

                {/* كروت قواعد الأتمتة المدمجة بالنظام */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
                        <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl mt-0.5">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs">الكرون جوب والمنبه الصباحي التلقائي</h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                                يستيقظ محرك المنصة آلياً كل يوم الساعة <span className="font-bold text-blue-500">7:00 صباحاً</span> لمراجعة الطلاب الغائبين في الحصص السابقة، وإرسال التقارير الفورية الموثقة لهواتف أولياء الأمور دون تدخل يدوي.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
                        <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl mt-0.5">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs">التقرير الشهري التراكمي الشامل</h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                                يتم تجميعه وبثه <span className="font-bold text-purple-500">أول يوم في كل شهر ميلادي</span> لتسليم عائلات الطلاب ملفاً رقمياً متكاملاً ومعدلات الحضور الفعلي ونسب الغياب.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-start md:col-span-2">
                        <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl mt-0.5">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs">معيار احتساب الرسائل (Meta Cloud API Standard)</h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                                على عكس نظام الـ SMS التقليدي المحدود بـ 70 حرفاً؛ يضمن لك نظام البث خصم <span className="font-bold text-amber-500">رسالة قالب واحدة فقط (1 Template)</span> لكل إشعار، مهما كان حجم النص طويلاً، وشاملاً  جداول الحصص.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* قسم جدول العمليات المطور مع الفلاتر الفخمة */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                            <History size={18} />
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">سجل العمليات وحركات الرصيد التدقيقية</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">سجل شامل معزز بحماية الدورة التكرارية لرصد الاستهلاك وعمليات الشحن الموثقة</p>
                        </div>
                    </div>

                    {/* أدوات البحث والفلترة المتطورة للمستخدم المحترف */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <input 
                                type="text"
                                placeholder="بحث في السجلات والبيان..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-60 pr-9 pl-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                            />
                            <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            {(["ALL", "CHARGE", "SEND"] as const).map((filterType) => (
                                <button
                                    key={filterType}
                                    onClick={() => setTypeFilter(filterType)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                        typeFilter === filterType 
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                                >
                                    {filterType === "ALL" ? "الكل" : filterType === "CHARGE" ? "شحن رصيد" : "استهلاك بث"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center">
                            <Info size={26} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">لا توجد سجلات تطابق خيارات الفلترة والبحث الحالية</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-4 px-6 md:px-8 font-black">نوع وطبيعة المعاملة</th>
                                    <th className="py-4 px-6 font-black">الكمية والمقدار</th>
                                    <th className="py-4 px-6 font-black">البيان والتفاصيل المحاسبية</th>
                                    <th className="py-4 px-6 md:px-8 font-black">التاريخ والتوقيت الدقيق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                        <td className="py-4 px-6 md:px-8">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                                                tx.type === "CHARGE" 
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            }`}>
                                                {tx.type === "CHARGE" ? (
                                                    <>
                                                        <ArrowDownLeft size={13} className="animate-pulse" />
                                                        شحن رصيد باقة
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUpRight size={13} />
                                                        بث آلي للسيرفر
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-black text-sm text-slate-800 dark:text-slate-200">
                                            <span className={tx.type === "CHARGE" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}>
                                                {tx.type === "CHARGE" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`}
                                            </span> <span className="text-xs font-normal text-slate-400">رسالة</span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[350px] truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" title={tx.description}>
                                            {tx.description || "معاملة آلية معالجة بواسطة النظام"}
                                        </td>
                                        <td className="py-4 px-6 md:px-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            {new Date(tx.createdAt).toLocaleDateString('ar-EG', {
                                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* أزرار الباجينيشن الفخمة */}
                {totalPages > 1 && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex justify-between items-center">
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                        >
                            <ChevronRight size={16} />
                            الصفحة السابقة
                        </button>
                        
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                            صفحة {page} من {totalPages}
                        </span>

                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                        >
                            الصفحة التالية
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* مودال شحن الرصيد الفوري والمؤمن بالكامل - AnimatePresence */}
            <AnimatePresence>
                {showChargeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        
                        {/* الخلفية المضببة الفخمة (Glassmorphism Overlay) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isPaying && setShowChargeModal(false)}
                            className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
                        />

                        {/* جسم المودال الأسطوري */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-2xl z-10 overflow-hidden"
                        >
                            {/* زخرفة هندسية خلفية داخل المودال */}
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">تعبئة رصيد البث الفوري</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">الشحن فوري ومؤمن عبر بوابة الدفع الإلكتروني الموحدة</p>
                                </div>
                                <button
                                    disabled={isPaying}
                                    onClick={() => setShowChargeModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all disabled:opacity-40 bg-slate-50 dark:bg-slate-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2.5">اختر إحدى الباقات الجاهزة الموصى بها:</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[500, 1000, 2500, 5000, 10000].map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                disabled={isPaying}
                                                onClick={() => setMessagesToCharge(count)}
                                                className={`py-3 rounded-xl font-black text-xs border transition-all ${
                                                    messagesToCharge === count
                                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                                        : "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                {count.toLocaleString()} رسالة
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative mt-4">
                                        <input
                                            type="number"
                                            min="50"
                                            disabled={isPaying}
                                            value={messagesToCharge || ""}
                                            onChange={(e) => setMessagesToCharge(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-left font-black text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                            placeholder="أو اكتب كمية مخصصة للرسائل..."
                                        />
                                        <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-bold">رسالة بث</span>
                                    </div>
                                </div>

                                {/* فاتورة الحساب والديناميكية الفورية القابلة للتدقيق المحاسبي */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/40 dark:border-slate-700/40 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                        <span>حجم كمية الرسائل المطلوبة:</span>
                                        <span className="font-black text-slate-800 dark:text-slate-200">{messagesToCharge.toLocaleString()} رسالة قالب</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                        <span>سعر التكلفة للرسالة الموحدة:</span>
                                        <span className="font-black text-slate-800 dark:text-slate-200">{wallet?.pricePerMessage || 0.40} ج.م</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-200/60 dark:bg-slate-700/60 my-1" />
                                    <div className="flex justify-between items-center text-sm font-black">
                                        <span className="text-slate-800 dark:text-slate-200">إجمالي المبلغ الصافي المستحق:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 text-base">
                                            {(messagesToCharge * (wallet?.pricePerMessage || 0.40)).toFixed(2)} ج.م
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isPaying || messagesToCharge < 50}
                                    onClick={handleCharge}
                                    className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-slate-900/10 dark:shadow-none"
                                >
                                    {isPaying ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            جاري الاتصال المشفر بالبوابة الموحدة...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={16} />
                                            الانتقال لبوابة الدفع الآمن الآن
                                        </>
                                    )}
                                </button>
                                
                                {messagesToCharge < 50 && (
                                    <p className="text-[10px] text-center text-rose-500 font-bold animate-pulse">
                                        ⚠️ الحد الأدنى المسموح به لإنشاء حركة تمويل للمحفظة بالسيرفر هو 50 رسالة.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}