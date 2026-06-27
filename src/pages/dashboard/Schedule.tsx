import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,   
  Clock, 
  Download, 
  Printer, 
  RefreshCcw, 
  User, 
  GraduationCap,
  Building,
  Loader2,
  BookOpen,
  MapPin
} from "lucide-react";
import html2canvas from "html2canvas";
import api from "../../api/axios";

// --- الثوابت والمقاييس المستندة للسكيما ---
const DAYS_AR: Record<string, string> = {
  SATURDAY: "السبت",
  SUNDAY: "الأحد",
  MONDAY: "الإثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
};


const getGradeName = (grade: number) => {
  const gradesNames: Record<number, string> = {
    1: "الأول", 2: "الثاني", 3: "الثالث", 
    4: "الرابع", 5: "الخامس", 6: "السادس"
  };
  return `الصف ${gradesNames[grade] || grade}`;
};

// ساعات العمل (من 7 صباحاً إلى 12 منتصف الليل)
const START_HOUR = 7;
const END_HOUR = 24; 
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

// خريطة تحويل أيام الجافاسكريبت لمفاتيحنا
const JS_DAY_TO_KEY: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState<string>("SATURDAY");
  const [rooms, setRooms] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const printAreaRef = useRef<HTMLDivElement>(null);

  // تحديد اليوم الحالي تلقائياً عند أول تحميل
  useEffect(() => {
    const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
    setSelectedDay(todayKey);
  }, []);

  // تحديث الوقت كل دقيقة عشان الخط الطولي يتحرك
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // كل 60 ثانية
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // محاكاة أو جلب حقيقي للبيانات
      const [roomsRes, sessionsRes] = await Promise.all([
        api.get("/rooms").catch(() => ({ data: { success: false, rooms: [] } })),
        api.get("/sessions").catch(() => ({ data: { success: false, sessions: [] } }))
      ]);
      
      if (roomsRes?.data?.success) setRooms(roomsRes.data.rooms);
      if (sessionsRes?.data?.success) setSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة حساب الموضع الأفقي للكروت
  const calculateCardPosition = (startTimeStr: string, endTimeStr: string) => {
    const parseTimeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const scheduleStartMinutes = START_HOUR * 60;
    const sessionStartMinutes = parseTimeToMinutes(startTimeStr);
    const sessionEndMinutes = parseTimeToMinutes(endTimeStr);

    const startOffset = sessionStartMinutes - scheduleStartMinutes;
    const duration = sessionEndMinutes - sessionStartMinutes;

    const rightPercent = (startOffset / TOTAL_MINUTES) * 100;
    const widthPercent = (duration / TOTAL_MINUTES) * 100;

    return {
      right: `${Math.max(0, rightPercent)}%`,
      width: `${Math.min(100, widthPercent)}%`,
    };
  };

  // دالة حساب موضع خط الوقت الحالي
  const calculateCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMinutesAbsolute = hours * 60 + minutes;
    const scheduleStartMinutes = START_HOUR * 60;
    
    // لو الوقت بره ساعات العمل، متظهرش الخط
    if (hours < START_HOUR || hours >= END_HOUR) return null;

    const offsetMinutes = currentMinutesAbsolute - scheduleStartMinutes;
    const rightPercent = (offsetMinutes / TOTAL_MINUTES) * 100;

    return `${rightPercent}%`;
  };

  const timelineHours = useMemo(() => {
    const hours = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const period = h >= 12 ? "م" : "ص";
      hours.push({ raw: h, label: `${displayHour}:00 ${period}` });
    }
    return hours;
  }, []);

  const filteredSessionsByDay = useMemo(() => {
    return sessions.filter((session) => session.days.includes(selectedDay));
  }, [sessions, selectedDay]);

  const downloadScheduleImage = async () => {
    if (!printAreaRef.current) return;
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
        windowWidth: 2600, // عرض عملاق لضمان عدم تداخل الكروت في الصورة
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `جدول_${DAYS_AR[selectedDay]}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  const isTodaySelected = JS_DAY_TO_KEY[currentTime.getDay()] === selectedDay;
  const timeLinePosition = calculateCurrentTimePosition();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-14 h-14 text-indigo-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">جاري معالجة وتنسيق الجداول...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1920px] mx-auto space-y-6 dir-rtl font-sans" dir="rtl">
      
      {/* الهيدر العلوي */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">الجدول الزمني التفاعلي</h1>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>الوقت المباشر: {currentTime.toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={fetchData} className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all hover:scale-105 active:scale-95">
            <RefreshCcw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95">
            <Printer className="w-5 h-5" />
            طباعة
          </button>
          <button onClick={downloadScheduleImage} className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
            <Download className="w-5 h-5" />
            تصدير كصورة 4K
          </button>
        </div>
      </div>

      {/* شريط اختيار الأيام */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar p-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
        {Object.entries(DAYS_AR).map(([key, value]) => {
          const isActive = selectedDay === key;
          const isActualToday = JS_DAY_TO_KEY[currentTime.getDay()] === key;
          const count = sessions.filter(s => s.days.includes(key)).length;
          
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`relative flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-black transition-all duration-300 ${
                isActive 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/50 dark:border-slate-700" 
                  : "text-slate-500 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {isActualToday && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" title="اليوم الحالي" />
              )}
              {value}
              <span className={`px-2.5 py-1 rounded-md text-xs ${isActive ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                {count} حصة
              </span>
            </button>
          );
        })}
      </div>

      {/* حاوية الجدول (The Grid) */}
      <div 
        ref={printAreaRef}
        id="timetable-print-area"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar relative">
          {/* تم زيادة العرض الأدنى (min-w) لـ 2400 بكسل 
            هذا هو السر اللي بيخلي الكروت تاخد مساحتها ومفيش حاجة تتدخل في بعضها
          */}
          <div className="min-w-[2400px] relative pb-6 bg-white dark:bg-slate-900">
            
            {/* المحور الأفقي للساعات */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 sticky top-0 z-40">
              <div className="w-[220px] p-5 text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 sticky right-0 z-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                القاعات الدراسية
              </div>
              
              <div className="flex-1 flex relative h-16">
                {timelineHours.map((hour) => (
                  <div key={hour.raw} className="flex-1 flex flex-col items-center justify-center border-l border-slate-200 dark:border-slate-800/80 last:border-l-0">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">{hour.label.split(" ")[0]}</span>
                    <span className="text-[10px] font-bold text-slate-400">{hour.label.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* خطوط الإرشاد الرأسية الخلفية */}
            <div className="absolute top-16 bottom-0 right-[220px] left-0 flex pointer-events-none z-0">
              {timelineHours.map((hour) => (
                <div key={hour.raw} className="flex-1 border-l border-dashed border-slate-200/60 dark:border-slate-800/50 last:border-l-0" />
              ))}
            </div>

            {/* خط الوقت الحي (The Live Red Line) */}
            {isTodaySelected && timeLinePosition && (
              <div 
                className="absolute top-16 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                style={{ right: `calc(220px + (100% - 220px) * ${parseFloat(timeLinePosition) / 100})` }}
              >
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-md">
                  الآن
                </div>
                {/* دايرة صغيرة بتنور وتطفي */}
                <div className="absolute top-0 right-1/2 translate-x-1/2 translate-y-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              </div>
            )}

            {/* صفوف القاعات */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 relative z-10 mt-2">
              {rooms.length === 0 ? (
                <div className="p-20 text-center text-slate-500 font-bold">لم يتم إضافة قاعات حتى الآن.</div>
              ) : (
                rooms.map((room) => {
                  const roomSessionsThisDay = filteredSessionsByDay.filter((s) => s.room.id === room.id);

                  return (
                    <div key={room.id} className="flex relative items-stretch min-h-[150px] group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* اسم القاعة الثابت */}
                      <div className="w-[220px] p-5 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 sticky right-0 z-40 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-base">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="truncate">{room.name}</span>
                        </div>
                        {room.maxStudents && (
                          <div className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit border border-slate-100 dark:border-slate-700/50">
                            السعة القصوى: {room.maxStudents}
                          </div>
                        )}
                      </div>

                      {/* منطقة كروت الحصص */}
                      <div className="flex-1 relative mx-2 my-2">
                        <AnimatePresence>
                          {roomSessionsThisDay.map((session) => {
                            const pos = calculateCardPosition(session.startTime, session.endTime);
                            
                            // اختيار لون بار جانبي بناءً على المرحلة
                            const stageColor = session.stage === "HIGH" ? "bg-rose-500" : session.stage === "MIDDLE" ? "bg-amber-500" : "bg-indigo-500";
                            const bgGradient = session.stage === "HIGH" ? "from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900" : 
                                               session.stage === "MIDDLE" ? "from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900" : 
                                               "from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900";

                            return (
                              <motion.div
                                key={session.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                style={{ right: pos.right, width: pos.width }}
                                title={`${session.name} | ${session.teacher.name} | ${session.startTime} - ${session.endTime}`}
                                className={`absolute top-0 bottom-0 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br ${bgGradient} shadow-sm hover:shadow-xl hover:scale-[1.02] hover:z-50 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden group/card`}
                              >
                                {/* الشريط اللوني الجانبي */}
                                <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${stageColor}`} />

                                <div className="space-y-2 pr-3">
                                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight break-words group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400">
                                    {session.name}
                                  </h3>

                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                                      <User className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="truncate">{session.teacher.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-bold">
                                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="truncate">{session.teacher.subject || "عام"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 mt-2 pr-3">
                                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-500/20 px-2 py-1 rounded-md w-fit whitespace-nowrap">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    {getGradeName(session.grade)}
                                  </div>
                                  
                                  <div className="text-[11px] sm:text-xs font-mono font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 whitespace-nowrap shadow-sm">
                                    {session.startTime} - {session.endTime}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* دليل الألوان المطور */}
      <div className="flex flex-wrap items-center justify-center gap-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300">
        <span className="text-slate-500 font-black">التصنيف اللوني للمراحل:</span>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/20" />
          <span>ابتدائي</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-amber-500 shadow-md shadow-amber-500/20" />
          <span>إعدادي</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-rose-500 shadow-md shadow-rose-500/20" />
          <span>ثانوي</span>
        </div>
      </div>

      {/* تنسيقات الـ CSS (Scrollbar & Print) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 12px; width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background-color: #cbd5e1; 
          border-radius: 20px; 
          border: 3px solid white;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
          background-color: #475569; 
          border-color: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

        @media print {
          body { background: white !important; color: black !important; }
          .no-print, nav, header, button { display: none !important; }
          #timetable-print-area {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important; border: none !important; box-shadow: none !important;
          }
          /* إجبار المتصفح يطبع الكروت بألوانها صح */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}