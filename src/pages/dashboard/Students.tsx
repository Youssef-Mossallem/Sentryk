import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Edit2,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
  X,
  Home,
  BookMarked
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import api from "../../api/axios";

// =============================================
// القواميس الثابتة والمهيأة للنظام السعري والإداري
// =============================================
const STAGES: Record<string, string> = {
  PRIMARY: "المرحلة الابتدائية",
  MIDDLE: "المرحلة الإعدادية",
  HIGH: "المرحلة الثانوية",
};

const STAGE_GRADES: Record<string, { label: string; value: number }[]> = {
  PRIMARY: [
    { label: "الصف الأول الابتدائي", value: 1 },
    { label: "الصف الثاني الابتدائي", value: 2 },
    { label: "الصف الثالث الابتدائي", value: 3 },
    { label: "الصف الرابع الابتدائي", value: 4 },
    { label: "الصف الخامس الابتدائي", value: 5 },
    { label: "الصف السادس الابتدائي", value: 6 },
  ],
  MIDDLE: [
    { label: "الصف الأول الإعدادي", value: 1 },
    { label: "الصف الثاني الإعدادي", value: 2 },
    { label: "الصف الثالث الإعدادي", value: 3 },
  ],
  HIGH: [
    { label: "الصف الأول الثانوي", value: 1 },
    { label: "الصف الثاني الثانوي", value: 2 },
    { label: "الصف الثالث الثانوي", value: 3 },
  ],
};

const SUB_TYPES: Record<string, string> = {
  MONTHLY: "شهري",
  HALF_MONTH: "نصف شهر",
  PER_SESSION: "بالحصة",
  COURSE: "كورس كامل",
};

// مصفوفات آمنة لضمان استقرار العرض دون انهيار الواجهة
const safeArray = <T,>(value: unknown): T[] => Array.isArray(value) ? (value as T[]) : [];

const normalizeStage = (value: string) => String(value || "").toUpperCase().trim();

// مفسر أسعار الحصص الذكي بناءً على إعدادات المدرس والمرحلة
const getSessionPriceForStudent = (
  session: any,
  stage: string,
  grade: number,
  subscriptionType: string
) => {
  const configs = safeArray<any>(session?.teacher?.priceConfigs);
  const stageKey = normalizeStage(stage);
  const typeKey = String(subscriptionType || "").toUpperCase();
  const gradeNum = Number(grade);

  const directMatch = configs.find((c: any) => {
    const cfgStage = normalizeStage(c.stage);
    const cfgType = String(c.subscriptionType || "").toUpperCase();
    const grades = safeArray<number>(c.grades);
    return cfgStage === stageKey && cfgType === typeKey && grades.includes(gradeNum);
  });

  if (directMatch) return Number(directMatch.price) || 0;

  if (typeKey === "HALF_MONTH") {
    const monthlyMatch = configs.find((c: any) => {
      const cfgStage = normalizeStage(c.stage);
      const cfgType = String(c.subscriptionType || "").toUpperCase();
      const grades = safeArray<number>(c.grades);
      return cfgStage === stageKey && cfgType === "MONTHLY" && grades.includes(gradeNum);
    });

    if (monthlyMatch) {
      return Math.round((Number(monthlyMatch.price) || 0) / 2);
    }
  }

  return 0;
};

