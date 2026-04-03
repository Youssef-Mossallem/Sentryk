import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// مكون الكارت الموحد بتصميم عصري
const DashboardCard = ({ title, value, icon, color, footerText, trend, subtitle }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
  >
    {/* خلفية جمالية خفيفة */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 shadow-inner`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend === 'up' ? 'صعود' : 'هبوط'}
        </div>
      )}
    </div>

    <div className="mt-6 relative z-10">
      <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black dark:text-white tracking-tight">
          {value ?? 0}
        </h3>
        {subtitle && <span className="text-xs font-bold text-slate-400">{subtitle}</span>}
      </div>
      {footerText && (
        <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
          <Activity size={12} className={`text-${color}-500`} />
          {footerText}
        </div>
      )}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <Zap className="text-primary-600 animate-bounce" size={48} />
            <div className="absolute inset-0 blur-xl bg-primary-500/20 animate-pulse rounded-full" />
        </div>
        <p className="font-black text-slate-400 text-sm animate-pulse">جاري تحضير البيانات الأسطورية...</p>
    </div>
  );

  const { students, revenue, sms, content, recentActivity } = stats || {};

  return (
    <div className="space-y-8 pb-10 px-2 md:px-0">
      
      {/* قسم الترحيب العلوي */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">لوحة التحكم</h1>
            <p className="text-slate-500 font-bold text-sm">أهلاً بك، إليك ملخص أداء السنتر اليوم.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">النظام يعمل بكفاءة</span>
        </div>
      </div>

      {/* 1. قسم الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="إجمالي الطلاب" 
          value={students?.total} 
          icon={<Users size={24} />} 
          color="blue"
          footerText={`${students?.active ?? 0} طالب لديهم اشتراكات فعالة`}
        />
        
        <DashboardCard 
          title="إيرادات الشهر" 
          value={revenue?.thisMonth?.toLocaleString()} 
          subtitle="ج.م"
          icon={<CreditCard size={24} />} 
          color="emerald"
          trend={revenue?.trend}
          footerText={`الفرق: ${revenue?.difference > 0 ? '+' : ''}${revenue?.difference} ج.م`}
        />

        <DashboardCard 
          title="رصيد الرسائل" 
          value={sms?.messages} 
          subtitle="رسالة"
          icon={<MessageSquare size={24} />} 
          color="amber"
          footerText={`القيمة المالية: ${sms?.balanceInMoney} ج.م`}
        />

        <DashboardCard 
          title="المحتوى الدراسي" 
          value={content?.subjects} 
          subtitle="مادة"
          icon={<BookOpen size={24} />} 
          color="purple"
          footerText={`${content?.groups ?? 0} مجموعة مسجلة بالمركز`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. قسم سجل النشاط */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                <ArrowRightLeft className="text-primary-600" size={24} />
                آخر العمليات والأنشطة
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <AnimatePresence>
                {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((log: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xs font-black text-primary-600 shrink-0">
                        {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                            <p className="text-sm font-bold dark:text-white truncate">
                            <span className="text-primary-600 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-lg ml-2">{log.user}</span> 
                            {log.action}
                            </p>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md w-fit shrink-0">
                            {log.time}
                            </span>
                        </div>
                        {log.target && (
                            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {log.target}
                            </p>
                        )}
                        </div>
                    </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">لا توجد سجلات حتى اللحظة</p>
                    </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 3. قسم التنبيهات الجانبية */}
        <div className="space-y-6">
          {/* كارت التنبيه العاجل (Near Expiry) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-rose-600 dark:bg-rose-600/20 p-8 rounded-[3.5rem] border border-rose-500/20 shadow-2xl shadow-rose-500/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-rose-100 dark:text-rose-400 mb-4">
                <Zap size={20} fill="currentColor" />
                <span className="font-black text-xs uppercase tracking-widest">تنبيه انتهاء الاشتراك</span>
              </div>
              <h4 className="text-white font-black text-2xl mb-1 leading-tight">
                {students?.nearExpiry ?? 0} طالب
              </h4>
              <p className="text-rose-100/70 text-xs font-bold mb-8 italic">تنتهي اشتراكاتهم خلال الـ 72 ساعة القادمة</p>
              
              <button className="w-full py-4 bg-white dark:bg-rose-600 text-rose-600 dark:text-white rounded-[2rem] font-black text-xs shadow-xl hover:shadow-white/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                عرض القائمة كاملة
                <ArrowRightLeft size={14} className="rotate-180" />
              </button>
            </div>
          </motion.div>

          {/* إحصائيات إضافية */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <h4 className="font-black dark:text-white mb-6 flex items-center gap-3 text-sm">
              <div className="w-2 h-6 bg-primary-500 rounded-full" />
              إحصائيات إضافية
            </h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">اشتراكات</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">منتهية تماماً</span>
                  </div>
                  <span className="text-2xl font-black text-rose-500">{students?.expired ?? 0}</span>
               </div>
               
               <div className="flex justify-between items-center p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">نشاط الرسائل</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">مرسلة هذا الشهر</span>
                  </div>
                  <span className="text-2xl font-black text-primary-500">{sms?.sentThisMonth ?? 0}</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}