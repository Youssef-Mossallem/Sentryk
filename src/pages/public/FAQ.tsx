import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  HelpCircle,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Smartphone,
  ShieldCheck,
  Layers,
  Calendar,
  CheckCheck,
  Send,
  UserCheck,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // 🛡️ تخصيص رأس الصفحة وعناكب الـ AI والـ SEO السيو العريق
import { useThemeStore } from '../../store/useThemeStore';

// هيكل البيانات المطور لأسئلة السناتر الواقعية والذكية شاملاً أسعار الباقات وأنظمة الإحالة لعام 2026
const faqData = [
  {
    category: "باقات الاشتراك، خطط التسعير، وبرنامج الإحالة الحصري",
    icon: <Coins size={22} />,
    questions: [
      {
        q: "ما هي خطط أسعار منظومة SENTRYK PRO وما هي حدود الاستيعاب التقنية لكل باقة؟",
        a: "توفر المنظومة 4 باقات مرنة وقابلة للتخصيص الفوري لتناسب كافة الأحجام التشغيلية للمراكز التعليمية: (1) الباقة التجريبية (TRIAL): مجانية بالكامل لمدة 14 يوماً وتدعم حتى 100 طالب و3 مستخدمين (موظفي سكرتارية). (2) الباقة الأساسية (BASIC): بسعر 499 جنيهاً شهرياً وتدعم حتى 250 طالباً و4 مستخدمين. (3) الباقة المتقدمة (PREMIUM): بسعر 999 جنيهاً شهرياً وتدعم حتى 1000 طالب و10 مستخدمين. (4) باقة النخبة (ELITE): باقة الصروح والسناتر العملاقة بسعر 1999 جنيهاً شهرياً، وتعتبر باقة غير محدودة تقنياً وعملياً حيث تدعم حتى 3,000,000 طالب و25,000 مستخدم."
      },
      {
        q: "كيف يتم احتساب سعر الاشتراك السنوي؟ وهل هناك خصومات عند الترقية؟",
        a: "الاشتراك السنوي يمنح مركزك التعليمي توفيراً هائلاً واستقراراً تشغيلياً على المدى الطويل؛ حيث يتم احتساب التكلفة السنوية عبر ضرب قيمة الباقة الشهرية في 9 أشهر فقط (أي تحصل على 3 أشهر مجانية تماماً)، ثم يطبق النظام برمجياً خصماً إضافياً بنسبة 15% على الإجمالي المخفض، مما يجعله العرض الأقوى والأوفر مالياً لإدارة سنترك."
      },
      {
        q: "كيف يعمل نظام كود الإحالة (Referral Code) وما هي مكافآت الداعي والسنتر المدعو؟",
        a: "نظام الإحالة مصمم برمجياً لمكافأة شركائنا بنظام الفوز المتبادل (Win-Win)؛ عند استخدام سنتر تعليمي جديد لكود الإحالة الخاص بك: يحصل السنتر المدعو فوراً على خصم حصرى بنسبة 20% ممتد لمدة شهرين كاملين على اشتراكه. بالمقابل، تحصل أنت (السنتر الداعي الاصلي) على شهر كامل مجاناً تماماً (يُشترط وجود شهر واحد نشط على الأقل بحسابك). والميزة العبقرية للنظام: إذا قررت لاحقاً الترقية إلى باقة سنوية، فسيقوم النظام تلقائياً باحتساب القيمة النقدية لكافة الشهور المجانية المتراكمة في محفظتك وخصمها مباشرة من السعر الإجمالي للباقة السنوية المترقى إليها."
      }
    ]
  },
  {
    category: "منظومة الأمان وحماية الصلاحيات وسجل النشاط",
    icon: <ShieldCheck size={22} />,
    questions: [
      {
        q: "ما الفرق الإداري والمالي بين صلاحية صاحب السنتر (الأدمن) وصلاحية السكرتارية؟",
        a: "تم تصميم النظام لحماية بياناتك وأموالك بالكامل؛ صاحب السنتر يمتلك التحكم المطلق والوحيد في إنشاء الفروع، إضافة المدرسين، تعديل أسعار المجموعات والحصص، والاطلاع على الأرباح الشهرية وإدارة محفظة الواتساب وسجل الأمان. أما السكرتارية، فلهم صلاحيات تشغيلية فقط مثل تسجيل الطلاب، تسجيل الحضور اليومي، وتجديد الاشتراكات وفق الأسعار المحددة مسبقاً، ولا يملكون أي صلاحية لحذف الطلاب أو تعديل الخزنة أو تغيير الأسعار، لمنع الأخطاء البشرية أو التلاعب."
      },
      {
        q: "كيف يعمل سجل النشاط (Activity Log) كدرع حماية ضد التلاعب المالي؟",
        a: "سجل النشاط هو نظام رقابي فوري ومتقدم يسجل أدق التفاصيل في السنتر. كل حركة (مثل: تجديد اشتراك، تعديل حضور طالب، فتح قاعة) يتم توثيقها لحظياً باسم الموظف الذي قام بها، مع تسجيل التاريخ والدقيقة والتعديل الذي تم بالضبط. هذا السجل مشفر ولا يمكن حذفه أو تعديله حتى من السكرتارية، مما يمنح صاحب السنتر رقابة كاملة عن بعد ويمنع أي تلاعب مالي نهائياً."
      },
      {
        q: "ماذا يحدث عند انتهاء باقة الاشتراك الخاصة بالسنتر نفسه في المنصة؟",
        a: "يمنحك النظام فترة تجريبية مجانية بالكامل لمدة 14 يوماً بكافة الصلاحيات والمميزات. عند انتهاء الاشتراك الفعلي للسنتر، يتم قفل العمليات التشغيلية تلقائياً عبر نظام الحماية الذكي لحين التجديد من خلال بوابة الدفع الإلكترونية المدمجة (Paymob)، مع الحفاظ التام والمشفر على كافة بيانات الطلاب والمدرسين وسجلات الحضور دون أي فقدان."
      }
    ]
  },
  {
    category: "نظام الحضور الذكي والترحيل العبقري (Attendance Engine)",
    icon: <UserCheck size={22} />,
    questions: [
      {
        q: "ما هي ميزة الترحيل التلقائي (Carry-Forward) وكيف تنهي طوابير الانتظار؟",
        a: "هي ميزة حصرية ومبتكرة لحل أزمة التكدس عند البوابات؛ إذا كان الطالب مسجلاً في حصتين متتاليتين لنفس المدرس (مثل حصة شرح تليها حصة حل أو تدريب مخصصة)، بمجرد مسح كارت الـ QR الخاص به في الحصة الأولى، يتعرف النظام تلقائياً على وجود اشتراك نشط له في الحصة التالية ويقوم بحقن تسجيل حضوره فيها بشكل آلي. هذا يعني أن الطالب يمرر الكارت مرة واحدة فقط للنظام ليتم تحضيره في الحصتين، مما يوفر نصف وقت الطوابير تماماً."
      },
      {
        q: "كيف يتعامل النظام مع حضور الطلاب المتأخرين؟ وهل يمكن ضبط وقت السماح؟",
        a: "نعم، النظام يحتوي على نافذة زمنية ذكية لكل حصة (Session Attendance Window). يمكنك ضبط وقت الحصة الرسمي، وتحديد مهلة سماح (مثلاً 10 دقائق). إذا قام الطالب بمسح الكارت بعد المهلة، يسجله النظام تلقائياً بحالة (متأخر - LATE) مع احتساب الدقائق الدقيقة للتأخير وحفظها في تقريره الإداري وتنبيه ولي الأمر في التقرير الشهري، مما يفرض الانضباط التام."
      },
      {
        q: "هل يدعم النظام العمل بدون إنترنت (Offline Sync) في حال انقطاع الشبكة فجأة؟",
        a: "بالتأكيد. يحتوي نظام الحضور على ميزة المزامنة الأوفلاين الشاملة؛ إذا انقطع الإنترنت بالسنتر أثناء توافد الطلاب، تستمر السكرتارية في مسح كروت الـ QR بشكل طبيعي وحفظ الحضور محلياً على الجهاز. وفور عودة الإنترنت، يتيح النظام ضغطة زر واحدة لمزامنة ورفع كافة السجلات بأمان إلى السيرفر دون ضياع أي سجل حضور."
      }
    ]
  },
  {
    category: "إدارة القاعات ومنع التداخل وجدولة المجموعات",
    icon: <Layers size={22} />,
    questions: [
      {
        q: "كيف يمنع النظام التداخل الزمني وحجز القاعات بالخطأ؟",
        a: "يحتوي النظام على خوارزمية ذكية لمنع تداخل الأوقات (Time Overlap Verification). عند محاولة السكرتارية جدولة حصة لمدرس في قاعة معينة، يقوم النظام بفحص كافة القاعات والمجموعات الأخرى في نفس الوقت؛ فإذا تبين أن القاعة مشغولة في هذا التوقيت أو المدرس لديه حصة أخرى في فرع ثانٍ، يرفض النظام إنشاء الحصة فوراً ويظهر تنبيهاً يوضح التداخل، مما يمنع الإحراج وتضارب المواعيد تماماً."
      },
      {
        q: "ما هي ميزة حماية سعة القاعات ومنع التكدس؟",
        a: "يفرض النظام رقابة صارمة على الطاقة الاستيعابية؛ فعند تعريف (قاعة أ) بسعة 50 مقعداً، لن يسمح النظام نهائياً بتسجيل أو حجز أكثر من 50 طالباً في المجموعات المرتبطة بهذه القاعة. كما يمنع النظام السكرتارية من تقليل سعة القاعة في الإعدادات إذا كانت هناك مجموعات نشطة وممتلئة بالفعل داخلها، لضمان راحة الطلاب والتزام السنتر بمعايير الجودة."
      }
    ]
  },
  {
    category: "التسعير التكيفي وحماية الفواتير (Price Snapshot)",
    icon: <Calendar size={22} />,
    questions: [
      {
        q: "ما هو نظام التسعير التكيفي وما هي أنواع الاشتراكات المدعومة؟",
        a: "يدعم النظام 4 أنواع مرنة للحسابات المالية تناسب كل المدرسين: (نظام الحصة الواحدة، النظام الشهري، نظام النصف شهر حيث يقسم النظام التكلفة تلقائياً، أو نظام الكورس الشامل). بمجرد اختيار نوع الاشتراك للمجموعة، يقوم النظام باحتساب المبالغ وتواريخ انتهاء الصلاحية بدقة متناهية."
      },
      {
        q: "ما هي ميزة لقطة السعر (Price Snapshot) وكيف تحميني من تضارب الحسابات؟",
        a: "هذه الميزة هي صمام أمان مالي للسنتر؛ عندما يشترك الطالب في مجموعة بسعر (100 جنيه مثلاً)، يأخذ النظام 'لقطة ثابتة' من هذا السعر ويربطها بفاتورة الطالب. إذا قرر المدرس لاحقاً رفع سعر المجموعة إلى 150 جنيهاً للطلاب الجدد، تظل حسابات الطالب القديم وتجديداته مبنية على لقطة السعر القديمة المحفوظة في اشتراكه دون أي تغيير أو ارتباك في الحسابات، إلا إذا قمت أنت بتحديث اشتراكه يدوياً."
      }
    ]
  },
  {
    category: "محفظة الواتساب وأتمتة الإشعارات (WhatsApp Cloud API)",
    icon: <Smartphone size={22} />,
    questions: [
      {
        q: "كيف تعمل محفظة الواتساب داخل السنتر وهل الخصم دقيق؟",
        a: "كل سنتر يمتلك محفظة رقمية خاصة به لرسائل الواتساب (WhatsApp Wallet). النظام مدمج مباشرة مع خوادم Meta الرسمية؛ عند إرسال أي رسالة تلقائية (ترحيب، غياب، تقرير)، يتم خصم رسالة واحدة (نقطة واحدة) وتوثيق المعاملة فوراً في قاعدة البيانات بشكل تزامني آمن. إذا شارف الرصيد على الانتهاء، ينبهك النظام لطلب الشحن لتفادي توقف الرسائل."
      },
      {
        q: "لماذا تظهر بعض الرسائل بفواصل مثل الرمز (❖) بدلاً من الأسطر الجديدة؟",
        a: "تمت برمجة وتنسيق الرسائل بأعلى معايير الجودة البرمجية المتوافقة مع سياسات فيسبوك الصارمة. استخدام الفواصل المتميزة ( ❖ ) يضمن تجميع تفاصيل الحصص والمواد والمواعيد أفقياً في سطر واحد أنيق وجذاب، مما يمنع رفض السيرفرات للرسائل ويضمن وصولها الفوري لهاتف ولي الأمر بشكل احترافي متميز وبدون أخطاء تسليم."
      }
    ]
  }
];

