import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Minus,
  Moon,
  Plus,
  Search,
  Smartphone,
  Sun,
  Users,
  Zap,
  Code
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import { Helmet } from 'react-helmet-async';

// هيكل البيانات المطور والملائم لمميزات "سنترك" الحقيقية
const faqData = [
  {
    category: "عن المنصة والمطور",
    icon: <HelpCircle size={20} />,
    questions: [
      {
        q: "من هو مطور ومؤسس منصة سنترك (SENTRYK)؟",
        a: "أنا، يوسف أحمد مسلم (Youssef Ahmed Mossallem). قمت بتطوير وبناء منصة سنترك كمنصة SaaS سحابية متكاملة تدمج بين كفاءة البرمجيات الحديثة والمتطلبات التشغيلية الدقيقة، لتوفير حل ذكي، سريع، وعالي الأمان لإدارة السناتر التعليمية بأعلى معايير الجودة."
      }
    ]
  },
  {
    category: "النظام والصلاحيات (Multi-Role System)",
    icon: <Users size={20} />,
    questions: [
      {
        q: "ما الفرق الدقيق بين صلاحيات الأدمن وصلاحيات السكرتارية؟",
        a: "الأدمن (صاحب السنتر) يمتلك تحكماً مطلقاً يشمل: إنشاء السنتر، إدارة وتعديل وحذف المواد والمجموعات والطلاب، إدارة محفظة الـ SMS والاشتراك المالي للموقع، والاطلاع على التقارير المالية وسجل النشاط. أما السكرتارية (Secretary) فصلاحياتهم تشغيلية فقط مثل تسجيل الطلاب الجدد، وتجديد الاشتراكات، ومتابعة الحالات وإرسال الرسائل، ولا يمكنهم حذف أي بيانات أساسية لضمان الأمان والسرية."
      },
      {
        q: "ما هو سجل النشاط (Activity Log) وكيف يحمي بيانات السنتر؟",
        a: "هو سجل أمان متقدم متاح للأدمن فقط، يقوم برصد وتوثيق كل عملية تحدث داخل النظام بشكل لحظي، حيث يسجل بدقة (من قام بالعملية، ماذا فعل، والتوقيت بالتفصيل)، مما يمنع أي تلاعب مالي أو إداري نهائياً."
      }
    ]
  },
  {
    category: "إدارة الطلاب والمجموعات والاشتراكات",
    icon: <Zap size={20} />,
    questions: [
      {
        q: "كيف يدعم النظام المجموعات الرئيسية والفرعية والتقسيم الداخلي؟",
        a: "يوفر النظام هيكلة مجموعات ذكية جداً؛ حيث يمكنك تقسيم الطلاب إلى مجموعات رئيسية (ثانوي، إعدادي)، ثم مجموعات فرعية (أولى، ثانية، ثالثة)، وصولاً إلى تقسيم داخلي مخصص كالدفعات (دفعة أ، دفعة ب). ويقوم النظام تلقائياً بعرض عدد الطلاب وإجمالي الدخل المتوقع لكل مجموعة على حدة."
      },
      {
        q: "كيف يتم احتساب أسعار اشتراكات الطلاب وتواريخ الانتهاء؟",
        a: "بمجرد إضافة الطالب واختيار المواد والمرحلة، يحسب النظام التكلفة تلقائياً بناءً على 3 أنواع مرنة من الاشتراكات يدعمها النظام: (شهري، نصف شهري، أو نظام الكورس)، مع حساب تاريخ انتهاء الاشتراك بدقة وتجديده بضغطة زر واحدة بمرونة تعديل المواد أثناء التجديد."
      },
      {
        q: "ماذا تعني الألوان الملحقة بحالات اشتراك الطلاب؟",
        a: "النظام يعتمد على واجهة بصرية ملونة لتسهيل عمل السكرتارية: اللون الأخضر يعني أن اشتراك الطالب (نشط)، واللون الأحمر ينبه السكرتارية أن الاشتراك (قرب ينتهي خلال 3 أيام)، بينما يشير اللون الأسود إلى أن الاشتراك (منتهي) تماماً ويجب تجديده."
      }
    ]
  },
  {
    category: "محفظة الرسائل SMS والتحكم التلقائي",
    icon: <Smartphone size={20} />,
    questions: [
      {
        q: "ما هي الحالات التي يقوم فيها النظام بإرسال رسائل SMS تلقائية؟",
        a: "النظام مدمج بنظام أتمتة كامل، حيث يتم إرسال رسائل SMS من رصيد محفظتك المتاحة بالسنتر فوراً في 4 حالات: عند تسجيل طالب جديد، قبل انتهاء اشتراك الطالب بـ 3 أيام، عند انتهاء الاشتراك الفعلي، وفور إتمام عملية تجديد الاشتراك بنجاح."
      }
    ]
  },
  {
    category: "الدفع والاشتراك في المنصة",
    icon: <CreditCard size={20} />,
    questions: [
      {
        q: "هل توجد فترة تجريبية للمنصة؟ وكيف يتم شحن وتفعيل الاشتراك المالي للسنتر؟",
        a: "نعم، تمنحك منصة سنترك فترة تجريبية مجانية بالكامل لمدة 14 يوماً بكافة المميزات وبصلاحيات كاملة (Full Access). بعد انتهاء التجربة، يمكنك اختيار باقة الاشتراك (شهري أو سنوي) وإتمام الدفع بأمان وسهولة عبر بوابة دفع إلكترونية مدمجة وموثوقة (Paymob)، مع توفر وضع تجريبي (Mock) للمعاينة والاختبار."
      }
    ]
  },
  {
    category: "البنية البرمجية والأداء التقني (Tech Stack)",
    icon: <Code size={20} />,
    questions: [
      {
        q: "ما هي التقنيات المستخدمة في بناء سنترك لضمان سرعتها وحمايتها؟",
        a: "تم بناء المنصة بأحدث التقنيات لضمان أعلى أداء؛ في الـ Backend نعتمد على Node.js و Express مع قاعدة بيانات PostgreSQL و Prisma ORM وحماية صارمة بـ JWT و Rate Limiting لمنع الاختراق. أما الـ Frontend فمبني باستخدام React مع TypeScript و Vite لتجربة فائقة السرعة، مدعومة بتصميم Tailwind CSS المتجاوب والمود المظلم (Dark Mode)، وإدارة حالات متكاملة وسلسة عبر Zustand."
      }
    ]
  }
];

