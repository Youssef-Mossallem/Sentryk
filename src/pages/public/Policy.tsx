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
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import { Helmet } from "react-helmet-async";

export default function Policy() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>('terms');

  const tabs = [
    { id: 'terms', label: 'اتفاقية الاستخدام', icon: <Scale size={18} /> },
    { id: 'privacy', label: 'خصوصية البيانات', icon: <ShieldCheck size={18} /> },
    { id: 'refund', label: 'الضمان والاسترداد', icon: <RefreshCcw size={18} /> },
  ];

  return (
    <><Helmet>
  <title>
    الشروط والأحكام وسياسة الخصوصية | SENTRYK
  </title>

  <meta
    name="description"
    content="اطلع على الشروط والأحكام وسياسة الخصوصية وسياسة الاسترداد الخاصة بمنصة SENTRYK لإدارة السناتر التعليمية. تعرف على حقوقك والتزاماتك وكيفية حماية بياناتك."
  />

  <meta
    name="keywords"
    content="
      شروط الاستخدام,
      سياسة الخصوصية,
      سياسة الاسترداد,
      اتفاقية الاستخدام,
      حماية البيانات,
      SENTRYK,
      سنترك,
      Privacy Policy,
      Terms of Service,
      Refund Policy,
      Data Protection,
      Educational Management System,
      SaaS Legal Policy
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
    href="https://sentryk.vercel.app/policy"
  />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="SENTRYK" />
  <meta property="og:locale" content="ar_EG" />

  <meta
    property="og:title"
    content="الشروط والأحكام وسياسة الخصوصية | SENTRYK"
  />

  <meta
    property="og:description"
    content="تعرف على شروط استخدام منصة SENTRYK وسياسة الخصوصية وحماية البيانات وسياسة الاسترداد."
  />

  <meta
    property="og:url"
    content="https://sentryk.vercel.app/policy"
  />

  {/* Twitter */}
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="الشروط والأحكام | SENTRYK"
  />

  <meta
    name="twitter:description"
    content="الشروط القانونية وسياسة الخصوصية وسياسة الاسترداد الخاصة بمنصة SENTRYK."
  />

  {/* Extra SEO */}
  <meta name="language" content="Arabic" />
  <meta name="geo.region" content="EG" />
  <meta name="geo.country" content="Egypt" />
  <meta name="rating" content="general" />

  {/* Legal Schema */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms and Privacy Policy",
      url: "https://sentryk.vercel.app/policy",
      description:
        "الشروط والأحكام وسياسة الخصوصية وسياسة الاسترداد الخاصة بمنصة SENTRYK.",
      publisher: {
        "@type": "Organization",
        name: "SENTRYK"
      },
      author: {
        "@type": "Person",
        name: "Youssef Ahmed Mossallem"
      },
      about: [
        "Terms of Service",
        "Privacy Policy",
        "Refund Policy",
        "Data Protection"
      ]
    })}
  </script>
