import { motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Loader2,
    ShieldCheck,
    Wallet,
    Zap,
    AlertTriangle,
    CreditCard,
    Sparkles,
    RefreshCw,
    Lock
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios'; 
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';

// هيكلية تفاصيل العملية المالية المتوافقة مع الباك إند
interface PaymentDetails {
    id: string | number;
    amount: number;
    plan: string;
    billingCycle: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    merchantReference: string;
    whatsappCount: number;
    freeMonthsConsumed: number;
    discountAppliedPercent: number;
}

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();
    const { updateAuth, token } = useAuthStore();

    // 1. التقاط المعرفات من الرابط
    const merchantOrderId = searchParams.get('merchant_order_id');
    const paymobTxnId = searchParams.get('id') || searchParams.get('paymentId');
    const urlIdentifier = merchantOrderId || paymobTxnId;

    // محرك اللوجز الصامت للخلفية (توجيه للكونسول مباشرة دون التأثير على الواجهة)
    const writeLog = (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', stage: string, message: string, payload?: any) => {
        console.log(`[${level}][${stage}] ${message}`, payload || '');
    };

    // حالات الواجهة الموحدة
    const [loading, setLoading] = useState<boolean>(true);
    const [isPolling, setIsPolling] = useState<boolean>(false);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [fallbackMode, setFallbackMode] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(5);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // المدخلات الخاصة بالفحص اليدوي السريع لغايات التيست المتقدم
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminBypass, setShowAdminBypass] = useState(false);

    const [details, setDetails] = useState<PaymentDetails>({
        id: '',
        amount: 0,
        plan: 'BASIC',
        billingCycle: 'MONTHLY',
        status: 'PENDING',
        merchantReference: '',
        whatsappCount: 0,
        freeMonthsConsumed: 0,
        discountAppliedPercent: 0
    });

    const pollingInterval = useRef<any>(null);
    const isComponentMounted = useRef<boolean>(true);
    const pollingCounter = useRef<number>(0);

    // دورة الأمان الطبقية المسترجعة (Rescue Layer): فحص وحفظ الهوية المحلية لمنع فقدان البيانات الرقمية
    useEffect(() => {
        writeLog('INFO', 'INITIALIZATION', 'بدء تشغيل وتدقيق دورة حياة صفحة المعاملات الموحدة 2026.');
        
        let finalIdentifier = urlIdentifier;

        // حماية متقدمة: إذا فقدنا الـ ID من الرابط بسبب تحويلات باي موب، نسترجعه فوراً من التخزين المحلي الآمن
        if (!finalIdentifier) {
            writeLog('WARN', 'RESCUE_LAYER', 'لم يتم العثور على معرّفات في الرابط الحالي. جاري فحص الحافظة المحلية للإنقاذ...');
            const savedSession = localStorage.getItem('sentryk_active_checkout');
            if (savedSession) {
                try {
                    const parsed = JSON.parse(savedSession);
                    if (Date.now() - parsed.timestamp < 3600000) {
                        finalIdentifier = parsed.merchantReference || parsed.id;
                        writeLog('SUCCESS', 'RESCUE_LAYER', 'تم بنجاح استنقاذ واستعادة بيانات الفاتورة المفقودة محلياً!', parsed);
                        setDetails(prev => ({
                            ...prev,
                            id: parsed.id,
                            merchantReference: parsed.merchantReference,
                            amount: parsed.amount,
                            plan: parsed.plan
                        }));
                    }
                } catch (e) {
                    writeLog('ERROR', 'RESCUE_LAYER', 'فشل قراءة كائن الطوارئ المخزن محلياً.', e);
                }
            }
        } else {
            writeLog('INFO', 'URL_PARSING', `تم العثور على معرّف معامله بالرابط المباشر: ${finalIdentifier}`);
        }

        if (!finalIdentifier) {
            writeLog('ERROR', 'VALIDATION', 'فشلت كافة مسارات البحث المصرفية والمحلية في تحديد هوية الفاتورة.');
            toast.error("مؤشر المعاملة المالية أو معرف الطلب غير متاح");
            navigate('/dashboard');
            return;
        }

        // إطلاق محرك الفحص والتحقق الفوري
        fetchAndVerifyDetails(finalIdentifier, true);

        // تشغيل حلقة الفحص المتزامن المستمر (Dynamic Polling Loop) لقفل الفواتير
        const isCallbackMode = searchParams.has('success') || searchParams.has('status') || searchParams.has('pending') || !!merchantOrderId;
        
        pollingInterval.current = setInterval(() => {
            if (isComponentMounted.current && finalIdentifier) {
                fetchAndVerifyDetails(finalIdentifier, false, isCallbackMode);
            }
        }, 4000);

        return () => {
            isComponentMounted.current = false;
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            writeLog('INFO', 'LIFECYCLE', 'تدمير مكون الواجهة وإيقاف حلقات الفحص المتزامنة.');
        };
    }, [urlIdentifier]);

    // دالة الفحص الاستعلامي الموحدة والربط الشامل مع الباك إند
    const fetchAndVerifyDetails = async (targetId: string | number, showLoadingAnimation = false, isCallback = false) => {
        if (showLoadingAnimation) setLoading(true);
        
        const requestUrl = `/payments/details/${targetId}${window.location.search}`;
        writeLog('INFO', 'API_REQUEST', `إرسال طلب فحص واستعلام إلى الباك إند: GET ${requestUrl}`, {
            targetId,
            urlParams: Object.fromEntries(searchParams.entries())
        });

        try {
            const response = await api.get(requestUrl);
            const data = response.data;
            
            writeLog('SUCCESS', 'API_RESPONSE', 'تم استلام استجابة فك وتدقيق الفاتورة بنجاح من الخادم المخدم.', data);

            if (data.success && data.payment) {
                const targetPayment = data.payment;
                const metadata = data.metadata || {};
                
                setCheckoutUrl(data.checkoutUrl || metadata?.checkoutUrl || null);

                const updatedDetails: PaymentDetails = {
                    id: targetPayment.id || targetId,
                    amount: targetPayment.amount ?? 0,
                    plan: targetPayment.plan || 'BASIC',
                    billingCycle: targetPayment.billingCycle || metadata?.billingCycle || 'MONTHLY',
                    status: targetPayment.status || 'PENDING',
                    merchantReference: targetPayment.merchantReference || '',
                    whatsappCount: Number(metadata?.whatsappCount || 0),
                    freeMonthsConsumed: Number(metadata?.freeMonthsConsumed || 0),
                    discountAppliedPercent: Number(metadata?.discountAppliedPercent || 0)
                };

                setDetails(updatedDetails);

                localStorage.setItem('sentryk_active_checkout', JSON.stringify({
                    id: updatedDetails.id,
                    merchantReference: updatedDetails.merchantReference,
                    plan: updatedDetails.plan,
                    amount: updatedDetails.amount,
                    timestamp: Date.now()
                }));

                // 🟢 حالة النجاح المالي والاعتماد النهائي
                if (targetPayment.status === 'SUCCESS') {
                    writeLog('SUCCESS', 'FINALIZE_TRANSACTION', 'الباك إند أقر بنجاح العملية! جاري تحديث الحساب محلياً وقفل شاشات الفحص.');
                    setPaymentSuccess(true);
                    setLoading(false);
                    setIsPolling(false);
                    if (pollingInterval.current) clearInterval(pollingInterval.current);

                    try {
                        const verifyRes = await api.get("/auth/verify-status");
                        if (verifyRes.data.success) {
                            updateAuth(verifyRes.data.user, token!, verifyRes.data.center);
                            writeLog('SUCCESS', 'AUTH_SYNC', 'تم تحديث رصيد الصلاحيات والحدود البرمجية محلياً بالفرونت إند.', verifyRes.data);
                        }
                    } catch (sessionErr: any) {
                        writeLog('WARN', 'AUTH_SYNC_FAILED', 'فشل الاتصال التلقائي لتحديث الكاش المحلي للصلاحيات.', sessionErr.message);
                    }
                    toast.success("تم تأكيد العملية وتحديث حدود الحساب بأمان! ✅");
                    return;
                }

                // 🔴 حالة الرفض البنكي النهائي
                if (targetPayment.status === 'FAILED') {
                    writeLog('ERROR', 'TRANSACTION_FAILED', 'بوابة الدفع المركزية أو خادم الباك إند سجل هذه المعاملة كعملية فاشلة/مرفوضة.');
                    setLoading(false);
                    setIsPolling(false);
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    setErrorMessage("تم رفض المعاملة المالية من قبل جهة إصدار البطاقة أو تم إلغاؤها.");
                    return;
                }

                // 🟡 الفاتورة معلقة قيد الدفع التزامني
                if (targetPayment.status === 'PENDING') {
                    if (isCallback || searchParams.has('id') || merchantOrderId) {
                        setIsPolling(true);
                        setLoading(false);
                        pollingCounter.current += 1;
                        writeLog('INFO', 'POLLING_LOOP', `المعاملة معلقة. جاري الانتظار وفحص الـ Webhook... المحاولة رقم [${pollingCounter.current}]`);
                        
                        if (pollingCounter.current > 6) {
                            setFallbackMode(true);
                            writeLog('WARN', 'FALLBACK_TRIGGER', 'تأخرت الاستجابة المباشرة. تفعيل إرشادات الدعم الفني الاحتياطية للمستخدم.');
                        }
                    } else {
                        setLoading(false);
                    }
                }
            } else {
                writeLog('ERROR', 'PAYMENT_VERIFY_ERROR', 'الباك إند لم يعثر على سجلات مطابقة أو أرجع كود خطأ.', data);
                if (showLoadingAnimation) setErrorMessage(data.error || "تعذر العثور على سجلات الفاتورة المطلوبة.");
            }
        } catch (error: any) {
            writeLog('ERROR', 'NETWORK_CRITICAL', 'انهيار في خط اتصال الفحص المشفر مع السيرفر أو خطأ 500.', error.response?.data || error.message);
            if (showLoadingAnimation) {
                setErrorMessage(error.response?.data?.error || "فشل الاتصال المشفر بخادم العمليات المالي.");
            }
        } finally {
            if (showLoadingAnimation) setLoading(false);
        }
    };

    // تدوير عداد الانتقال التلقائي الآمن بعد النجاح
    useEffect(() => {
        if (paymentSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (paymentSuccess && countdown === 0) {
            const redirectPath = details.plan === "WHATSAPP" ? "/sms-wallet" : "/dashboard";
            writeLog('INFO', 'REDIRECT', `توجيه المستخدم النهائي الآن إلى المسار: ${redirectPath}`);
            navigate(redirectPath);
        }
    }, [paymentSuccess, countdown, details.plan]);

    const handlePaymobRedirect = () => {
        writeLog('INFO', 'GATEWAY_REDIRECT', 'بدء معالجة التوجيه الآمن لبوابة الدفع الخارجية لـ Paymob.', {
            checkoutUrl,
            currentDetails: details
        });

        if (checkoutUrl) {
            toast.success("جاري إعادة توجيهك الآمن لمنفذ السداد الموحد...");
            setTimeout(() => {
                window.location.href = checkoutUrl;
            }, 600);
        } else {
            writeLog('ERROR', 'REDIRECT_ABORT', 'فشل التوجيه لعدم توفر رابط الـ checkoutUrl من الباك إند لهذه الفاتورة.');
            toast.error("رابط الدفع الإلكتروني المباشر غير متاح حالياً، يرجى المحاولة لاحقاً.");
        }
    };

    // كود اختبار ومحاكاة التفعيل اليدوي الإداري السريع
    const handleAdminBypassTest = async () => {
        writeLog('INFO', 'ADMIN_BYPASS_SUBMIT', 'إرسال طلب تفعيل يدوي فوري كأدمن من واجهة التيست...', {
            paymentId: details.id,
            adminEmail
        });
        try {
            const res = await api.post('/payments/activate-manual', {
                paymentId: details.id,
                adminEmail,
                adminPassword
            });
            writeLog('SUCCESS', 'ADMIN_BYPASS_RESPONSE', 'رد السيرفر على التفعيل اليدوي الاستثنائي:', res.data);
            if (res.data.success) {
                toast.success("تم التفعيل اليدوي بنجاح عبر محرك الخدمة الموحد! ✅");
                fetchAndVerifyDetails(details.id, true);
            } else {
                toast.error(res.data.error || "فشلت عملية الباي باس");
            }
        } catch (err: any) {
            writeLog('ERROR', 'ADMIN_BYPASS_FATAL', 'فشل إرسال طلب تفعيل الأدمن اليدوي.', err.response?.data || err.message);
            toast.error(err.response?.data?.error || "حدث خطأ في معالجة طلب التيست");
        }
    };

    // ===========================================================================
    // الواجهات الشرطية وإدارة حالات العرض
    // ===========================================================================

    // 1️⃣ واجهة التحميل والأمن الطبقي
    if (loading) {
        return (
            <div className={`h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-[#020617] text-white' : 'bg-white text-slate-900'}`}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
                    <h3 className="font-black text-xl animate-pulse">تأمين الاتصال وجلب البيانات المالية...</h3>
                    <p className="text-xs text-slate-400 font-bold">يتم الآن فحص وتدقيق المعاملة تزامناً مع السيرفر</p>
                </div>
            </div>
        );
    }

    // 2️⃣ واجهة الأخطاء الحرجة
    if (errorMessage && !isPolling && !paymentSuccess) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-[#020617]' : 'bg-slate-50'}`} dir="rtl">
                <div className="max-w-md w-full mx-4 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-rose-500/20 text-center space-y-6">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">خلل في معالجة الفاتورة</h2>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{errorMessage}</p>
                    <button 
                        onClick={() => fetchAndVerifyDetails(details.id || urlIdentifier || '', true)}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm transition-all hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> إعادة المحاولة الفنية الآن
                    </button>
                </div>
            </div>
        );
    }

    // 3️⃣ واجهة النجاح المالي الأسطوري
    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
                <div className="text-center p-8 max-w-lg w-full mx-4 bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-emerald-50 dark:border-emerald-950/30 relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-emerald-200 dark:bg-emerald-900/30 rounded-full animate-ping opacity-50"></div>
                        <div className="relative w-24 h-24 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <Check className="w-12 h-12 text-white" strokeWidth={4} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                        تم تفعيل الحساب بنجاح! <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">شكرًا لك، قمنا باعتماد العقد المالي وتسجيل الصلاحيات الجديدة في نظام الـ SaaS.</p>
                    
                    <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] text-right text-xs space-y-3.5 border border-slate-100 dark:border-slate-800/60">
                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">نوع الباقة الفعّالة:</span> <span className="font-black px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full">{details.plan === "WHATSAPP" ? `شحن محفظة الواتساب (${details.whatsappCount} رسالة)` : `باقة الفئة ${details.plan}`}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">دورة المحاسبة المعتمدة:</span> <span className="font-black text-slate-700 dark:text-slate-300">{details.billingCycle === "YEARLY" ? "سنوي (خصم خاص 🎁)" : "شهري"}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">القيمة المالية الإجمالية:</span> <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{details.amount} ج.م</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">المعرّف الداخلي الصغير:</span> <span className="font-mono font-black text-slate-500 dark:text-slate-400">#{details.id}</span></div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        جاري نقلك آلياً للوحة التحكم للعمل خلال {countdown} ثوانٍ...
                    </div>
                </div>
            </div>
        );
    }

    // 4️⃣ واجهة الانتظار والمزامنة الحية (Live Polling Board)
    if (isPolling) {
        const isPaymobDeclined = searchParams.get("success") === "false";
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-slate-900" dir="rtl">
                <div className="text-center p-8 max-w-md w-full mx-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800/50 space-y-6">
                    {isPaymobDeclined ? (
                        <>
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/30 text-rose-500">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">عملية سداد مرفوضة بنكياً</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                تعذر استلام وأرشفة أموال العملية. قد يكون السبب عدم تفعيل كود الأمان (OTP)، أو تخطي الحد الائتماني للشراء المصرفي للكارت.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="relative w-20 h-20 mx-auto">
                                <Loader2 className="w-20 h-20 animate-spin text-indigo-600 dark:text-indigo-400" />
                                <CreditCard className="w-7 h-7 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">جاري فحص وتأكيد السداد حياً...</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                نتحقق الآن تزامناً مع خوادم بوابات الدفع وقنوات الـ Webhook لقفل وإغلاق الفاتورة المفتوحة.
                            </p>
                        </>
                    )}

                    {fallbackMode && (
                        <div className="p-4 bg-amber-50/70 dark:bg-amber-900/20 border border-amber-500/20 rounded-2xl text-right">
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-bold">
                                💡 تنبيه الأمان الاحتياطي: إذا تم خصم المبلغ من حسابك البنكي بالفعل فلا تقلق، سيقوم نظام الـ Webhook المالي بتحديث صلاحيات السنتر تلقائياً فور فك تعليق الشبكات المصرفية الخارجية.
                            </p>
                        </div>
                    )}
                    
                    <div className="pt-2 flex flex-col gap-3">
                        <button 
                            onClick={() => fetchAndVerifyDetails(details.id || urlIdentifier || '', true, true)}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/10"
                        >
                            <RefreshCw className="w-4 h-4" /> إعادة فحص يدوي للحالة الآن
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 5️⃣ واجهة العرض الأساسية المدمجة والنهائية
    return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'} font-sans pb-32 relative overflow-hidden`} dir="rtl">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-emerald-600/5 blur-[150px] rounded-full" />
            </div>

            <main className="max-w-6xl mx-auto px-6 pt-12">
                <header className="text-center mb-12">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-5 text-sm font-black"
                    >
                        <Zap size={15} fill="currentColor" /> بوابة معالجة المدفوعات والاشتراسات لعام 2026
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">إتمام وتأكيد المعاملة المالية</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto text-sm md:text-base">
                        قم بسداد قيمة الفاتورة المستحقة عبر منفذ الدفع الآلي المشفر لتفعيل الاشتراك والحدود البرمجية لحسابك على الفور.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* عمود تفكيك عناصر الفاتورة الرقمية (يمين) */}
                    <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-5 space-y-6">
                        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <Wallet className="text-indigo-500" size={22} /> بيان وتفاصيل الفاتورة
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center p-4 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100/60 dark:border-slate-800/40">
                                    <span className="font-bold opacity-60 text-xs">معرّف النظام الصغير (ID)</span>
                                    <span className="font-black text-indigo-500 font-mono text-sm">#{details.id}</span>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold opacity-75 mb-1">صافي المبلغ المستحق للدفع</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-5xl font-black tracking-tight">{details.amount}</span>
                                        <span className="text-lg font-bold">ج.م</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black opacity-50 uppercase mb-1">الغرض / الفئة</p>
                                        <p className="font-black text-xs md:text-sm text-slate-800 dark:text-slate-200 truncate">
                                            {details.plan === "WHATSAPP" ? `شحن محفظة الواتساب` : `اشتراك باقة ${details.plan}`}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black opacity-50 uppercase mb-1">دورة الفاتورة</p>
                                        <p className="font-black text-xs md:text-sm text-slate-800 dark:text-slate-200">
                                            {details.plan === "WHATSAPP" ? "مفتوحة" : (details.billingCycle === "YEARLY" ? "سنوية" : "شهرية")}
                                        </p>
                                    </div>
                                </div>

                                {details.discountAppliedPercent > 0 && (
                                    <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">
                                        <span>خصم ترويجي نشط معتمد:</span>
                                        <span>{details.discountAppliedPercent}% خصم</span>
                                    </div>
                                )}
                            </div>

                            {/* زر فتح لوحة التيست السريع لتجاوز البوابة يدوياً للأدمن والمطورين */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                                <button 
                                    onClick={() => setShowAdminBypass(!showAdminBypass)}
                                    className="text-xs text-slate-400 hover:text-indigo-500 font-bold inline-flex items-center gap-1 transition-colors"
                                >
                                    <Lock size={12} /> اختبار التفعيل الإداري اليدوي (Bypass Test)
                                </button>
                                
                                {showAdminBypass && (
                                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-right space-y-3 border border-dashed border-indigo-500/30">
                                        <p className="text-[11px] font-bold text-indigo-500">خاص بالاختبار: تفعيل الفاتورة فوراً عبر السيرفر دون دفع حقيقي</p>
                                        <input 
                                            type="text" placeholder="بريد المطور (ADMIN_MOCK_EMAIL)" 
                                            className="w-full p-2 text-xs rounded-lg border bg-white dark:bg-slate-900"
                                            value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                                        />
                                        <input 
                                            type="password" placeholder="كلمة المرور (ADMIN_MOCK_PASSWORD)" 
                                            className="w-full p-2 text-xs rounded-lg border bg-white dark:bg-slate-900"
                                            value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleAdminBypassTest}
                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-black text-xs hover:bg-indigo-700"
                                        >
                                            إرسال أمر حقن التفعيل للسيرفر
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* عمود بوابات السداد التنفيذية (يسار) */}
                    <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-7 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                                    <CreditCard size={26} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">بوابة السداد الفوري والمشفر</h3>
                                    <p className="text-xs text-slate-400 font-bold">دفع آمن مدعوم بمعايير حماية البيانات البنكية PCI-DSS</p>
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/20 rounded-2xl flex items-start gap-4">
                                <ShieldCheck className="w-8 h-8 text-indigo-500 shrink-0 mt-0.5" />
                                <p className="text-xs md:text-sm font-bold text-indigo-950 dark:text-indigo-300 leading-relaxed">
                                    عند النقر، سيتم توجيهك الآمن إلى منفذ الدفع الإلكتروني الموحد لإكمال معطيات الكارت وتفعيل ميزات باقة SaaS فوراً.
                                </p>
                            </div>

                            <button
                                onClick={handlePaymobRedirect}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
                            >
                                <ShieldCheck size={22} /> الانتقال لمنفذ فيزا / ماستركارد بأمان
                            </button>
                        </motion.div>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 text-slate-400 hover:text-indigo-500 font-black transition-colors flex items-center justify-center gap-2 group text-sm"
                        >
                            <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" /> إلغاء المعاملة والعودة للوحة القيادة
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}