import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  Phone,
  RefreshCw,
  Save,
  Settings,
  Share2,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

// 1. تعريف شكل بيانات المركز لحل مشاكل TypeScript
interface CenterData {
  id: string;
  name: string;
  phone: string;
  plan: string;
  referralCode: string;
  referralCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CenterSettings() {
  const [center, setCenter] = useState<CenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plan: ''
  });

  useEffect(() => {
    fetchCenterData();
  }, []);

  const fetchCenterData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/centers');
      if (res.data.success) {
        const centerData = res.data.center;
        setCenter(centerData);
        setFormData({
          name: centerData.name || '',
          phone: centerData.phone || '',
          plan: centerData.plan || ''
        });
      }
    } catch (err: any) {
      toast.error("فشل في تحميل بيانات المركز");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("اسم المركز مطلوب");
    
    setSaving(true);
    try {
      const res = await api.put('/centers', formData);
      if (res.data.success) {
        setCenter(res.data.center);
        toast.success("تم تحديث البيانات بنجاح");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCenter = async () => {
    try {
      const res = await api.delete('/centers');
      if (res.data.success) {
        toast.success("تم حذف المركز وجميع بياناته بنجاح");
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.replace('/register');
        }, 1500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "فشل حذف المركز";
      toast.error(errorMsg);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-primary-600" size={50} />
        <Settings className="absolute inset-0 m-auto text-primary-200 animate-pulse" size={20} />
      </div>
      <p className="font-black text-slate-400 animate-pulse">جاري جلب إعداداتك...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 text-primary-600">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">إعدادات المنصة</h1>
            <p className="text-slate-400 text-sm font-bold mt-1">تحكم في هوية المركز والخيارات الإدارية</p>
          </div>
        </div>
        <button 
          onClick={fetchCenterData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-400 hover:text-primary-600 transition-colors"
        >
          <RefreshCw size={14} /> تحديث البيانات
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'general', label: 'البيانات العامة', icon: <Building2 size={16}/> },
          { id: 'subscription', label: 'خطة الاشتراك', icon: <Award size={16}/> },
          { id: 'danger', label: 'منطقة الخطر', icon: <ShieldAlert size={16}/> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
              activeTab === tab.id 
                ? (tab.id === 'danger' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm') 
                : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.form 
              key="general"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleUpdate} className="p-10 space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-500 flex items-center gap-2 pr-2">
                    <Building2 size={18} className="text-primary-600" /> اسم المركز الدراسي
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: سنتر الأوائل"
                    className="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-500 flex items-center gap-2 pr-2">
                    <Phone size={18} className="text-primary-600" /> رقم التواصل الرسمي
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="010xxxxxxx"
                    className="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold dark:text-white outline-none text-left"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <button 
                  type="submit" disabled={saving}
                  className="group flex items-center gap-3 px-12 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/25 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} className="group-hover:scale-110 transition-transform" />}
                  حفظ التعديلات الجديدة
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'subscription' && (
            <motion.div 
              key="sub"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-primary-700 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                  <Award className="absolute -bottom-10 -left-10 w-48 h-48 text-white/10 -rotate-12" />
                  <div className="relative z-10">
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Active Plan</span>
                    <h3 className="text-4xl font-black mt-4 mb-8 tracking-tight">{center?.plan || 'Standard'}</h3>
                    <div className="flex items-center gap-3 text-sm font-bold bg-black/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                      <CheckCircle2 size={18} className="text-emerald-400" /> اشتراكك ساري المفعول
                    </div>
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-primary-600 shadow-sm border border-slate-50 dark:border-slate-800">
                      <Share2 size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-400 mb-1 uppercase">Total Referrals</p>
                      <p className="text-3xl font-black dark:text-white tracking-tighter">{center?.referralCount || 0}</p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-xs font-black text-slate-500 mb-3 flex items-center gap-2">كود الإحالة الخاص بك <Info size={14}/></p>
                    <div 
                      onClick={() => {
                        if (center?.referralCode) {
                          navigator.clipboard.writeText(center.referralCode);
                          toast.success("تم نسخ الكود");
                        }
                      }}
                      className="group flex items-center justify-between p-5 bg-white dark:bg-slate-950 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-500 transition-all"
                    >
                      <span className="font-mono text-xl font-black text-primary-600 tracking-[0.3em]">{center?.referralCode || '------'}</span>
                      <span className="text-[10px] font-black text-slate-300 group-hover:text-primary-500">اضغط للنسخ</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'danger' && (
            <motion.div 
              key="danger"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="p-10"
            >
              <div className="bg-rose-50/50 dark:bg-rose-500/5 border-2 border-rose-100 dark:border-rose-500/10 p-10 rounded-[3rem] text-center md:text-right">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-rose-500/40">
                    <ShieldAlert size={45} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-2xl font-black text-rose-600">إغلاق وحذف المركز نهائياً</h4>
                    <p className="text-slate-500 font-bold leading-relaxed max-w-2xl">
                      هذا الإجراء سيقوم بحذف <span className="text-rose-600 font-black">كل شيء</span>. الطلاب، المدرسين، سجلات الحضور، والاشتراكات المالية. بمجرد الضغط، لا يمكن التراجع أو استعادة البيانات تحت أي ظرف.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-10 py-5 bg-rose-500 text-white rounded-[1.5rem] font-black hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/25 active:scale-95 whitespace-nowrap"
                  >
                    بدء عملية الحذف
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
             <Info size={20} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ الانضمام</p>
             <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
               {center?.createdAt ? new Date(center.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' }) : '---'}
             </p>
           </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500">
             <AlertTriangle size={20} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase">آخر تحديث للملف</p>
             <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
               {center?.updatedAt ? new Date(center.updatedAt).toLocaleDateString('ar-EG', { dateStyle: 'full' }) : '---'}
             </p>
           </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-rose-500" />
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trash2 size={45} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black dark:text-white">تأكيد الحذف النهائي</h3>
                <p className="text-slate-500 font-bold leading-relaxed">
                  أنت على وشك مسح سنتر <span className="text-rose-500 font-black px-1 underline">{center?.name}</span>. سيتم تسجيل خروجك فوراً ومسح كافة بيانات الدخول من متصفحك.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all"
                >
                  إلغاء العملية
                </button>
                <button 
                  onClick={handleDeleteCenter}
                  className="p-5 bg-rose-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all"
                >
                  تأكيد الحذف والمسح
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}