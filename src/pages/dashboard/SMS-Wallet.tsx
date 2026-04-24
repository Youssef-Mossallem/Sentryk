import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowDownLeft,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    History,
    Loader2,
    MessageSquare,
    Phone,
    Plus,
    RefreshCw, 
    Search,
    Send,
    User,
    Wallet,
    X
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

interface Student {
    id: number;
    name: string;
    phone: string;
}

interface Transaction {
    id: string;
    amount: number;
    type: "CHARGE" | "SEND";
    description: string;
    createdAt: string;
}

export default function SmsWallet() {
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    
    const [smsToCharge, setSmsToCharge] = useState(100);
    const [isPaying, setIsPaying] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [manualMessage, setManualMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // حساب عدد الرسائل بناءً على 60 حرف لكل رسالة
    const smsParts = useMemo(() => {
        if (!manualMessage.length) return 0;
        return Math.ceil(manualMessage.length / 60);
    }, [manualMessage]);

    const fetchData = useCallback(async (showToast = false) => {
        try {
            const [walletRes, transRes] = await Promise.all([
                api.get("/sms-wallet"),
                api.get(`/sms-wallet/transactions?page=${page}&limit=8`)
            ]);
            
            if (walletRes.data.success) setWallet(walletRes.data.wallet);
            if (transRes.data.success) {
                setTransactions(transRes.data.transactions);
                setTotalPages(transRes.data.pagination.totalPages);
            }
            if (showToast) toast.success("تم تحديث البيانات");
        } catch (err: any) {
            if (err.response) {
                toast.error("حدث خطأ أثناء جلب البيانات");
            }
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // إصلاح البحث: إضافة فلترة دقيقة ومنع ظهور نتائج غير مطابقة تماماً
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const query = searchQuery.trim();
            if (query.length >= 2 && !selectedStudent) {
                try {
                    const res = await api.get(`/students?search=${query}`);
                    const fetchedStudents: Student[] = res.data.data || [];
                    
                    // فلترة إضافية في الفرونت اند للتأكد من مطابقة البحث للاسم أو الرقم
                    const filtered = fetchedStudents.filter(s => 
                        s.name.toLowerCase().includes(query.toLowerCase()) || 
                        s.phone.includes(query)
                    );
                    
                    setStudents(filtered);
                } catch (err) {
                    console.error("Search error", err);
                    setStudents([]);
                }
            } else {
                setStudents([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedStudent]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchQuery(""); 
        setStudents([]);    
    };

    const handleCharge = async () => {
        if (isPaying) return;
        setIsPaying(true);
        try {
            const res = await api.post("/payments/create", {
                type: "SMS",
                smsCount: smsToCharge,
            });
            if (res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "بوابة الدفع غير متاحة حالياً");
            setIsPaying(false);
        }
    };

    const handleSendSms = async () => {
        if (!selectedStudent || !manualMessage.trim() || isSending) return;
        
        // تنبيه المستخدم إذا كان الرصيد لا يكفي لعدد أجزاء الرسالة
        if (wallet && wallet.messages < smsParts) {
            toast.error("رصيدك الحالي لا يكفي لإرسال هذه الرسالة الطويلة");
            return;
        }

        setIsSending(true);
        try {
            await api.post("/sms-wallet/send", {
                phone: selectedStudent.phone,
                message: manualMessage
            });
            toast.success(`تم إرسال ${smsParts} رسالة بنجاح إلى ${selectedStudent.name}`);
            setShowSendModal(false);
            setManualMessage("");
            setSelectedStudent(null);
            fetchData(); 
        } catch (err: any) {
            toast.error(err.response?.data?.error || "فشل في عملية الإرسال");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 text-right font-inter" dir="rtl">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600/10 rounded-3xl border border-indigo-600/20 shadow-inner">
                        <Wallet className="text-indigo-600 w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black dark:text-white tracking-tight">المحفظة الرقمية</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1">تتبع رصيد الـ SMS والعمليات المالية للسنتر</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-7 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-[1.5rem] font-black hover:border-indigo-500 transition-all active:scale-95"
                    >
                        <Send size={18} className="text-indigo-600" />
                        إرسال مخصص
                    </button>
                    <button
                        onClick={() => setShowChargeModal(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-9 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        شحن الرصيد
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden bg-slate-900 p-9 rounded-[3rem] text-white shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent opacity-50" />
                    <p className="relative z-10 text-slate-400 font-bold mb-3">رصيد الرسائل المتاح</p>
                    <div className="relative z-10 flex items-baseline gap-2">
                        <h2 className="text-6xl font-black">{wallet?.messages || 0}</h2>
                        <span className="text-xl text-indigo-400 font-bold">SMS</span>
                    </div>
                    <div className="relative z-10 mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       حالة المحفظة: متصلة
                    </div>
                </motion.div>

                <div className="bg-white dark:bg-slate-900 p-9 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-400 font-bold mb-2">القيمة التقديرية</p>
                    <h2 className="text-4xl font-black dark:text-white mb-1 tracking-tight">
                        {wallet?.balanceInMoney || "0.00"} <span className="text-lg text-slate-400">ج.م</span>
                    </h2>
                    <p className="text-indigo-600 text-xs font-black mt-2">سعر الرسالة (60 حرف): {wallet?.pricePerMessage || 0.30} ج.م</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-9 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-400 font-bold mb-2">آخر عملية شحن</p>
                    <h2 className="text-2xl font-black dark:text-white mb-1">
                        {wallet?.lastUpdated ? new Date(wallet.lastUpdated).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long' }) : '---'}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold">تحديث تلقائي من البنك</p>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="p-9 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <History size={24} />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">سجل المحفظة</h3>
                    </div>
                    <button onClick={() => fetchData(true)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''} text-slate-400`} />
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
                            <p className="text-slate-400 font-bold">جاري المزامنة...</p>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {transactions.map((t) => (
                                <div key={t.id} className="p-7 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-[1.2rem] ${t.type === 'CHARGE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                                            {t.type === 'CHARGE' ? <ArrowDownLeft size={24} /> : <MessageSquare size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black dark:text-white text-lg">{t.description}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                                {new Date(t.createdAt).toLocaleString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${t.type === 'CHARGE' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {t.type === 'CHARGE' ? `+${t.amount}` : `-${t.amount}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] opacity-40">
                            <History size={60} className="mb-4 text-slate-300" />
                            <p className="text-xl font-black">لا توجد حركات مالية</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex justify-center items-center gap-8">
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-20 transition-all">
                            <ChevronRight size={24} />
                        </button>
                        <span className="text-lg font-black dark:text-white"> {page} / {totalPages}</span>
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-20 transition-all">
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- Charge Modal --- */}
            <AnimatePresence>
                {showChargeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/40">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 border border-white dark:border-slate-800">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black dark:text-white">شحن الرصيد</h3>
                                {!isPaying && <button onClick={() => setShowChargeModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {[100, 500, 1000].map(c => (
                                        <button key={c} onClick={() => setSmsToCharge(c)} className={`py-4 rounded-2xl font-black text-sm transition-all ${smsToCharge === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}>
                                            {c} رسالة
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="relative">
                                    <input min="100" type="number" value={smsToCharge} onChange={e => setSmsToCharge(Number(e.target.value))} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] text-center font-black text-3xl dark:text-white outline-none transition-all" />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">SMS</span>
                                </div>

                                <div className="p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-600/10 text-center">
                                    <p className="text-slate-500 text-sm font-bold mb-1">المبلغ المطلوب سداده</p>
                                    <h4 className="text-5xl font-black text-indigo-600">{(smsToCharge * (wallet?.pricePerMessage || 0.25)).toFixed(2)} <span className="text-xl">ج.م</span></h4>
                                </div>

                                <button disabled={isPaying || smsToCharge <= 0} onClick={handleCharge} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/40 disabled:opacity-50">
                                    {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard size={24} />}
                                    {isPaying ? 'جاري التحويل للبنك...' : 'تأكيد الدفع'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- Send Modal --- */}
            <AnimatePresence>
                {showSendModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/40">
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-10 border border-white dark:border-slate-800">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center"><Send size={24} /></div>
                                    <h3 className="text-3xl font-black dark:text-white">إرسال مخصص</h3>
                                </div>
                                {!isSending && <button onClick={() => setShowSendModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>}
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <label className="text-sm font-black text-slate-500 mb-2 block mr-2">البحث (الاسم أو رقم الهاتف)</label>
                                    <div className="relative">
                                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                                        <input 
                                            type="text" 
                                            placeholder="اكتب اسم الطالب أو رقم موبايله..." 
                                            value={searchQuery} 
                                            onChange={e => {
                                                setSearchQuery(e.target.value);
                                                if (selectedStudent) setSelectedStudent(null);
                                            }} 
                                            className="w-full pr-16 pl-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg dark:text-white transition-all shadow-inner" 
                                        />
                                    </div>

                                    {/* Results Dropdown */}
                                    <AnimatePresence>
                                        {students.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-[110] w-full mt-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] shadow-2xl max-h-[280px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                                                {students.map(s => (
                                                    <div key={s.id} onClick={() => handleSelectStudent(s)} className="p-5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer flex justify-between items-center rounded-2xl transition-colors group/item">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-indigo-600 transition-colors">
                                                                <User size={20} />
                                                            </div>
                                                            <span className="font-black text-lg dark:text-white">{s.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 font-bold bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
                                                            <Phone size={14} />
                                                            {s.phone}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {selectedStudent && (
                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-between p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 border-dashed">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><User size={24} /></div>
                                            <div>
                                                <p className="text-xs text-emerald-600 font-black mb-0.5">المستلم المختار:</p>
                                                <p className="text-xl font-black dark:text-white leading-tight">{selectedStudent.name}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm"><X size={18} /></button>
                                    </motion.div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-500 mb-2 block mr-2">نص الرسالة</label>
                                    <textarea 
                                        rows={5} 
                                        value={manualMessage} 
                                        onChange={e => setManualMessage(e.target.value)} 
                                        placeholder="اكتب رسالتك هنا..." 
                                        className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg dark:text-white resize-none shadow-inner transition-all" 
                                    />
                                    <div className="flex justify-between items-center px-4">
                                        <div className="flex items-center gap-2 text-slate-500 font-black text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                            <span>{manualMessage.length} حرف</span>
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                            <span className="text-indigo-600">{smsParts} رسائل (بناءً على 60 حرف للرسالة)</span>
                                        </div>
                                        <div className="text-[10px] font-black text-rose-500 uppercase">يخصم {smsParts} من رصيد الـ SMS</div>
                                    </div>
                                </div>

                                <button 
                                    disabled={!selectedStudent || !manualMessage.trim() || isSending} 
                                    onClick={handleSendSms} 
                                    className="w-full py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2.2rem] font-black text-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 disabled:opacity-20 shadow-2xl shadow-indigo-500/10"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />}
                                    {isSending ? 'جاري المعالجة...' : 'إرسال الرسالة'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
