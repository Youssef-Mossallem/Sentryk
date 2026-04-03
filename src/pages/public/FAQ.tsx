import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Minus,
  Moon, Plus,
  Search,
  Smartphone,
  Sun,
  Users,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';

// هيكل البيانات للأسئلة الشائعة
const faqData = [
  {
    category: "النظام والصلاحيات",
    icon: <Users size={20} />,
    questions: [
      {
        q: "ما الفرق بين حساب الأدمن وحساب السكرتارية؟",
        a: "الأدمن (صاحب السنتر) يمتلك صلاحيات كاملة تشمل إدارة المواد، تسعير المراحل، رؤية التقارير المالية، وحذف البيانات. أما السكرتارية فصلاحياتهم تقتصر على العمليات التشغيلية مثل تسجيل الطلاب، تجديد الاشتراكات، وإرسال الرسائل، ولا يمكنهم حذف البيانات الأساسية لضمان الأمان."
      },
      {
        q: "هل يمكنني إضافة أكثر من مساعد (سكرتير) في نفس الوقت؟",
        a: "نعم، نظام Sentryk Pro يتيح لك إضافة عدد غير محدود من المساعدين مع تتبع نشاط كل فرد منهم من خلال سجل النشاط (Activity Log) المتاح للأدمن فقط."
      }
    ]
  },
  {
    category: "إدارة الطلاب والاشتراكات",
    icon: <Zap size={20} />,
    questions: [
      {
        q: "كيف يتم حساب تاريخ انتهاء اشتراك الطالب؟",
        a: "النظام يقوم بحساب التاريخ تلقائياً بناءً على نوع الاشتراك (شهري، نصف شهري، أو كورس). بمجرد التجديد، يتم تحديث الحالة فوراً وإرسال إشعار للطالب إذا كانت ميزة الرسائل مفعلة."
      },
      {
        q: "ماذا تعني ألوان حالة الاشتراك؟",
        a: "الأخضر يعني أن الاشتراك نشط، الأحمر ينبهك أن الاشتراك سينتهي خلال 3 أيام، والأسود يعني أن الاشتراك قد انتهى بالفعل ويجب التجديد."
      }
    ]
  },
  {
    category: "نظام الـ SMS والشحن",
    icon: <Smartphone size={20} />,
    questions: [
      {
        q: "هل الرسائل التلقائية تستهلك رصيداً إضافياً؟",
        a: "الرسائل تستهلك من محفظة الرسائل الخاصة بك في النظام. يمكنك شحن المحفظة في أي وقت، وسيتم خصم رسالة واحدة لكل عملية تلقائية (مثل رسالة الترحيب أو تنبيه انتهاء الاشتراك)."
      },
      {
        q: "هل يمكنني تخصيص نص الرسائل المرسلة للطلاب؟",
        a: "نعم، يمكنك من خلال الإعدادات ضبط القوالب الجاهزة للرسائل التلقائية لتناسب اسم السنتر الخاص بك وأسلوبك في التواصل."
      }
    ]
  },
  {
    category: "الدفع والاشتراك في المنصة",
    icon: <CreditCard size={20} />,
    questions: [
      {
        q: "هل توجد فترة تجريبية قبل الدفع؟",
        a: "بالطبع، نوفر لك 14 يوماً تجربة مجانية بكافة المميزات (Full Access) لتتمكن من تجربة النظام بالكامل داخل السنتر الخاص بك قبل اتخاذ قرار الاشتراك."
      },
      {
        q: "ماذا يحدث لبياناتي إذا انتهى اشتراكي في الموقع؟",
        a: "بياناتك تظل محفوظة ومشفرة تماماً لمدة 30 يوماً بعد انتهاء الاشتراك. يمكنك استعادتها فور تجديد الاشتراك في أي وقت خلال هذه الفترة."
      }
    ]
  }
];

export default function FAQ() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-700 text-right overflow-x-hidden font-sans pb-20`} dir="rtl">
      
      {/* --- Navbar (نفس الستايل لتوحيد الهوية) --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#030712]/40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">SENTRYK</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all">
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <Link to="/" className="text-lg font-bold hover:text-primary-600 transition-colors flex items-center gap-2 group">
              <span>الرئيسية</span>
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-44 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-600/10 text-primary-600 font-black text-sm mb-6 border border-primary-600/20">
              <HelpCircle size={16} /> مركز المساعدة والدعم
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              لديك <span className="text-primary-600">تساؤلات؟</span> <br /> نحن نملك الإجابة.
            </h1>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={24} />
              <input 
                type="text"
                placeholder="ابحث عن ميزة، اشتراك، أو طريقة دفع..."
                className="w-full py-6 pr-16 pl-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-primary-600/5 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all font-bold text-lg"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FAQ Content --- */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-16">
          {faqData.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black opacity-80 uppercase tracking-wider">{cat.category}</h3>
              </div>

              <div className="grid gap-4">
                {cat.questions.filter(item => item.q.includes(searchQuery) || item.a.includes(searchQuery)).map((item, qIdx) => {
                  const isOpen = activeQuestion === `${idx}-${qIdx}`;
                  return (
                    <motion.div 
                      key={qIdx}
                      layout
                      className={`overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${
                        isOpen 
                        ? 'bg-white dark:bg-slate-900 border-primary-600/50 shadow-2xl shadow-primary-600/10' 
                        : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-primary-600/30'
                      }`}
                    >
                      <button 
                        onClick={() => setActiveQuestion(isOpen ? null : `${idx}-${qIdx}`)}
                        className="w-full p-8 flex items-center justify-between text-right"
                      >
                        <span className={`text-xl font-black leading-snug transition-colors ${isOpen ? 'text-primary-600' : ''}`}>
                          {item.q}
                        </span>
                        <div className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all ${isOpen ? 'bg-primary-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-8 pb-8 text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-6">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="px-6 mt-20">
        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary-600 to-blue-700 text-white relative overflow-hidden shadow-3xl shadow-primary-600/40">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-right">
              <h2 className="text-4xl md:text-5xl font-black mb-4">مازلت تبحث عن إجابات؟</h2>
              <p className="text-xl font-bold opacity-80">فريق الدعم الفني متواجد لمساعدتك في أي وقت على مدار الساعة.</p>
            </div>
            <a 
              href="/contact" // ضع رقم الواتساب هنا
              className="px-10 py-6 bg-white text-primary-600 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
            >
              <MessageSquare size={24} />
              تحدث معنا الآن
            </a>
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-black/10 blur-3xl rounded-full"></div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="mt-20 py-10 border-t border-slate-200/50 dark:border-slate-800/50 text-center opacity-40">
        <p className="text-xs font-black tracking-[0.5em]">
          SENTRYK SUPPORT SYSTEM • YOUR PARTNER IN EDUCATION
        </p>
      </footer>
    </div>
  );
}