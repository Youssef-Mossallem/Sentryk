import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  EyeOff,
  FileText,
  Gavel,
  Lock,
  Mail,
  Moon,
  RefreshCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCheck,
  CreditCard,
  Database,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useThemeStore } from '../../store/useThemeStore';

export default function Policy() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>('terms');

  const tabs = [
    { id: 'terms', label: 'اتفاقية الاستخدام والتعاقد', icon: <Scale size={20} /> },
    { id: 'privacy', label: 'خصوصية وحماية البيانات', icon: <ShieldCheck size={20} /> },
    { id: 'refund', label: 'السياسة المالية والاسترداد', icon: <RefreshCcw size={20} /> },
  ];

  // 🧠 بيانات مهيكلة متقدمة (JSON-LD) لتغذية نماذج الـ AI ومحركات البحث بالفلسفة القانونية للمنصة
  const legalSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "الميثاق القانوني والسياسات التنظيمية | SENTRYK PRO",
    "description": "الوثيقة القانونية والتشريعية الرسمية لمنظومة سنترك برو لإدارة المراكز التعليمية، وتشمل شروط الخدمة، سياسة الخصوصية وحماية بيانات الطلاب وفقاً للقوانين السيادية، وأنظمة الدفع والاسترداد.",
    "publisher": {
      "@type": "Organization",
      "name": "SENTRYK PRO",
      "developer": {
        "@type": "Person",
        "name": "Youssef Ahmad El-Sayed Muslim"
      }
    },
    "mainEntity": [
      {
        "@type": "DigitalDocument",
        "name": "Terms of Service",
        "version": "2.0.0",
        "dateModified": "2026-06-27"
      },
      {
        "@type": "DigitalDocument",
        "name": "Privacy Policy",
        "version": "2.0.0",
        "dateModified": "2026-06-27"
      }
    ]
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 text-right overflow-x-hidden pb-20 font-sans`} dir="rtl">
      
      {/* 🚀 الرأس السيادي لتهيئة المحرك وفهرسة عناكب الـ AI والـ SEO */}
      <Helmet>
        <title>الميثاق القانوني والسياسات التنظيمية | SENTRYK PRO</title>
        <meta name="title" content="الميثاق القانوني والسياسات التنظيمية | SENTRYK PRO" />
        <meta name="description" content="الوثيقة الدستورية والقانونية الحاكمة لمنظومة سنترك برو (SENTRYK PRO). تعرف على شروط التعاقد والامتثال الأمني وحقوق حماية البيانات والسياسات المالية لعام 2026." />
        <meta name="keywords" content="شروط خدمة سنترك, سياسة خصوصية Sentryk Pro, حماية بيانات الطلاب, يوسف مسلم, احمد مسلم, نظام إدارة السناتر, الامتثال القانوني الرقمي, الدفع الالكتروني paymob" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="government" />
        <meta property="og:url" content="https://sentryk.vercel.app/policy" />
        <meta property="og:title" content="الميثاق القانوني والسياسات التنظيمية | SENTRYK PRO" />
        <meta property="og:description" content="اتفاقية الاستخدام الرسمية وحماية الملكية الفكرية والأمن السيبراني لبيانات المراكز التعليمية والطلاب المسجلين بكروت QR." />
        <meta property="og:image" content="https://sentryk.vercel.app/og-legal.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="الميثاق القانوني والسياسات التنظيمية | SENTRYK PRO" />
        <meta name="twitter:description" content="بنود وشروط استخدام منظومة Sentryk Pro وحفظ الحقوق المالية وحقوق التعويض البرمجي المعتمدة." />

        {/* حقن الـ Schema برمجياً */}
        <script type="application/ld+json">
          {JSON.stringify(legalSchema)}
        </script>
      </Helmet>

      {/* --- الهيدر الفاخر (Navbar) --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-[#030712]/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-xl group-hover:bg-indigo-500/40 transition-all"></div>
              <div className="relative w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 overflow-hidden border border-white/10">
                <img src="/favicon.svg" alt="Sentryk Logo" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-l from-indigo-600 to-blue-500 bg-clip-text text-transparent">SENTRYK <span className="text-indigo-600 text-sm align-super">PRO</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200/40 dark:border-slate-700/40"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <Link to="/" className="text-base font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
              <span>الرئيسية</span>
              <ChevronLeft size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- شاشة البداية الديناميكية (Hero Section) --- */}
      <section className="pt-44 pb-12 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/5 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-black text-sm mb-6 border border-indigo-600/20">
              <Gavel size={16} /> الامتثال التشريعي والدستوري الرقمي لعام 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              الميثاق القانوني <br /> <span className="bg-gradient-to-l from-indigo-600 to-blue-500 bg-clip-text text-transparent">والسياسات التنظيمية</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-4 font-medium leading-relaxed">
              وثيقة معاهدة الاستخدام الآمن والشفافية التشغيلية والمالية الحاكمة للعلاقة بين إدارة السناتر التابعة للمستخدم والمطور المستقل لمنظومة سنترك برو.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- التحكم بالتبويبات التفاعلية (Tabs Control) --- */}
      <section className="px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-12 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4.5 rounded-2xl font-black transition-all duration-300 border ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-600/40 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span className="text-base md:text-lg">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* --- عرض المحتوى القانوني التكيفي الشامل --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-l from-indigo-600 to-blue-500"></div>

              {/* === TAB 1: TERMS OF SERVICE === */}
              {activeTab === 'terms' && (
                <div className="space-y-12">
                  <header className="space-y-3">
                    <div className="inline-flex p-3.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/10">
                      <Scale size={30} />
                    </div>
                    <h2 className="text-3xl font-black">اتفاقية شروط الخدمة والتعاقد المشترك</h2>
                    <p className="text-slate-400 text-base font-medium">اللوائح الإلزامية المنظمة لاستخدام التراخيص البرمجية وحقوق الملكية الفكرية.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 dark:text-slate-400 text-[16px] leading-relaxed font-medium">
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-lg">
                        <UserCheck size={20} className="text-indigo-600" />
                        <h3>الأهلية والتعاقد القانوني</h3>
                      </div>
                      <p>يقر المستخدم بإنشاء هذا الحساب بصفته ممثلاً قانونياً أو مالكاً للمركز التعليمي (السنتر) وأنه قد بلغ السن القانوني للتعاقد والإبرام المالي (21 عاماً ميلادياً) وفقاً لأحكام القانون المدني المصري، ويتحمل التبعات القانونية والتعاقدية لقراراته المالية داخل المنظومة.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-lg">
                        <Briefcase size={20} className="text-indigo-600" />
                        <h3>حقوق الملكية الفكرية والبرمجية</h3>
                      </div>
                      <p>إن كافة الأكواد البرمجية، التصاميم الهندسية، قواعد البيانات، والواجهات الرسومية لمنظومة SENTRYK PRO هي ملكية فكرية مطلقة وحصرية للمطور المستقل (يوسف أحمد السيد مسلم). يُحظر تماماً هندسة النظام عكسياً، تفكيكه، أو محاولة نسخ الشيفرات البرمجية، وأي مخالفة تعرض الفاعل للملاحقة الجنائية الفورية.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-lg">
                        <Gavel size={20} className="text-indigo-600" />
                        <h3>القانون السيادي والولاية القضائية</h3>
                      </div>
                      <p>تخضع هذه الاتفاقية بنصوصها وتفسيراتها لقوانين جمهورية مصر العربية (بما في ذلك قانون مكافحة جرائم تقنية المعلومات رقم 175 لسنة 2018). وينعقد الاختصاص القضائي الحصري والوحيد للنظر في أي نزاع تشغيلي أو تعاقدي لمحاكم القاهرة بمختلف درجاتها تيسيراً لحفظ الحقوق.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-lg">
                        <ShieldAlert size={20} className="text-indigo-600" />
                        <h3>حدود المسؤولية التشغيلية</h3>
                      </div>
                      <p>يخلي المطور مسؤوليته الكاملة عن أي خسائر تجارية أو أخطاء حسابية ناتجة عن إساءة استخدام الصلاحيات الإدارية من قبل السكرتارية أو المساعدين. دور المنصة هو توفير الأدوات التقنية المتكاملة، وتظل مسؤولية مراجعة الحسابات والتحقق من المبالغ النقدية داخل السنتر منوطة بصاحب الحساب.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: PRIVACY POLICY === */}
              {activeTab === 'privacy' && (
                <div className="space-y-12">
                  <header className="space-y-3">
                    <div className="inline-flex p-3.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/10">
                      <Lock size={30} />
                    </div>
                    <h2 className="text-3xl font-black">ميثاق حماية البيانات والخصوصية المطلقة</h2>
                    <p className="text-slate-400 text-base font-medium">الالتزام الصارم بتأمين بيانات الطلاب، المعلمين، وسجلات الحضور والغياب والرسائل السحابية.</p>
                  </header>

                  <div className="space-y-8 text-slate-600 dark:text-slate-400 text-[16px] leading-relaxed font-medium">
                    <div className="p-8 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row gap-6 items-start">
                      <div className="p-3 bg-emerald-500 text-white rounded-xl"><Database size={24} /></div>
                      <div className="space-y-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-xl">الامتثال لقانون حماية البيانات الشخصية</h4>
                        <p>تلتزم منصة سنترك برو التزاماً تقنياً وقانونياً صارماً ببنود قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020. نعلن بشكل واضح وجازم أننا **لا نبيع، لا نشارك، ولا نكشف** عن أرقام هواتف الطلاب أو أولياء أمورهم أو سجلات غيابهم لأي جهة إعلانية أو طرف ثالث أياً كان؛ البيانات ملك للسنتر حصرياً.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                          <EyeOff size={18} className="text-indigo-600" /> التشفير والأمن السيبراني
                        </h4>
                        <p>يتم تخزين ومعالجة كافة كلمات المرور وبيانات المعاملات المالية الحيوية باستخدام بروتوكولات تشفير متقدمة (End-to-End Encryption) عبر خوادم سحابية محمية بجدران نار نفاذة، مما يضمن استحالة الوصول إليها أو تسريبها من أي طرف خارجي غير مصرح له.</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                          <Mail size={18} className="text-indigo-600" /> قنوات التراسل الرسمية والتنبيهات
                        </h4>
                        <p>تعتبر المراسلات والإخطارات المرسلة عبر البريد الإلكتروني المسجل في النظام، أو الإشعارات الإدارية الداخلية الموجهة لحساب الأدمن، هي الوسائل الرسمية الوحيدة المعتمدة قانوناً لإبلاغ المستخدم بأي تحديثات أمنية أو تعديلات تطرأ على ميثاق الخصوصية.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: REFUND & PAYMENT === */}
              {activeTab === 'refund' && (
                <div className="space-y-12">
                  <header className="space-y-3">
                    <div className="inline-flex p-3.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/10">
                      <CreditCard size={30} />
                    </div>
                    <h2 className="text-3xl font-black">السياسات المالية، شحن المحافظ، والتعويض</h2>
                    <p className="text-slate-400 text-base font-medium">القواعد الحاكمة لبوابات الدفع الإلكتروني، تجديد الاشتراكات السنوية، والضمان المالي النقدي للبيانات.</p>
                  </header>

                  <div className="space-y-8 text-slate-600 dark:text-slate-400 text-[16px] leading-relaxed font-medium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-indigo-600" /> الباقة التجريبية وقرار الاشتراك
                        </h4>
                        <p>تمنح المنظومة كافة المستخدمين الجدد فترة تجريبية مجانية (Trial) مدتها 14 يوماً بكامل الصلاحيات والمميزات دون قيود. قيام المستخدم بدفع قيمة الاشتراك (شهرياً أو سنوياً) بعد انتهاء هذه المدة يعد إقراراً قانونياً قاطعاً برضاه التام وعلمه النافي للجهالة بجودة وملاءمة النظام لكافة احتياجات مركزه التعليمي.</p>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                          <AlertTriangle size={18} className="text-indigo-600" /> سياسة عدم الاسترجاع النقدي لقاء الخدمة الرقمية
                        </h4>
                        <p>نظراً لطبيعة المنتجات البرمجية الرقمية السحابية التي يتم تفعيل خصائصها وموارد سيرفراتها فوراً وبشكل آلي، فإن المبالغ المدفوعة للاشتراكات (سواء باقات تجديد السنتر أو شحن محفظة رسائل الواتساب السحابية عبر بوابة الدفع Paymob) تكون نهائية وغير قابلة للاسترداد النقدي. ويحق للمستخدم إلغاء التجديد التلقائي للباقات في أي وقت يريده.</p>
                      </div>
                    </div>

                    <div className="p-8 bg-indigo-600/5 rounded-2xl border border-indigo-500/20 space-y-3">
                      <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-xl flex items-center gap-2">
                        <FileText size={22} /> بند الضمان الذهبي لحماية السجلات والتعويض المالي
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300">
                        لأن استقرار سنترك هو أولويتنا الكبرى: في حال حدوث أي خلل فني أو عطل برمجي جسيم من طرف السيرفرات السحابية الرئيسية للمنظومة يترتب عليه -لا قدر الله- فقدان كامل ونهائي لقاعدة بيانات الطلاب أو سجلات حضورهم (Data Loss) دون وجود نسخة احتياطية يمكن استعادتها، **يلتزم المطور التزاماً مالياً وقانونياً برد كامل قيمة الاشتراك الجاري المدفوع فوراً للمستخدم وبشكل نقدي**، كتعويض نهائي وشامل عن الضرر الفني الناتج.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* شارة التوثيق والإصدار القانوني المعياري */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest border border-slate-200/30 dark:border-slate-700/30 shadow-inner">
              <ShieldCheck size={16} className="text-indigo-600" />
              تاريخ الاعتماد التشريعي: 27 يونيو 2026 — الإصدار المطور 2.0.0
            </div>
          </div>
        </div>
      </section>

      {/* --- قسم المساعدة السريعة ودعم الميثاق --- */}
      <section className="max-w-4xl mx-auto px-6 mt-16 text-center">
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-right flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hidden sm:inline-block"><HelpCircle size={24} /></div>
            <div>
              <h4 className="font-black text-lg">لديك استفسار خاص ببنود الامتثال؟</h4>
              <p className="text-slate-400 text-sm font-medium">إذا كنت بحاجة إلى صياغة عقد مخصص لسنترك العملاق، يمكنك التحدث معنا.</p>
            </div>
          </div>
          <Link to="/contact" className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-sm font-black hover:opacity-90 transition-opacity whitespace-nowrap">
            طلب استشارة قانونية تقنية
          </Link>
        </div>
      </section>

      {/* --- الفوتر القانوني السيادي (Footer) --- */}
      <footer className="mt-24 py-10 border-t border-slate-200/50 dark:border-slate-800/50 text-center opacity-40">
        <p className="text-xs font-black tracking-[0.4em] text-slate-500 dark:text-slate-400 uppercase">
          SENTRYK LEGAL OFFICE • ENFORCED UNDER EGYPTIAN DIGITAL LAWS • ARCHITECTURE BY YOUSSEF MUSLIM
        </p>
      </footer>

    </div>
  );
}