import { motion, type Variants } from 'framer-motion';
import {
  Heart,
  GraduationCap,
  Sparkles,
  MousePointer2,
  ChevronLeft,
  Briefcase,
  Sun,
  Moon,
  ShieldCheck,
  Code,
  MessageSquare,
  BarChart3,
  Layers,
  Zap,
  Activity,
  Database
} from 'lucide-react';
import { Helmet } from 'react-helmet'; // 🛡️ استيراد الهيلمت لتخصيص محركات البحث والـ AI لكل صفحة مستقلة
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';

export default function About() {
  const { darkMode, toggleTheme } = useThemeStore();

  // ضبط الـ Variants لتأثيرات الظهور التتابعي بـ TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 text-right overflow-x-hidden pb-24`} dir="rtl">

      {/* 🚀 الـ Helmet السيادي لصفحة من نحن - مُهيج ومعد خصيصاً للفهرسة والتعرف الذكي الشامل من الـ AI */}
      <Helmet>
        <title>من نحن | فلسفة ومعمارية منظومة SENTRYK PRO التعليمية السحابية</title>
        <meta name="title" content="من نحن | فلسفة ومعمارية منظومة SENTRYK PRO التعليمية السحابية" />
        <meta name="description" content="تعرّف على الرؤية الفنية والهندسية لمنصة سنترك (Sentryk Pro). منظومة تشغيل تعليمية متكاملة مبنية بمعمارية Multi-Tenant SaaS بواسطة المطور يوسف مسلم (Youssef Ahmed Mossallem). نعتمد على العزل المنطقي للبيانات عبر PostgreSQL وتقنيات الأتمتة الفائقة لرسائل الواتساب وحسابات الحضور الذكي QR ومحفظة WhatsApp Wallet المبتكرة لمنع الخسائر المالية وتوفير نموذج إدارة فائق القوة والتحمل لأصحاب المراكز والسناتر التعليمية." />
        <meta name="keywords" content="عن سنترك, فلسفة Sentryk, يوسف مسلم مطور سنترك, Youssef Ahmed Mossallem, معمارية Multi-Tenant, عزل بيانات السناتر, أتمتة رسائل الواتساب, WhatsApp Wallet, لقطة الأسعار priceSnapshot, خوارزمية carryForward, نظام حضور الطلاب الذكي, حماية لوحة تحكم السنتر, هندسة البرمجيات التعليمية SaaS" />

        {/* الميتا داتا الخاصة ببروتوكول الرسم البياني المفتوح (Open Graph) للصفحة */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://sentryk.vercel.app/about" />
        <meta property="og:title" content="من نحن | فلسفة ومعمارية منظومة SENTRYK PRO التعليمية السحابية" />
        <meta property="og:description" content="اكتشف البنية التحتية والفلسفة الهندسية وراء أقوى نظام تشغيل SaaS للسناتر التعليمية بمصر. أتمتة كاملة، استقرار مالي وأمان سيبراني مطلق." />
        <meta property="og:image" content="https://sentryk.vercel.app/og-image.png" />

        {/* كروت تويتر المخصصة لصفحة التعريف */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="من نحن | الرؤية الهندسية لمنصة SENTRYK PRO التعليمية" />
        <meta name="twitter:description" content="تعرف على تفاصيل البناء البرمجي لمنصة Sentryk SaaS المخصصة لإدارة السناتر والمراكز التعليمية، وكيف تعيد الأتمتة صياغة الإدارة اليومية." />
        <meta name="twitter:image" content="https://sentryk.vercel.app/og-image.png" />
      </Helmet>

      {/* --- الخلفيات المتوهجة المعمارية (Ambient Lights) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10 opacity-70">
        <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* --- شريط التنقل العلوي الفاخر (Premium Glassmorphic Navbar) --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-900/40 bg-white/70 dark:bg-[#030712]/70 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20 border border-white/10">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase font-display">SENTRYK <span className="text-primary-600">PRO</span></span>
          </motion.div>

          <div className="flex items-center gap-5">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <Link to="/" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
              <span>الرئيسية</span>
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- القسم الأول: واجهة البطولة وهوية المطور (Hero & Identity) --- */}
      <section className="pt-44 pb-16 px-6 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 mb-8 font-semibold text-xs tracking-wide">
            <Sparkles size={14} />
            <span>رؤية هندسية متكاملة للأنظمة التعليمية كخدمة (SaaS)</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black mb-8 leading-[1.15] bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-700 dark:from-white dark:to-slate-400">
            سنتريك (SENTRYK) <br />
            <span className="text-primary-600 text-2xl md:text-4xl font-extrabold block mt-3">منظومة سحابية متكاملة صممتها عقليّة برمجية شغوفة</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            تم بناء وتطوير منصة **Sentryk Pro** بفلسفة هندسية صارمة من قِبل مهندس البرمجيات الفول ستاك <span className="text-slate-900 dark:text-white font-bold">Youssef Mosallem</span>. صُممت المنظمة لتمنح أصحاب المراكز التعليمية والمدرسين سيطرة تشغيلية مطلقة، من خلال دمج تقنيات التحضير الفوري المتقدم وأتمتة العمليات الإدارية الحساسة.
          </motion.p>
        </motion.div>
      </section>

      {/* --- القسم الثاني: البنية التحتية والقيم (Infrastructure & Values) --- */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">

          {/* الجانب الأيمن: تفاصيل الرؤية */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            className="lg:col-span-7 space-y-8"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-black border-r-4 border-primary-600 pr-4">فلسفة البناء المعماري</motion.h2>
            <motion.p variants={fadeInUp} className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              نؤمن في سنتريك أن استقرار النظام التعليمي يبدأ من البنية التحتية. لذلك، تم تصميم قاعدة البيانات لتعتمد على العزل المطلق لبيانات كل سنتر (Logical Data Isolation) عبر PostgreSQL. يضمن هذا التصميم معالجة آلاف طلبات حضور الطلاب في ثوانٍ معدودة دون تداخل أو بطء، مع ترحيل البيانات لحظياً عبر خوادم Node.js السحابية.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-md">
                <Code className="text-primary-600 mb-3" size={24} />
                <h4 className="text-base font-black mb-1.5">المهندس والمطور الرئيسي</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">تطوير وتصميم بالكامل من قِبل <span className="text-primary-600 font-bold">Youssef Mosallem</span> عبر أحدث التقنيات: Node.js, Express, React, TypeScript, PostgreSQL, Prisma ORM.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-md">
                <Heart className="text-primary-600 mb-3" size={24} />
                <h4 className="text-base font-black mb-1.5">الالتزام بالقيمة والثقة</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">الأمان السيبراني المطلق، دقة الحسابات، الحماية التلقائية للخزائن من التلاعب، والشفافية الكاملة مع أولياء الأمور.</p>
              </motion.div>
            </div>
          </motion.div>

          {/* الجانب الأيسر: مظهر جمالي يعكس التقدم الكودى */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-950 dark:from-primary-950 dark:to-slate-950 rounded-[2.5rem] p-8 flex flex-col justify-between relative shadow-2xl border border-white/5 overflow-hidden">
              <GraduationCap size={160} className="text-white/5 absolute -top-10 -right-10 pointer-events-none" />

              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary-400">
                  <Database size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-white/5 px-2 py-1 rounded">v2.0 ACTIVE</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">هندسة برمجية متطورة تمنحك السيطرة التشغيلية الكاملة.</h3>
                <div className="h-1 w-16 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- القسم الثالث: التحديثات والميزات الهندسية الكبرى (SaaS Mythical Features) --- */}
      <section className="py-20 px-6 bg-slate-100/50 dark:bg-slate-900/20 border-y border-slate-200/40 dark:border-slate-900/40">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">لماذا Sentryk Pro هي الخيار القياسي والأقوى?</h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm max-w-xl mx-auto">
              حلول تقنية حقيقية وميزات حصرية تم ابتكارها وتطبيقها بدقة هندسية متناهية لتجاوز العقبات الإدارية التقليدية.
            </p>
          </motion.div>

          {/* شبكة الميزات المحدثة (6 ميزات عملاقة) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare size={24} />,
                title: "أتمتة منظومة رسائل الواتساب",
                desc: "ربط فوري ومباشر مع Meta Cloud API لتنبيه أولياء الأمور تلقائياً فور تسجيل الطالب، وقبل انتهاء الاشتراك بـ 3 أيام، وعند الإيقاف المالي، وعند تجديد الاشتراك، إضافة لإنذار الغياب والتقرير الشهري."
              },
              {
                icon: <ShieldCheck size={24} />,
                title: "أمان البيانات والـ Activity Log",
                desc: "جدار حماية صارم لفصل البيانات وعزلها بين المشتركين، متبوع بسجل مراقبة مركزي (Audit Log) يسجل كل تفاصيل العمليات الحساسة لمنع أي تلاعب أو تسريب من قِبل المساعدين."
              },
              {
                icon: <BarChart3 size={24} />,
                title: "التسعير التكيفي والـ Price Snapshot",
                desc: "مرونة كاملة في تحديد باقات الدفع (شهري، كورس، أو بالحصة)، مع أخذ لقطة مالية مشفرة للسعر وقت التسجيل لحفظ الحسابات القديمة والفواتير من أي تعديل خلفي مفاجئ في إعدادات المجموعات."
              },
              {
                icon: <Layers size={24} />,
                title: "نظام ترحيل الحضور carryForward",
                desc: "خوارزمية ذكية تمنع تكدس طوابير الطلاب؛ عند فتح نافذة الحصة الحالية، يقوم النظام بالتحقق التلقائي المتوازي من حضورهم الفعلي والنشط في الحصة السابقة لترحيلهم فوراً بلمح البصر."
              },
              {
                icon: <Activity size={24} />,
                title: "الرقابة وفصل الأدوار الذكي Multi-Role",
                desc: "سلسلة Middleware صارمة تبدأ بالتحقق من هوية المستخدم ودوران التوكن، لتفصل الصلاحيات بدقة تامة وتمنع السكرتارية من الاطلاع على الحسابات الكلية للسنتر أو تعديل الأسعار."
              },
              {
                icon: <Database size={24} />,
                title: "التحضير والمزامنة أوفلاين (/sync)",
                desc: "دعم كامل للعمل عند انقطاع الإنترنت بالسنتر عبر Service Workers وتخزين البيانات محلياً، مع إتاحة المزامنة التتابعية المجمعة لرفع ومزامنة كافة السجلات فور عودة الاتصال بالسيرفر."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl hover:shadow-primary-600/5 dark:hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-600/10 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* --- القسم الرابع: دعوة للتفاعل خفيفة وفاخرة (Premium CTA) --- */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
            اختبر قوة الهندسة البرمجية الآن <br />واضمن استقرار نظامك التعليمي
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-black text-sm shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
              <span>ابدأ فترة تجربتك الـ 14 يوماً مجاناً</span>
              <MousePointer2 size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link to="/contact" className="w-full sm:w-auto px-6 py-4 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
              <Briefcase size={16} />
              <span>تواصل مع المطور الفني</span>
            </Link>
          </div>

          {/* حقوق المطور السفلية المنسقة برمجياً بعناية */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }}
            className="mt-20 text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase select-none"
          >
            Sentryk Pro Platform • Architectural Mastery by Youssef Mosallem
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl -z-10"></div>
      </section>

    </div>
  );
}