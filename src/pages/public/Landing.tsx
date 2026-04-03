import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgePercent,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageSquare,
  Moon,
  MousePointerClick,
  ShieldAlert,
  Sparkles,
  Sun,
  Users,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';

const premiumFeatures = [
  {
    icon: <ShieldAlert className="w-7 h-7" />,
    title: "منظومة أمان مالي متكاملة",
    desc: "صممنا النظام بحيث تظل السيطرة الكاملة في يدك. السكرتارية والمساعدون لديهم صلاحيات محددة، بينما تملك أنت وحدك حق الرقابة والتعديل لضمان أعلى مستويات الأمان."
  },
  {
    icon: <MessageSquare className="w-7 h-7" />,
    title: "تواصل ذكي مع أولياء الأمور",
    desc: "عزز من هيبة مركزك التعليمي عبر رسائل SMS تلقائية واحترافية؛ تصل لولي الأمر فور الاشتراك أو التجديد، مما يبني جسراً من الثقة والمصداقية."
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "لوحة تحكم ذكية وشاملة",
    desc: "وداعاً للدفاتر الورقية. تابع نمو أعداد طلابك، صافي أرباحك، وتقاريرك الشهرية من خلال واجهة تحليلية دقيقة تضع الحقيقة أمام عينيك لحظة بلحظة."
  },
  {
    icon: <BadgePercent className="w-7 h-7" />,
    title: "إدارة الاشتراكات بالألوان",
    desc: "نظام بصري ذكي يسهل عمل فريقك؛ الطلاب النشطون بالأخضر، ومن أوشك اشتراكهم على الانتهاء بالأحمر، لضمان استمرارية التحصيل دون أخطاء."
  },
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: "هيكلة المواد والمجموعات",
    desc: "نظم حصصك ومجموعاتك بمرونة كاملة، مع إمكانية تخصيص أسعار مختلفة لكل مرحلة دراسية وأنظمة اشتراك متنوعة تناسب أسلوبك في التدريس."
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "رقابة إدارية دقيقة",
    desc: "سجل نشاط متكامل يرصد كل عملية تتم داخل النظام؛ لتعرف 'من فعل ماذا ومتى'. هدوء البال يأتي عندما تعرف أن كل شيء يسير وفق خطتك."
  }
];

export default function Landing() {
  const { darkMode, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-500 overflow-hidden text-right" dir="rtl">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#030712]/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
              <Zap size={26} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">SENTRYK</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="hidden md:block font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 px-4">دخول المعلمين</Link>
            <Link to="/signup" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25">ابدأ فترتك التجريبية</Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-44 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-600 mb-8 font-bold text-sm">
            <Sparkles size={18} />
            <span>نظام الإدارة الأكثر تطوراً للمعلمين المحترفين في مصر</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-[5.5rem] font-black leading-[1.15] mb-8 dark:text-white tracking-tight">
            حول مركزك التعليمي <br />
            إلى <span className="text-primary-600 italic">منظومة</span> ذكية
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
            سنتريك ليس مجرد برنامج لإدارة الطلاب، بل هو شريكك الإداري الذي يضمن لك الأمان المالي والاحترافية أمام أولياء الأمور. صُمم خصيصاً ليخلصك من عشوائية الورق وتلاعب البيانات، لتتفرغ أنت لما تبدع فيه: التدريس.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-5">
             <Link to="/signup" className="px-14 py-6 bg-primary-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary-600/40 hover:bg-primary-700 hover:-translate-y-2 transition-all flex items-center gap-4 group">
               انضم لنخبة المعلمين الآن
               <ArrowLeft className="group-hover:-translate-x-2 transition-transform" />
             </Link>
          </motion.div>

          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-500 font-bold">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> لا يتطلب بطاقة ائتمان</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> تجربة مجانية شاملة</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> دعم فني احترافي</div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px] -z-10"></div>
      </section>

      {/* --- Value Proposition Section --- */}
      <section className="py-24 px-6 bg-white/40 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 dark:text-white">لماذا يختار المحترفون "سنتريك"؟</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold italic text-xl max-w-3xl mx-auto">نحن لا نقدم مجرد مميزات تقنية، بل نقدم حلاً جذرياً لمشاكل الإدارة اليومية التي تواجه كل معلم ناجح.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -12 }}
                className="p-10 rounded-[3.5rem] bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-lg">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- High Prestige Section --- */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-primary-950 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
                <GraduationCap size={70} className="mx-auto mb-8 text-primary-500" />
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">استعد وقتك المفقود.. <br/> وعزز قيمة عملك</h2>
                <p className="text-xl md:text-2xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto italic">"الإدارة الناجحة هي نصف نجاح المدرس. سنتريك يضمن لك منظومة تعمل بدقة الساعة السويسرية."</p>
                <Link to="/signup" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-2xl hover:bg-primary-50 hover:scale-105 transition-all shadow-xl">
                    ابدأ تجربتك الآن
                    <MousePointerClick />
                </Link>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-right">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-primary-600" />
              <span className="text-2xl font-black dark:text-white tracking-tighter">SENTRYK</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              نظام سنتريك هو الشريك المثالي للمدرس الخصوصي الناجح. نخلصك من تعقيدات الورق والملفات لتركز على طلابك فقط.
            </p>
          </div>
          
          <div>
            <h4 className="font-black mb-6 dark:text-white text-xl">اكتشف</h4>
            <ul className="space-y-4 font-bold text-slate-500 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-primary-600">عن سنتريك</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600">طلب مساعدة</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600"> الاساله الشائعة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 dark:text-white text-xl">قانوني</h4>
            <ul className="space-y-4 font-bold text-slate-500 dark:text-slate-400">
              <li><Link to="/policy" className="hover:text-primary-600">اتفاقية الخدمة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 dark:text-white text-xl">تواصل معنا</h4>
            <div className="flex gap-4 mb-6">
              <Link to="/contact" className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                <Mail size={22} />
              </Link>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">دعم فني متاح على مدار الساعة</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 dark:border-slate-800/50 text-center">
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} SENTRYK PRO. BY DEVELOPERS FOR EDUCATORS
          </p>
        </div>
      </footer>
    </div>
  );
}