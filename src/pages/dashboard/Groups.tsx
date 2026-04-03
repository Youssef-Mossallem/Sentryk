import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Edit3,
  GraduationCap,
  Hash,
  Info,
  Layers,
  LogOut,
  Phone,
  Plus,
  Target,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios"; // تأكد من مسار الاكسيوس عندك

// --- مكون تفاصيل الطالب المطور ---
const StudentDetailOverlay = ({ student, onClose, onRemoveFromGroup }: any) => {
  if (!student) return null;

  // حساب إجمالي مدفوعات الطالب من اشتراكاته الحقيقية في الباك
  // const totalPaid =
  //   student.subscriptions?.reduce(
  //     (acc: number, sub: any) => acc + sub.totalPrice,
  //     0,
  //   ) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border dark:border-slate-800"
      >
        <div className="h-40 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 relative">
          <div className="absolute -bottom-14 right-10 w-28 h-28 bg-white dark:bg-slate-800 rounded-[2rem] p-1.5 shadow-2xl">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-[1.7rem] flex items-center justify-center text-indigo-600">
              <User size={50} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-8 left-8 p-3 bg-white/20 hover:bg-white/40 rounded-2xl text-white transition-all backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 pt-20 text-right" dir="rtl">
          <div className="flex justify-between items-start mb-8">
            {/* <div>
              <h2 className="text-3xl font-black dark:text-white leading-none">{student.name}</h2>
              <p className="text-indigo-500 font-bold text-sm mt-2 flex items-center gap-2">
                 <Fingerprint size={14}/> كود الطالب: {student.id}
              </p>
            </div> */}
            {/* <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-2xl font-black text-sm">
              {totalPaid} ج.م
            </div> */}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
              <Phone size={16} className="text-slate-400 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">
                رقم التواصل
              </p>
              <p className="font-bold dark:text-white font-mono">
                {student.phone}
              </p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
              <GraduationCap size={16} className="text-slate-400 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase">
                المرحلة
              </p>
              <p className="font-bold dark:text-white">
                {student.stage === "HIGH"
                  ? "ثانوي"
                  : student.stage === "MIDDLE"
                    ? "إعدادي"
                    : "ابتدائي"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onRemoveFromGroup(student.id)}
              className="w-full py-5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> إزالة من هذه المجموعة
            </button>
            <button
              onClick={onClose}
              className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function GroupsManager() {
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<any[]>([]);
  const [view, setView] = useState<"GROUPS" | "STUDENTS">("GROUPS");
  const [modal, setModal] = useState({
    open: false,
    type: "CREATE" as "CREATE" | "EDIT",
    data: null as any,
  });
  const [activeStudent, setActiveStudent] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/groups");
      setTree(res.data.data || []);

      // تحديث الـ Path إذا كنا داخل مجموعة حالياً لضمان مزامنة البيانات
      if (path.length > 0) {
        const lastId = path[path.length - 1].id;
        const findAndRefresh = (groups: any[]): any => {
          for (const g of groups) {
            if (g.id === lastId) return g;
            if (g.subGroups) {
              const found = findAndRefresh(g.subGroups);
              if (found) return found;
            }
          }
        };
        const updatedCurrent = findAndRefresh(res.data.data);
        if (updatedCurrent) {
          const newPath = [...path];
          newPath[newPath.length - 1] = updatedCurrent;
          setPath(newPath);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentGroups = useMemo(() => {
    if (path.length === 0) return tree;
    return path[path.length - 1].subGroups || [];
  }, [path, tree]);

  const currentLevel = path[path.length - 1] || null;

  // حساب الدخل الإجمالي للمجموعة الحالية (من اشتراكات الطلاب الحقيقية)
  //   const calculateLevelIncome = (students: any[]) => {
  //     return students?.reduce((total, st) => {
  //       const studentTotal = st.subscriptions?.reduce((sum: number, sub: any) => sum + (sub.totalPrice || 0), 0) || 0;
  //       return total + studentTotal;
  //     }, 0) || 0;
  //   };

  const handleRemoveStudent = async (studentId: number) => {
    if (
      !window.confirm(
        "هل تريد إزالة الطالب من المجموعة؟ (لن يتم حذف الطالب من السيستم)",
      )
    )
      return;
    try {
      // نستخدم راوت تعديل الطالب لجعل groupId = null
      await api.put(`/students/${studentId}`, {
        groupId: null,
        name: activeStudent.name, // الحقول المطلوبة في الـ Validation
        phone: activeStudent.phone,
        stage: activeStudent.stage,
      });
      setActiveStudent(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "فشل إزالة الطالب");
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: (fd.get("name") as string).trim(),
      maxStudents: fd.get("maxStudents") ? Number(fd.get("maxStudents")) : null,
      parentGroupId:
        modal.type === "CREATE"
          ? currentLevel
            ? Number(currentLevel.id)
            : null
          : modal.data.parentGroupId,
    };

    try {
      if (modal.type === "CREATE") await api.post("/groups", payload);
      else await api.put(`/groups/${modal.data.id}`, payload);
      setModal({ open: false, type: "CREATE", data: null });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] p-4 md:p-8 font-sans text-right"
      dir="rtl"
    >
      {/* Top Navigation Panel */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
            <Layers size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">
              إدارة المجموعات
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-tighter">
                <Target size={12} />{" "}
                {currentLevel ? "مستوى فرعي" : "المستوى الرئيسي"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModal({ open: true, type: "CREATE", data: null })}
          className="px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={22} /> إنشاء مجموعة جديدة
        </button>
      </div>

      {/* Dynamic Breadcrumbs */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar font-bold">
        <button
          onClick={() => {
            setPath([]);
            setView("GROUPS");
          }}
          className={`px-5 py-2 rounded-xl transition-all ${path.length === 0 ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400"}`}
        >
          الرئيسية
        </button>
        {path.map((p, i) => (
          <React.Fragment key={p.id}>
            <ChevronLeft size={16} className="text-slate-300" />
            <button
              onClick={() => {
                setPath(path.slice(0, i + 1));
                setView("GROUPS");
              }}
              className={`px-5 py-2 rounded-xl whitespace-nowrap ${i === path.length - 1 && view === "GROUPS" ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400"}`}
            >
              {p.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="L"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20"
            >
              <div className="w-14 h-14 border-[6px] border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
            </motion.div>
          ) : view === "GROUPS" ? (
            <motion.div
              key="G"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentGroups.map((group: any) => (
                <div
                  key={group.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-[3rem] p-10 border dark:border-slate-800 hover:shadow-2xl transition-all"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Users size={28} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <button
                        onClick={() =>
                          setModal({ open: true, type: "EDIT", data: group })
                        }
                        className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("حذف؟"))
                            api
                              .delete(`/groups/${group.id}`)
                              .then(fetchData)
                              .catch((e) => alert(e.response.data.error));
                        }}
                        className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black dark:text-white mb-2">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                      <Hash size={12} /> ID: {group.id}
                    </span>
                  </div>

                  <div className="space-y-3 mb-10">
                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border dark:border-slate-800">
                      <span className="text-xs font-black text-slate-400">
                        الطلاب المسجلين
                      </span>
                      <span className="font-black dark:text-white">
                        {group.studentCount} / {group.maxStudents || "∞"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t dark:border-slate-800">
                    <button
                      onClick={() => setPath([...path, group])}
                      className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      الفروع <ArrowRight size={14} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => {
                        setPath([...path, group]);
                        setView("STUDENTS");
                      }}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl font-black text-xs hover:bg-slate-200 transition-all"
                    >
                      الطلاب
                    </button>
                  </div>
                </div>
              ))}
              {currentGroups.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Info size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">
                    لا يوجد مجموعات فرعية هنا
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 font-bold">
                    يمكنك البدء بإضافة أول فرع لهذه المجموعة
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="S"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setView("GROUPS")}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-inner"
                  >
                    <ArrowRight size={24} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black dark:text-white italic">
                      طلاب: {currentLevel?.name}
                    </h2>
                  </div>
                </div>
                <div className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20">
                  {currentLevel?.students.length} طالب مسجل
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                      <th className="p-8">اسم الطالب</th>
                      <th className="p-8">المرحلة</th>
                      <th className="p-8">رقم الهاتف</th>
                      <th className="p-8">قيمة الاشتراك</th>
                      <th className="p-8 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {currentLevel?.students.map((st: any) => (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group"
                      >
                        <td className="p-8 font-black dark:text-white text-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500 font-bold text-xs">
                              {st.name[0]}
                            </div>
                            {st.name}
                          </div>
                        </td>
                        <td className="p-8">
                          <span className="px-5 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl font-black text-[10px] text-slate-500 uppercase">
                            {st.stage}
                          </span>
                        </td>
                        <td className="p-8 font-mono text-slate-500 font-bold">
                          {st.phone}
                        </td>
                        <td className="p-8">
                          <span className="font-black text-emerald-600">
                            {st.subscriptions?.[0]?.totalPrice ?? 0} ج.م
                          </span>
                        </td>
                        <td className="p-8 text-center">
                          <button
                            onClick={() => setActiveStudent(st)}
                            className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-[11px] shadow-lg hover:translate-y-[-2px] transition-all"
                          >
                            عرض الملف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentLevel?.students.length === 0 && (
                  <div className="p-20 text-center text-slate-400 font-black">
                    لا يوجد طلاب مسجلين في هذه المجموعة
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal: Create/Edit Group */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-12 shadow-2xl border dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[80px]" />
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black dark:text-white italic">
                  {modal.type === "CREATE" ? "إضافة مجموعة" : "تعديل البيانات"}
                </h3>
                <button
                  onClick={() =>
                    setModal({ open: false, type: "CREATE", data: null })
                  }
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
              <form
                onSubmit={handleGroupSubmit}
                className="space-y-8 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase mr-3">
                    اسم المجموعة
                  </label>
                  <input
                    name="name"
                    defaultValue={modal.data?.name}
                    required
                    placeholder="أدخل اسماً مميزاً..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl outline-none font-black dark:text-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase mr-3">
                    السعة القصوى (اختياري)
                  </label>
                  <input
                    name="maxStudents"
                    type="number"
                    defaultValue={modal.data?.maxStudents}
                    placeholder="∞"
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl outline-none font-black dark:text-white transition-all shadow-inner"
                  />
                </div>
                {modal.type === "CREATE" && currentLevel && (
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-3">
                    <Info size={18} className="text-indigo-500" />
                    <p className="text-xs font-black text-indigo-600/80 italic">
                      سيتم الإنشاء كفرع من: {currentLevel.name}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  تنفيذ العملية
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStudent && (
          <StudentDetailOverlay
            student={activeStudent}
            onClose={() => setActiveStudent(null)}
            onRemoveFromGroup={handleRemoveStudent}
          />
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
