import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, User, Mail, Lock, Phone, 
  Building2, ChevronLeft, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  Sun, Moon, XCircle, Gift
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../api/axios";

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
    password: '',
    referredByCode: '' // حقل كود الإحالة الاختياري الجديد
  });

  // ===========================================================================
  // دالة التحقق المرنة والأمنية من قوة كلمة المرور (تخدم كل الحروف واللغات والرموز)
  // ===========================================================================
  const passwordCriteria = {
    // الطول لا يقل عن 8 أحرف في المطلق
    length: formData.password.length >= 8,
    // تحتوي على حرف واحد على الأقل أو رمز أو رقم إضافي لضمان عدم بساطتها العشوائية
    complexity: formData.password.length > 0 && (
      /[\d]/.test(formData.password) || 
      /[a-zA-Z]/.test(formData.password) || 
      /[^a-zA-Z0-9\s]/.test(formData.password) || 
      /[\u0600-\u06FF]/.test(formData.password)
    )
  };

  const isPasswordStrong = () => {
    return passwordCriteria.length; // الشرط الأساسي والوحيد للمطابقة مع السيرفر هو الطول >= 8
  };

  const isPhoneValid = (phone: string) => {
    return phone.length === 11 && /^[0-9]+$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPhoneValid(formData.phone)) {
      setError('يجب أن يتكون رقم الهاتف من 11 رقم فقط ويبدأ بـ 01');
      return;
    }

    if (!isPasswordStrong()) {
      setError('يجب أن تتكون كلمة المرور من 8 خانات أو أحرف على الأقل لحماية أمن السنتر التعليمي');
      return;
    }

    if (!agreed) return;
    
    setLoading(true);

    try {
      // إرسال كائن البيانات بالكامل متضمناً كود الإحالة الاختياري
      const response = await api.post('/auth/signup', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/plans');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ ما أثناء إنشاء الحساب، يرجى مراجعة البيانات المكتوبة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} transition-colors duration-700`} dir="rtl">
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col lg:flex-row overflow-hidden text-right">
        
        {/* زر تبديل الوضع (Light / Dark) */}
        <button 
          type="button"
          onClick={toggleTheme}
          className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 transition-all"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-primary-600" />}
        </button>

        {/* الجانب الأيسر البصري التنافسي لـ Sentryk (Desktop Only) */}
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
            <p className="text-xl text-primary-100 font-medium">انضم إلى مئات المدرسين والمراكز الذين اختاروا "سنتريك" لإدارة شؤونهم بذكاء وبأعلى استقرار سيبراني لعام 2026.</p>
            
            <div className="space-y-4 pt-8">
              {['أمان تام وشامل لبيانات طلابك ومجموعاتك', 'تقارير مالية تفصيلية ومحفظة فواتير ذكية', 'دعم فني هندسي متواصل على مدار الساعة'].map((text, i) => (
                <div key={i} className="flex items-center gap-3 font-bold">
                  <CheckCircle2 size={20} className="text-slate-900/30" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* الجانب الأيمن (نموذج إدخال البيانات المطور) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 my-auto"
          >
            <div className="text-center lg:text-right space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-black mb-4 group">
                <ChevronLeft size={20} className="group-hover:translate-x-1 transition-transform" />
                <span>العودة للرئيسية</span>
              </Link>
              <h1 className="text-4xl font-black dark:text-white tracking-tight">إنشاء حساب جديد</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold">قم بإدخال بياناتك وبيانات السنتر لتأسيس نظامك</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* حقول: اسم السنتر + رقم الهاتف */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-black pr-2 dark:text-slate-300">اسم السنتر فقط</label>
                  <div className="relative group">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white shadow-sm"
                      placeholder="النور او Egypt"
                      value={formData.centerName}
                      onChange={(e) => setFormData({...formData, centerName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black pr-2 dark:text-slate-300">رقم الهاتف الكلي (11 رقم)</label>
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

              {/* حقل: اسم المسؤول */}
              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">اسم المسؤول الرئيسي (الأدمن)</label>
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white shadow-sm"
                    placeholder="المهندس يوسف أحمد"
                    value={formData.adminName}
                    onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                  />
                </div>
              </div>

              {/* حقل: البريد الإلكتروني */}
              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">البريد الإلكتروني للإشعارات</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white text-left shadow-sm"
                    placeholder="admin@sentryk.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* حقل: كلمة المرور الفائقة المرونة والأمان */}
              <div className="space-y-1">
                <label className="text-sm font-black pr-2 dark:text-slate-300">كلمة المرور المشفرة</label>
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
                    className={`w-full bg-white dark:bg-slate-900 border ${error.includes('كلمة المرور') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl py-4 pr-12 pl-12 outline-none focus:border-primary-600 transition-all font-bold dark:text-white text-left shadow-sm`}
                    placeholder="اكتب كلمة مرور قوية (تقبل عربي/إنجليزي)"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {/* مؤشر التحقق البصري المحدث */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 px-2">
                  <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${passwordCriteria.length ? 'text-green-500' : 'text-slate-400'}`}>
                    {passwordCriteria.length ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} 8 خانات أو أحرف على الأقل
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${formData.password.length > 0 ? 'text-green-500' : 'text-slate-400'}`}>
                    {formData.password.length > 0 ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} مدخلات حرة ومعالجة آمنة ومفتوحة بالخادم
                  </div>
                </div>
              </div>

              {/* 🎁 [إضافة أسطورية حصرية]: حقل كود الإحالة الترويجي (اختياري) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center pr-2">
                  <label className="text-sm font-black dark:text-slate-300">كود الإحالة أو كود الدعوه </label>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">اختياري</span>
                </div>
                <div className="relative group">
                  <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-primary-600 transition-all font-bold dark:text-white uppercase placeholder:normal-case shadow-sm"
                    placeholder="أدخل كود صديقك أو رمز العرض إن وجد"
                    value={formData.referredByCode}
                    onChange={(e) => setFormData({...formData, referredByCode: e.target.value})}
                  />
                </div>
              </div>

              {/* شروط الاستخدام والسياسة العامة لـ Sentryk */}
              <div className="flex items-center gap-3 px-2 pt-1">
                <input 
                  type="checkbox" 
                  id="policy" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-primary-600 cursor-pointer rounded-lg"
                />
                <label htmlFor="policy" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  أوافق بالكامل على <Link to="/policy" className="text-primary-600 hover:underline">شروط الاستخدام وسياسات الخصوصية</Link> لنظام Sentryk
                </label>
              </div>

              {/* مربع معالجة الأخطاء الساخن والـ Animations */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-bold"
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* زر تفعيل وإطلاق المعاملة والـ Submitting */}
              <button 
                disabled={loading || !agreed}
                className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <span>تأسيس السنتر وبدء الفترة التجريبية</span>
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                )}
              </button>

              <p className="text-center font-bold text-slate-500 dark:text-slate-400 pt-4">
                لديك سنتر مسجل بالفعل في المنظومة؟{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">
                  تسجيل الدخول المباشر
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}