</Helmet>
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right overflow-x-hidden pb-20 font-sans" dir="rtl">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#030712]/40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">SENTRYK</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all">
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <Link to="/" className="text-lg font-bold text-slate-800 dark:text-white hover:text-primary-600 transition-colors flex items-center gap-2 group">
              <span>الرئيسية</span>
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Page Header --- */}
      <section className="pt-48 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black dark:text-white mb-6 leading-tight"
          >
            الميثاق القانوني <span className="text-primary-600 italic">والتنظيمي</span>
          </motion.h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
            توضح هذه الوثيقة الالتزامات القانونية المتبادلة لضمان بيئة تعليمية رقمية آمنة ومستقرة.
          </p>
        </div>
      </section>

      {/* --- Policy Section --- */}
      <section className="px-6 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Tabs Control */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-10 py-5 rounded-[1.5rem] font-black transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/30 scale-105' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-primary-600/40 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span className="text-lg">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-10 md:p-20 shadow-sm relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-l from-primary-600 to-transparent opacity-20"></div>

              {/* --- 1. Terms of Use --- */}
              {activeTab === 'terms' && (
                <div className="space-y-12">
                  <header className="space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-primary-600/10 text-primary-600 mb-2">
                      <Scale size={32} />
                    </div>
                    <h2 className="text-4xl font-black dark:text-white">شروط الخدمة والتعاقد</h2>
                    <p className="text-slate-500 font-bold italic underline decoration-primary-600/30">تحكم هذه الاتفاقية العلاقة القانونية بين المستخدم والطرف الأول (المطور المستقل).</p>
                  </header>

                  <div className="space-y-10 text-slate-600 dark:text-slate-400 leading-[1.8] text-lg font-medium">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <UserCheck size={24} className="text-primary-600" />
                            <h3>الأهلية القانونية (شرط السن)</h3>
                        </div>
                        <p>يقر المستخدم عند إنشاء حساب بأنه قد بلغ السن القانوني للإبرام والتعاقد (21 عاماً ميلادياً) وفقاً للقوانين المصرية المعمول بها، وأنه يمتلك كامل الأهلية القانونية لاستخدام المنصة والوفاء بالالتزامات المالية.</p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <Gavel size={24} className="text-primary-600" />
                            <h3>القانون الواجب التطبيق والولاية القضائية</h3>
                        </div>
                        <p>تخضع هذه الاتفاقية بكافة بنودها وتفسيراتها لقوانين جمهورية مصر العربية. وينعقد الاختصاص الحصري في نظر أي نزاع قد ينشأ عن استخدام المنصة لمحاكم القاهرة بجمهورية مصر العربية بمختلف درجاتها.</p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <ShieldAlert size={24} className="text-primary-600" />
                            <h3>حدود المسؤولية القانونية (Limitation of Liability)</h3>
                        </div>
                        <p className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border-r-4 border-red-500/50 text-sm">
                            إلى أقصى حد يسمح به القانون، يخلي الطرف الأول (يوسف أحمد السيد مسلم) مسؤوليته عن أي خسائر غير مباشرة، أو تبعية، أو خسارة في الأرباح أو البيانات ناتجة عن استخدام المنصة. كما لا يتحمل المطور أي مسؤولية تجاه ادعاءات أطراف ثالثة ناتجة عن المحتوى الذي يرفعه المعلم أو المساعدين التابعين له.
                        </p>
                    </section>
                  </div>
                </div>
              )}

              {/* --- 2. Privacy Policy --- */}
              {activeTab === 'privacy' && (
                <div className="space-y-12">
                  <header className="space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-primary-600/10 text-primary-600 mb-2">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-4xl font-black dark:text-white">سياسة خصوصية البيانات</h2>
                    <p className="text-slate-500 font-bold italic underline decoration-primary-600/30">التزامنا تجاه أمن معلوماتك وبيانات طلابك.</p>
                  </header>

                  <div className="space-y-10 text-slate-600 dark:text-slate-400 leading-[1.8] text-lg font-medium">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <EyeOff size={24} className="text-primary-600" />
                            <h3>التزام السرية المطلقة</h3>
                        </div>
                        <p>يتعهد المطور (يوسف مسلم) التزاماً قانونياً صارماً بعدم إفشاء أو بيع أو مشاركة أي بيانات تخص الطلاب أو المعلمين مع أي جهة إعلانية أو طرف ثالث. البيانات المدخلة هي ملكية حصرية للمستخدم، ودور المنصة يقتصر على المعالجة التقنية فقط.</p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <Mail size={24} className="text-primary-600" />
                            <h3>الإشعارات الرسمية للتعديلات</h3>
                        </div>
                        <p>تتم كافة الإشعارات المتعلقة بتعديلات هذه السياسة أو التنبيهات الأمنية عبر البريد الإلكتروني المسجل في النظام. يُعتبر البريد الإلكتروني وسيلة التراسل الرسمية المعتمدة قانوناً بين الطرفين.</p>
                    </section>
                  </div>
                </div>
              )}

              {/* --- 3. Refund Policy --- */}
              {activeTab === 'refund' && (
                <div className="space-y-12">
                  <header className="space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-primary-600/10 text-primary-600 mb-2">
                      <RefreshCcw size={32} />
                    </div>
                    <h2 className="text-4xl font-black dark:text-white">الضمانات وحقوق الاسترداد</h2>
                    <p className="text-slate-500 font-bold italic underline decoration-primary-600/30">شفافية التعامل المالي وسياسة التعويض.</p>
                  </header>

                  <div className="space-y-10 text-slate-600 dark:text-slate-400 leading-[1.8] text-lg font-medium">
                    <div className="p-8 bg-primary-600/5 rounded-[2.5rem] border border-primary-600/20">
                        <h4 className="font-black text-primary-600 mb-3 text-xl flex items-center gap-2">
                            <CheckCircle2 size={24} />
                            فترة التجربة والقرار
                        </h4>
                        <p className="font-bold">نمنحك 14 يوماً كاملة لاختبار كافة جوانب النظام. الدفع بعد هذه الفترة هو إقرار نهائي برضاك التام عن مستوى الخدمة.</p>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <AlertTriangle size={24} className="text-primary-600" />
                            <h3>سياسة الاسترجاع المالي</h3>
                        </div>
                        <p>نظراً لطبيعة الخدمات الرقمية، لا يتم استرداد المبالغ المدفوعة بعد تفعيل الاشتراك (الشهري أو السنوي). يحق للمستخدم إلغاء التجديد في أي وقت دون أي التزامات مستقبلية.</p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl">
                            <FileText size={24} className="text-primary-600" />
                            <h3>ضمان البيانات وحالات التعويض</h3>
                        </div>
                        <p>في حال حدوث خلل فني أدى لفقدان كلي للبيانات (Data Loss) لا يمكن تداركه، يلتزم المطور برد قيمة الاشتراك الجاري كلياً،كتعويض نهائي وشامل عن الضرر.</p>
                    </section>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Verification Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-slate-500 dark:text-slate-400 font-black text-sm uppercase tracking-widest">
                <ShieldCheck size={18} className="text-primary-600" />
                آخر تحديث: 22 مارس 2026 - الإصدار 1.0.4
            </div>
          </div>
        </div>
      </section>

      {/* --- Simple Footer --- */}
      <footer className="mt-20 py-10 border-t border-slate-200/50 dark:border-slate-800/50 text-center opacity-40">
        <p className="text-xs font-black dark:text-white tracking-[0.5em]">
          SENTRYK LEGAL DEPARTMENT • DEVELOPED BY YOUSSEF AHMAD MUSLIM
        </p>
      </footer>

    </div>
 </>  );
}
