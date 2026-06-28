import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Edit2,
  QrCode,
  RefreshCcw,
  Search,
  Filter,
  Check,
  X,
  Phone,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  Printer,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  Wifi,
  WifiOff,
  Home,
  BookMarked,
  Info,
  DollarSign,
  HelpCircle,
  Hash,
  ChevronDown
} from "lucide-react";
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

const safeArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const normalizeStage = (value: string) => String(value || "").toUpperCase().trim();

// مفسر أسعار الحصص والاشتراكات الذكي بناءً على إعدادات المدرس والمرحلة
const getSessionPriceForStudent = (
  session: any,
  stage: string,
  grade: number,
  subscriptionType: string
): number => {
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
// مكون مربعات الشرح المنسقة والمريحة للعين (System Docs Component)
// =============================================
const SystemGuideBox = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/60 dark:to-slate-900/40 border border-blue-100 dark:border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-sm relative overflow-hidden"
    >
      <div className="absolute left-0 bottom-0 text-blue-500/5 dark:text-blue-500/10 -mb-8 -ml-8 pointer-events-none">
        <HelpCircle size={180} />
      </div>
      <div className="flex justify-between items-center border-b border-blue-200/50 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 text-blue-800 dark:text-blue-400">
          <Info size={20} />
          <h3 className="text-sm font-black tracking-wide">الدليل الإرشادي الموحد لإدارة حسابات الطلاب (Sentryk Core)</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
          title="إغلاق الدليل مؤقتاً"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="space-y-1.5 bg-white dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800/80 shadow-inner">
          <p className="font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <QrCode size={14} /> 1. كروت الحضور الرقمية الذكية
          </p>
          <p>عند إضافة أي طالب جديد، يتم فوراً استخدام محرك الـ Canvas بالباك إند لإنتاج بطاقة هوية مخصصة ومحمية برمز مشفر فريد. يتم حفظها سحابياً وتوفير رابط قصير لها لضمان سهولة الطباعة واستخدامها عبر المساعدين عند بوابات القاعات.</p>
        </div>
        <div className="space-y-1.5 bg-white dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800/80 shadow-inner">
          <p className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <DollarSign size={14} /> 2. تحديث نظام الفواتير الشامل
          </p>
          <p>يدعم السيستم أنواع اشتراكات متعددة. في حالة اختيار نظام <span className="font-black">"بالحصة"</span>، يتيح لك النظام إدخال عدد الحصص المشحونة ليقوم بضربها تلقائياً في السعر الفردي المهيأ من المدرس، وحفظ رصيد الطالب بدقة متناهية لمنع التعارضات المالية.</p>
        </div>
        <div className="space-y-1.5 bg-white dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800/80 shadow-inner">
          <p className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Clock size={14} /> 3. تقنية العمل أوفلاين والمزامنة
          </p>
          <p>في حال انقطاع اتصالك بالإنترنت، لا داعي للقلق. يعمل النظام بحفظ كافة القيود، الطلاب، وعمليات السداد محلياً بطابور معزول، وفور استعادة الاتصال يقوم السيرفر بمعالجتها كحزمة متكاملة (Bulk Sync) وإرسال إشعارات الواتساب تلقائياً.</p>
        </div>
      </div>
    </motion.div>
  );
};