// =============================================
// مودال استعراض وطباعة بطاقات الـ QR الملقمة من الباك إند
// =============================================
const QRManagementModal = ({ isOpen, onClose, student }: any) => {
  if (!isOpen || !student) return null;

  // الحصول على رابط الكارت الذكي المولد من الباك إند عبر Cloudinary أو الرابط القصير الموحد
  const cardImageUrl = student.qrImageUrl || student.subscriptions?.[student.subscriptions.length - 1]?.qrImageUrl;

  const handleDownloadQR = () => {
    if (!cardImageUrl) {
      toast.error("رابط بطاقة الـ QR غير متوفر حالياً ⏳");
      return;
    }
    // فتح الرابط في نافذة جديدة لتحميله أو حفظه بأعلى جودة
    window.open(cardImageUrl, "_blank");
    toast.success("تم فتح بطاقة الحضور بجودتها الأصلية للتحميل 🎫");
  };

  const handlePrintQR = () => {
    if (!cardImageUrl) {
      toast.error("لا يمكن طباعة كارت فارغ، يرجى قيد الطالب أولاً");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة بطاقة الحضور الذكية - ${student.name}</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #ffffff; }
            .print-container { text-align: center; }
            img { max-width: 100%; max-height: 95vh; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${cardImageUrl}" />
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 text-center space-y-5"
      >
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <QrCode className="text-blue-500" size={20} /> بطاقة الحضور الذكية النخبوية
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1 transition-colors">
            <X size={22} />
          </button>
        </div>

        {cardImageUrl ? (
          <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-inner">
            <img 
              src={cardImageUrl} 
              alt={`Sentryk Smart Card - ${student.name}`} 
              className="w-full h-auto rounded-xl object-contain mx-auto max-h-[450px]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="p-12 bg-slate-950 rounded-2xl border border-slate-800 border-dashed text-center space-y-3">
            <AlertCircle className="text-amber-500 mx-auto animate-pulse" size={40} />
            <p className="text-xs font-bold text-slate-400">جاري توليد وسحب كارت الهوية المطور من السيرفر...</p>
            <p className="text-[10px] text-slate-500">إذا كنت في الوضع المحلي أوفلاين، فسيتم الرفع والتوليد فور الاتصال.</p>
          </div>
        )}

        <div className="text-right px-1">
          <h4 className="text-lg font-black text-white">{student.name}</h4>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            كود الكارت الموحد الموثق: <span className="font-mono text-blue-400 text-xs">{student.qrToken || "PENDING_SYNC"}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handlePrintQR}
            disabled={!cardImageUrl}
            className="h-12 bg-white text-slate-950 rounded-xl font-black flex items-center justify-center gap-2 text-xs hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-40"
          >
            <Printer size={16} /> طباعة الكارت الأصلي
          </button>
          <button
            onClick={handleDownloadQR}
            disabled={!cardImageUrl}
            className="h-12 bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-2 text-xs hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-40"
          >
            <Download size={16} /> فتح وإدارة الرابط
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================
// مودال إضافة وقيد الطلاب (يدعم التعدد والأوفلاين التام)
// =============================================
const StudentModal = ({ isOpen, onClose, onSubmit, initialData, sessions, isOnline }: any) => {
  const [loading, setLoading] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    stage: "HIGH",
    grade: 1,
    subscriptionType: "MONTHLY",
    selectedSessions: [] as number[],
  });

  const [batchRows, setBatchRows] = useState([{ name: "", phone: "" }]);

  useEffect(() => {
    if (initialData) {
      const lastSub = initialData.subscriptions?.[initialData.subscriptions.length - 1];
      const currentSessionIds = lastSub
        ? safeArray<any>(lastSub.enrolledSessions || lastSub.items)
            .map((item: any) => Number(item.sessionId || item.session?.id))
            .filter((id: number) => !isNaN(id) && id > 0)
        : [];

      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        stage: initialData.stage || "HIGH",
        grade: initialData.grade || 1,
        subscriptionType: lastSub?.subscriptionType || "MONTHLY",
        selectedSessions: currentSessionIds,
      });
      setIsBatchMode(false);
    } else {
      setFormData({
        name: "",
        phone: "",
        stage: "HIGH",
        grade: 1,
        subscriptionType: "MONTHLY",
        selectedSessions: [],
      });
      setBatchRows([{ name: "", phone: "" }]);
      setIsBatchMode(false);
    }
    setSessionSearch("");
  }, [initialData, isOpen]);

  const handleStageChange = (stageKey: string) => {
    setFormData((prev) => ({
      ...prev,
      stage: stageKey,
      grade: STAGE_GRADES[stageKey]?.[0]?.value || 1,
      selectedSessions: [],
    }));
  };

  const availableSessions = useMemo(() => {
    return sessions.filter(
      (s: any) =>
        normalizeStage(s.stage) === normalizeStage(formData.stage) &&
        Number(s.grade) === Number(formData.grade)
    );
  }, [sessions, formData.stage, formData.grade]);

  const filteredSessions = useMemo(() => {
    const query = sessionSearch.trim().toLowerCase();
    if (!query) return availableSessions;
    return availableSessions.filter((s: any) =>
      String(s.name || "").toLowerCase().includes(query) ||
      String(s.teacher?.name || "").toLowerCase().includes(query) ||
      String(s.teacher?.subject || s.subject || "").toLowerCase().includes(query) ||
      String(s.room?.name || "").toLowerCase().includes(query)
    );
  }, [availableSessions, sessionSearch]);

  const singleCalculatedPrice = useMemo(() => {
    return formData.selectedSessions.reduce((total, sId) => {
      const sessionItem = sessions.find((s: any) => s.id === sId);
      return total + getSessionPriceForStudent(sessionItem, formData.stage, formData.grade, formData.subscriptionType);
    }, 0);
  }, [formData.selectedSessions, formData.stage, formData.grade, formData.subscriptionType, sessions]);

  const totalLivePrice = useMemo(() => {
    if (!isBatchMode) return singleCalculatedPrice;
    return singleCalculatedPrice * (batchRows.filter((r) => r.name.trim()).length || 1);
  }, [isBatchMode, batchRows, singleCalculatedPrice]);

  const toggleSessionSelection = (id: number) => {
    setFormData((prev) => {
      const exists = prev.selectedSessions.includes(id);
      return {
        ...prev,
        selectedSessions: exists
          ? prev.selectedSessions.filter((x) => x !== id)
          : [...prev.selectedSessions, id],
      };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isBatchMode) {
        const activeStudents = batchRows.filter((r) => r.name.trim() && r.phone.trim());
        if (activeStudents.length === 0) {
          toast.error("يرجى إدخال بيانات طالب واحد على الأثل 🛑");
          setLoading(false);
          return;
        }

        const payloads = activeStudents.map((student) => ({
          name: student.name.trim(),
          phone: student.phone.trim(),
          stage: formData.stage,
          grade: Number(formData.grade),
          subscriptions: formData.selectedSessions.length > 0
            ? [{
                subscriptionType: formData.subscriptionType,
                items: formData.selectedSessions.map((sessionId) => ({ sessionId })),
              }]
            : [],
          totalPrice: singleCalculatedPrice,
        }));

        await onSubmit(payloads, null);
      } else {
        if (!formData.name.trim() || !formData.phone.trim()) {
          toast.error("يرجى ملء الحقول الإلزامية");
          setLoading(false);
          return;
        }

        const basePayload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          stage: formData.stage,
          grade: Number(formData.grade),
          subscriptions: formData.selectedSessions.length > 0
            ? [{
                subscriptionType: formData.subscriptionType,
                items: formData.selectedSessions.map((sessionId) => ({ sessionId })),
              }]
            : [],
          totalPrice: singleCalculatedPrice,
        };

        await onSubmit(basePayload, initialData?.id);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg">
              {initialData ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <h3 className="text-xl font-black dark:text-white">
              {initialData ? "تعديل بيانات ملف الطالب" : isBatchMode ? "تسجيل دفعة طلاب مجمعة" : "تسجيل طالب جديد"}
            </h3>
            {!isOnline && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Clock size={12} /> وضع حفظ الأوفلاين نشط
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        {!initialData && (
          <div className="px-8 py-3 bg-blue-50/40 dark:bg-blue-950/10 border-b dark:border-slate-800/40 flex items-center justify-between">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none text-xs font-black text-blue-600 dark:text-blue-400">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/40"
                checked={isBatchMode}
                onChange={(e) => setIsBatchMode(e.target.checked)}
              />
              تفعيل إضافة باقة طلاب دفعة واحدة (نفس الصف والمجموعات)
            </label>
          </div>
        )}

        <form className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-right" onSubmit={handleFormSubmit}>
          {!isBatchMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">اسم الطالب رباعي</label>
                <div className="relative">
                  <User className="absolute right-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    required={!isBatchMode}
                    placeholder="مثال: يوسف أحمد مسلم"
                    className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white focus:outline-none focus:border-blue-600"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">رقم هاتف ولي الأمر</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    required={!isBatchMode}
                    placeholder="010XXXXXXXX"
                    className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white focus:outline-none focus:border-blue-600 text-left placeholder:text-right"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-3xl border dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-300">قائمة أسماء وهواتف الطلاب:</label>
                <button
                  type="button"
                  onClick={() => setBatchRows([...batchRows, { name: "", phone: "" }])}
                  className="h-8 px-3 bg-blue-600 text-white font-black text-[11px] rounded-xl flex items-center gap-1"
                >
                  <Plus size={14} /> إضافة طالب للحزمة
                </button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto p-1">
                {batchRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-800/80 shadow-sm">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="اسم الطالب..."
                        className="h-10 px-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:border-blue-600"
                        value={row.name}
                        onChange={(e) => {
                          const r = [...batchRows]; r[idx].name = e.target.value; setBatchRows(r);
                        }}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="رقم هاتف ولي الأمر..."
                        className="h-10 px-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:border-blue-600 text-left"
                        value={row.phone}
                        onChange={(e) => {
                          const r = [...batchRows]; r[idx].phone = e.target.value; setBatchRows(r);
                        }}
                      />
                    </div>
                    {batchRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBatchRows(batchRows.filter((_, i) => i !== idx))}
                        className="text-rose-500 p-1 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">المرحلة التعليمية</label>
              <div className="relative">
                <GraduationCap className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <select
                  className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white appearance-none focus:outline-none focus:border-blue-600"
                  value={formData.stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                >
                  {Object.entries(STAGES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">الصف الدراسي</label>
              <div className="relative">
                <Layers className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <select
                  className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white appearance-none focus:outline-none focus:border-blue-600"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value), selectedSessions: [] })}
                >
                  {STAGE_GRADES[formData.stage]?.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">نظام الدورة والفاتورة</label>
              <div className="relative">
                <BookOpen className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <select
                  className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white appearance-none focus:outline-none focus:border-blue-600"
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                >
                  {Object.entries(SUB_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">
                اختر مجموعات الحصص النشطة المستهدفة ({availableSessions.length})
              </label>
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="البحث الفوري عن حصة، مدرس أو قاعة..."
                  className="w-full h-8 pr-8 pl-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] rounded-xl text-right focus:outline-none focus:border-blue-600"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>
            </div>

            {/* عرض المجموعات بالتفاصيل الكاملة عند إضافة طالب جديد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {filteredSessions.map((session: any) => {
                const isChecked = formData.selectedSessions.includes(session.id);
                const sPrice = getSessionPriceForStudent(session, formData.stage, formData.grade, formData.subscriptionType);

                return (
                  <div
                    key={session.id}
                    onClick={() => toggleSessionSelection(session.id)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isChecked 
                        ? "bg-blue-50/80 dark:bg-blue-950/20 border-blue-500" 
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                        {isChecked && <Check size={14} />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black dark:text-white">{session.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <span>المدرس: {session.teacher?.name || "عام"}</span>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400">المادة: {session.teacher?.subject || "عام"}</span>
                          <span>•</span>
                          <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                            <Home size={10} /> {session.room?.name || "القاعة العامة"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{sPrice} ج.م</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between border dark:border-slate-800 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400">إجمالي رسوم الخزينة المستحقة الفورية:</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {totalLivePrice.toFixed(2)} <span className="text-xs font-bold">ج.م</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-8 bg-blue-600 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              {initialData ? "تأكيد وتعديل الملف" : "قيد وحفظ بالسيستم"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// =============================================
// مودال تجديد وتمديد اشتراكات الطلاب الأسطوري (عرض شامل لكل التفاصيل)
// =============================================
const RenewSubscriptionModal = ({ isOpen, onClose, student, sessions, onConfirm }: any) => {
  const [subType, setSubType] = useState("MONTHLY");
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  useEffect(() => {
    if (student) {
      const lastSub = student.subscriptions?.[student.subscriptions.length - 1];
      setSubType(lastSub?.subscriptionType || "MONTHLY");
      setSelectedSessions(
        lastSub
          ? safeArray<any>(lastSub.enrolledSessions || lastSub.items)
              .map((i: any) => Number(i.sessionId || i.session?.id))
              .filter((id: number) => !isNaN(id) && id > 0)
          : []
      );
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const availableSessions = sessions.filter(
    (s: any) =>
      normalizeStage(s.stage) === normalizeStage(student.stage) &&
      Number(s.grade) === Number(student.grade)
  );

  const calculatedPrice = selectedSessions.reduce((total, sId) => {
    const sessionItem = sessions.find((s: any) => s.id === sId);
    return total + getSessionPriceForStudent(sessionItem, student.stage, student.grade, subType);
  }, 0);

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md text-right">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
            <RefreshCcw className="text-emerald-500" size={20} /> تجديد وتمديد فاتورة الطالب المالي
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/30">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">ملف الطالب المستهدف بالفاتورة:</p>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{student.name}</p>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">كود الحساب الموحد: #{student.id}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400">تحديث نظام الاشتراك للحزمة القادمة</label>
          <div className="relative">
            <BookMarked className="absolute right-4 top-3.5 text-slate-400" size={18} />
            <select
              className="w-full h-12 pr-11 pl-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white focus:outline-none appearance-none focus:border-blue-600"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
            >
              {Object.entries(SUB_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* تحسين عرض المجموعات بكافة تفاصيلها (اسم الحصة، المدرس، المادة، والقاعة) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 block">
            الحصص والمواد التابعة للفاتورة الجديدة ({availableSessions.length}):
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {availableSessions.map((session: any) => {
              const isChecked = selectedSessions.includes(session.id);
              const sPrice = getSessionPriceForStudent(session, student.stage, student.grade, subType);
              const teacherName = session.teacher?.name || "غير محدد";
              const subjectName = session.teacher?.subject || session.subject || "عام";
              const roomName = session.room?.name || "القاعة العامة";

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessions(isChecked ? selectedSessions.filter(x => x !== session.id) : [...selectedSessions, session.id])}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    isChecked 
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm" 
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                      {isChecked && <Check size={14} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black dark:text-white">{session.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>المدرس: {teacherName}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">المادة: {subjectName}</span>
                        <span>•</span>
                        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                          <Home size={10} /> {roomName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left whitespace-nowrap pl-1">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{sPrice} ج.م</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between border dark:border-slate-800 gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400">مجموع رسوم الاشتراك للتجديد النظري:</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{calculatedPrice.toFixed(2)} ج.م</p>
          </div>
          <button
            onClick={() => onConfirm({ subscriptionType: subType, sessionIds: selectedSessions, totalPrice: calculatedPrice }, student.id)}
            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/10"
          >
            تأكيد التحصيل وتحديث الفاتورة فوراً
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================
// المكون الاستراتيجي الرئيسي لصفحة الطلاب (Students)
// =============================================
export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // فلاتر التصفية المتقدمة
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // حالات فتح النوافذ المنبثقة
  const [modal, setModal] = useState({ open: false, data: null as any });
  const [renewModal, setRenewModal] = useState({ open: false, student: null as any });
  const [qrModal, setQrModal] = useState({ open: false, student: null as any });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("تمت استعادة الاتصال بخادم Sentryk بنجاح! جاري معالجة طابور الأوفلاين...", { icon: <Wifi className="text-emerald-500" /> });
      triggerOfflineQueueSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        "تم حفظ البيانات محلياً بسبب انقطاع الإنترنت. عند عودة الاتصال، افتح الموقع أو اتركه يعمل في الخلفية من نفس الجهاز ليتم رفع البيانات للسيرفر تلقائياً ⚠️",
        { duration: 6000, icon: <WifiOff className="text-rose-500" /> }
      );
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!navigator.onLine) {
      const localSt = localStorage.getItem("sentryk_cached_students");
      if (localSt) setStudents(JSON.parse(localSt));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resStudents, resSessions, resTeachers] = await Promise.all([
        api.get("/students"),
        api.get("/sessions"),
        api.get("/teachers").catch(() => ({ data: {} })),
      ]);

      const studentsData = safeArray<any>(resStudents.data?.data ?? resStudents.data?.students ?? resStudents.data);
      const sessionsData = safeArray<any>(resSessions.data?.data ?? resSessions.data?.sessions ?? resSessions.data);
      const teachersData = safeArray<any>(resTeachers.data?.data ?? resTeachers.data?.teachers ?? resTeachers.data);

      setStudents(studentsData);
      setSessions(sessionsData);
      setTeachers(teachersData);

      localStorage.setItem("sentryk_cached_students", JSON.stringify(studentsData));
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("فشل جلب البيانات المحدثة من خادم Sentryk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const triggerOfflineQueueSync = async () => {
    if (!navigator.onLine) return;

    const studentQueue = JSON.parse(localStorage.getItem("sentryk_offline_student_queue") || "[]");
    const subQueue = JSON.parse(localStorage.getItem("sentryk_offline_sub_queue") || "[]");

    if (studentQueue.length === 0 && subQueue.length === 0) return;

    const syncToastId = toast.loading("جاري مزامنة وشحن الفواتير والعمليات المعلقة أوفلاين...");

    try {
      if (studentQueue.length > 0) {
        await api.post("/students/bulk-sync", { studentsArray: studentQueue });
        localStorage.setItem("sentryk_offline_student_queue", "[]");
      }

      if (subQueue.length > 0) {
        await api.post("/subscriptions/bulk-sync", { subscriptionsArray: subQueue });
        localStorage.setItem("sentryk_offline_sub_queue", "[]");
      }

      toast.success("اكتملت مزامنة العمليات المعلقة وتحديث الحسابات المالية بنجاح تام ⚡", { id: syncToastId });
      fetchInitialData();
    } catch (err) {
      console.error("Bulk sync error:", err);
      toast.error("حدث تضارب جزئي أثناء معالجة الحزمة المجمعة للأوفلاين", { id: syncToastId });
    }
  };

  const handleStudentSubmit = async (payloadOrPayloads: any, studentId?: number | null) => {
    const isModeOnline = navigator.onLine;

    if (!isModeOnline) {
      const currentQueue = JSON.parse(localStorage.getItem("sentryk_offline_student_queue") || "[]");
      const timestamp = new Date().toISOString();

      if (Array.isArray(payloadOrPayloads)) {
        payloadOrPayloads.forEach(p => currentQueue.push({ ...p, isOfflineMode: true, offlineCreatedAt: timestamp }));
      } else {
        currentQueue.push({ ...payloadOrPayloads, isOfflineMode: true, offlineCreatedAt: timestamp });
      }

      localStorage.setItem("sentryk_offline_student_queue", JSON.stringify(currentQueue));
      toast.warning("تم حفظ قيد الطالب في طابور الأوفلاين المحلي وسيشحن فور عودة الاتصال ⏳");
      fetchInitialData();
      return;
    }

    try {
      if (studentId) {
        await api.put(`/students/${studentId}`, payloadOrPayloads);
        toast.success("تم تحديث وحفظ تعديلات ملف الطالب بنجاح");
      } else if (Array.isArray(payloadOrPayloads)) {
        const toastId = toast.loading("جاري قيد الطلاب تتابعياً بالخادم...");
        await api.post("/students/bulk-sync", { studentsArray: payloadOrPayloads });
        toast.success(`تم قيد دفعة الطلاب المجمعة بنجاح وعددهم (${payloadOrPayloads.length})`, { id: toastId });
      } else {
        await api.post("/students", payloadOrPayloads);
        toast.success("تم تسجيل وقيد الطالب بنجاح وتوليد بطاقة الـ QR النخبوية بالواتساب 🎫");
      }
      fetchInitialData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "فشل إتمام العملية بالخادم");
    }
  };

  const handleRenewConfirm = async (renewPayload: any, studentId: number) => {
    if (!navigator.onLine) {
      const currentSubQueue = JSON.parse(localStorage.getItem("sentryk_offline_sub_queue") || "[]");
      currentSubQueue.push({
        studentId,
        items: renewPayload.sessionIds.map((id: number) => ({ sessionId: id, subscriptionType: renewPayload.subscriptionType })),
        isOfflineMode: true,
        offlineCreatedAt: new Date().toISOString()
      });

      localStorage.setItem("sentryk_offline_sub_queue", JSON.stringify(currentSubQueue));
      toast.warning("تم جدول وحفظ تجديد الفاتورة في طابور الأوفلاين المحلي بنجاح 💸");
      setRenewModal({ open: false, student: null });
      return;
    }

    try {
      await api.post(`/subscriptions/${studentId}`, {
        items: renewPayload.sessionIds.map((id: number) => ({ sessionId: id, subscriptionType: renewPayload.subscriptionType }))
      });

      toast.success("تم تجديد الاشتراك واستلام الرسوم وتحديث إشعار ولي الأمر بالواتساب ✅");
      setRenewModal({ open: false, student: null });
      fetchInitialData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "فشلت عملية التجديد المالي للاشتراك");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف الطالب نهائياً؟ سيتم مسح السجلات والاشتراكات المرتبطة به كلياً لمنع الأخطاء.")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("تم إقصاء وحذف كائن الطالب من قاعدة البيانات بنجاح 🧨");
      fetchInitialData();
    } catch (err) {
      toast.error("فشل حذف الطالب لوجود قيود علاقات معقدة");
    }
  };

  const preparedSessions = useMemo(() => {
    return sessions.map((session: any) => {
      const matchedTeacher = teachers.find((t: any) => t.id === session.teacherId || t.id === session.teacher?.id);
      return {
        ...session,
        teacher: {
          ...(session.teacher || {}),
          ...(matchedTeacher || {}),
          priceConfigs: matchedTeacher?.priceConfigs || session.teacher?.priceConfigs || []
        }
      };
    });
  }, [sessions, teachers]);

  const filteredStudents = useMemo(() => {
    return students.filter((student: any) => {
      const lastSubscription = student.subscriptions?.[student.subscriptions.length - 1];
      const enrolledSessions = safeArray<any>(lastSubscription?.enrolledSessions || lastSubscription?.items);

      const sessionsSearchText = enrolledSessions.map((item: any) => {
        const sessionObj = preparedSessions.find((s: any) => s.id === (item.sessionId || item.session?.id));
        const sessionName = String(item.sessionName || item.session?.name || sessionObj?.name || "").toLowerCase();
        const teacherName = String(item.teacherName || item.session?.teacher?.name || sessionObj?.teacher?.name || "").toLowerCase();
        const subjectName = String(item.subject || item.session?.teacher?.subject || item.session?.subject || sessionObj?.teacher?.subject || "").toLowerCase();
        const roomName = String(item.room?.name || item.session?.room?.name || sessionObj?.room?.name || "").toLowerCase();
        return `${sessionName} ${teacherName} ${subjectName} ${roomName}`;
      }).join(" ");

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        String(student.id).includes(query) ||
        String(student.name || "").toLowerCase().includes(query) ||
        String(student.phone || "").includes(query) ||
        sessionsSearchText.includes(query);

      const matchStage = stageFilter === "ALL" || student.stage === stageFilter;
      const matchGrade = gradeFilter === "ALL" || Number(student.grade) === Number(gradeFilter);
      
      const computedStatus = student.computedStatus || (student.subscriptions?.some((s: any) => s.status === "ACTIVE") ? "ACTIVE" : "EXPIRED");
      const matchStatus = statusFilter === "ALL" || computedStatus === statusFilter;

      return matchQuery && matchStage && matchGrade && matchStatus;
    });
  }, [students, searchQuery, stageFilter, gradeFilter, statusFilter, preparedSessions]);

  return (
    <div className="p-6 space-y-8 font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-right text-slate-900 dark:text-slate-100" dir="rtl">
      <Toaster position="bottom-left" richColors />

      {/* شريط رأس الصفحة الاحترافي */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              منظومة شؤون إدارة الطلاب والاشتراكات <Sparkles className="text-blue-500" size={24} />
            </h1>
            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full flex items-center gap-1 ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700 animate-pulse"}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "متصل بالسيرفر" : "الوضع المحلي أوفلاين"}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            إصدار Sentryk الاحترافي لدعم المزامنة التتابعية المجمعة، قيد الهويات الرقمية بالـ QR Code، تتبع غرف الحصص ومستحقات المدرسين المباشرة.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Plus size={18} /> تسجيل طالب جديد
        </button>
      </div>

      {/* لوحة بطاقات الإحصاء الاستكشافية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400">إجمالي الطلاب المقيدين</p>
            <p className="text-2xl font-black mt-1">{students.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl"><User size={24} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400">الاشتراكات النشطة حالياً</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {students.filter(s => s.computedStatus === "ACTIVE" || s.subscriptions?.some((sub: any) => sub.status === "ACTIVE")).length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl"><UserCheck size={24} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400">اشتراكات منتهية (تتطلب تجديد)</p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {students.filter(s => s.computedStatus === "EXPIRED" || (!s.subscriptions || s.subscriptions.length === 0)).length}
            </p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl"><UserX size={24} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400">عمليات معلقة بالأوفلاين</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {JSON.parse(localStorage.getItem("sentryk_offline_student_queue") || "[]").length + JSON.parse(localStorage.getItem("sentryk_offline_sub_queue") || "[]").length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl"><Clock size={24} /></div>
        </div>
      </div>

      {/* فلاتر التصفية والبحث العملاق ذو التقسيم العالي */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 border-b dark:border-slate-800 pb-2">
          <Filter size={16} /> لوحة التحكم والفلاتر المتقدمة والفرز الذكي
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث بالمعرف، اسم الطالب، هاتف، أو اسم المدرس، المادة أو القاعة مباشرة..."
              className="w-full h-12 pr-10 pl-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none appearance-none"
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setGradeFilter("ALL"); }}
            >
              <option value="ALL">كل المراحل الدراسية</option>
              {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div>
            <select
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none appearance-none"
              value={gradeFilter}
              disabled={stageFilter === "ALL"}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="ALL">كل الصفوف الدراسية</option>
              {stageFilter !== "ALL" && STAGE_GRADES[stageFilter]?.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">كل الحالات المالية والايرادات</option>
              <option value="ACTIVE">الطلاب النشطين (مدفوع) ✅</option>
              <option value="EXPIRED">الاشتراكات المنتهية (مطلوب سداد) ❌</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول البيانات الرئيسي الفخم ذو السطور المفصلة */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
            <p className="text-xs font-bold text-slate-400">جاري قراءة ومعالجة مصفوفة بيانات الطلاب...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-20 text-center space-y-2">
            <AlertCircle className="text-slate-300 mx-auto" size={50} />
            <p className="text-sm font-black text-slate-400">لا توجد سجلات طلاب مطابقة لمعايير البحث الحالية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-4">رقم الهوية الذكي</th>
                  <th className="p-4">اسم الطالب / ولي الأمر</th>
                  <th className="p-4">المرحلة والصف</th>
                  <th className="p-4">المواد والمجموعات والقاعات المسجلة</th>
                  <th className="p-4">مستحقات الخزينة والفاتورة</th>
                  <th className="p-4">حالة الاشتراك المالي</th>
                  <th className="p-4 text-center">أدوات التحكم السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 text-xs font-bold">
                {filteredStudents.map((student: any) => {
                  const lastSubscription = student.subscriptions?.[student.subscriptions.length - 1];
                  const computedStatus = student.computedStatus || (lastSubscription?.status === "ACTIVE" ? "ACTIVE" : "EXPIRED");
                  const enrolledSessions = safeArray<any>(lastSubscription?.enrolledSessions || lastSubscription?.items);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-400">#{student.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {student.phone}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">{STAGES[student.stage]}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">الصف رقم {student.grade}</p>
                      </td>
                      {/* عرض المدرسين والمواد والقاعات بشكل أسطوري ونظيف جداً في جدول الطلاب */}
                      <td className="p-4 max-w-xs">
                        {enrolledSessions.length === 0 ? (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">غير مسكن بمجموعات حالياً</span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {enrolledSessions.map((item: any, idx: number) => {
                              const sessionObj = preparedSessions.find((s: any) => s.id === (item.sessionId || item.session?.id));
                              const currentSessionName = item.sessionName || item.session?.name || sessionObj?.name || "حصة عامة";
                              const currentTeacherName = item.teacherName || item.session?.teacher?.name || sessionObj?.teacher?.name || "غير محدد";
                              const currentSubject = item.subject || item.session?.teacher?.subject || item.session?.subject || sessionObj?.teacher?.subject || "عام";
                              const currentRoom = item.room?.name || item.session?.room?.name || sessionObj?.room?.name || "القاعة العامة";

                              return (
                                <div key={idx} className="flex flex-wrap items-center gap-1.5 text-[11px] leading-tight text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border dark:border-slate-800/80">
                                  <span className="font-black text-blue-600 dark:text-blue-400">{currentSessionName}</span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="text-slate-600 dark:text-slate-400 font-bold">أ/ {currentTeacherName}</span>
                                  <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded font-black text-[10px]">
                                    {currentSubject}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded font-black text-[10px] flex items-center gap-0.5">
                                    <Home size={10} /> {currentRoom}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-black text-emerald-600 dark:text-emerald-400">{lastSubscription?.totalPrice ? `${lastSubscription.totalPrice} ج.م` : "0.00"}</p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <Calendar size={10} /> ينتهي: {lastSubscription?.endDate ? new Date(lastSubscription.endDate).toLocaleDateString("ar-EG") : "بلا تاريخ"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full ${computedStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {computedStatus === "ACTIVE" ? "نشط ومسدد" : "منتهي الصلاحية"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setRenewModal({ open: true, student })}
                            className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-xl flex items-center gap-1 transition-colors"
                            title="تجديد وتحصيل اشتراك الطالب ماليًا"
                          >
                            <RefreshCcw size={12} /> تجديد الاشتراك
                          </button>
                          <button
                            onClick={() => setQrModal({ open: true, student })}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                            title="عرض بطاقة الهوية الرقمية الرسمية"
                          >
                            <QrCode size={14} />
                          </button>
                          <button
                            onClick={() => setModal({ open: true, data: student })}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-amber-500 hover:text-white transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودالات الإدارة المهيأة للنظام بالكامل بالربط المباشر */}
      <StudentModal
        isOpen={modal.open}
        initialData={modal.data}
        sessions={preparedSessions}
        isOnline={isOnline}
        onClose={() => setModal({ open: false, data: null })}
        onSubmit={handleStudentSubmit}
      />

      <RenewSubscriptionModal
        isOpen={renewModal.open}
        student={renewModal.student}
        sessions={preparedSessions}
        onClose={() => setRenewModal({ open: false, student: null })}
        onConfirm={handleRenewConfirm}
      />

      <QRManagementModal
        isOpen={qrModal.open}
        student={qrModal.student}
        onClose={() => setQrModal({ open: false, student: null })}
      />
    </div>
  );
}