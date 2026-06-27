import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  ChevronLeft, 
  Fingerprint, 
  Cpu,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios'; 
import { useThemeStore } from '../../store/useThemeStore';

export default function VerifyGate() {
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // التقاط التوكن السري تلقائياً إذا كان ممرراً في الرابط
  const tokenFromUrl = searchParams.get('token');

  // حالات المدخلات للمرحلة الأولى
  const [ownerName, setOwnerName] = useState('');
  const [masterPassphrase, setMasterPassphrase] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // حالات التحكم بالواجهة والأمان
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * 🛡️ الأثر البرمجي اللحظي (Auto-Verify Effect)
   * إذا دخل الأدمن من الرابط الزمني المشفر، يتم إرسال التوكن مباشرة للباك إند لفك التشفير
   */
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  /**
   * 🔐 دالة التحقق وإهلاك التوكن (المرحلة الثانية)
   */
  const handleVerifyToken = async (tokenToVerify: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/super-vault/verify-gate', {
        token: tokenToVerify
      });

      if (response.data.success) {
        setSuccess(true);
        
        // 1. تخزين توكن الـ JWT السيادي قصير المدى الصادر من الباك إند
        localStorage.setItem('sentryk_super_token', response.data.token);
        
        // 2. حقن مفاتيح الحماية الافتراضية المعتمدة في الـ sessionStorage لضمان توافق الـ Infrastructure Guard
        sessionStorage.setItem('sentryk_vault_key', 'Sentryk_Master_Key_2026_Prod');
        sessionStorage.setItem('sentryk_vault_secret', 'SuperSecurePassphrase_For_PromoCodes_9981!!');
        
        // الانتقال للوحة التحكم العليا بعد انتهاء تأثير النجاح الأسطوري
        // استبدل setTimeout بهذا:
if (response.data.success) {
  setSuccess(true);
  
  localStorage.setItem('sentryk_super_token', response.data.token);
  sessionStorage.setItem('sentryk_vault_key', 'Sentryk_Master_Key_2026_Prod');
  sessionStorage.setItem('sentryk_vault_secret', 'SuperSecurePassphrase_For_PromoCodes_9981!!');

  // تأخير أقل + force re-render
  setTimeout(() => {
    navigate('/super-vault/dashboard', { replace: true });
  }, 800);
}
      }
    } catch (err: any) {
      console.error('🔒 [Vault Verification Intercept Error]:', err);
      setError(
        err.response?.data?.error || 
        'فشل التحقق الإستراتيجي! رابط العبور غير شرعي أو انتهت صلاحيته الزمنية (3 دقائق) وتم تدميره.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⚡ دالة طلب الرابط الفوري (المرحلة الأولى)
   */
  const handleSubmitRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !masterPassphrase.trim() || !otpCode.trim()) {
      setError('يرجى ملء كافة مفاتيح العبور السيادية وكود Duo Mobile لتخطي جدار الحماية.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/super-vault/request-link', {
        ownerName: ownerName.trim(),
        masterPassphrase: masterPassphrase.trim(),
        otpCode: otpCode.trim()
      });

      if (response.data.success && response.data.gatewayUrl) {
        // فك وحل مصفوفة الرابط القادم لاستخراج التوكن وحقنه برمجياً لتسهيل عملية الدخول اللحظي دون مغادرة الصفحة
        const urlObj = new URL(response.data.gatewayUrl);
        const extractedToken = urlObj.searchParams.get('token');
        
        if (extractedToken) {
          await handleVerifyToken(extractedToken);
        } else {
          setError('تم توليد الرابط بنجاح ولكن فشل محرك النظام في استخلاص رمز الأمان.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('🔒 [Vault Link Request Failure]:', err);
      setError(
        err.response?.data?.error || 
        'فشل توليد مصفوفة العبور السيادية! تحقق من تطابق اسم المالك والعبارة وكود الـ OTP.'
      );
      setLoading(false);
    }
  };

  // حالة التحقق التلقائي النشط من الرابط لمنع تداخل الشاشات
  const isAutoVerifying = !!tokenFromUrl && loading && !error;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-center items-center p-4 transition-colors duration-500">
      
      {/* الخلفية السيبرانية المضيئة */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/10 dark:bg-purple-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]" />
      </div>

      {/* زر تبديل الثيم العلوي */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xl text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>
      </div>

      {/* الحاوية الرئيسية المتحركة */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-xl z-10"
      >
        {/* شعار المنظومة الكبرى فوق الكارد */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 30px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(99, 102, 241, 0)"] 
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-2xl mb-4"
          >
            <Fingerprint size={32} className="animate-pulse" />
          </motion.div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest uppercase mb-2">
            <Cpu size={12} />
            <span>Sentryk Infrastructure Matrix 2026</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 dark:from-white dark:via-slate-200 dark:to-slate-400">
            بوابة العبور السيادية
          </h1>
          <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 max-w-sm">
            منطقة مشفرة بالكامل صالحة فقط لمديري البنية التحتية العليا ونظام الـ SaaS الأسطوري.
          </p>
        </div>

        {/* الكارد الرئيسي الفخم */}
        <div className="relative rounded-[2.5rem] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          
          {/* شريط زينة علوي متدرج */}
          <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <AnimatePresence mode="wait">
            {isAutoVerifying ? (
              /* واجهة فحص التوكن التلقائي القادم من الرابط الزمني */
              <motion.div 
                key="auto-verify-loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-500 mb-6 shadow-2xl shadow-indigo-500/20">
                  <Loader2 className="animate-spin" size={40} />
                </div>
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                  جاري فحص مصفوفة العبور السيادية...
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  يتم الآن تدمير الرابط تلقائياً لحماية النظام البنيوي (Self-Destruct) والتحقق التام من صلاحية التوكن الرقمي المستلم.
                </p>
              </motion.div>
            ) : !success ? (
              /* نموذج طلب الرابط والعبور الحقيقي المتوافق مع محرك الـ TOTP والأدمن المالك */
              <motion.form 
                key="request-link-form"
                onSubmit={handleSubmitRequestLink} 
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* حقل اسم المالك السيادي */}
                <div className="space-y-2">
                  <label className="flex text-sm font-black text-slate-700 dark:text-slate-300 mr-1 items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    <span>اسم المالك السيادي للأنظمة (Owner Name)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Terminal size={18} />
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. SUPER_ADMIN_OWNER_NAME"
                      className="w-full pr-12 pl-4 py-4 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl font-mono text-sm tracking-wide text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* حقل العبارة السرية الكبرى */}
                <div className="space-y-2">
                  <label className="flex text-sm font-black text-slate-700 dark:text-slate-300 mr-1 items-center gap-2">
                    <Lock size={16} className="text-violet-500" />
                    <span>العبارة السرية الأعظم للخزنة (Master Passphrase)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassphrase ? 'text' : 'password'}
                      dir="ltr"
                      value={masterPassphrase}
                      onChange={(e) => setMasterPassphrase(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••"
                      className="w-full pr-12 pl-12 py-4 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl font-mono text-sm tracking-wide text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassphrase ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* حقل كود الـ OTP القادم من Duo Mobile */}
                <div className="space-y-2">
                  <label className="flex text-sm font-black text-slate-700 dark:text-slate-300 mr-1 items-center gap-2">
                    <KeyRound size={16} className="text-pink-500" />
                    <span>كود الأمان المتغير المولد من تطبيق الـ Authenticator (OTP)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                      <Fingerprint size={18} />
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full pr-12 pl-4 py-4 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl font-mono text-sm tracking-[0.5em] text-center font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 dark:focus:border-pink-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* عرض الأخطاء بتأثير هزة ذكي */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 font-bold text-xs md:text-sm flex items-start gap-3 shadow-lg"
                    >
                      <ShieldAlert size={20} className="shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <span className="font-black block mb-0.5">خرق أمني / خطأ في التحقق التحتية</span>
                        <p className="opacity-90 leading-relaxed font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* زر توليد الرابط والعبور الذكي */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-600/30 dark:shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-4 group cursor-pointer relative overflow-hidden"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <span>طلب رابط الخزنة وفك التشفير</span>
                      <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                </button>
              </motion.form>
            ) : (
              /* واجهة النجاح عند مطابقة كافة البيانات واصدار الـ JWT بنجاح */
              <motion.div 
                key="success-animation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mb-6 shadow-2xl shadow-emerald-500/20">
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Sparkles size={40} className="animate-pulse" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                  تم فك التشفير واعتماد الهوية بنجاح ✅
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  مرحباً بك يا آدمن، تم إهلاك الرابط بنجاح لمنع الاختراق، وجاري الآن بناء وتأمين جلسة العمل السيادية للمنصة الكبرى...
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono font-bold text-indigo-500">
                  <Loader2 className="animate-spin" size={14} />
                  <span>INITIALIZING SECURE OVERLORD SESSION...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* تذييل الصفحة */}
        <p className="mt-8 text-center text-[11px] font-mono tracking-widest text-slate-400 dark:text-slate-600 font-bold uppercase">
          Sentryk System Architecture v2.0.26 • AES-256 Encrypted Matrix
        </p>
      </motion.div>
    </div>
  );
}