// =============================================
// مودال استعراض وطباعة بطاقات الـ QR الملقمة من الباك إند
// =============================================
const QRManagementModal = ({ isOpen, onClose, student }: any) => {
  if (!isOpen || !student) return null;

  const cardImageUrl = student.qrImageUrl || student.subscriptions?.[student.subscriptions.length - 1]?.qrImageUrl;

  const handleDownloadQR = () => {
    if (!cardImageUrl) {
      toast.error("رابط بطاقة الـ QR غير متوفر حالياً ⏳");
      return;
    }
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
            <p className="text-[10px] text-slate-500">سيظهر الرابط فوراً بمجرد معالجة محرك الصور في الخلفية.</p>
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
// مودال إضافة وقيد الطلاب (يدعم التعدد، نظام الحصص المطور، والأوفلاين)
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
    totalSessions: 4, // القيمة الافتراضية لشحن الحصص عند اختيار PER_SESSION
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
        totalSessions: lastSub?.totalSessions || 4,
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
        totalSessions: 4,
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

  // احتساب السعر المطور والمطابق لتحديث السيرفر بالضرب في عدد الحصص
  const singleCalculatedPrice = useMemo(() => {
    return formData.selectedSessions.reduce((total, sId) => {
      const sessionItem = sessions.find((s: any) => s.id === sId);
      const basePrice = getSessionPriceForStudent(sessionItem, formData.stage, formData.grade, formData.subscriptionType);

      // التحديث السعري المطور: إذا كان النظام بالحصة، نضرب سعر الحصة الفردية في عدد الحصص المطلوبة
      if (formData.subscriptionType === "PER_SESSION") {
        return total + (basePrice * (Number(formData.totalSessions) || 1));
      }
      return total + basePrice;
    }, 0);
  }, [formData.selectedSessions, formData.stage, formData.grade, formData.subscriptionType, formData.totalSessions, sessions]);

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
          toast.error("يرجى إدخال بيانات طالب واحد على الأقل 🛑");
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
              totalSessions: formData.subscriptionType === "PER_SESSION" ? Number(formData.totalSessions) : undefined
            }]
            : [],
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
              totalSessions: formData.subscriptionType === "PER_SESSION" ? Number(formData.totalSessions) : undefined
            }]
            : [],
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

        {/* كارت الشرح الذكي الخاص بالنافذة المنبثقة */}
        <div className="mx-8 mt-4 p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 text-right flex items-start gap-2">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p>تنبيه: تغيير المرحلة أو الصف الدراسي يقوم تلقائياً بإعادة تصفية المجموعات المتاحة لمنع تسكين الطلاب بمجموعات خاطئة لا تطابق مستواهم الأكاديمي.</p>
        </div>

        <form className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-right" onSubmit={handleFormSubmit}>
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

          {/* التحديث الحصري: ظهور خانة شحن رصيد عدد الحصص عند اختيار نظام بالحصة */}
          <AnimatePresence shadow-sm>
            {formData.subscriptionType === "PER_SESSION" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-slate-800 rounded-2xl space-y-2"
              >
                <label className="text-xs font-black text-blue-700 dark:text-blue-400 block">عدد الحصص المراد سداد قيمتها وشحنها للطالب:</label>
                <div className="relative max-w-xs">
                  <Hash className="absolute right-4 top-3 text-blue-500" size={16} />
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full h-10 pr-10 pl-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-black dark:text-white focus:outline-none"
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: Math.max(1, Number(e.target.value)) })}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold">سيقوم محرك النظام بضرب السعر الفردي المهيأ للحصة × {formData.totalSessions} حصص وتوريدها للخزينة بالخادم تلقائياً.</p>
              </motion.div>
            )}
          </AnimatePresence>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {filteredSessions.map((session: any) => {
                const isChecked = formData.selectedSessions.includes(session.id);
                const basePrice = getSessionPriceForStudent(session, formData.stage, formData.grade, formData.subscriptionType);
                const currentPriceText = formData.subscriptionType === "PER_SESSION"
                  ? `${basePrice * (Number(formData.totalSessions) || 1)} ج.م (${formData.totalSessions} حصص)`
                  : `${basePrice} ج.م`;

                return (
                  <div
                    key={session.id}
                    onClick={() => toggleSessionSelection(session.id)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${isChecked
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
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{currentPriceText}</span>
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
// مودال تجديد وتمديد اشتراكات الطلاب الأسطوري
// =============================================
const RenewSubscriptionModal = ({ isOpen, onClose, student, sessions, onConfirm }: any) => {
  const [subType, setSubType] = useState("MONTHLY");
  const [totalSessions, setTotalSessions] = useState(4);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  useEffect(() => {
    if (student) {
      const lastSub = student.subscriptions?.[student.subscriptions.length - 1];
      setSubType(lastSub?.subscriptionType || "MONTHLY");
      setTotalSessions(lastSub?.totalSessions || 4);
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
    const basePrice = getSessionPriceForStudent(sessionItem, student.stage, student.grade, subType);
    if (subType === "PER_SESSION") {
      return total + (basePrice * (Number(totalSessions) || 1));
    }
    return total + basePrice;
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

        {subType === "PER_SESSION" && (
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-slate-800 rounded-2xl space-y-2">
            <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">عدد الحصص المجددة الشغالة:</label>
            <input
              type="number"
              min={1}
              className="w-32 h-10 px-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs font-black dark:text-white"
              value={totalSessions}
              onChange={(e) => setTotalSessions(Math.max(1, Number(e.target.value)))}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 block">
            الحصص والمواد التابعة للفاتورة الجديدة ({availableSessions.length}):
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
            {availableSessions.map((session: any) => {
              const isChecked = selectedSessions.includes(session.id);
              const basePrice = getSessionPriceForStudent(session, student.stage, student.grade, subType);
              const calculatedIndividual = subType === "PER_SESSION" ? basePrice * totalSessions : basePrice;

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessions(isChecked ? selectedSessions.filter(x => x !== session.id) : [...selectedSessions, session.id])}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${isChecked
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
                        <span>المدرس: {session.teacher?.name || "غير محدد"}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">المادة: {session.teacher?.subject || "عام"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{calculatedIndividual} ج.م</span>
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
            onClick={() => onConfirm({ subscriptionType: subType, sessionIds: selectedSessions, totalSessions: subType === "PER_SESSION" ? totalSessions : undefined }, student.id)}
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
// المكون الاستراتيجي الرئيسي لصفحة الطلاب (Students Dashboard)
// =============================================
export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // فلاتر التصفية المتقدمة والعميقة
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      toast.error("تم حفظ العمليات محلياً بسبب انقطاع الإنترنت. سيرفع السيستم البيانات تلقائياً فور عودة الشبكة ⚠️", { duration: 5000, icon: <WifiOff className="text-rose-500" /> });
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
      console.error(err);
      toast.error("فشل جلب البيانات المحدثة من السيرفر الرئيسي");
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

    const syncToastId = toast.loading("جاري مزامنة الفواتير والطلاب المعلقين أوفلاين...");

    try {
      if (studentQueue.length > 0) {
        // تم التعديل الجذري هنا لتتوافق مع الباك إند بإرسال المفتاح 'students'
        await api.post("/students/bulk-sync", { students: studentQueue });
        localStorage.setItem("sentryk_offline_student_queue", "[]");
      }

      if (subQueue.length > 0) {
        await api.post("/subscriptions/bulk-sync", { subscriptionsArray: subQueue });
        localStorage.setItem("sentryk_offline_sub_queue", "[]");
      }

      toast.success("اكتملت مزامنة العمليات المعلقة بنجاح تام وتحديث الخزينة ⚡", { id: syncToastId });
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ في المزامنة المجمعة للأوفلاين ببعض القيود المتقاطعة", { id: syncToastId });
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
        const toastId = toast.loading("جاري قيد الطلاب تتابعياً بالخادم المجمع...");
        // تم التعديل الهيكلي للتوافق مع الباك إند الفردي والمجمع بإرسال المفتاح 'students'
        await api.post("/students/bulk-sync", { students: payloadOrPayloads });
        toast.success(`تم قيد دفعة الطلاب المجمعة بنجاح وعددهم (${payloadOrPayloads.length})`, { id: toastId });
      } else {
        await api.post("/students", payloadOrPayloads);
        toast.success("تم تسجيل الطالب وتوليد كارت الحضور الذكي في قاعدة البيانات بنجاح 🚀");
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
        items: renewPayload.sessionIds.map((id: number) => ({ sessionId: id })),
        subscriptionType: renewPayload.subscriptionType,
        totalSessions: renewPayload.totalSessions,
        isOfflineMode: true,
        offlineCreatedAt: new Date().toISOString()
      });

      localStorage.setItem("sentryk_offline_sub_queue", JSON.stringify(currentSubQueue));
      toast.warning("تم حفظ تجديد الفاتورة في طابور الأوفلاين المحلي بنجاح 💸");
      setRenewModal({ open: false, student: null });
      return;
    }

    try {
      await api.post(`/subscriptions/${studentId}`, {
        subscriptionType: renewPayload.subscriptionType,
        totalSessions: renewPayload.totalSessions,
        items: renewPayload.sessionIds.map((id: number) => ({ sessionId: id }))
      });

      toast.success("تم تجديد الاشتراك واستلام الرسوم وتحديث إشعار ولي الأمر ✅");
      setRenewModal({ open: false, student: null });
      fetchInitialData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "فشلت عملية التجديد المالي للاشتراك");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف الطالب نهائياً؟ سيتم مسح السجلات والاشتراكات كلياً.")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("تم حذف كائن الطالب من قاعدة البيانات بنجاح 🧨");
      fetchInitialData();
    } catch (err) {
      toast.error("فشل حذف الطالب لوجود قيود علاقات معقدة بالسيرفر");
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
        return `${sessionName} ${teacherName} ${subjectName}`;
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

      {/* شريط رأس الصفحة الاحترافي والمريح للعين */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-900/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              منظومة شؤون إدارة الطلاب والاشتراكات <Sparkles className="text-blue-500" size={22} />
            </h1>
            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full flex items-center gap-1 ${isOnline ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 animate-pulse"}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "اتصال حي بالسيرفر" : "الوضع المحلي أوفلاين"}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400">
            إصدار Sentryk الاحترافي لدعم المزامنة التتابعية المجمعة، قيد الهويات الرقمية بالـ QR Code، تتبع غرف الحصص ومستحقات المدرسين المباشرة.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Plus size={16} /> تسجيل طالب / حزمة جديدة
        </button>
      </div>

      {/* دمج مربع الشرح الإرشادي الموحد */}
      <SystemGuideBox />

      {/* لوحة بطاقات الإحصاء الاستكشافية الواسعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">إجمالي الطلاب المقيدين</p>
            <p className="text-3xl font-black">{students.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl"><User size={22} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">الاشتراكات النشطة حالياً</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {students.filter(s => s.computedStatus === "ACTIVE" || s.subscriptions?.some((sub: any) => sub.status === "ACTIVE")).length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl"><UserCheck size={22} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">اشتراكات منتهية (تتطلب سداد)</p>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {students.filter(s => s.computedStatus === "EXPIRED" || (!s.subscriptions || s.subscriptions.length === 0)).length}
            </p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl"><UserX size={22} /></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400">عمليات معلقة في الانتظار أوفلاين</p>
            <p className="text-3xl font-black text-amber-500">
              {JSON.parse(localStorage.getItem("sentryk_offline_student_queue") || "[]").length + JSON.parse(localStorage.getItem("sentryk_offline_sub_queue") || "[]").length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl"><Clock size={22} /></div>
        </div>
      </div>

      {/* فلاتر التصفية والفرز الذكي العملاق */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 border-b dark:border-slate-800 pb-2">
          <Filter size={14} /> لوحة التحكم والفلاتر المتقدمة والفرز الذكي للمحاسبة
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ابحث بالمعرف، اسم الطالب، رقم ولي الأمر، اسم المدرس، أو المادة..."
              className="w-full h-12 pr-10 pl-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none appearance-none"
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setGradeFilter("ALL"); }}
            >
              <option value="ALL">كل المراحل التعليمية</option>
              {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div>
            <select
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none appearance-none"
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
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">كل الحالات المالية</option>
              <option value="ACTIVE">الطلاب النشطين (مدفوع) ✅</option>
              <option value="EXPIRED">الاشتراكات المنتهية (مطلب سداد) ❌</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول السجلات الرئيسي الفخم والمريح جداً للعين */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={36} />
            <p className="text-xs font-bold text-slate-400">جاري قراءة ومعالجة مصفوفة بيانات الطلاب والمجموعات...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-20 text-center space-y-2">
            <AlertCircle className="text-slate-300 mx-auto" size={44} />
            <p className="text-xs font-black text-slate-400">لا توجد سجلات طلاب مطابقة لمعايير البحث الحالية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-4"><div className="flex items-center gap-1"><Hash size={12} /> كود الحساب</div></th>
                  <th className="p-4">اسم الطالب / ولي الأمر</th>
                  <th className="p-4">المرحلة والصف الدراسي</th>
                  <th className="p-4">المجموعات والمواد والقاعات المسجلة بقوة</th>
                  <th className="p-4">آخر رسوم سداد بالخزينة</th>
                  <th className="p-4">الحالة المالية</th>
                  <th className="p-4 text-center">أدوات التحكم السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800/80 text-xs font-bold">
                {filteredStudents.map((student: any) => {
                  const lastSubscription = student.subscriptions?.[student.subscriptions.length - 1];
                  const computedStatus = student.computedStatus || (lastSubscription?.status === "ACTIVE" ? "ACTIVE" : "EXPIRED");
                  const enrolledSessions = safeArray<any>(lastSubscription?.enrolledSessions || lastSubscription?.items);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-mono text-slate-400">#{student.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5" dir="ltr">
                          <Phone size={10} /> {student.phone}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">{STAGES[student.stage]}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">الصف رقم {student.grade}</p>
                      </td>
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
                                <div key={idx} className="flex flex-wrap items-center gap-1.5 text-[10px] bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border dark:border-slate-800/60">
                                  <span className="font-black text-blue-600 dark:text-blue-400">{currentSessionName}</span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="text-slate-600 dark:text-slate-400">أ/ {currentTeacherName}</span>
                                  <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded font-black text-[9px] flex items-center gap-0.5">
                                    <Home size={9} /> {currentRoom} ({currentSubject})
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-black text-emerald-600 dark:text-emerald-400">
                          {lastSubscription?.totalPrice ? `${lastSubscription.totalPrice} ج.م` : "0.00 ج.م"}
                        </p>
                        {lastSubscription?.totalSessions && (
                          <p className="text-[9px] text-blue-500 font-bold">الرصيد: {lastSubscription.totalSessions} حصص</p>
                        )}
                        <p className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <Calendar size={10} /> ينتهي: {lastSubscription?.endDate ? new Date(lastSubscription.endDate).toLocaleDateString("ar-EG") : "بلا تاريخ"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full ${computedStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"}`}>
                          {computedStatus === "ACTIVE" ? "نشط ومسدد" : "مطلوب تجديد مالي"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setRenewModal({ open: true, student })}
                            className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg flex items-center gap-1 transition-colors"
                            title="تجديد وتحصيل اشتراك الطالب ماليًا"
                          >
                            <RefreshCcw size={12} /> تجديد الفاتورة
                          </button>
                          <button
                            onClick={() => setQrModal({ open: true, student })}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                            title="عرض بطاقة الهوية الرقمية للـ QR"
                          >
                            <QrCode size={12} />
                          </button>
                          <button
                            onClick={() => setModal({ open: true, data: student })}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={12} />
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