const whatsappTemplates = [
  {
    id: "FIRST_SUB",
    title: "إشعار التسجيل الأول وكارت الـ QR",
    templateName: "sentryk_first_subscription",
    content: (
      <div className="space-y-3 text-slate-900 dark:text-zinc-100 font-sans text-[16px] md:text-[17px] leading-relaxed">
        <p>تم تأكيد تسجيل الطالب <span className="font-bold">*أحمد مصطفى كامل*</span> بنجاح في سنتر <span className="font-bold">*أكاديمية النخبة التعليمية*</span>.</p>
        <p>تفاصيل الحصص والمجموعات المسجلة الحالية:</p>
        <p className="font-bold">
          (1) مجموعة الفيزياء [مستر محمد أحمد] ❖ قاعة ابن حيان ❖ السبت 04:00 م ❖ السعر: 150ج ❖ (2) مجموعة الكيمياء [مستر خالد محمود] ❖ قاعة زويل ❖ الأحد 06:00 م ❖ السعر: 150ج
        </p>
        <p>• إجمالي قيمة الاشتراك: <span className="font-bold">300</span> جنيهاً</p>
        <p>• تاريخ انتهاء الصلاحية: <span className="font-bold">20/07/2026</span></p>
        <p>رابط بطاقة الدخول الذكية (QR Code):</p>
        <p className="underline break-all font-mono text-sm text-slate-900 dark:text-zinc-100">https://tinyurl.com/sentryk-qr-92k8</p>
        <p className="pt-2">
          *تنبيه هام:* يرجى فتح الرابط أعلاه، والضغط مطولاً على صورة البطاقة ثم اختيار "حفظ الصورة" للاحتفاظ بها على الهاتف؛ حيث يتوجب إبرازها بشكل إلزامي عند بوابات الدخول في كل حصة.
        </p>
        <p className="text-xs text-slate-400 mt-2 text-left">مع تمنياتنا لكم بفصل دراسي موفق ومتميز.</p>
      </div>
    )
  },
  {
    id: "ABSENT",
    title: "إشعار الغياب الفوري عن الحصة",
    templateName: "student_absence_notice",
    content: (
      <div className="space-y-3 text-slate-900 dark:text-zinc-100 font-sans text-[16px] md:text-[17px] leading-relaxed">
        <p>نحيط سيادتكم علماً بغياب الطالب <span className="font-bold">*أحمد مصطفى كامل*</span> عن الحضور اليوم في سنتر <span className="font-bold">*أكاديمية النخبة التعليمية*</span>.</p>
        <p>تفاصيل الحصص والجلسات التي غاب عنها الطالب اليوم:</p>
        <p className="font-bold">
          (1) مجموعة الشرح الأولى [مادة: الفيزياء - مستر محمد أحمد] السبت الساعة 04:00 م ❖ (2) مجموعة التدريب المكثف [مادة: الفيزياء - مستر محمد أحمد] السبت الساعة 06:00 م
        </p>
        <p className="text-xs text-slate-400 mt-2 text-left">شاكرين لسيادتكم حرصكم الدائم واهتمامكم بمستقبل الطالب.</p>
      </div>
    )
  },
  {
    id: "ENDING_SOON",
    title: "تذكير قرب انتهاء الاشتراك (قبل 3 أيام)",
    templateName: "subscription_expiry_reminder",
    content: (
      <div className="space-y-3 text-slate-900 dark:text-zinc-100 font-sans text-[16px] md:text-[17px] leading-relaxed">
        <p>نود تذكير سيادتكم بقرب انتهاء صلاحية اشتراك الطالب <span className="font-bold">*أحمد مصطفى كامل*</span> في سنتر <span className="font-bold">*أكاديمية النخبة التعليمية*</span> خلال ثلاثة أيام.</p>
        <p>تفاصيل الحصص والمجموعات المجدولة حالياً للطالب:</p>
        <p className="font-bold">
          (1) مجموعة الفيزياء [مستر محمد أحمد] ❖ السبت 04:00 م ❖ السعر: 150ج ❖ (2) مجموعة الكيمياء [مستر خالد محمود] ❖ الأحد 06:00 م ❖ السعر: 150ج
        </p>
        <p>• إجمالي قيمة التجديد المطلوب: <span className="font-bold">300</span> جنيهاً</p>
        <p>• تاريخ انتهاء الصلاحية الحالي: <span className="font-bold">23/06/2026</span></p>
        <p>يرجى التكرم بالتوجه لشؤون الطلاب لتجديد الاشتراك، وذلك لضمان استمرار حجز المقاعد واستمرار حضور الطالب دون انقطاع.</p>
        <p className="text-xs text-slate-400 mt-2 text-left">شاكرين لسيادتكم حسن تعاونكم وتفهمكم.</p>
      </div>
    )
  },
  {
    id: "EXPIRED",
    title: "إشعار انتهاء الاشتراك وإيقاف الكارت",
    templateName: "subscription_expired_notice",
    content: (
      <div className="space-y-3 text-slate-900 dark:text-zinc-100 font-sans text-[16px] md:text-[17px] leading-relaxed">
        <p>نحيط سيادتكم علماً بانتهاء صلاحية اشتراك الطالب <span className="font-bold">*أحمد مصطفى كامل*</span> في سنتر <span className="font-bold">*أكاديمية النخبة التعليمية*</span>.</p>
        <p>تفاصيل المجموعات والحصص المتوقفة مؤقتاً:</p>
        <p className="font-bold">
          (1) مجموعة الفيزياء [مستر محمد أحمد] السبت 04:00 م ❖ (2) مجموعة الكيمياء [مستر خالد محمود] الأحد 06:00 م
        </p>
        <p>• إجمالي قيمة التجديد المطلوب لإعادة التفعيل: <span className="font-bold">300</span> جنيهاً</p>
        <p>
          *ملاحظة إدارية:* بناءً على اللوائح التنظيمية، تم إيقاف تفعيل بطاقة الدخول الذكية (QR Code) الخاصة بالطالب مؤقتاً، وسيتم إعادة تنشيطها تلقائياً فور التوجه لشؤون الطلاب وإتمام إجراءات تجديد الاشتراك، لضمان سماح بوابات السنتر بالدخول واستئناف الحضور.
        </p>
        <p className="text-xs text-slate-400 mt-2 text-left">شاكرين لسيادتكم مقدماً سرعة تعاونكم وحرصكم على مصلحة الطالب.</p>
      </div>
    )
  }
];

