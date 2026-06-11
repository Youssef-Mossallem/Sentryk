import { motion, type Variants } from 'framer-motion';
import { 
  Heart, GraduationCap, Sparkles, MousePointer2, ChevronLeft, Briefcase, Sun, Moon, ShieldCheck, Code, Smartphone, BarChart3
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";

export default function About() {
  const { darkMode, toggleTheme } = useThemeStore();

  // ضبط الـ Variants بشكل صحيح لـ TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7, 
        ease: "easeOut" 
      } 
    }
  };

  return (
    <>
    <Helmet>
  <title>
    من نحن | SENTRYK - نظام إدارة السناتر التعليمية ومراكز الدروس الخصوصية
  </title>

  <meta
    name="description"
    content="تعرف على منصة SENTRYK لإدارة السناتر التعليمية ومراكز الدروس الخصوصية. اكتشف رؤية المنصة وأهدافها ومزاياها التقنية المتقدمة ومعلومات عن المطور يوسف أحمد مسلم."
  />

  <meta
    name="keywords"
    content="
      SENTRYK,
      سنترك,
      نظام إدارة سناتر,
      إدارة مراكز تعليمية,
      إدارة الطلاب,
      نظام اشتراكات الطلاب,
      برنامج سنتر تعليمي,
      إدارة الدروس الخصوصية,
      منصة تعليمية,
      Educational Management System,
      SaaS Education,
      School Management,
      Student Management,
      Center Management,
      يوسف أحمد مسلم,
      Youssef Ahmed Mossallem
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
    href="https://sentryk.vercel.app/about"
  />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ar_EG" />
  <meta property="og:site_name" content="SENTRYK" />

  <meta
    property="og:title"
    content="من نحن | SENTRYK - نظام إدارة السناتر التعليمية"
  />

  <meta
    property="og:description"
    content="منصة سحابية متطورة لإدارة السناتر التعليمية والطلاب والاشتراكات والتقارير المالية والصلاحيات المتقدمة."
  />

  <meta
    property="og:url"
    content="https://sentryk.vercel.app/about"
  />

  {/* Twitter */}
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="من نحن | SENTRYK"
  />

  <meta
    name="twitter:description"
    content="تعرف على منصة SENTRYK ومزاياها التقنية ورؤية تطويرها."
  />

  {/* إضافات SEO احترافية */}
  <meta name="language" content="Arabic" />
  <meta name="geo.region" content="EG" />
  <meta name="geo.country" content="Egypt" />
  <meta name="rating" content="general" />
  <meta name="revisit-after" content="7 days" />

  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About SENTRYK",
      url: "https://sentryk.vercel.app/about",
      description:
        "تعرف على منصة SENTRYK لإدارة السناتر التعليمية ومراكز الدروس الخصوصية.",
      mainEntity: {
        "@type": "SoftwareApplication",
        name: "SENTRYK",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        creator: {
          "@type": "Person",
          name: "Youssef Ahmed Mossallem"
        }
      }
    })}
  </script>
