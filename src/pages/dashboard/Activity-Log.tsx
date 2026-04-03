import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Layers,
  LayoutGrid,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
  Clock
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

interface Log {
  id: string;
  action: string;
  user: string;
  target?: string;
  time: string;
  details?: {
    name?: string;
    studentName?: string;
  };
}

interface ActionTheme {
  label: string;
  color: string;
  icon: ReactNode;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    from: "",
    to: "",
    action: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const stringFilters: Record<string, string> = {
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        from: filters.from,
        to: filters.to,
        action: filters.action,
      };
      
      const params = new URLSearchParams(stringFilters);
      const res = await api.get(`/activity-log?${params.toString()}`);
      
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionTheme = (action: string): ActionTheme => {
    const themes: Record<string, ActionTheme> = {
      CREATE_STUDENT: { label: "إضافة طالب", color: "indigo", icon: <User size={14} /> },
      RENEW_SUBSCRIPTION: { label: "تجديد اشتراك", color: "emerald", icon: <RefreshCw size={14} /> },
      DELETE_STUDENT: { label: "حذف بيانات", color: "rose", icon: <X size={14} /> },
      UPDATE_SMS: { label: "تعديل SMS", color: "amber", icon: <Activity size={14} /> },
    };
    return themes[action] || { label: action, color: "slate", icon: <Layers size={14} /> };
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 text-right font-inter" dir="rtl">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary-600/10 rounded-2xl border border-primary-600/20 shadow-inner">
            <ShieldCheck className="text-primary-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black dark:text-white">سجل العمليات</h1>
            <p className="text-slate-400 font-bold text-xs mt-1">مراقبة أداء النظام والمسؤولين</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="البحث السريع..."
              className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500/20 text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => fetchLogs()} className="p-3.5 bg-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-600/20 transition-all active:scale-95">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <Calendar className="text-slate-400" size={16} />
          <input type="date" value={filters.from} className="bg-transparent border-none text-xs font-black dark:text-white outline-none cursor-pointer" onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <LayoutGrid className="text-slate-400" size={16} />
          <select value={filters.action} className="bg-transparent border-none text-xs font-black dark:text-white outline-none min-w-[120px]" onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
            <option value="">جميع التصنيفات</option>
            <option value="CREATE_STUDENT">إضافة طلاب</option>
            <option value="RENEW_SUBSCRIPTION">تجديدات</option>
            <option value="DELETE_STUDENT">حذف</option>
          </select>
        </div>
        <button onClick={() => setFilters({ page: 1, limit: 12, from: "", to: "", action: "" })} className="mr-auto text-xs font-black text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">إعادة تعيين</button>
      </div>

      {/* 3. Logs List */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse" />
          ))
        ) : logs.length > 0 ? (
          logs.map((log, idx) => {
            const theme = getActionTheme(log.action);
            const targetName = log.details?.name || log.details?.studentName || log.target;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={log.id}
                className="group flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-50 dark:border-slate-800/50 hover:border-primary-500/20 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none transition-all"
              >
                {/* الجزء الأول: المسؤول (تم تبسيطه وحذف الإيميل) */}
                <div className="flex items-center gap-4 min-w-[200px] w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-primary-600 shadow-inner">
                      {log.user ? log.user.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-black dark:text-white group-hover:text-primary-600 transition-colors">
                        {log.user || "غير معرف"}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block">مسؤول النظام</span>
                    </div>
                </div>

                {/* الجزء الثاني: العملية */}
                <div className="flex-1 flex flex-wrap items-center gap-4 w-full">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black border border-current bg-opacity-10 transition-all
                    ${theme.color === 'indigo' ? 'bg-indigo-500 text-indigo-600 border-indigo-200' : 
                      theme.color === 'emerald' ? 'bg-emerald-500 text-emerald-600 border-emerald-200' : 
                      theme.color === 'rose' ? 'bg-rose-500 text-rose-600 border-rose-200' : 
                      'bg-slate-500 text-slate-600 border-slate-200'}`}
                  >
                    {theme.icon}
                    {theme.label}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Fingerprint size={14} className="opacity-50" />
                    <span className="text-xs font-bold truncate max-w-[250px]">
                      {targetName ? targetName.replace("Student #", "المستهدف: ") : "تعديل عام"}
                    </span>
                  </div>
                </div>

                {/* الجزء الثالث: الوقت */}
                <div className="flex items-center gap-4 pr-6 border-r border-slate-100 dark:border-slate-800 w-full md:w-auto justify-between md:justify-end">
                   <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 justify-end">
                        <span className="text-xs font-black">{log.time?.includes(",") ? log.time.split(",")[1] : log.time}</span>
                        <Clock size={12} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{log.time?.includes(",") ? log.time.split(",")[0] : ""}</span>
                   </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-black">لا توجد سجلات متاحة حالياً</p>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="text-[11px] font-black text-slate-400 mr-4">
          عرض الصفحة {pagination.page} من {pagination.totalPages}
        </span>
        <div className="flex gap-2">
          <button disabled={pagination.page === 1} onClick={() => setFilters({ ...filters, page: pagination.page - 1 })} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all disabled:opacity-20"><ChevronRight size={18} /></button>
          <button disabled={pagination.page === pagination.totalPages} onClick={() => setFilters({ ...filters, page: pagination.page + 1 })} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all disabled:opacity-20"><ChevronLeft size={18} /></button>
        </div>
      </div>
    </div>
  );
}