export default function FAQ() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  return (
    <><Helmet>
  <title>
    الأسئلة الشائعة | SENTRYK - إجابات واستفسارات نظام إدارة السناتر التعليمية
  </title>

  <meta
    name="description"
    content="اعثر على إجابات جميع الأسئلة الشائعة حول منصة SENTRYK، الصلاحيات، إدارة الطلاب، الاشتراكات، الرسائل SMS، الدفع الإلكتروني، والدعم الفني."
  />

  <meta
    name="keywords"
    content="
      FAQ,
      الأسئلة الشائعة,
      SENTRYK FAQ,
      سنترك,
      دعم سنترك,
      إدارة الطلاب,
      إدارة السناتر التعليمية,
      نظام الاشتراكات,
      رسائل SMS,
      Paymob,
      صلاحيات الأدمن,
      صلاحيات السكرتارية,
      Activity Log,
      Educational Management System,
      Student Management System,
      SaaS Education
    "
  />

  <meta name="author" content="Youssef Ahmed Mossallem" />
  <meta name="creator" content="Youssef Ahmed Mossallem" />
  <meta name="publisher" content="SENTRYK" />

  <meta
    name="robots"
    content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
  />

  <meta name="googlebot" content="index,follow" />

  <link
    rel="canonical"
    href="https://sentryk.vercel.app/faq"
  />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ar_EG" />
  <meta property="og:site_name" content="SENTRYK" />

  <meta
    property="og:title"
    content="الأسئلة الشائعة | SENTRYK"
  />

  <meta
    property="og:description"
    content="كل ما تريد معرفته عن منصة SENTRYK لإدارة السناتر التعليمية والطلاب والاشتراكات والدعم الفني."
  />

  <meta
    property="og:url"
    content="https://sentryk.vercel.app/faq"
  />

  {/* Twitter */}
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="الأسئلة الشائعة | SENTRYK"
  />

  <meta
    name="twitter:description"
    content="إجابات شاملة عن جميع استفسارات منصة SENTRYK التعليمية."
  />

  {/* SEO Extras */}
  <meta name="language" content="Arabic" />
  <meta name="geo.region" content="EG" />
  <meta name="geo.country" content="Egypt" />
  <meta name="rating" content="general" />

  {/* FAQ Schema */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "من هو مطور ومؤسس منصة سنترك؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يوسف أحمد مسلم هو مطور ومؤسس منصة SENTRYK."
          }
        },
        {
          "@type": "Question",
          "name": "ما الفرق بين الأدمن والسكرتارية؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "الأدمن يمتلك جميع الصلاحيات بينما السكرتارية تمتلك صلاحيات تشغيلية محددة."
          }
        },
        {
          "@type": "Question",
          "name": "هل توجد فترة تجريبية مجانية؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، توفر منصة SENTRYK فترة تجريبية مجانية لمدة 14 يوماً."
          }
        }
      ]
    })}
  </script>
</Helmet>
    <div className={`min-h-screen ${darkMode ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-700 text-right overflow-x-hidden font-sans pb-20`} dir="rtl">
      
      {/* --- Navbar --- */}
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
              <HelpCircle size={16} /> مركز المساعدة والدعم الفني
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              لديك <span className="text-primary-600">تساؤلات؟</span> <br /> نحن نملك الإجابة.
            </h1>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={24} />
              <input 
                type="text"
                placeholder="ابحث عن ميزة، صلاحية، رسائل SMS، أو تفاصيل المطور..."
                className="w-full py-6 pr-16 pl-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-primary-600/5 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all font-bold text-lg text-right"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FAQ Content --- */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-16">
          {faqData.map((cat, idx) => {
            // فلترة الأسئلة بناءً على مدخلات البحث لضمان النظافة البرمجية
            const filteredQuestions = cat.questions.filter(
              item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      item.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // إذا كان القسم فارغاً بعد البحث، لا يتم رندرة العنوان أبداً
            if (filteredQuestions.length === 0) return null;

            return (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                  <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-black opacity-80 uppercase tracking-wider">{cat.category}</h3>
                </div>

                <div className="grid gap-4">
                  {filteredQuestions.map((item, qIdx) => {
                    const uniqueKey = `${idx}-${qIdx}`;
                    const isOpen = activeQuestion === uniqueKey;
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
                          onClick={() => setActiveQuestion(isOpen ? null : uniqueKey)}
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
            );
          })}
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
              href="/contact"
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
</>  );
}