</Helmet>
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right overflow-x-hidden pb-20" dir="rtl">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#030712]/40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/40 overflow-hidden">
              <img src="/favicon.svg" alt="Sentryk Logo" className="w-[22px] h-[22px] object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase font-display">SENTRYK</span>
          </motion.div>

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

      {/* --- Section 1: من نحن والمطور --- */}
      <section className="pt-56 pb-20 px-6 relative">
        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-10"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-600/5 border border-primary-600/20 text-primary-600 mb-10 font-bold text-sm tracking-widest uppercase">
             <Sparkles size={16} />
             <span>رؤية هندسية متكاملة لإدارة التعليم</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black mb-8 dark:text-white leading-[1.2] tracking-tight">
            سنتريك (SENTRYK) <br />
            <span className="text-primary-600 text-3xl md:text-4xl font-extrabold block mt-2">منصة SaaS ذكية من ابتكار وتطوير المهندس يوسف أحمد مسلم</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium">
            تم بناء منصة سنترك بفلسفة "الهندسة أولاً" بواسطة المطور الفول ستاك **يوسف أحمد مسلم**. وهي منظومة سحابية متكاملة صُممت لتمكين أصحاب السناتر التعليمية والمدرسين من السيطرة التامة على مراكزهم، إدارة شؤون الطلاب، أتمتة الرسائل الذكية، وضبط الحسابات المالية بدقة متناهية دون أدنى تعقيد.
          </motion.p>
        </motion.div>
      </section>

      {/* --- Section 2: الرؤية والهدف والمطور --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            className="space-y-10"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-black dark:text-white border-r-4 border-primary-600 pr-6">رؤيتنا وبنيتنا</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 dark:text-slate-400 leading-loose font-medium">
              تأسست سنترك برؤية تقنية طموحة من **يوسف أحمد مسلم** لتصبح المعيار القياسي الرقمي الأول لإدارة المراكز التعليمية في مصر. ندمج بين سرعة واجهات برمجيات الويب الحديثة وحماية السيرفرات لتقديم أقوى أداء للسنتر.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <motion.div variants={fadeInUp} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <Code className="text-primary-600 mb-4" size={32} />
                <h4 className="text-xl font-black dark:text-white mb-2">المطور والناشر</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold">تطوير وتصميم بالكامل بواسطة يوسف أحمد مسلم (Youssef Ahmed Mossallem)، باستخدام تقنيات Node.js, Express, React, TypeScript, PostgreSQL.</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <Heart className="text-primary-600 mb-4" size={32} />
                <h4 className="text-xl font-black dark:text-white mb-2">قيمنا الثابتة</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold">توفير الأمان المطلق، دقة الحسابات، سرعة المعالجة، وحفظ البيانات بأعلى تشفير تقني.</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-square bg-slate-900 dark:bg-primary-600 rounded-[3rem] p-12 flex flex-col justify-center items-center text-center shadow-3xl">
              <GraduationCap size={100} className="text-white mb-8 opacity-20 absolute top-10 right-10" />
              <Code size={60} className="text-primary-400 mb-6" />
              <h3 className="text-3xl font-black text-white mb-6 leading-tight">هندسة برمجية متطورة تمنحك السيطرة الكاملة.</h3>
              <div className="h-1.5 w-20 bg-primary-400 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Section 3: لماذا تختارنا (الميزات الحقيقية للمنصة) --- */}
      <section className="py-32 px-6 bg-white/50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black dark:text-white mb-6">لماذا سنتريك هي الخيار الأقوى؟</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold italic text-xl">حلول حقيقية وميزات حصرية تم ابتكارها وتطبيقها بدقة هندسية عالية.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: <ShieldCheck size={36} />, 
                title: "أمان البيانات والـ Activity Log", 
                desc: "حماية بيانات الطلاب بجدار حماية صارم، مع سجل نشاط متكامل ومتاح للأدمن فقط لمراقبة كل تفاصيل العمليات البرمجية والإدارية لحظة بلحظة ومنع أي تلاعب." 
              },
              { 
                icon: <Smartphone size={36} />, 
                title: "أتمتة رسائل الـ SMS بالكامل", 
                desc: "محفظة ذكية مرتبطة تلقائياً بـ 4 حالات أساسية: عند تسجيل الطلاب، تنبيهات ما قبل انتهاء الاشتراك بـ 3 أيام، عند الانتهاء، وفور تجديد الاشتراك بنجاح لربط أولياء الأمور بالنظام." 
              },
              { 
                icon: <BarChart3 size={36} />, 
                title: "تقارير مالية وادوار ذكية", 
                desc: "فصل كامل للصلاحيات بين الأدمن والمساعدين (Secretary)، مع لوحة تحكم ذكية تعتمد الألوان المحددة لمتابعة الاشتراكات وحساب الأرباح الشهرية مقارنة بالشهر السابق." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[3rem] bg-white dark:bg-[#030712] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary-600/5 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-primary-600/10 text-primary-600 rounded-2xl flex items-center justify-center mb-8">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black dark:text-white mb-5">{feature.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 4: CTA خفيف --- */}
      <section className="py-40 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black dark:text-white mb-10 leading-tight">
            اختبر قوة سنترك الآن واضمن نظامك التعليمي
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/signup" className="px-16 py-6 bg-primary-600 text-white rounded-2xl font-black text-2xl shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-2 transition-all flex items-center gap-4 group">
              ابدأ فترة تجربتك الـ 14 يوماً
              <MousePointer2 size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="px-10 py-6 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xl dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
               <Briefcase size={20} />
               تواصل مع المطور
            </Link>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }}
            className="mt-32 text-xs font-black dark:text-white tracking-[0.5em] uppercase"
          >
             Sentryk Platform • Developed by Youssef Ahmed Mossallem
          </motion.div>
        </motion.div>
      </section>

    </div>
    </>
  );
}
