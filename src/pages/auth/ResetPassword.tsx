import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye, EyeOff,
  Loader2,
  Lock,
  Moon,
  Save,
  ShieldCheck,
  Sun
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';

export default function ResetPassword() {
  const { darkMode, toggleTheme } = useThemeStore();
  const { token } = useParams(); // سحب التوكن من الرابط /reset-password/:token
  const navigate = useNavigate();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمتي المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'انتهت صلاحية الرابط أو حدث خطأ ما');
      }

      setSuccess(true);
      // التوجيه لصفحة اللوجن بعد 3 ثواني
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
        
        {/* تأثيرات الخلفية */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent opacity-20"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

        {/* زر تبديل الثيم */}
        <button 
          onClick={toggleTheme}
          className="fixed top-8 left-8 z-50 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
        >
          {darkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-primary-600" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[3rem] p-10 md:p-16 shadow-2xl relative z-10"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="reset-form" exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary-600/10 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <ShieldCheck size={40} />
                  </div>
                  <h1 className="text-4xl font-black dark:text-white tracking-tight">كلمة مرور جديدة</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">قم بتعيين كلمة مرور قوية لحماية حسابك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* كلمة المرور الجديدة */}
                  <div className="space-y-2">
                    <label className="text-sm font-black dark:text-slate-400 pr-2">كلمة المرور الجديدة</label>
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
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-600 rounded-2xl py-5 pr-14 pl-14 outline-none transition-all font-bold dark:text-white text-left"
                        placeholder="••••••••"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* تأكيد كلمة المرور */}
                  <div className="space-y-2">
                    <label className="text-sm font-black dark:text-slate-400 pr-2">تأكيد كلمة المرور</label>
                    <div className="relative group">
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                      <input 
                        required
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-600 rounded-2xl py-5 pr-14 pl-14 outline-none transition-all font-bold dark:text-white text-left"
                        placeholder="••••••••"
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-black">
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary-600/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>تحديث كلمة المرور</span>
                        <Save size={20} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success-msg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-6">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={60} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black dark:text-white">تم التغيير بنجاح!</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">تم تحديث كلمة المرور الخاصة بك. جارٍ تحويلك لصفحة الدخول...</p>
                </div>
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}