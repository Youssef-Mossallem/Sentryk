import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, User, Mail, Lock, Phone, 
  Building2, ChevronLeft, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  Sun, Moon, XCircle
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../api/axios"; // استيراد الأكسيوس كما طلبت

export default function Signup() {
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    centerName: '',
    phone: '',
    adminName: '',
    email: '',
    password: ''
  });

  // دوال التحقق (Validation Logic)
  const isPasswordStrong = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const isPhoneValid = (phone: string) => {
    return phone.length === 11 && /^[0-9]+$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من رقم الهاتف
    if (!isPhoneValid(formData.phone)) {
      setError('يجب أن يتكون رقم الهاتف من 11 رقم فقط');
      return;
    }

    // التحقق من قوة كلمة المرور
    if (!isPasswordStrong(formData.password)) {
      setError('كلمة المرور لا تستوفي الشروط الأمنية المطلوبة');
      return;
    }

    if (!agreed) return;
    
    setLoading(true);

    try {
      // استخدام api.post مباشرة (الرابط الأساسي معرف في axios.js)
      const response = await api.post('/auth/signup', formData);

      // حفظ التوكن في LocalStorage
      localStorage.setItem('token', response.data.token);
      
      // التوجيه لصفحة الخطط
      navigate('/plans');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ ما أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} transition-colors duration-700`} dir="rtl">
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col lg:flex-row overflow-hidden text-right">
        
        {/* زر تبديل الوضع */}
        <button 
          type="button"
          onClick={toggleTheme}
          className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 transition-all"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-primary-600" />}
        </button>

        {/* الجانب الأيسر (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:w-1/2 bg-primary-600 relative items-center justify-center p-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10 text-white space-y-8 max-w-lg">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl">
              <Zap size={40} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tight">ابدأ رحلة <span className="text-slate-900/30">التحول الرقمي</span> لمنظومتك التعليمية.</h2>
            <p className="text-xl text-primary-100 font-medium">انضم إلى مئات المدرسين الذين اختاروا "سنتريك" لإدارة مراكزهم بذكاء واحترافية.</p>
            
            <div className="space-y-4 pt-8">
              {['أمان تام لبيانات طلابك', 'تقارير مالية تفصيلية', 'دعم فني على مدار الساعة'].map((text, i) => (
                <div key={i} className="flex items-center gap-3 font-bold">
                  <CheckCircle2 size={20} className="text-slate-900/30" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* الجانب الأيمن (Form) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="text-center lg:text-right space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-black mb-4 group">
                <ChevronLeft size={20} className="group-hover:translate-x-1 transition-transform" />
                <span>العودة للرئيسية</span>
              </Link>
              <h1 className="text-4xl font-black dark:text-white">إنشاء حساب جديد</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold">قم بإدخال بياناتك وبيانات السنتر للبدء</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-black pr-2 dark:text-slate-300">اسم السنتر</label>
                  <div className="relative group">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white shadow-sm"
                      placeholder="سنتر النخبة"
                      value={formData.centerName}
                      onChange={(e) => setFormData({...formData, centerName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black pr-2 dark:text-slate-300">رقم الهاتف (11 رقم)</label>
                  <div className="relative group">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      required
                      type="tel" 
                      maxLength={11}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white text-left shadow-sm"
                      placeholder="010XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">اسم المسؤول (الأدمن)</label>
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white shadow-sm"
                    placeholder="يوسف أحمد"
                    value={formData.adminName}
                    onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white text-left shadow-sm"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">كلمة المرور</label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'} 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-12 outline-none focus:border-primary-600 transition-all font-bold dark:text-white text-left shadow-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {/* متطلبات كلمة المرور الموضحة بصرياً */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 px-2">
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} حرف كبير
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`}>
                    {/[a-z]/.test(formData.password) ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} حرف صغير
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${/\d/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`}>
                    {/\d/.test(formData.password) ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} أرقام
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${/[@$!%*?&]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`}>
                    {/[@$!%*?&]/.test(formData.password) ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} رمز خاص
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2">
                <input 
                  type="checkbox" 
                  id="policy" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-primary-600 cursor-pointer rounded-lg"
                />
                <label htmlFor="policy" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  أوافق على <Link to="/policy" className="text-primary-600 hover:underline">شروط الاستخدام</Link>
                </label>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-bold"
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                disabled={loading || !agreed}
                className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <span>إنشاء حسابي الآن</span>
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                )}
              </button>

              <p className="text-center font-bold text-slate-500 dark:text-slate-400 pt-4">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
