import React, { useEffect, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DoorOpen,
  Plus,
  Edit3,
  Trash2,
  X,
  Info,
  Hash,
  Users,
  LayoutGrid,
  Lock,
  Eye,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen,
  User,
  ShieldAlert
} from "lucide-react";
import api from "../../api/axios";
import { useAuthStore } from "../../store/useAuthStore"; // استيراد ستور الصلاحيات الخاص بالسيستم

// --- الواجهات وهيكلة البيانات المتوافقة مع الـ Backend ---
interface ISession {
  id: number;
  name: string;
  maxStudents: number;
  startTime: string;
  endTime: string;
  teacher: {
    name: string;
    subject: string;
  };
}

interface IRoom {
  id: number;
  name: string;
  maxStudents: number;
  sessions?: ISession[];
}

type ModalType = "CREATE" | "EDIT";

export default function RoomsManager() {
  const { user } = useAuthStore(); // جلب بيانات المستخدم الحالي وصلاحياته
  const isAdmin = user?.role === "ADMIN";

  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالة المودال الخاص بالإدخال والتعديل
  const [modal, setModal] = useState<{ open: boolean; type: ModalType; data: IRoom | null }>({
    open: false,
    type: "CREATE",
    data: null,
  });

  // حالة مودال الحذف المخصص (الأمان الهندسي)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; roomId: number | null; roomName: string }>({
    open: false,
    roomId: null,
    roomName: "",
  });

  // حالة لوحة استكشاف تفاصيل القاعة والحصص المرتبطة بها (GET /rooms/:id)
  const [inspector, setInspector] = useState<{ open: boolean; room: IRoom | null; sessionsLoading: boolean }>({
    open: false,
    room: null,
    sessionsLoading: false,
  });

  // حالة إظهار الخطأ أو النجاح في الواجهة بدلاً من الـ Alert التقليدي
  const [feedback, setFeedback] = useState<{ text: string; type: "SUCCESS" | "ERROR" | null }>({ text: "", type: null });

  // دالة إظهار التنبيهات المؤقتة الذكية
  const showFeedback = (text: string, type: "SUCCESS" | "ERROR") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: "", type: null }), 5000);
  };

  // 1. جلب القاعات الشاملة من الباك إند
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rooms");
      if (res.data && res.data.rooms) {
        setRooms(res.data.rooms);
      }
    } catch (err: any) {
      console.error("❌ Error fetching rooms:", err);
      showFeedback(err.response?.data?.error || "حدث خطأ أثناء جلب القاعات من الخادم", "ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. جلب تفاصيل قاعة محددة بالـ ID مع حصصها (Deep Inspection)
  const handleInspectRoom = async (room: IRoom) => {
    setInspector({ open: true, room: room, sessionsLoading: true });
    try {
      const res = await api.get(`/rooms/${room.id}`);
      if (res.data && res.data.room) {
        setInspector({ open: true, room: res.data.room, sessionsLoading: false });
      }
    } catch (err: any) {
      console.error("❌ Error fetching room details:", err);
      showFeedback(err.response?.data?.error || "فشل جلب تفاصيل المجموعات داخل القاعة", "ERROR");
      setInspector(prev => ({ ...prev, sessionsLoading: false }));
    }
  };

  // 3. معالجة حذف القاعة الفعلي بعد تأكيد المودال المخصص
  const executeDeleteRoom = async () => {
    if (!deleteModal.roomId) return;
    try {
      await api.delete(`/rooms/${deleteModal.roomId}`);
      showFeedback("تم حذف القاعة بنجاح وتطهير السجلات 🗑️", "SUCCESS");
      setDeleteModal({ open: false, roomId: null, roomName: "" });
      // إذا كانت القاعة المفتوحة في المفتش هي التي تم حذفها، قم بإغلاق المفتش
      if (inspector.room?.id === deleteModal.roomId) {
        setInspector({ open: false, room: null, sessionsLoading: false });
      }
      fetchRooms();
    } catch (err: any) {
      // هنا الباك إند سيمتنع عن الحذف الكارثي لو هناك مجموعات نشطة وسيتم عرض رسالته المخصصة بامتياز
      showFeedback(err.response?.data?.error || "فشل حذف القاعة لوجود قيود برمجية", "ERROR");
      setDeleteModal({ open: false, roomId: null, roomName: "" });
    }
  };

  // 4. إنشاء أو تعديل قاعة بذكاء وفحص القيود هندسياً
  const handleRoomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nameValue = (fd.get("name") as string).trim();
    const maxStudentsValue = fd.get("maxStudents") ? Number(fd.get("maxStudents")) : null;

    if (!nameValue) {
      showFeedback("اسم القاعة حقل إجباري لا يمكن تركه فارغاً", "ERROR");
      return;
    }

    const payload = {
      name: nameValue,
      maxStudents: maxStudentsValue,
    };

    try {
      if (modal.type === "CREATE") {
        await api.post("/rooms", payload);
        showFeedback("تم إنشاء القاعة وإضافتها لخرائط السنتر بنجاح 🏛️", "SUCCESS");
      } else {
        if (!modal.data?.id) return;
        await api.put(`/rooms/${modal.data.id}`, payload);
        showFeedback("تم تحديث بيانات القاعة وحفظ التعديلات الهندسية ✅", "SUCCESS");
      }
      setModal({ open: false, type: "CREATE", data: null });
      fetchRooms();
    } catch (err: any) {
      showFeedback(err.response?.data?.error || "فشل حفظ البيانات، يرجى مراجعة القيود", "ERROR");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      
      {/* شريط الإشعارات والـ Feedback الذكي العائم */}
      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-6 right-6 md:left-auto md:w-[26rem] z-[999] p-5 rounded-3xl shadow-2xl flex items-center gap-4 border text-sm font-black ${
              feedback.type === "SUCCESS"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 backdrop-blur-xl"
                : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 backdrop-blur-xl"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feedback.type === "SUCCESS" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
              {feedback.type === "SUCCESS" ? "✨" : "⚠️"}
            </div>
            <p className="leading-relaxed flex-1">{feedback.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* ==================== البانر العلوي للتنقل وإضافة قاعة ==================== */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex items-center gap-6 z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-6 transition-transform duration-300">
              <DoorOpen size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black dark:text-white tracking-tight">إدارة الغرف والقاعات الدراسية</h1>
              <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                <LayoutGrid size={13} className="text-indigo-500" /> تنظيم وتوزيع المجموعات بناءً على السعة الاستيعابية القصوى والمنع الهندسي للتضارب.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModal({ open: true, type: "CREATE", data: null })}
            className="px-8 py-4.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-2xl font-black shadow-lg shadow-slate-900/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 z-10 self-stretch md:self-auto justify-center"
          >
            <Plus size={20} /> إضافة قاعة جديدة
          </button>
        </div>

        {/* ==================== العرض الرئيسي للقاعات ==================== */}
        <main>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-32">
                <div className="w-16 h-16 border-[6px] border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 mt-4 tracking-widest">جاري فحص وتحديث مدرجات السنتر...</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* التحكم بالبطاقة والأزرار التفاعلية */}
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-500/5 transition-all duration-300">
                          <DoorOpen size={26} />
                        </div>
                        
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          {/* زر تفاصيل الحصص الاستكشافي - متاح للجميع */}
                          <button
                            onClick={() => handleInspectRoom(room)}
                            title="استكشاف الحصص داخل القاعة"
                            className="p-3 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Eye size={16} />
                          </button>

                          {/* أزرار الإدارة المحمية - تتأثر بصلاحية الـ ADMIN فقط في الـ PUT/DELETE */}
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => setModal({ open: true, type: "EDIT", data: room })}
                                className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ open: true, roomId: room.id!, roomName: room.name })}
                                className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="p-3 bg-slate-100 dark:bg-slate-800/40 text-slate-400 rounded-xl" title="تعديل أو حذف القاعة صلاحية الأدمن فقط 🔒">
                              <Lock size={16} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* تفاصيل القاعة الأساسية */}
                      <h3 className="text-2xl font-black dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {room.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-2 mb-6">
                        <span className="text-[10px] font-black text-slate-400/90 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Hash size={11} /> معرف القاعة رقم: {room.id}
                        </span>
                      </div>
                    </div>

                    {/* السعة الاستيعابية ومحتوى أسفل الكارد */}
                    <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Users size={13} className="text-slate-400" /> السعة القصوى
                        </span>
                        <span className="font-black text-sm dark:text-white text-slate-800">
                          {room.maxStudents ? `${room.maxStudents} طالب` : "60 طالب (افتراضي)"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* في حال عدم وجود أي قاعة مضافة */}
                {rooms.length === 0 && (
                  <div className="col-span-full py-24 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Info size={32} />
                    </div>
                    <h3 className="text-lg font-black dark:text-white text-slate-700">لا توجد قاعات مسجلة حالياً بالسنتر</h3>
                    <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto font-bold leading-relaxed">
                      ابدأ بتسكين السنتر وإضافة غرف ومدرجات التدريس لتتمكن من جدولة المجموعات والحصص وربطها بالسعة الاستيعابية بشكل صحيح.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ==================== المودال الديناميكي: إنشاء / تعديل قاعة ==================== */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-black dark:text-white text-slate-900">
                  {modal.type === "CREATE" ? "✨ إضافة قاعة جديدة" : "📝 تعديل بيانات القاعة"}
                </h3>
                <button
                  onClick={() => setModal({ open: false, type: "CREATE", data: null })}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* تنبيه ذكي للأدمن مبني على شروط الـ Backend الفخمة */}
              {modal.type === "EDIT" && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-relaxed">
                    تنبيه هندسي: لا يمكن تقليل السعة الاستيعابية لرقم أقل من سعة أي مجموعة نشطة تعمل داخل هذه القاعة حالياً لتجنب حدوث تضارب في تسجيل الطلاب.
                  </p>
                </div>
              )}

              <form onSubmit={handleRoomSubmit} className="space-y-6 relative z-10">
                {/* حقل اسم القاعة */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 mr-2 block h-14">
                    اسم القاعة / رقم الغرفة الدراسية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    defaultValue={modal.data?.name || ""}
                    required
                    placeholder="مثال: قاعة الخوارزمي، مدرج (أ)، غرفة 102..."
                    className="w-full p-4.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl outline-none font-black text-sm text-slate-800 dark:text-white transition-all shadow-inner h-14"
                  />
                </div>

                {/* حقل السعة القصوى */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 mr-2 block">
                    السعة الاستيعابية للطلاب (اختياري)
                  </label>
                  <input
                    name="maxStudents"
                    type="number"
                    min="1"
                    defaultValue={modal.data?.maxStudents || ""}
                    placeholder="سيقوم النظام بتعيين 60 طالب تلقائياً إن تركت فارغة"
                    className="w-full p-4.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl outline-none font-black text-sm text-slate-800 dark:text-white transition-all shadow-inner h-14"
                  />
                </div>

                {/* زر الإرسال */}
                <button
                  type="submit"
                  className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all tracking-wide mt-4 h-14 flex items-center justify-center gap-2"
                >
                  {modal.type === "CREATE" ? "تأكيد وإنشاء القاعة الفورية" : "حفظ التحديثات الهندسية"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== مودال حذف قاعة مخصص (Custom Deletion Confirmation) ==================== */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-[850] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative"
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black dark:text-white text-slate-900 mb-2">تأكيد حذف القاعة نهائياً؟</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">
                أنت على وشك حذف القاعة <span className="text-rose-500 font-black">"{deleteModal.roomName}"</span>. النظام سيقوم بالتحقق من عدم ارتباطها بأي مجموعة نشطة حالياً لمنع تلف جداول المواعيد.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={executeDeleteRoom}
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-600/20 transition-all"
                >
                  نعم، نفذ الحذف
                </button>
                <button
                  onClick={() => setDeleteModal({ open: false, roomId: null, roomName: "" })}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-slate-700 rounded-2xl font-black text-sm transition-all"
                >
                  إلغاء الأمر
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== لوحة مستكشف وتفاصيل الحصص بالقاعة (Inspector Drawer) ==================== */}
      <AnimatePresence>
        {inspector.open && inspector.room && (
          <div className="fixed inset-0 z-[750] flex justify-end bg-slate-950/40 backdrop-blur-sm">
            {/* الخلفية لإغلاق اللوحة عند الضغط خارجها */}
            <div className="absolute inset-0" onClick={() => setInspector({ open: false, room: null, sessionsLoading: false })} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full p-8 shadow-2xl border-l border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between overflow-y-auto no-scrollbar"
            >
              <div>
                {/* رأس اللوحة الإستكشافية */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center">
                      <DoorOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black dark:text-white text-slate-900">{inspector.room.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">مستكشف الجداول والربط الهندسي</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspector({ open: false, room: null, sessionsLoading: false })}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* عرض تفاصيل السعة داخل المفتش */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-slate-400 flex items-center gap-1.5">
                    <Users size={14} /> سعة الغرفة المعتمدة:
                  </span>
                  <span className="text-sm font-black dark:text-white text-slate-800">
                    {inspector.room.maxStudents ? `${inspector.room.maxStudents} طالب` : "60 طالب"}
                  </span>
                </div>

                {/* قسم الحصص والمجموعات المجدولة حالياً */}
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 mr-1">المجموعات المقامة بالقاعة حالياً</h4>
                
                {inspector.sessionsLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 mt-2">جاري استدعاء سجلات المجموعات الحية...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspector.room.sessions && inspector.room.sessions.length > 0 ? (
                      inspector.room.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3.5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-black dark:text-white text-slate-800">{session.name}</span>
                            <span className="text-[10px] font-bold bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                              سعة السيشن: {session.maxStudents} ط
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-bold">
                            <div className="flex items-center gap-1.5">
                              <User size={12} className="text-slate-400" />
                              <span className="truncate">المدرس: {session.teacher?.name || "غير محدد"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BookOpen size={12} className="text-slate-400" />
                              <span className="truncate">المادة: {session.teacher?.subject || ""}</span>
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                              <Clock size={12} className="text-slate-400" />
                              <span>الموعد: {session.startTime} - {session.endTime || "غير محدد"}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed dark:border-slate-800/40">
                        <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-black text-slate-400">القاعة خالية تماماً من الحصص حالياً</p>
                        <p className="text-[10px] text-slate-400/80 mt-1">يمكنك ربط هذه القاعة بأي سيشن جديد عبر مدير الحصص.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* الفوتر الخاص باللوحة الإستكشافية */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold flex justify-between items-center bg-white dark:bg-slate-900 sticky bottom-0">
                <span>كود الفحص: RM-{inspector.room.id}</span>
                <span>نظام Sentryk للتحكم التعليمي</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}