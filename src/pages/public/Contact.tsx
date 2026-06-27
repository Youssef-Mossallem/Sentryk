import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Hash,
  Headset,
  Mail,
  Moon,
  Send,
  Sun,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // 🛡️ تخصيص رأس الصفحة ومحركات البحث وعناكب الـ AI
import { useThemeStore } from '../../store/useThemeStore';

export default function Contact() {
  const { darkMode, toggleTheme } = useThemeStore();

  // States للمدخلات والحالة
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_pjcokij",
          template_id: "template_c1dnj9m",
          user_id: "EjARs5yaDNybll9Ov",
          template_params: {
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            to_email: "ahmadmoslem35@gmail.com",
          },
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  // 🤖 البيانات المهيكلة المخصصة لعناكب الـ AI ومحركات البحث (Schema.org JSON-LD)
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "اتصل بنا | الدعم الفني والمبيعات لمنظومة Sentryk Pro",
    "description": "قناة التواصل الرسمية المباشرة مع المطورين وفريق الدعم الفني لمنصة سنتريك التعليمية السحابية لإدارة السناتر والمراكز التعليمية.",
    "url": "https://sentryk.vercel.app/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "Sentryk Pro",
      "url": "https://sentryk.vercel.app",
      "logo": "https://sentryk.vercel.app/favicon.svg",
      "image": "https://sentryk.vercel.app/og-image.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "ahmadmoslem35@gmail.com",
        "contactType": "customer support",
        "areaServed": "EG",
        "availableLanguage": ["Arabic", "English"]
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right overflow-x-hidden" dir="rtl">

      {/* 🚀 الـ Helmet السيادي الفاخر - تهيئة مطلقة للأرشفة والفهرسة والذكاء الاصطناعي */}
      <Helmet>
        <title>اتصل بنا | الدعم الفني والاستشارات لمنظومة SENTRYK PRO</title>
        <meta name="title" content="اتصل بنا | الدعم الفني والاستشارات لمنظومة SENTRYK PRO" />
        <meta name="description" content="تواصل مباشرة مع فريق الدعم الفني والمبيعات لمنصة سنتريك (Sentryk Pro) السحابية. اطرح استفساراتك التقنية حول إدارة السناتر، أتمتة رسائل الواتساب Meta API، والحلول البرمجية الذكية." />
        <meta name="keywords" content="اتصل بسنتريك, دعم Sentryk Pro, مبيعات سنترك, تواصل مع مطور سنترك, أحمد مسلم, يوسف مسلم, حجز باقة البرو, بريد Sentryk, إدارة المراكز التعليمية مصر" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Facebook / LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sentryk.vercel.app/contact" />
        <meta property="og:title" content="اتصل بنا | الدعم الفني والاستشارات لمنظومة SENTRYK PRO" />
        <meta property="og:description" content="فريق سنتريك الاستشاري جاهز للرد على استفساراتك الإدارية والتقنية. تواصل معنا الآن لنقل مركزك التعليمي إلى السحابة." />
        <meta property="og:image" content="https://sentryk.vercel.app/og-image.png" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="اتصل بنا | الدعم الفني والاستشارات لمنظومة SENTRYK PRO" />
        <meta name="twitter:description" content="تواصل معنا مباشرة عبر نموذج المراسلة الفوري وسنقوم بالرد عليك في أقل من ساعتين." />
        <meta name="twitter:image" content="https://sentryk.vercel.app/og-image.png" />

        {/* 🧠 حقن البيانات المهيكلة الـ Schema للـ AI والنظم الذكية لتوليد المقتطفات المميزة */}
        <script type="application/ld+json">
          {JSON.stringify(contactSchema)}
        </script>
      </Helmet>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#030712]/40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* تحسين شكل اللوجو */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-500/20 blur-lg rounded-xl group-hover:bg-primary-500/40 transition-all"></div>
              <div className="relative w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary-600/30 overflow-hidden border border-white/10">
                <img src="/favicon.svg" alt="Sentryk Logo" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase font-display">SENTRYK <span className="text-primary-600 text-sm align-super">PRO</span></span>
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

      <section className="pt-44 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          {/* --- Left Side: Information --- */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-5xl md:text-6xl font-black dark:text-white mb-8 leading-tight font-display">
                لنصنع <span className="text-primary-600 italic">التغيير</span> معاً
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                فريق "سنتريك" الاستشاري مستعد للإجابة على كافة استفساراتكم التقنية والإدارية. تواصلكم معنا هو الخطوة الأولى نحو منظومة خالية من الفوضى.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: <Headset className="text-primary-600" />, title: "دعم فني مباشر", desc: "متاحون على مدار الساعة لخدمتكم" },
                { icon: <Mail className="text-primary-600" />, title: "المراسلات الرسمية", desc: "ahmadmoslem35@gmail.com" },
                { icon: <Clock className="text-primary-600" />, title: "وقت الاستجابة", desc: "عادة ما نرد في أقل من ساعتين" }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 items-center p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-14 h-14 bg-primary-600/5 rounded-2xl flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black dark:text-white text-lg">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* --- Right Side: Contact Form --- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="p-8 md:p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black dark:text-slate-300 pr-2">الاسم </label>
                    <div className="relative group">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="أحمد محمد"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 dark:focus:border-primary-600 transition-all font-bold dark:text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black dark:text-slate-300 pr-2">البريد الإلكتروني</label>
                    <div className="relative group">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        placeholder="name@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 dark:focus:border-primary-600 transition-all font-bold dark:text-white text-left"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black dark:text-slate-300 pr-2">موضوع الرسالة</label>
                  <div className="relative group">
                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="استفسار عن باقة البرو"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 dark:focus:border-primary-600 transition-all font-bold dark:text-white"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black dark:text-slate-300 pr-2">رسالتك</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="اكتب لنا استفسارك بكل وضوح..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] py-4 px-6 outline-none focus:border-primary-600 dark:focus:border-primary-600 transition-all font-bold dark:text-white resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button
                  disabled={status === 'loading'}
                  className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {status === 'loading' ? (
                      <motion.div
                        key="loading"
                        initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                        className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"
                      />
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                        className="flex items-center gap-3"
                      >
                        <span>إرسال الطلب الآن</span>
                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Status Messages */}
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl flex items-center gap-3 font-bold text-sm">
                      <CheckCircle2 size={18} /> تم إرسال رسالتك بنجاح، فريقنا سيتواصل معك قريباً.
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-3 font-bold text-sm">
                      <AlertCircle size={18} /> حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* --- Simple Footer Label --- */}
      <div className="text-center py-10 opacity-30">
        <p className="text-xs font-black dark:text-white tracking-[0.4em] uppercase font-display">Sentryk Communication Hub • 2026</p>
      </div>

    </div>
  );
}