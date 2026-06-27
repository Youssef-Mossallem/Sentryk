import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronLeft,
  Eye, EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Moon,
  Sun,
  UserPlus,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; 
import { useThemeStore } from '../../store/useThemeStore';
import api from "../../api/axios"; 

export default function Login() {
  const { darkMode, toggleTheme } = useThemeStore();
  const setAuth = useAuthStore((state) => state.setAuth); 
  const navigate = useNavigate();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    // منع ريلود الصفحة الافتراضي تماماً
    e.preventDefault();
    e.stopPropagation(); 
    
    setLoading(true);
    setError('');

    // تنظيف المدخلات وتأمين صيغة البريد الإلكتروني قبل الإرسال
    const sanitizedData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };

    try {
      const response = await api.post('/auth/login', sanitizedData);
      const data = response.data;

      if (data.success) {
        // تحديث الستور بشكل موحد ببيانات المستخدم، التوكن، والسنتر
        setAuth(data.user, data.token, data.center);
        
        // =============================================================
        // التوجيه الذكي بعد تحديث الـ Store (الإصلاح الأساسي)
        // =============================================================
        // نعطي الـ Zustand فرصة بسيطة لتحديث isPaid عبر checkSubscription()
        setTimeout(() => {
          const { isPaid } = useAuthStore.getState();
          
          if (isPaid) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/plans', { replace: true });
          }
        }, 80);

      } else {
        setError(data.error || 'فشلت عملية تسجيل الدخول، يرجى المحاولة مرة أخرى');
      }
      
    } catch (err: any) {
      // استخراج رسالة الخطأ بدقة متناهية من رد السيرفر أو السقوط الشبكي
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(errorMessage);
      console.error("❌ Login Front-End Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
        
        {/* خلفية جمالية متحركة مستوحاة من هوية سنترك الاحترافية */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"></div>
        </div>

        {/* زر تبديل الثيم المستقر */}
        <button 
          type="button"
          onClick={toggleTheme}
          className="fixed top-8 left-8 z-50 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 transition-all group"
        >
          {darkMode ? <Sun size={22} className="text-amber-400 group-hover:rotate-45 transition-transform" /> : <Moon size={22} className="text-primary-600 group-hover:-rotate-12 transition-transform" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[3rem] p-10 md:p-16 shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-black mb-2 hover:gap-4 transition-all group">
              <ChevronLeft size={20} className="group-hover:translate-x-1 transition-transform" />
              <span>العودة للرئيسية</span>
            </Link>
            
            <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary-600/20 rotate-3">
                <Zap size={40} className="text-white" fill="currentColor" />
            </div>
            
            <h1 className="text-4xl font-black dark:text-white tracking-tight">مرحباً بك <span className="text-primary-600">مرة أخرى</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold">سجل دخولك لإدارة منظومتك التعليمية</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <label className="text-sm font-black dark:text-slate-400 pr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input 
                  required
                  type="email" 
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-600 dark:focus:border-primary-600 rounded-2xl py-5 pr-14 pl-5 outline-none transition-all font-bold dark:text-white text-left tracking-wide"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-sm font-black dark:text-slate-400">كلمة المرور</label>
              </div>
              <div className="relative group">
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <input 
                  required
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-600 dark:focus:border-primary-600 rounded-2xl py-5 pr-14 pl-14 outline-none transition-all font-bold dark:text-white text-left tracking-widest"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* عرض رسائل الخطأ بـ AnimatePresence لمنع قفز عناصر الواجهة فجأة */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-[1.5rem] text-sm font-black">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* زر الإرسال والحالة التشغيلية التفاعلية */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary-600/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <LogIn size={22} className="group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* فاصل إنشاء حساب جديد */}
            <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-sm font-bold text-slate-400">أو</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            <Link 
                to="/signup"
                className="w-full py-5 border-2 border-slate-200 dark:border-slate-800 dark:text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
            >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform text-primary-600" />
                <span>إنشاء حساب سنتر جديد</span>
            </Link>

          </form>
        </motion.div>
      </div>
    </div>
  );
}