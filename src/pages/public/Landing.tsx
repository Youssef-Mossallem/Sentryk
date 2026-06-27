import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Download,
  Fingerprint,
  GraduationCap,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  WifiOff,
  X,
  Zap,
  Star,
  Activity,
  Wallet,
  BellRing,
  ScanLine,
  TrendingUp,
  Headphones,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';

const premiumFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'الترحيل الذكي ومنع الطوابير',
    desc: 'يتعرف النظام تلقائياً على الطلاب المستمرين للحصة التالية ويقوم بتحضيرهم في ثوانٍ معدودة بدون طوابير إضافية.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'تأمين الخزينة وضبط الكاش',
    desc: 'حماية قوية لحساباتك عبر تثبيت أسعار الاشتراكات وقت التسجيل، مع منع أي تلاعب بأثر رجعي من السكرتارية.',
  },
  {
    icon: <WifiOff className="w-6 h-6" />,
    title: 'منظومة الحضور أوفلاين',
    desc: 'سجل حضور الطلاب بالكامل بدون إنترنت، وسيقوم النظام بالمزامنة السحابية فور عودة الاتصال تلقائياً.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'سجل رقابة إداري صارم',
    desc: 'لوحة تحكم ترصد وتوثق كل حركة أو تعديل مالي يقوم به فريق العمل لحظة بلحظة وبشكل يمكن مراجعته بسهولة.',
  },
];

const stats = [
  { label: 'وقت الإعداد', value: '14 يوم', icon: <Clock3 className="w-5 h-5" /> },
  { label: 'الأتمتة اليومية', value: '24/7', icon: <Activity className="w-5 h-5" /> },
  { label: 'تتبع العمليات', value: 'دقيق', icon: <Fingerprint className="w-5 h-5" /> },
  { label: 'الاستقرار', value: 'عالي', icon: <BadgeCheck className="w-5 h-5" /> },
];

