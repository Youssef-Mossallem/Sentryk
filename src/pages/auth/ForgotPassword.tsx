import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, ChevronLeft, Loader2, Send, 
  CheckCircle2, AlertCircle, Sun, Moon, KeyRound 
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { darkMode, toggleTheme } = useThemeStore();
  
  // قراءة الرابط من .env أو الافتراضي 3000
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء محاولة إرسال الرابط');
      }

      // إظهار حالة النجاح
      setIsSubmitted(true);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-700 text-right flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
        
        {/* الدوائر الديكورية في الخلفية */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"></div>
        </div>

        {/* زر تبديل الثيم */}
        <button 
          onClick={toggleTheme}
          className="fixed top-8 left-8 z-50 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 transition-all"
        >
          {darkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-primary-600" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[3rem] p-10 md:p-16 shadow-2xl relative z-10"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              /* --- مرحلة إدخال الإيميل --- */
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <KeyRound size={40} />
                  </div>
                  <h1 className="text-4xl font-black dark:text-white tracking-tight">نسيت كلمة المرور؟</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black dark:text-slate-400 pr-2">البريد الإلكتروني المسجل</label>
                    <div className="relative group">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                      <input 
                        required
                        type="email" 
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-600 dark:focus:border-primary-600 rounded-2xl py-5 pr-14 pl-5 outline-none transition-all font-bold dark:text-white text-left"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-black"
                      >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    disabled={loading || !email}
                    className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary-600/30 hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>إرسال الرابط</span>
                        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-black hover:text-primary-600 transition-colors">
                      <ChevronLeft size={20} />
                      <span>العودة لتسجيل الدخول</span>
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* --- مرحلة نجاح الإرسال --- */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-10"
              >
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={50} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black dark:text-white">تفقد بريدك الإلكتروني!</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    لقد أرسلنا تعليمات استعادة الحساب إلى <br />
                    <span className="text-primary-600">{email}</span>
                  </p>
                </div>
                
                <div className="pt-6">
                    <p className="text-sm text-slate-400 mb-6 font-bold">لم تصلك الرسالة؟ تأكد من مجلد الـ Spam</p>
                    <Link 
                        to="/login"
                        className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl block transition-transform hover:scale-105"
                    >
                        العودة لتسجيل الدخول
                    </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}