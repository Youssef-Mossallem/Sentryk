import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  DoorOpen,
  Plus,
  Edit3,
  Trash2,
  X,
  Info,
  DollarSign,
  Users,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Search,
  Filter,
  AlertCircle,
  Layers
} from "lucide-react";
import api from "../../api/axios"; // مسار الأكسيوس الخاص بالـ API

// أيام الأسبوع الثابتة والمعتمدة في قاعدة البيانات والباك إند
const DAYS_OF_WEEK = [
  { id: "SATURDAY", label: "السبت" },
  { id: "SUNDAY", label: "الأحد" },
  { id: "MONDAY", label: "الإثنين" },
  { id: "TUESDAY", label: "الثلاثاء" },
  { id: "WEDNESDAY", label: "الأربعاء" },
  { id: "THURSDAY", label: "الخميس" },
  { id: "FRIDAY", label: "الجمعة" },
];

export default function SessionsManager() {
  // --- حالات البيانات الأساسية (State Management) ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات البحث والفلترة الذكية
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState("ALL");
  const [selectedDayFilter, setSelectedDayFilter] = useState("ALL");

  // حفظ الأيام المختارة بداخل المودال (يدعم تعدد الأيام للحصة الواحدة بالتوافق مع الراوت الجديد)
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // نظام التنبيهات الاحترافي البديل للـ Alert البدائي
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  // حالة التحكم في المودال (إنشاء / تعديل)
  const [modal, setModal] = useState({
    open: false,
    type: "CREATE" as "CREATE" | "EDIT",
    data: null as any,
  });

  // حالات جديدة للـ Dynamic Filtering بناءً على المدرس (فقط في الإنشاء)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [availableStages, setAvailableStages] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<number[]>([]);

  // دالة إظهار التنبيهات المخصصة وتختفي تلقائياً بعد 4 ثوانٍ
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // --- جلب البيانات الشامل من السيرفر (Fetch Layer) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, teachersRes, roomsRes] = await Promise.all([
        api.get("/sessions"),
        api.get("/teachers"), 
        api.get("/rooms")     
      ]);

      if (sessionsRes.data?.sessions) setSessions(sessionsRes.data.sessions);
      if (teachersRes.data?.teachers) setTeachers(teachersRes.data.teachers);
      if (roomsRes.data?.rooms) setRooms(roomsRes.data.rooms);
    } catch (err) {
      console.error("Error fetching sessions data:", err);
      showToast("فشل جلب البيانات من السيرفر، يرجى التحقق من الاتصال", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // تكييف الأيام المختارة تلقائياً عند فتح مودال التعديل
  useEffect(() => {
    if (modal.open && modal.type === "EDIT" && modal.data?.days) {
      setSelectedDays(modal.data.days);
    } else {
      setSelectedDays([]);
    }
  }, [modal]);

  // دالة اختيار وإلغاء تفعيل الأيام داخل الجريد
  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  // --- عمليات الحذف (Delete Logic) ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المجموعة نهائياً؟ ستقوم بالتحقق من قيود الأمان أولاً.")) return;
    try {
      const res = await api.delete(`/sessions/${id}`);
      showToast(res.data?.message || "تم حذف المجموعة بنجاح", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || "فشل حذف الحصة", "error");
    }
  };

  // --- عمليات الحفظ والإرسال (Submit Logic) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      showToast("برجاء اختيار يوم واحد على الأقل للحصة! 📅", "error");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: (fd.get("name") as string).trim(),
      teacherId: Number(fd.get("teacherId")),
      roomId: Number(fd.get("roomId")),
      startTime: fd.get("startTime"), 
      endTime: fd.get("endTime") ? fd.get("endTime") : null, 
      maxStudents: fd.get("maxStudents") ? Number(fd.get("maxStudents")) : null,
      stage: fd.get("stage"),
      grade: Number(fd.get("grade")),
      days: selectedDays, 
    };

    try {
      if (modal.type === "CREATE") {
        const res = await api.post("/sessions", payload);
        showToast(res.data?.message || "تم إنشاء المجموعة وتطبيق قيود السعة الاستيعابية بنجاح", "success");
      } else {
        const res = await api.put(`/sessions/${modal.data.id}`, payload);
        showToast(res.data?.message || "تم تحديث المجموعة بنجاح وتأكيد السعات", "success");
      }
      // إعادة تعيين الحالات
      setSelectedTeacherId(null);
      setAvailableStages([]);
      setAvailableGrades([]);
      setModal({ open: false, type: "CREATE", data: null });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || "حدث خطأ غير متوقع أثناء معالجة البيانات", "error");
    }
  };

  // --- حسابات لوحة القيادة الفوقية (Derived Stats Dashboard) ---
  const statsDashboard = useMemo(() => {
    return sessions.reduce(
      (acc, curr) => {
        acc.totalStudents += curr.studentCount || 0;
        acc.totalRevenue += curr.estimatedRevenue || 0;
        return acc;
      },
      { totalStudents: 0, totalRevenue: 0, totalGroups: sessions.length }
    );
  }, [sessions]);

  // --- الفلترة والبحث الذكي (Client-Side Search Matrix) ---
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            session.teacher?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = selectedStageFilter === "ALL" || session.stage === selectedStageFilter;
      const matchesDay = selectedDayFilter === "ALL" || session.days?.includes(selectedDayFilter);
      return matchesSearch && matchesStage && matchesDay;
    });
  }, [sessions, searchQuery, selectedStageFilter, selectedDayFilter]);

  const translateStage = (stage: string) => {
    if (stage === "HIGH") return "ثانوي";
    if (stage === "MIDDLE") return "إعدادي";
    return "ابتدائي";
  };

  const translateDay = (dayId: string) => {
    const found = DAYS_OF_WEEK.find(d => d.id === dayId);
    return found ? found.label : dayId;
  };

  // دالة لجلب الـ Price Configurations لمدرس معين (يمكن تحسينها بـ API منفصل)
  const getTeacherSupportedOptions = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.priceConfigs || teacher.priceConfigs.length === 0) {
      return { stages: ["PRIMARY", "MIDDLE", "HIGH"], grades: Array.from({length: 12}, (_, i) => i + 1) };
    }

    const uniqueStages = new Set<string>();
    const uniqueGrades = new Set<number>();

    teacher.priceConfigs.forEach((config: any) => {
      uniqueStages.add(config.stage);
      config.grades.forEach((g: number) => uniqueGrades.add(g));
    });

    return {
      stages: Array.from(uniqueStages),
      grades: Array.from(uniqueGrades).sort((a, b) => a - b)
    };
  };

  // تحديث الخيارات المتاحة عند تغيير المدرس (فقط CREATE)
  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = Number(e.target.value);
    setSelectedTeacherId(teacherId || null);

    if (teacherId && modal.type === "CREATE") {
      const { stages, grades } = getTeacherSupportedOptions(teacherId);
      setAvailableStages(stages);
      setAvailableGrades(grades);
    } else {
      setAvailableStages([]);
      setAvailableGrades([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8 font-sans text-right selection:bg-indigo-600 selection:text-white" dir="rtl">
      
      {/* =============================================
          نظام الإشعارات المدمج (Toast Notifications)
          ============================================= */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 transition-all text-white ${
              toast.type === "success" ? "bg-emerald-600/90 shadow-emerald-500/20" : "bg-rose-600/90 shadow-rose-500/20"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-xs font-black tracking-wide leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================
          1. البانر العلوي التفاعلي الأسطوري
          ============================================= */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black dark:text-white tracking-tight flex items-center gap-2">
              منظومة المجموعات والجدولة الذكية <Sparkles className="text-amber-500 animate-pulse" size={24} />
            </h1>
            <p className="text-slate-400 dark:text-slate-400 text-xs font-bold mt-1.5 leading-relaxed">
              تحكم هندسي مطلق في توزيع القاعات، التحقق من تداخل المواعيد، وحساب الإيرادات الحية للمجموعات.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModal({ open: true, type: "CREATE", data: null })}
          className="w-full lg:w-auto px-8 py-4.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 z-10 h-12"
        >
          <Plus size={20} /> إنشاء جدول مجموعة جديد
        </button>
      </div>

      {/* =============================================
          2. لوحة القيادة الإحصائية الحية (Live Counters)
          ============================================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">المجموعات النشطة</p>
            <h3 className="text-2xl font-black dark:text-white font-mono">{statsDashboard.totalGroups}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center"><Layers size={22} /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">الطلاب المسجلين بالمجموعات</p>
            <h3 className="text-2xl font-black dark:text-white font-mono">{statsDashboard.totalStudents} <span className="text-xs font-bold text-slate-400">طالب</span></h3>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center"><Users size={22} /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">الدخل المتوقع الكلي المجمع</p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono">{statsDashboard.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400">ج.م</span></h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={22} /></div>
        </div>
      </div>

      {/* =============================================
          3. فلاتر التصفية والبحث المتقدمة (Advanced Filter Bar)
          ============================================= */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="w-full md:flex-1 relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث باسم المجموعة أو اسم المدرس المالك لها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none text-xs font-bold dark:text-white transition-all"
          />
        </div>
        
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
          {/* فلتر المراحل */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="bg-transparent text-xs font-black outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">كل المراحل</option>
              <option value="PRIMARY">الابتدائية</option>
              <option value="MIDDLE">الإعدادية</option>
              <option value="HIGH">الثانوية</option>
            </select>
          </div>

          {/* فلتر الأيام */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl">
            <CalendarDays size={14} className="text-slate-400" />
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="bg-transparent text-xs font-black outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">كل الأيام</option>
              {DAYS_OF_WEEK.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* =============================================
          4. العرض الرئيسي لكروت المجموعات النشطة
          ============================================= */}
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            /* هيكل التحميل الذكي الأنيميشن (Skeleton Screen Loader) */
            <motion.div key="L" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200/50 dark:border-slate-800 space-y-6 animate-pulse">
                  <div className="flex justify-between"><div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-xl" /><div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-xl" /></div>
                  <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="space-y-3"><div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" /><div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" /></div>
                  <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-4"><div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" /><div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" /></div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="G" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {filteredSessions.map((session) => (
                <div key={session.id} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between">
                  
                  <div>
                    {/* هيدر الكارت العلوي */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-[11px] font-black dark:text-slate-300 text-slate-600">{translateStage(session.stage)} - الصف {session.grade}</span>
                      </div>
                      
                      {/* أزرار التحكم المخفية تظهر في وضع الـ Hover بحركات ناعمة */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100">
                        <button
                          onClick={() => setModal({ open: true, type: "EDIT", data: session })}
                          className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 rounded-xl transition-colors shadow-sm"
                          title="تعديل جدول المجموعة"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 dark:text-rose-400 rounded-xl transition-colors shadow-sm"
                          title="حذف المجموعة"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-black dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {session.name}
                    </h3>

                    {/* عرض مصفوفة أيام الأسبوع التكرارية */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {session.days?.map((dayId: string) => (
                        <span key={dayId} className="px-3 py-1 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/10">
                          {translateDay(dayId)}
                        </span>
                      ))}
                    </div>

                    {/* داتا تفاصيل المجموعة الهندسية */}
                    <div className="space-y-3.5 mb-6">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs">
                        <User size={15} className="text-slate-400 shrink-0" />
                        <span>المدرس: <span className="text-slate-800 dark:text-white font-black">{session.teacher?.name}</span> <span className="text-slate-400 font-normal">({session.teacher?.subject})</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs">
                        <DoorOpen size={15} className="text-slate-400 shrink-0" />
                        <span>القاعة: <span className="text-slate-800 dark:text-white font-black">{session.room?.name}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs">
                        <Clock size={15} className="text-slate-400 shrink-0" />
                        <span>التوقيت: <span dir="ltr" className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-black text-slate-700 dark:text-indigo-400">{session.startTime}</span> إلى <span dir="ltr" className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-black text-slate-700 dark:text-indigo-400">{session.endTime || "--:--"}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* العدادات الذكية السفلية بالكارت */}
                  <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-indigo-50/30 dark:bg-indigo-500/5 border border-slate-100 dark:border-transparent rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 mb-1">الطلاب الفعليين</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                          {session.studentCount} <span className="text-xs text-slate-400 font-bold">/ {session.maxStudents || "∞"}</span>
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5 border border-slate-100 dark:border-transparent rounded-2xl text-center">
                        <p className="text-[10px] font-black text-slate-400 mb-1">الإيراد المباشر</p>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {session.estimatedRevenue.toLocaleString()} <span className="text-[11px] font-bold">ج.م</span>
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

              {filteredSessions.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-400">لا توجد مجموعات مطابقة لمعايير البحث الحالية</h3>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* =============================================
          5. المودال المطور الكلي والمنظم لإضافة وتعديل الجداول
          ============================================= */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden my-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-black dark:text-white">
                  {modal.type === "CREATE" ? "إضافة مجموعة جديدة لنظام السنتر" : "تعديل بيانات وإعدادات المجموعة"}
                </h3>
                <button
                  onClick={() => {
                    setSelectedTeacherId(null);
                    setAvailableStages([]);
                    setAvailableGrades([]);
                    setModal({ open: false, type: "CREATE", data: null });
                  }}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-right">
                
                {/* حقل اسم الحصة */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1 uppercase">اسم الحصة الدراسية / المجموعة</label>
                  <input
                    name="name"
                    required
                    defaultValue={modal.data?.name}
                    placeholder="مثال: مجموعة فيزياء السبت والثلاثاء (م. محمد)"
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-xl outline-none font-bold dark:text-white transition-all text-xs"
                  />
                </div>

                {/* منتقي الأيام المتكررة (Days Checklist Picker) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 mr-1 block">أيام تكرار الحصة أسبوعياً في السنتر (اختر يوماً أو أكثر) 📆</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`p-2.5 text-[11px] font-black rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={11} className="animate-bounce" />}
                          <span>{day.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* المدرس والقاعة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">المدرس المسؤول</label>
                    <select
                      name="teacherId"
                      required
                      defaultValue={modal.data?.teacher?.id}
                      onChange={handleTeacherChange}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none text-xs font-black dark:text-white transition-all"
                    >
                      <option value="">اختر المدرس المالك للمجموعة...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">قاعة التدريس</label>
                    <select
                      name="roomId"
                      required
                      defaultValue={modal.data?.room?.id}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none text-xs font-black dark:text-white transition-all"
                    >
                      <option value="">اختر قاعة السنتر المسكّنة...</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (سعة قصوى {r.maxStudents || "∞"})</option>)}
                    </select>
                  </div>
                </div>

                {/* المرحلة والسنة الدراسية - Dynamic للإنشاء فقط */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">المرحلة التعليمية</label>
                    <select
                      name="stage"
                      required
                      defaultValue={modal.data?.stage || (availableStages.length > 0 ? availableStages[0] : "HIGH")}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none text-xs font-black dark:text-white transition-all "
                    >
                      {modal.type === "CREATE" && availableStages.length > 0 ? (
                        availableStages.map(stage => (
                          <option key={stage} value={stage}>
                            {stage === "PRIMARY" ? "ابتدائي" : stage === "MIDDLE" ? "إعدادي" : "ثانوي"}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="PRIMARY">ابتدائي</option>
                          <option value="MIDDLE">إعدادي</option>
                          <option value="HIGH">ثانوي</option>
                        </>
                      )}
                    </select>
                    {modal.type === "CREATE" && selectedTeacherId && availableStages.length === 0 && (
                      <p className="text-[10px] text-amber-600">هذا المدرس ليس لديه تهيئات سعرية بعد</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">السنة الدراسية (رقم الصف)</label>
                    <select
                      name="grade"
                      required
                      defaultValue={modal.data?.grade || (availableGrades.length > 0 ? availableGrades[0] : 1)}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none text-xs font-black dark:text-white transition-all"
                    >
                      {modal.type === "CREATE" && availableGrades.length > 0 ? (
                        availableGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))
                      ) : (
                        Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* الوقت المطور والحد الأقصى */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500" /> وقت البدء
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      required
                      defaultValue={modal.data?.startTime || "16:00"}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none font-black text-xs dark:text-white font-mono text-center transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" /> وقت النهاية (اختياري)
                    </label>
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={modal.data?.endTime || ""}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none font-black text-xs dark:text-white font-mono text-center transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">الحد الأقصى للطلاب</label>
                    <input
                      name="maxStudents"
                      type="number"
                      defaultValue={modal.data?.maxStudents}
                      placeholder="تلقائي حسب سعة القاعة"
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 rounded-xl outline-none text-xs font-black dark:text-white transition-all"
                    />
                  </div>
                </div>

                {/* صندوق النصيحة الذكية */}
                <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center gap-3">
                  <Info size={15} className="text-indigo-500 shrink-0" />
                  <p className="text-[11px] font-bold text-indigo-600/90 dark:text-indigo-400/90 leading-relaxed">
                    نظام الحماية والجدولة الذكية يمنع تلقائياً حجز نفس القاعة لمجموعتين مختلفتين في نفس الأسبوع والوقت لتجنب التداخل. يتم فلترة الجريدات حسب تهيئات المدرس السعرية.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all tracking-wide"
                >
                  حفظ وتأكيد إعدادات المجموعة المحدثة ✨
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}