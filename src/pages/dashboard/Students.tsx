import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  DollarSign,
  Edit2,
  GraduationCap,
  Layers,
  Loader2,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

// --- الثوابت ---
const STAGES: Record<string, string> = {
  PRIMARY: "المرحلة الابتدائية",
  MIDDLE: "المرحلة الإعدادية",
  HIGH: "المرحلة الثانوية",
};

const SUB_TYPES: Record<string, string> = {
  MONTHLY: "شهري",
  HALF_MONTH: "نصف شهر",
  COURSE: "كورس كامل",
};

// --- دالة تسطيح المجموعات ---
const flattenGroups = (groups: any[], level = 0): any[] => {
  let flat: any[] = [];
  groups.forEach((group) => {
    const prefix = level > 0 ? " ".repeat(level) + "└─ " : "";
    flat.push({ ...group, displayName: `${prefix}${group.name}` });
    if (group.subGroups && group.subGroups.length > 0) {
      flat = [...flat, ...flattenGroups(group.subGroups, level + 1)];
    }
  });
  return flat;
};

// --- مكون توست السعر المخصص ---
const PriceToast = ({ price, onClose }: { price: number; onClose: () => void; }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-10 left-10 z-[200] bg-emerald-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white/20 backdrop-blur-lg"
    >
      <div className="bg-white/20 p-3 rounded-2xl">
        <DollarSign size={30} />
      </div>
      <div>
        <p className="text-xs font-bold opacity-80">تم التجديد بنجاح! المبلغ المطلوب:</p>
        <p className="text-3xl font-black">{price} <small className="text-sm">ج.م</small></p>
      </div>
      <button onClick={onClose} className="mr-4 hover:rotate-90 transition-transform">
        <X size={20} />
      </button>
    </motion.div>
  );
};

