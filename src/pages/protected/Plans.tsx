import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    CreditCard,
    Crown,
    Gem,
    Gift,
    Loader2,
    Moon,
    ShieldCheck,
    Sun,
    Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function Plans() {
    const { darkMode, toggleTheme } = useThemeStore();
    const { center, token, updateAuth, isPaid } = useAuthStore();
    const navigate = useNavigate();
    
    const [isYearly, setIsYearly] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    // --- المنطق الأسطوري للحماية والتوجيه التلقائي ---
    useEffect(() => {
        // 1. التحقق من حالة الدفع: إذا كان دافع فعلاً، اطرده للداشبورد
        if (isPaid === true) {
            navigate("/dashboard", { replace: true });
            return;
        }

        // 2. عمل Refresh تلقائي لمرة واحدة فقط عند دخول الصفحة لضمان تحديث البيانات
        const hasRefreshed = sessionStorage.getItem('plans_refreshed');
        if (!hasRefreshed) {
            sessionStorage.setItem('plans_refreshed', 'true');
            window.location.reload();
        }
    }, [isPaid, navigate]);

    const prices = {
        monthly: 199,
        yearly: 1199
    };

    const handleSubscription = async (planType: "TRIAL" | "MONTHLY" | "YEARLY") => {
        setLoading(planType);
        setError('');

        try {
            const amount = planType === "TRIAL" ? 0 : (planType === "YEARLY" ? prices.yearly : prices.monthly);
            
            const response = await api.post('/payments/create', {
                type: "PLAN",
                plan: planType,
                amount: amount
            });

            const data = response.data;

            if (planType === "TRIAL" && data.success) {
                if (data.user && data.center) {
                    updateAuth(data.user, data.token || token!, data.center);
                    navigate("/dashboard?status=trial_activated", { replace: true });
                } else {
                    window.location.href = "/dashboard?status=trial_activated";
                }
                return;
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
            
        } catch (err: any) {
            console.error("Payment Error:", err);
            const errorMessage = err.response?.data?.error || err.message || "عذراً، حدث خطأ أثناء الاتصال ببوابة الدفع.";
            setError(errorMessage);
        } finally {
            setLoading(null);
        }
    };

    // منع وميض المحتوى إذا كان المستخدم مسدداً بالفعل
    if (isPaid) return null;

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'} transition-all duration-700 font-sans`} dir="rtl">
            
            {/* Navbar */}
            <nav className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center relative z-20">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 rotate-3 group">
                        <Gem size={30} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Sentryk <span className="text-primary-600">Pro</span></h2>
                </motion.div>
                
                <button onClick={toggleTheme} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:rotate-12 transition-all">
                    {darkMode ? <Sun className="text-amber-400" size={26} /> : <Moon className="text-primary-600" size={26} />}
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 text-center relative z-10">
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
                        اختر خطة <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">النجاح</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold mb-12 max-w-2xl mx-auto">
                        انضم لمئات المعلمين الذين وثقوا بنا لإدارة مستقبلهم التعليمي باحترافية.
                    </p>
                </motion.div>

                {/* Switch Monthly/Yearly */}
                <div className="flex items-center justify-center gap-10 mb-16 scale-110">
                    <span className={`font-black text-xl transition-colors ${!isYearly ? 'text-primary-600' : 'text-slate-400'}`}>شهري</span>
                    <div 
                        onClick={() => setIsYearly(!isYearly)}
                        className="w-20 h-10 rounded-full bg-slate-200 dark:bg-slate-800 p-1.5 cursor-pointer relative border border-slate-300 dark:border-slate-700"
                    >
                        <motion.div 
                            animate={{ x: isYearly ? -40 : 0 }}
                            className="w-7 h-7 bg-primary-600 rounded-full shadow-lg flex items-center justify-center"
                        >
                            <Zap size={14} className="text-white" fill="currentColor" />
                        </motion.div>
                    </div>
                    <div className="text-right leading-tight">
                        <span className={`font-black text-xl transition-colors ${isYearly ? 'text-primary-600' : 'text-slate-400'}`}>سنوي</span>
                        <span className="block text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black mt-1">وفر 22%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    
                    {/* 1. Trial Plan */}
                    <AnimatePresence mode='wait'>
                        {!center?.trialUsed && (
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-dashed border-primary-500/30 flex flex-col justify-between relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12">
                                    <Gift size={150} />
                                </div>
                                
                                <div className="text-right relative z-10">
                                    <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 text-primary-600 mb-6">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4">الفترة التجريبية</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">استمتع بـ 14 يوم تجربة مجانية، جرب فيها كل الأدوات قبل الاشتراك.</p>
                                    
                                    <div className="space-y-4 mb-10">
                                        {["دخول كامل لجميع الأدوات", "تفعيل فوري للحساب", "إضافة طلاب غير محدود"].map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 font-bold">
                                                <Check size={18} className="text-green-500" strokeWidth={3} /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleSubscription("TRIAL")}
                                    disabled={!!loading}
                                    className="w-full py-6 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    {loading === "TRIAL" ? <Loader2 className="animate-spin" /> : "ابدأ الـ 14 يوم مجاناً"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 2. Paid Plan (Sentryk Pro) */}
                    <motion.div 
                        layout
                        className={`bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-4 border-primary-600 shadow-2xl shadow-primary-500/20 flex flex-col justify-between relative overflow-hidden ${center?.trialUsed ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}
                    >
                        <div className="absolute top-0 left-0 bg-primary-600 text-white px-8 py-2 rounded-br-[2rem] font-black text-sm">
                            الخيار الأفضل
                        </div>

                        <div className="text-right mt-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="inline-flex p-3 rounded-2xl bg-primary-600 text-white shadow-lg">
                                    <Crown size={32} />
                                </div>
                                <div className="text-left">
                                    <span className="text-5xl font-black tracking-tighter">{isYearly ? prices.yearly : prices.monthly}</span>
                                    <span className="text-slate-400 font-bold mr-2">ج.م / {isYearly ? 'سنوي' : 'شهري'}</span>
                                </div>
                            </div>

                            <h3 className="text-3xl font-black mb-4 uppercase">Sentryk Pro</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {[
                                    "نظام الباركود الذكي",
                                    "تقارير مالية تفصيلية",
                                    "رسائل تلقائية SMS",
                                    "دعم فني VIP 24/7",
                                    "صلاحيات سكرتارية",
                                    "تشفير بيانات بنكي"
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-2 text-red-500 font-bold text-sm">
                                   <ShieldCheck size={16} /> {error}
                                </div>
                            )}
                            <button 
                                onClick={() => handleSubscription(isYearly ? "YEARLY" : "MONTHLY")}
                                disabled={!!loading}
                                className="group w-full py-7 bg-primary-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {loading && loading !== "TRIAL" ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>اشترك الآن</span>
                                        <ArrowLeft className="group-hover:-translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Info */}
                <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
                    <div className="flex items-center gap-2 font-black"><ShieldCheck className="text-green-500" /> دفع آمن عبر PAYMOB</div>
                    <div className="flex items-center gap-2 font-black"><CreditCard /> محفظة الكترونية / كروت بنكية</div>
                </div>
            </main>

            {/* Decorative Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>
        </div>
    );
}