export default function FAQ() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [activeWhatsappTab, setActiveWhatsappTab] = useState("FIRST_SUB");

  // تصفية الأسئلة بناءً على مدخل البحث لضمان سلاسة الواجهة
  const filteredFaq = faqData.map(category => {
    const questions = category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions };
  }).filter(category => category.questions.length > 0);

  const activeTemplate = whatsappTemplates.find(t => t.id === activeWhatsappTab);

  // 🤖 بناء البيانات المهيكلة المتقدمة لـ محركات البحث وعناكب الـ AI (FAQPage JSON-LD)
  const schemaQuestions = faqData.flatMap(cat =>
    cat.questions.map(q => ({
      "@type": "Question",
      "name": q.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.a
      }
    }))
  );

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "الأسئلة الشائعة والمركز المعرفي لمنظومة Sentryk Pro",
    "description": "الدليل التقني الكامل والأسئلة الشائعة حول إدارة السناتر، ترحيل الحضور، أسعار الخطط وباقات البرو، ونظام أتمتة رسائل الواتساب والربط البرمجي السحابي.",
    "url": "https://sentryk.vercel.app/faq",
    "mainEntity": schemaQuestions
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 text-right overflow-x-hidden font-sans pb-20`} dir="rtl">

      {/* 🚀 رأس الصفحة السيادي للـ SEO والميتا داتا العميقة لنماذج الـ LLM وعناكب البحث */}
      <Helmet>
        <title>الأسئلة الشائعة والمركز المعرفي | SENTRYK PRO</title>
        <meta name="title" content="الأسئلة الشائعة والمركز المعرفي | SENTRYK PRO" />
        <meta name="description" content="اكتشف الباقات المالية لـ سنتريك برو (Trial, Basic, Premium, Elite)، ونظام كود الإحالة التراكمي المبتكر. تعرف على آليات الترحيل الذكي للحضور وأتمتة إشعارات Meta API السحابية للسناتر التعليمية." />
        <meta name="keywords" content="اسعار سنترك, باقات Sentryk Pro, كود إحالة سنترك, ترحيل الحضور التلقائي, حماية السناتر التعليمية, احمد مسلم, يوسف مسلم, نظام كروت QR للطلاب, سيو تعليمي مصر, واتساب API ميتا" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Facebook / LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sentryk.vercel.app/faq" />
        <meta property="og:title" content="الأسئلة الشائعة والمركز المعرفي لـ SENTRYK PRO - دليل التشغيل الذكي" />
        <meta property="og:description" content="الدليل البرمجي الشامل لإدارة سنترك بكل كفاءة. تفاصيل الباقات والأسعار السنوية المخفضة، نظام التداخل الزمني، وقوالب إشعارات الواتساب الحية." />
        <meta property="og:image" content="https://sentryk.vercel.app/og-image.png" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="الأسئلة الشائعة والمركز المعرفي | SENTRYK PRO" />
        <meta name="twitter:description" content="تعرف على تفاصيل الباقات الأربعة التي تبدأ من الخطة التجريبية إلى باقة النخبة المفتوحة وكيفية عمل كود الإحالة وخصم الشهور المجانية." />
        <meta name="twitter:image" content="https://sentryk.vercel.app/og-image.png" />

        {/* 🧠 حقن الهوية المهيكلة الكترونياً للـ AI والـ Crawlers لفهم البيانات وتوليد إجابات دقيقة */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>

      {/* --- الهيدر العلوي (Navbar) --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-[#030712]/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-xl group-hover:bg-indigo-500/40 transition-all"></div>
              <div className="relative w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 overflow-hidden border border-white/10">
                <img src="/favicon.svg" alt="Sentryk Logo" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-l from-indigo-600 to-blue-500 bg-clip-text text-transparent font-display">SENTRYK <span className="text-indigo-600 text-sm align-super">PRO</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200/40 dark:border-slate-700/40"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.344l.707-.707M1.05 12a11 text-center" /></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <Link to="/" className="text-base font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
              <span>الرئيسية</span>
              <ChevronLeft size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- شاشة البداية والبحث (Hero) --- */}
      <section className="pt-44 pb-12 px-6 relative">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-black text-sm mb-6 border border-indigo-600/20">
              <HelpCircle size={16} /> مركز المعرفة والأدلة التشغيلية والمالية الذكية
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              دليلك الشامل لإدارة <br className="hidden md:inline" /> سنترك <span className="text-indigo-600 dark:text-indigo-400">SENTRYK</span> بكل احترافية
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-10 font-medium">
              اكتشف باقات التسعير التنافسية، آليات خصم كود الإحالة التراكمية، ترحيل الحضور التلقائي، وأتمتة إشعارات الواتساب الرسمية دون مجهود أو تعقيد تقني.
            </p>

            {/* بار البحث الفاخر */}
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
              <input
                type="text"
                placeholder="ابحث عن: أسعار الخطط، كود الإحالة، الترحيل التلقائي، الصلاحيات، الحسابات..."
                className="w-full py-5 pr-14 pl-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-base text-right"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- القسم الرئيسي المتكامل (البلوك المزدوج التفاعلي) --- */}
      <section className="px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* العمود الأيمن: الأسئلة الشائعة المنظمة والأدلة (7 أعمدة) */}
          <div className="lg:col-span-7 space-y-12 order-2 lg:order-1">
            {filteredFaq.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                <h4 className="text-xl font-bold mb-2">لم نجد نتائج تطابق بحثك</h4>
                <p className="text-slate-400 text-sm">حاول كتابة كلمات مفتاحية أخرى مثل (باقات، إحالة، حضور، كارت، صلاحية)</p>
              </div>
            ) : (
              filteredFaq.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/10">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">{cat.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {cat.questions.map((item, qIdx) => {
                      const uniqueKey = `${idx}-${qIdx}`;
                      const isOpen = activeQuestion === uniqueKey;
                      return (
                        <div
                          key={qIdx}
                          className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen
                              ? 'bg-white dark:bg-slate-900 border-indigo-600/50 shadow-xl shadow-indigo-600/5'
                              : 'bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-indigo-600/30'
                            }`}
                        >
                          <button
                            onClick={() => setActiveQuestion(isOpen ? null : uniqueKey)}
                            className="w-full p-6 flex items-center justify-between text-right gap-4"
                          >
                            <span className={`text-base md:text-[18px] font-black leading-snug transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {item.q}
                            </span>
                            <div className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <div className="px-6 pb-6 text-[16px] md:text-[17px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* العمود الأيسر: محاكي رسائل الواتساب التفاعلي الحقيقي (5 أعمدة) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 order-1 lg:order-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Smartphone className="text-emerald-500" size={24} />
                <div>
                  <h4 className="font-black text-lg">محاكي إشعارات الواتساب</h4>
                  <p className="text-xs text-slate-400">شاهد القوالب الحقيقية الصافية كما تصل لأولياء الأمور</p>
                </div>
              </div>

              {/* أزرار اختيار القوالب */}
              <div className="flex flex-wrap gap-2 mb-6">
                {whatsappTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveWhatsappTab(t.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${activeWhatsappTab === t.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {t.title.split(' ')[0] + ' ' + (t.title.split(' ')[1] || '')}
                  </button>
                ))}
              </div>

              {/* جسم هاتف الواتساب التفاعلي الاحترافي */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-inner bg-[#efeae2] dark:bg-zinc-950 relative min-h-[420px] flex flex-col justify-between">

                {/* هيدر الواتساب المصغر */}
                <div className="bg-[#00a884] dark:bg-zinc-900 p-3 flex items-center justify-between text-white shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-[#00a884] dark:text-zinc-300 font-black text-sm">
                      S
                    </div>
                    <div>
                      <h5 className="text-xs font-black">Sentryk Cloud Router</h5>
                      <span className="text-[9px] opacity-80 flex items-center gap-0.5">الحساب الرسمي متصل <CheckCheck size={10} /></span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono opacity-40 bg-black/10 px-2 py-0.5 rounded">
                    Meta Verified
                  </div>
                </div>

                {/* شاشة الشات والفقاعة المستهدفة */}
                <div className="p-4 flex-1 flex flex-col justify-end">
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-white/80 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1 rounded-lg shadow-sm">
                      اليوم
                    </span>
                  </div>

                  {/* فقاعة الرسالة - نظيفة ومتطابقة مع الرسائل الواقعية للهواتف */}
                  <motion.div
                    key={activeWhatsappTab}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tr-none shadow-md max-w-[94%] mr-auto relative text-right border-r-4 border-slate-400"
                  >
                    <div className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 mb-2 pb-1 border-b border-dashed border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                      <span>Template: {activeTemplate?.templateName}</span>
                      <Send size={10} className="text-slate-400" />
                    </div>

                    {/* المحتوى النصي الفعلي */}
                    {activeTemplate?.content}

                    {/* التوقيت وعلامة الصح الزرقاء */}
                    <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400 font-mono">
                      <span>07:00 ص</span>
                      <CheckCheck size={14} className="text-blue-500" />
                    </div>
                  </motion.div>
                </div>

                {/* فوتر الواتساب السفلي للمظهر الاحترافي */}
                <div className="bg-[#f0f2f5] dark:bg-zinc-900/60 p-2 text-center text-[10px] font-bold text-slate-400 dark:text-zinc-500 border-t border-slate-200/50 dark:border-zinc-800">
                  ⚠️ هذه رسالة مؤتمتة ومحمية لا تدعم الرد المباشر
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- قسم الدعم المباشر الفاخر (CTA) --- */}
      <section className="px-4 md:px-6 mt-16">
        <div className="max-w-5xl mx-auto p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-right">
              <h2 className="text-3xl md:text-4xl font-black mb-3">هل واجهت حالة تشغيلية أو مالية معقدة؟</h2>
              <p className="text-lg font-bold opacity-85">فريق مهندسي ومطوري سنترك متواجدين لدعمك وتعديل باقتك وتنشيط الأكواد على مدار الساعة.</p>
            </div>
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl flex items-center gap-3 whitespace-nowrap"
            >
              <MessageSquare size={22} />
              تواصل مع الدعم المباشر
            </a>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-black/10 blur-3xl rounded-full pointer-events-none"></div>
        </div>
      </section>

      {/* --- الفوتر (Footer) --- */}
      <footer className="mt-20 py-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center opacity-50">
        <p className="text-xs font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
          SENTRYK SUPPORT SYSTEM • AUTOMATED CENTER OPERATIONS • 2026
        </p>
      </footer>
    </div>
  );
}