const workflow = [
  {
    title: 'استقبال الطالب',
    desc: 'تسجيل سريع، بطاقة رقمية، وتصنيف مباشر للحالة والاشتراك.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'إدارة الحضور',
    desc: 'حضور/غياب/تأخير مع أوفلاين مود ومزامنة تلقائية.',
    icon: <ScanLine className="w-5 h-5" />,
  },
  {
    title: 'التنبيهات الذكية',
    desc: 'رسائل واتساب وسMS في لحظات حرجة لتقليل فقد الاشتراكات.',
    icon: <BellRing className="w-5 h-5" />,
  },
  {
    title: 'التحليل المالي',
    desc: 'تقارير أرباح، نمو، ومقارنة شهرية بواجهة واضحة وسهلة.',
    icon: <TrendingUp className="w-5 h-5" />,
  },
];

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallAppToast = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          className="fixed bottom-5 left-5 right-5 md:left-auto md:right-8 md:w-[430px] z-[100] pointer-events-none"
        >
          <div className="pointer-events-auto relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-5 flex items-center gap-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent" />
            <div className="relative shrink-0 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 p-3.5 text-white shadow-xl shadow-primary-600/20">
              <Smartphone size={24} />
            </div>
            <div className="relative flex-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">تطبيق Sentryk على جهازك</h4>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                ثبّت المنصة للوصول السريع وتجربة أكثر احترافية في الإدارة اليومية.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="relative inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-600"
            >
              <Download size={14} />
              تثبيت
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="relative p-1 text-slate-400 transition-colors hover:text-rose-500"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SectionTitle = ({
  eyebrow,
  title,
  desc,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  center?: boolean;
}) => (
  <div className={center ? 'text-center' : 'text-right'}>
    {eyebrow && (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/15 bg-primary-500/8 px-4 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-300">
        <Sparkles size={14} className="animate-pulse" />
        {eyebrow}
      </div>
    )}
    <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">{title}</h2>
    {desc && <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-slate-500 dark:text-slate-400 md:text-lg">{desc}</p>}
  </div>
);

const FeatureCard = ({ item }: { item: (typeof premiumFeatures)[number] }) => (
  <motion.div
    whileHover={{ y: -8 }}
    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 dark:border-slate-800/70 dark:bg-[#090f1f] md:p-7"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-inner dark:bg-primary-500/10 dark:text-primary-300">
      {item.icon}
    </div>
    <h3 className="relative mb-3 text-lg font-black tracking-tight text-slate-950 dark:text-white md:text-xl">{item.title}</h3>
    <p className="relative text-sm leading-7 text-slate-500 dark:text-slate-400 md:text-[15px]">{item.desc}</p>
  </motion.div>
);

export default function Landing() {
  const { darkMode, toggleTheme } = useThemeStore();
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div dir="rtl" className="min-h-screen overflow-hidden bg-[#f8fafc] text-right text-slate-900 transition-colors duration-500 dark:bg-[#030712] dark:text-slate-50 font-sans selection:bg-primary-500/20">
      <InstallAppToast />

      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-2xl dark:border-slate-900/60 dark:bg-[#030712]/75">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-primary-600 shadow-lg shadow-primary-600/20">
              <img src="/favicon.svg" alt="Sentryk Logo" className="h-6 w-6 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold tracking-[0.28em] text-slate-400 dark:text-slate-500">SAAS PLATFORM</div>
              <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">SENTRYK PRO</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary-500 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              aria-label="تبديل الوضع"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 md:block">
              دخول المشتركين
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700 sm:px-5"
            >
              تجربة مجانية
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 sm:pt-32">
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="absolute left-1/2 top-24 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary-500/8 blur-[140px]" />
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-5xl text-center">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/15 bg-white px-4 py-2 text-xs font-bold text-primary-700 shadow-sm dark:bg-slate-950 dark:text-primary-300"
              >
                <Sparkles size={14} className="animate-pulse" />
                منصة ذكية لإدارة السناتر والمراكز التعليمية بمستوى الشركات العالمية
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[5.3rem]"
              >
                أدر مركزك التعليمي من
                <span className="block bg-gradient-to-b from-slate-950 via-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-500">
                  منصة واحدة فائقة الذكاء
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg md:text-xl"
              >
                Sentryk يجمع الحضور، الاشتراكات، الخزينة، الرسائل، التقارير، والصلاحيات في تجربة واحدة أنيقة وسريعة، مصممة لتقليل الفوضى وزيادة السيطرة والربحية.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 rounded-[1.4rem] bg-primary-600 px-7 py-4.5 text-base font-black text-white shadow-2xl shadow-primary-600/20 transition-all hover:-translate-y-1 hover:bg-primary-700 sm:px-8 sm:py-5 sm:text-lg"
                >
                  ابدأ الآن مجاناً لمدة 14 يوماً
                  <ArrowLeft size={18} />
                </Link>

                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-primary-500 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 sm:px-7 sm:py-5 sm:text-base"
                >
                  شاهد قوالب الواتساب والـ FAQ
                  <ArrowUpRight size={16} />
                </Link>
              </motion.div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 + idx * 0.03 }}
                    className="rounded-[1.5rem] border border-slate-200/70 bg-white p-4 text-right shadow-sm dark:border-slate-800/70 dark:bg-[#090f1f]"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{stat.value}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="لماذا Sentryk مختلف؟"
              title="واجهة حديثة، واضحة، ومصممة للإقناع"
              desc="الصفحة مبنية بعقلية SaaS عالمي: وضوح بصري، هرمية قوية في العناوين، مسافات مريحة، وأزرار تحويل بارزة تساعد الزائر على اتخاذ القرار بسرعة."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {premiumFeatures.map((item) => (
                <FeatureCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-5 lg:items-stretch">
            <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-[#090f1f] lg:col-span-3 lg:p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                محرك الواتساب الذكي لإشعارات الطلاب وأولياء الأمور
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400 md:text-base">
                المنصة ترسل رسائل منظمة تلقائياً في اللحظات المهمة، بحيث يظل ولي الأمر على علم دائم بحالة الطالب، ويزيد التجديد، وتقل المتابعة اليدوية.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  'رسالة ترحيب فورية عند تسجيل الطالب مع كارت الهوية الرقمي.',
                  'تنبيه قبل انتهاء الاشتراك بـ 3 أيام.',
                  'إشعار مباشر عند انتهاء الاشتراك.',
                  'تأكيد تلقائي عند التجديد الفعلي.',
                  'تقرير شهري مختصر للحضور والغياب والتأخير.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
                    <span className="leading-7">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm dark:border-slate-800/70 dark:from-[#0b1329] dark:to-[#090f1f] lg:col-span-2 lg:p-8">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500/10 blur-3xl" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">معاينة احترافية</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">قوالب ورسائل مرتبة بشكل جاهز للعرض.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-3 py-2 text-[11px] font-black text-white dark:bg-white dark:text-slate-950">
                    WhatsApp Suite
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-950 dark:text-white">Sentryk Automation</div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">رسائل مختصرة، واضحة، ومقنعة.</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/70">(لرويه القوالب الحقيقيه اذهب للاسله الشائعه) مرحباً، تم تسجيل الطالب بنجاح وتم إصدار بطاقة الهوية الرقمية.</div>
                    <div className="rounded-2xl bg-primary-50 px-4 py-3 text-primary-900 dark:bg-primary-500/10 dark:text-primary-200">تنبيه: يتبقى 3 أيام على انتهاء الاشتراك.</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/70">تم التجديد بنجاح. شكراً لثقتكم.</div>
                  </div>
                </div>

                <Link
                  to="/faq"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition-all hover:bg-primary-600 dark:bg-white dark:text-slate-950 dark:hover:bg-primary-600 dark:hover:text-white"
                >
                  رؤية الهيكل والتمبليتس الفعلي
                  <ChevronLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="رحلة الاستخدام"
              title="من التسجيل إلى التقارير في مسار واحد بسيط"
              desc="الزائر يفهم الفكرة بسرعة: يدخل النظام، يسجل الطلاب، يتابع الاشتراكات، ويرى الأداء المالي والتشغيلي من لوحة واحدة."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((step, idx) => (
                <motion.div
                  key={step.title}
                  whileHover={{ y: -6 }}
                  className="rounded-[1.6rem] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-[#090f1f]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    {step.icon}
                  </div>
                  <div className="mb-2 text-sm font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">0{idx + 1}</div>
                  <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-[#090f1f] sm:p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                <WifiOff size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">الإنترنت انقطع؟ العمل لا يتوقف</h3>
              <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400 md:text-base">
                استمر في تسجيل الحضور والعمليات الأساسية بدون إنترنت، ثم دع المنصة تعيد المزامنة تلقائياً عند الرجوع للشبكة، بدون إرباك أو فقد بيانات.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'تسجيل أوفلاين',
                  'مزامنة تلقائية',
                  'بدون فقد بيانات',
                  'تجربة سلسة',
                ].map((text) => (
                  <div key={text} className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-950 p-6 shadow-xl shadow-slate-950/20 dark:border-slate-800/70 sm:p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-300">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">حماية مالية ورقابية بمستوى مؤسسي</h3>
              <p className="mt-4 text-sm leading-8 text-slate-300 md:text-base">
                الصلاحيات، سجل العمليات، الأسعار الثابتة، ومراجعة الأحداث كلها تصنع طبقة أمان تساعدك على ضبط فريق العمل وتقليل الأخطاء المالية.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'Role-based access',
                  'Activity logs',
                  'قفل الأسعار',
                  'مراجعة العمليات',
                ].map((text) => (
                  <div key={text} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/90 backdrop-blur-sm">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-slate-200/70 bg-slate-950 p-7 shadow-2xl shadow-slate-950/20 dark:border-slate-800/70 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-200">
                  <BarChart3 size={14} />
                  تقارير ذكية ولوحة قيادة كاملة
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white md:text-5xl">كل الأرقام أمامك بوضوح</h3>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                  أرباح، اشتراكات، نمو شهري، حضور، وأداء تشغيلي في واجهة واحدة مرتبة وسريعة تساعدك على اتخاذ القرار بثقة.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    'رؤية مالية مباشرة',
                    'مقارنة شهرية',
                    'تقارير تشغيلية',
                    'نظرة إدارية شاملة',
                  ].map((text) => (
                    <div key={text} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/90">
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white">Dashboard Preview</div>
                      <div className="mt-1 text-xs text-slate-400">واجهة تحليلية مختصرة</div>
                    </div>
                    <div className="rounded-2xl bg-green-500/15 px-3 py-2 text-[11px] font-black text-green-300">Live</div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['الطلاب النشطين', '1,284', <GraduationCap className="w-5 h-5" />],
                      ['الإيراد الشهري', '€ / $', <Wallet className="w-5 h-5" />],
                      ['الرسائل المرسلة', '24K', <Mail className="w-5 h-5" />],
                      ['نسبة الالتزام', '99.9%', <BadgeCheck className="w-5 h-5" />],
                    ].map(([label, value, icon]) => (
                      <div key={label as string} className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <div className="text-xs font-bold">{label as string}</div>
                          <div className="text-primary-300">{icon as React.ReactNode}</div>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-white">{value as string}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2.2rem] border border-slate-200/70 bg-white p-7 shadow-sm dark:border-slate-800/70 dark:bg-[#090f1f] sm:p-10 lg:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-300">
                  <Star size={14} />
                  تجربة تحويل عالية
                </div>
                <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                  جاهز لتحويل مركزك إلى نظام احترافي فعلاً؟
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400 md:text-base">
                  ابدأ الآن واستمتع بواجهة راقية، تنظيم ممتاز، ورسالة تسويقية واضحة ترفع ثقة العميل من أول ثانية.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700">
                  ابدأ الفترة التجريبية
                  <ArrowLeft size={16} />
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-500 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  تواصل مع الدعم
                  <Headphones size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-14 text-sm text-slate-500 dark:border-slate-900 dark:bg-[#030712] dark:text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/20">
                <img src="/favicon.svg" alt="Sentryk Logo" className="h-5 w-5 object-contain" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-950 dark:text-white">SENTRYK PRO</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Educational SaaS</div>
              </div>
            </div>
            <p className="max-w-sm leading-7">
              منصة حديثة لإدارة السناتر والمراكز التعليمية بواجهة احترافية، أتمتة قوية، وتحكم أعلى في التشغيل والبيانات.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-lg font-black text-slate-950 dark:text-white">المنصة</h4>
            <ul className="space-y-3 font-medium">
              <li><Link to="/about" className="transition-colors hover:text-primary-600">حول النظام</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-primary-600">الأسئلة الشائعة</Link></li>
              <li><Link to="/signup" className="transition-colors hover:text-primary-600">ابدأ التجربة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-lg font-black text-slate-950 dark:text-white">الأمان</h4>
            <ul className="space-y-3 font-medium">
              <li><Link to="/policy" className="transition-colors hover:text-primary-600">الخصوصية والأمان</Link></li>
              <li><span>Activity Logs</span></li>
              <li><span>Role Permissions</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-lg font-black text-slate-950 dark:text-white">التواصل</h4>
            <div className="flex gap-3">
              <Link to="/contact" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-primary-600 hover:text-white dark:bg-slate-900 dark:text-slate-300">
                <Mail size={18} />
              </Link>
              <Link to="/faq" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-primary-600 hover:text-white dark:bg-slate-900 dark:text-slate-300">
                <MessageSquare size={18} />
              </Link>
            </div>
            <p className="mt-5 leading-7">دعم فني واستشارات مرنة لتسريع الإعداد وتحسين التشغيل.</p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-100 px-4 pt-8 text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:border-slate-800/60 dark:text-slate-500 sm:px-6 lg:px-8">
          © {year} SENTRYK PRO. Designed & Developed for premium educational management.
        </div>
      </footer>
    </div>
  );
}