// --- مكون مودال التجديد المطور ---
const RenewalModal = ({ isOpen, onClose, student, subjects, onRenew }: any) => {
  const [step, setStep] = useState<"ask" | "select">("ask");
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subType, setSubType] = useState("MONTHLY");

  // تحديد المواد الحالية للطالب عند الفتح لتكون "مختارة ومتلونة" تلقائياً
  useEffect(() => {
    if (isOpen && student.subscriptions) {
      const lastSub = student.subscriptions[student.subscriptions.length - 1];
      if (lastSub && lastSub.items) {
        setSelectedSubjects(lastSub.items.map((i: any) => i.subjectId));
      }
    }
  }, [isOpen, student]);

  // فلترة المواد: فقط التي لها سعر > 0 في هذه المرحلة وهذا النوع من الاشتراك
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub: any) => {
      const priceObj = sub.prices?.find(
        (p: any) => p.stage === student.stage && p.subscriptionType === subType
      );
      return priceObj && Number(priceObj.price) > 0;
    });
  }, [subjects, student.stage, subType]);

  const currentPrice = useMemo(() => {
    return selectedSubjects.reduce((total, subId) => {
      const subject = subjects.find((s: any) => s.id === subId);
      const p = subject?.prices?.find(
        (p: any) => p.stage === student.stage && p.subscriptionType === subType
      );
      return total + (p ? Number(p.price) : 0);
    }, 0);
  }, [selectedSubjects, subType, subjects, student.stage]);

  const handleDetailedRenew = async () => {
    if (selectedSubjects.length === 0) return alert("اختر مادة واحدة على الأقل");
    setLoading(true);
    await onRenew(student.id, {
      items: selectedSubjects.map((id) => ({
        subjectId: id,
        subscriptionType: subType,
      })),
    });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border dark:border-slate-800">
        <div className="p-8 text-center space-y-6">
          {step === "ask" ? (
            <>
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <RefreshCcw size={40} className="animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black dark:text-white">تجديد اشتراك {student.name}</h2>
              <p className="text-slate-500 font-bold italic">هل تريد التجديد السريع أم تعديل المواد المختارة؟</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={async () => { setLoading(true); await onRenew(student.id, { items: [] }); setLoading(false); }}
                  disabled={loading}
                  className="h-14 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <><Check size={20} /> تجديد تلقائي (نفس المواد)</>}
                </button>
                <button onClick={() => setStep("select")} className="h-14 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl font-black hover:bg-slate-200 transition-all">تعديل المواد والاشتراك</button>
                <button onClick={onClose} className="text-slate-400 font-bold text-sm">إلغاء</button>
              </div>
            </>
          ) : (
            <div className="text-right space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black dark:text-white">اختيار المواد</h3>
                <select value={subType} onChange={(e) => setSubType(e.target.value)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold dark:text-white outline-none">
                  {Object.entries(SUB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {filteredSubjects.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjects(prev => prev.includes(sub.id) ? prev.filter(i => i !== sub.id) : [...prev, sub.id])}
                    className={`p-3 rounded-2xl border-2 text-right transition-all ${selectedSubjects.includes(sub.id) ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg" : "border-slate-100 dark:border-slate-800"}`}
                  >
                    <div className="flex justify-between items-center">
                       <p className={`font-black text-xs ${selectedSubjects.includes(sub.id) ? "text-emerald-600" : "dark:text-white"}`}>{sub.name}</p>
                       {selectedSubjects.includes(sub.id) && <Check size={14} className="text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {sub.prices.find((p: any) => p.stage === student.stage && p.subscriptionType === subType)?.price || 0} ج.م
                    </p>
                  </button>
                ))}
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-2xl flex justify-between items-center border border-emerald-500/20">
                <span className="font-black text-emerald-600 text-sm">الإجمالي المطلوب:</span>
                <span className="font-black text-emerald-600 text-xl">{currentPrice} ج.م</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDetailedRenew} disabled={loading} className="flex-[2] h-12 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "تأكيد وتجديد"}
                </button>
                <button onClick={() => setStep("ask")} className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl font-black">رجوع</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- المكون الرئيسي للمودال (StudentModal) ---
const StudentModal = ({ isOpen, onClose, onSubmit, initialData, subjects, groups }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    stage: "PRIMARY",
    subscriptionType: "MONTHLY",
    selectedSubjects: [] as number[],
    groupId: "",
  });

  useEffect(() => {
    if (initialData) {
      // عند التعديل: جلب المواد الحالية للطالب
      const lastSub = initialData.subscriptions?.[initialData.subscriptions.length - 1];
      const currentSubIds = lastSub ? lastSub.items.map((i: any) => i.subjectId) : [];

      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        stage: initialData.stage || "PRIMARY",
        subscriptionType: "MONTHLY",
        selectedSubjects: currentSubIds,
        groupId: initialData.groupId?.toString() || "",
      });
    } else {
      setFormData({ name: "", phone: "", stage: "PRIMARY", subscriptionType: "MONTHLY", selectedSubjects: [], groupId: "" });
    }
  }, [initialData, isOpen]);

  // فلترة المواد للمودال الأساسي: فقط التي لها سعر في المرحلة المختارة
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub: any) => {
      const priceObj = sub.prices?.find(
        (p: any) => p.stage === formData.stage && p.subscriptionType === formData.subscriptionType
      );
      return priceObj && Number(priceObj.price) > 0;
    });
  }, [subjects, formData.stage, formData.subscriptionType]);

  const totalPrice = useMemo(() => {
    return formData.selectedSubjects.reduce((total, subId) => {
      const subject = subjects.find((s: any) => s.id === subId);
      const priceObj = subject?.prices?.find(
        (p: any) => p.stage === formData.stage && p.subscriptionType === formData.subscriptionType
      );
      return total + (priceObj ? Number(priceObj.price) : 0);
    }, 0);
  }, [formData.selectedSubjects, formData.stage, formData.subscriptionType, subjects]);

  const toggleSubject = (id: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(id)
        ? prev.selectedSubjects.filter(sid => sid !== id)
        : [...prev.selectedSubjects, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload: any = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      stage: formData.stage,
      groupId: formData.groupId ? Number(formData.groupId) : null,
    };

    // في حال التعديل أو الإضافة: نرسل المواد المختارة لتحديثها تلقائياً مع المرحلة الجديدة
    if (formData.selectedSubjects.length > 0) {
      payload.subscriptions = [
        {
          subscriptionType: formData.subscriptionType,
          items: formData.selectedSubjects.map((id) => ({ subjectId: id })),
        },
      ];
    }

    await onSubmit(payload);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">{initialData ? <Edit2 size={20} /> : <Plus size={20} />}</div>
            <h3 className="text-xl font-black dark:text-white">{initialData ? "تعديل الملف الشخصي" : "تسجيل طالب جديد"}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={28} /></button>
        </div>

        <form className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black dark:text-slate-400 uppercase tracking-widest">اسم الطالب</label>
              <div className="relative">
                <User className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pr-12 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500 rounded-2xl outline-none dark:text-white font-bold" placeholder="الاسم الكامل" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black dark:text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pr-12 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500 rounded-2xl outline-none dark:text-white font-bold font-mono" placeholder="01xxxxxxxxx" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black dark:text-slate-400 tracking-widest">المجموعة الدراسية</label>
              <div className="relative">
                <Layers className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <select value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })} className="w-full pr-12 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500 rounded-2xl outline-none dark:text-white font-bold appearance-none cursor-pointer">
                  <option value="">-- اختر مجموعة --</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.displayName}</option>)}
                </select>
                <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black dark:text-slate-400">المرحلة الدراسية (تغييرها سيقوم بتعديل أسعار اشتراكات الطالب تلقائياً)</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(STAGES).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setFormData({ ...formData, stage: key })} className={`py-3 rounded-2xl text-xs font-black border-2 transition-all ${formData.stage === key ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-slate-100 dark:border-slate-800 text-slate-500"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 pt-6 border-t dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black dark:text-slate-300 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" /> المواد المتاحة للمرحلة
                </label>
                <select value={formData.subscriptionType} onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })} className="font-bold text-xs bg-slate-200 dark:bg-slate-700 p-2 px-4 rounded-xl outline-none dark:text-white cursor-pointer">
                  {Object.entries(SUB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSubjects.map((sub: any) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-start gap-1 transition-all ${formData.selectedSubjects.includes(sub.id) ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm" : "border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100"}`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className={`font-black text-sm ${formData.selectedSubjects.includes(sub.id) ? "text-blue-600" : "dark:text-white"}`}>{sub.name}</span>
                      {formData.selectedSubjects.includes(sub.id) && <Check size={18} className="text-blue-600" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      السعر: {sub.prices.find((p: any) => p.stage === formData.stage && p.subscriptionType === formData.subscriptionType)?.price || "0"} ج.م
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {totalPrice > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[1.5rem] flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-black shadow-inner">
                    <span className="text-sm">إجمالي فاتورة الاشتراك:</span>
                    <span className="text-2xl">{totalPrice} <small className="text-xs">ج.م</small></span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button disabled={loading} type="submit" className="h-14 flex-[2] bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 disabled:opacity-50 flex justify-center items-center gap-2 transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : initialData ? "تحديث البيانات والمواد" : "تأكيد الإضافة"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-2xl font-black">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- المكون الرئيسي لصفحة الطلاب ---
export default function StudentsPage() {
  const [data, setData] = useState<{ students: any[]; total: number; totalPages: number; }>({ students: [], total: 0, totalPages: 1 });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: "", stage: "", groupId: "" });
  const [modal, setModal] = useState<{ open: boolean; student: any }>({ open: false, student: null });
  const [renewal, setRenewal] = useState<{ open: boolean; student: any }>({ open: false, student: null });
  const [priceToast, setPriceToast] = useState<{ show: boolean; price: number; }>({ show: false, price: 0 });

  const getSubscriptionStatus = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) return { label: "منتهي", color: "rose" };
    if (diffInDays <= 3) return { label: `قرب ينتهي (${diffInDays} يوم)`, color: "amber" };
    return { label: "نشط", color: "emerald" };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/students", { params: { page, limit: 10, ...filters } });
      if (res.data.success) {
        setData({ students: res.data.data, total: res.data.pagination.total, totalPages: res.data.pagination.totalPages });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, filters]);

  const fetchOptions = async () => {
    try {
      const [subRes, groupRes] = await Promise.all([api.get("/subjects"), api.get("/groups")]);
      setSubjects(subRes.data.data || []);
      setGroups(flattenGroups(groupRes.data.data || []));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); fetchOptions(); }, [fetchData]);

  const handleAction = async (payload: any) => {
    try {
      if (modal.student) await api.put(`/students/${modal.student.id}`, payload);
      else await api.post("/students", payload);
      setModal({ open: false, student: null });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.error || "حدث خطأ"); }
  };

  const handleRenewal = async (studentId: number, payload: any) => {
    try {
      const res = await api.post(`/subscriptions/${studentId}`, payload);
      if (res.data.success) {
        setPriceToast({ show: true, price: res.data.subscription.totalPrice });
        setRenewal({ open: false, student: null });
        fetchData();
      }
    } catch (err: any) { alert(err.response?.data?.error || "حدث خطأ في الاشتراك"); }
  };

  const deleteStudent = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف الطالب نهائياً؟")) return;
    try { await api.delete(`/students/${id}`); fetchData(); } catch (err: any) { alert(err.response?.data?.error); }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 text-right max-w-7xl mx-auto min-h-screen relative" dir="rtl">
      {/* SMS INFO */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl text-sm text-blue-900 dark:text-blue-300 font-bold leading-relaxed">
        يتم إرسال رسائل <span className="font-black">SMS</span> تلقائيًا إلى رقم ولي أمر الطالب المسجل في النظام عند الإضافة، التجديد، أو قرب انتهاء الاشتراك.
      </div>
      
      <AnimatePresence>{priceToast.show && <PriceToast price={priceToast.price} onClose={() => setPriceToast({ show: false, price: 0 })} />}</AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic">قاعدة بيانات الطلاب</h1>
          <p className="text-slate-500 font-bold mt-1">إجمالي الطلاب: <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 rounded-lg">{data.total}</span></p>
        </div>
        <button onClick={() => setModal({ open: true, student: null })} className="h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 rounded-[1.5rem] font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
          <Plus size={22} /> إضافة طالب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-[2rem] border dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
        <div className="relative">
          <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
          <input placeholder="ابحث باسم الطالب..." className="w-full pr-12 pl-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none dark:text-white font-bold border border-transparent focus:border-blue-500" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        </div>
        <select className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl outline-none dark:text-white font-bold border border-transparent focus:border-blue-500" value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
          <option value="">كل المراحل</option>
          {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl outline-none dark:text-white font-bold border border-transparent focus:border-blue-500" value={filters.groupId} onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}>
          <option value="">كل المجموعات</option>
          {groups.map((g: any) => <option key={g.id} value={g.id}>{g.displayName}</option>)}
        </select>
        <button onClick={() => setFilters({ name: "", stage: "", groupId: "" })} className="bg-rose-50 text-rose-600 py-3 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">إعادة ضبط</button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] border-b dark:border-slate-800 uppercase tracking-widest font-black">
                <th className="p-8">بيانات الطالب</th>
                <th className="p-8">المستوى والمجموعة</th>
                <th className="p-8">حالة الاشتراك</th>
                <th className="p-8 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={50} /></td></tr>
              ) : data.students.length === 0 ? (
                <tr><td colSpan={4} className="p-32 text-center font-black text-slate-400">لا يوجد طلاب مطابقين للبحث</td></tr>
              ) : (
                data.students.map((st: any) => {
                  const lastSub = st.subscriptions?.[st.subscriptions.length - 1];
                  const statusInfo = lastSub ? getSubscriptionStatus(lastSub.endDate) : { label: "بدون اشتراك", color: "slate" };
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${statusInfo.color === "rose" ? "bg-rose-100 text-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"}`}>{st.name[0]}</div>
                          <div>
                            <div className="font-black dark:text-white text-xl">{st.name}</div>
                            <div className="text-sm text-slate-400 font-mono mt-1"><Phone size={12} className="inline ml-1" /> {st.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-2">
                          <span className="w-fit text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl dark:bg-blue-900/20"><GraduationCap size={12} className="inline ml-1" /> {STAGES[st.stage]}</span>
                          {st.group && <div className="text-xs text-slate-500 font-bold italic"><Layers size={14} className="inline ml-1" /> {st.group.name}</div>}
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`w-fit text-[10px] font-black px-3 py-1.5 rounded-xl border flex items-center gap-2 ${statusInfo.color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" : statusInfo.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusInfo.color === "rose" ? "bg-rose-600" : statusInfo.color === "amber" ? "bg-amber-600" : "bg-emerald-600"}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setRenewal({ open: true, student: st })} className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl hover:scale-110 transition-all shadow-sm"><RefreshCcw size={18} /></button>
                          <button onClick={() => setModal({ open: true, student: st })} className="p-3 text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-2xl hover:scale-110 transition-all shadow-sm"><Edit2 size={18} /></button>
                          <button onClick={() => deleteStudent(st.id)} className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl hover:scale-110 transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-8 py-3 text-sm font-black bg-white dark:bg-slate-900 border rounded-2xl disabled:opacity-30 transition-all hover:bg-slate-100">السابق</button>
          <div className="flex items-center gap-2"><span className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20">{page}</span><span className="text-xs font-black text-slate-400">من {data.totalPages}</span></div>
          <button disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)} className="px-8 py-3 text-sm font-black bg-white dark:bg-slate-900 border rounded-2xl disabled:opacity-30 transition-all hover:bg-slate-100">التالي</button>
        </div>
      </div>

      <AnimatePresence>
        {modal.open && <StudentModal isOpen={modal.open} onClose={() => setModal({ open: false, student: null })} initialData={modal.student} subjects={subjects} groups={groups} onSubmit={handleAction} />}
        {renewal.open && <RenewalModal isOpen={renewal.open} onClose={() => setRenewal({ open: false, student: null })} student={renewal.student} subjects={subjects} onRenew={handleRenewal} />}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}
