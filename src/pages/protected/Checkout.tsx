import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Loader2,
    MessageSquare,
    ShieldCheck,
    Wallet,
    Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore'; // إضافة الـ Store

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();
    const { updateAuth, token } = useAuthStore(); // جلب وظيفة التحديث والتكن
    const paymentId = searchParams.get('paymentId');
    
    const [copied, setCopied] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [details, setDetails] = useState({
        id: paymentId,
        amount: 0,
        type: 'PLAN',
        planName: '',
        smsCount: 0,
        status: 'PENDING'
    });

    const pollingInterval = useRef<any>(null);

    const fetchPaymentDetails = async (showLoading = false) => {
        if (!paymentId) return;
        if (showLoading) setLoading(true);
        
        try {
            const response = await api.get(`/payments/details/${paymentId}`);
            const data = response.data;

            setDetails({
                id: data.id,
                amount: data.amount,
                type: data.metadata?.type || (data.plan ? 'PLAN' : 'UNKNOWN'),
                planName: data.plan,
                smsCount: data.metadata?.smsCount || 0,
                status: data.status
            });

            if (data.status === 'SUCCESS' && !isSuccess) {
                setIsSuccess(true);
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                
                // --- الجزء المضاف لتحديث حالة الاشتراك فوراً في المتصفح ---
                try {
                    const verifyRes = await api.get("/auth/verify-status");
                    if (verifyRes.data.success) {
                        updateAuth(verifyRes.data.user, token!, verifyRes.data.center);
                    }
                } catch (e) {
                    console.error("فشل تحديث بيانات الجلسة محلياً");
                }
                // -------------------------------------------------------

                toast.success("تم تأكيد الدفع بنجاح!");
                
                setTimeout(() => {
                    const redirectPath = data.metadata?.type === "SMS" ? "/sms-wallet" : "/dashboard";
                    navigate(redirectPath);
                }, 3000);
            }
        } catch (error) {
            console.error("Error fetching payment details", error);
            if (showLoading) toast.error("فشل في جلب بيانات الفاتورة");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        if (!paymentId) {
            toast.error("رقم العملية مفقود");
            navigate('/dashboard');
            return;
        }

        fetchPaymentDetails(true);

        pollingInterval.current = setInterval(() => {
            fetchPaymentDetails(false);
        }, 5000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [paymentId]);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const accounts = {
        vodafone: "01032102047",
        bankName: "البنك التجاري الدولي (CIB)",
        iban: "EG123456789012345678901234567", // آيبان تجريبي
        accountName: "شركة سمارت للحلول البرمجية"
    };

    if (loading) {
        return (
            <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-[#020617]' : 'bg-white'}`}>
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="font-black animate-pulse">جاري جلب تفاصيل الفاتورة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'} font-sans pb-20 relative overflow-hidden`} dir="rtl">
            
            <AnimatePresence>
                {isSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-primary-600/95 backdrop-blur-md text-white p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md"
                        >
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <Check size={48} className="text-primary-600" strokeWidth={4} />
                            </div>
                            <h2 className="text-4xl font-black mb-4">تم التفعيل بنجاح!</h2>
                            <p className="text-primary-100 font-bold mb-8">
                                تم استلام وتأكيد حوالتك المالية بنجاح. جاري توجيهك الآن إلى لوحة التحكم...
                            </p>
                            <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-50" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="max-w-5xl mx-auto px-6 pt-12">
                
                <header className="text-center mb-12">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 mb-6 text-sm font-black"
                    >
                        <Zap size={16} fill="currentColor" />
                        نظام الدفع الآمن والسريع
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">إتمام التحويل المالي</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto">
                        قم بتحويل المبلغ الموضح أدناه عبر إحدى الوسائل المتاحة، وسيقوم النظام بتفعيل حسابك تلقائياً عند التأكيد.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <Wallet className="text-primary-500" /> ملخص الفاتورة
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/40 border border-transparent">
                                    <span className="font-bold opacity-60">رقم العملية</span>
                                    <span className="font-black text-primary-500 font-mono">#{details.id}</span>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-primary-600 text-white shadow-xl flex flex-col items-center justify-center text-center">
                                    <span className="text-sm font-bold opacity-80 mb-1">المبلغ المطلوب</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black">{details.amount}</span>
                                        <span className="text-xl font-bold">ج.م</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black opacity-50 uppercase mb-1">نوع الطلب</p>
                                        <p className="font-black text-sm">
                                            {details.type === 'SMS' ? `شحن ${details.smsCount} رسالة` : `اشتراك ${details.planName}`}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black opacity-50 uppercase mb-1">حالة الدفع</p>
                                        <p className="font-black text-sm text-amber-500 flex items-center gap-1">
                                            <Clock size={14} className="animate-spin" /> فحص آلي..
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-xs font-bold text-slate-400">سيتم تحديث هذه الصفحة تلقائياً فور استلام المبلغ</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        {/* Vodafone Cash */}
                        <div className="relative group overflow-hidden bg-[#ee0000] rounded-[2.5rem] p-0.5 shadow-xl transition-transform hover:scale-[1.01]">
                            <div className="bg-[#ee0000] p-6 md:p-8 rounded-[2.3rem] relative overflow-hidden">
                                <div className="relative z-10 text-white">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md font-black text-xs">VC</div>
                                            <h3 className="text-xl md:text-2xl font-black">فودافون كاش</h3>
                                        </div>
                                    </div>
                                    <p className="text-white/80 font-bold text-xs mb-2">رقم المحفظة المستلمة:</p>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/10 p-4 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                                        <span className="text-2xl md:text-3xl font-black tracking-wider flex-1 text-center font-mono">{accounts.vodafone}</span>
                                        <button 
                                            onClick={() => copyToClipboard(accounts.vodafone, 'voda')}
                                            className="w-full sm:w-auto px-6 py-3 bg-white text-[#ee0000] rounded-xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            {copied === 'voda' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                            <span className="font-black text-sm">{copied === 'voda' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className="relative group overflow-hidden bg-blue-700 rounded-[2.5rem] p-0.5 shadow-xl transition-transform hover:scale-[1.01]">
                            <div className="bg-blue-700 p-6 md:p-8 rounded-[2.3rem] relative overflow-hidden">
                                <div className="relative z-10 text-white">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                                <Building2 size={20} />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black">تحويل بنكي (IBAN)</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-white/70 text-xs font-bold mb-1">اسم البنك</p>
                                            <p className="font-black text-lg">{accounts.bankName}</p>
                                        </div>

                                        <div>
                                            <p className="text-white/70 text-xs font-bold mb-1">رقم الآيبان (IBAN)</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/10">
                                                <span className="text-sm md:text-base font-black tracking-tighter flex-1 font-mono break-all text-center leading-relaxed">
                                                    {accounts.iban}
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(accounts.iban, 'bank')}
                                                    className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center justify-center gap-2 border border-white/20"
                                                >
                                                    {copied === 'bank' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                                    <span className="font-black text-xs">{copied === 'bank' ? 'تم النسخ' : 'نسخ الآيبان'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Action */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <button 
                                onClick={() => window.open(`https://wa.me/201061062466?text=مرحباً، قمت بتحويل مبلغ ${details.amount} ج.م لعملية رقم ${details.id}.. وهذا هو إيصال الدفع:`, '_blank')}
                                className="relative w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4"
                            >
                                <MessageSquare className="animate-bounce" />
                                إرسال إيصال التحويل (لتسريع التفعيل)
                            </button>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 text-slate-400 hover:text-primary-500 font-black transition-colors flex items-center justify-center gap-2 group"
                        >
                            <ArrowRight size={18} className="group-hover:-translate-x-2 transition-transform" />
                            العودة للوحة التحكم
                        </button>
                    </motion.div>
                </div>

                <footer className="mt-20 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8 opacity-40 grayscale">
                        <div className="flex items-center gap-2 font-black text-xs"><ShieldCheck size={16}/> SECURE ENCRYPTION</div>
                        <div className="flex items-center gap-2 font-black text-xs"><CheckCircle2 size={16}/> AUTO-VERIFICATION</div>
                    </div>
                </footer>
            </main>
        </div>
    );
}