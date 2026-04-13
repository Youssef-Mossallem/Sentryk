import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Shield, ShieldCheck, Mail, Trash2, Edit3, Search, Loader2, X, UserCog, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../../api/axios';

// --- Types ---
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SECRETARY';
  isActive: boolean;
  createdAt: string;
}

// --- Modal Component ---
const UserModal = ({ isOpen, onClose, onSubmit, initialData }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SECRETARY',
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name, 
        email: initialData.email, 
        password: '', // لا نعرض كلمة المرور القديمة
        role: initialData.role,
        isActive: initialData.isActive 
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'SECRETARY', isActive: true });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // إرسال البيانات المطلوبة فقط في حالة التعديل
      const payload = { ...formData };
      if (initialData && !payload.password) delete (payload as any).password;
      
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl text-sm text-blue-900 dark:text-blue-300 font-bold leading-relaxed">
  يتيح النظام مستويين مختلفين من الصلاحيات: <span className="font-black">الأدمن</span> و <span className="font-black">السكرتيرة</span>.
  <br /><br />
  
  يمتلك <span className="font-black">الأدمن</span> صلاحيات كاملة داخل النظام، حيث يمكنه الوصول إلى جميع الصفحات 
  وإدارة كافة البيانات بدون أي قيود.
  
  <br /><br />
  
  أما <span className="font-black">السكرتيرة</span> فلديها صلاحيات محدودة، حيث يمكنها الوصول فقط إلى 
  صفحتي <span className="font-black">الطلاب</span> و <span className="font-black">المجموعات</span>.
  
  <br /><br />
  
  يمكن للسكرتيرة تعديل بيانات الطلاب، وتجديد الاشتراكات، وكذلك تعديل بيانات المجموعات، 
  لكنها <span className="font-black">لا تستطيع حذف أي بيانات داخل النظام</span>.
  
  <br /><br />
  
  أي صفحات أخرى داخل لوحة التحكم تكون متاحة فقط لـ <span className="font-black">الأدمن</span> ولا يمكن للسكرتيرة الوصول إليها.
</div>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              {initialData ? <UserCog size={20}/> : <UserPlus size={20}/>}
            </div>
            <h3 className="text-xl font-black dark:text-white">
              {initialData ? 'تعديل الصلاحيات' : 'إضافة عضو جديد'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={28} /></button>
        </div>

        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* الاسم */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">الأسم بالكامل</label>
              <div className="relative">
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pr-4 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none dark:text-white font-bold transition-all" placeholder="مثلاً: أحمد محمد" />
              </div>
            </div>

            {/* الإيميل - يظهر فقط عند الإضافة أو للقراءة فقط عند التعديل */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
              <div className="relative">
                <input required disabled={!!initialData} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pr-4 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none dark:text-white font-bold disabled:opacity-50 transition-all font-mono" placeholder="name@example.com" />
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">
                {initialData ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <input required={!initialData} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pr-4 pl-4 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none dark:text-white font-bold transition-all font-mono" placeholder="••••••••" />
              </div>
            </div>

            {/* الدور (Role) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setFormData({...formData, role: 'ADMIN'})} className={`py-3.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${formData.role === 'ADMIN' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <ShieldCheck size={20} />
                <span className="text-xs font-black">مدير (Admin)</span>
              </button>
              <button type="button" onClick={() => setFormData({...formData, role: 'SECRETARY'})} className={`py-3.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${formData.role === 'SECRETARY' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Shield size={20} />
                <span className="text-xs font-black">سكرتارية</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button disabled={loading} type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'حفظ التغييرات' : 'إنشاء الحساب')}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-2xl font-black">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, user: null as User | null });
  const mainUserId = users.length ? Math.min(...users.map(u => u.id)) : null;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (payload: any) => {
    if (modal.user) {
      await api.put(`/users/${modal.user.id}`, payload);
    } else {
      await api.post('/users', payload);
    }
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (id === mainUserId) return alert("لا يمكن حذف الأدمن الرئيسي للنظام!");
    if (!window.confirm("هل أنت متأكد من حذف هذا العضو؟ سيتم حذف جميع سجلات نشاطه أيضاً.")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 text-right max-w-7xl mx-auto min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">فريق العمل</h1>
          <p className="text-slate-500 font-bold">إدارة مديري السنتر، السكرتارية وصلاحيات الوصول</p>
        </div>
        <button onClick={() => setModal({ open: true, user: null })} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <UserPlus size={22}/> إضافة عضو جديد
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            placeholder="ابحث عن عضو (بالاسم أو البريد الإلكتروني)..." 
            className="w-full pr-14 pl-6 py-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border dark:border-slate-800 outline-none dark:text-white font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-indigo-600 rounded-[1.5rem] p-4 flex items-center justify-between text-white shadow-xl shadow-indigo-600/20">
            <div className="bg-white/20 p-3 rounded-2xl">
                <ShieldCheck size={24} />
            </div>
            <div className="text-left">
                <div className="text-xs font-black opacity-60 uppercase">إجمالي الفريق</div>
                <div className="text-2xl font-black">{users.length} أعضاء</div>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] border-b dark:border-slate-800 uppercase tracking-[0.2em]">
                <th className="p-8 text-right font-black">العضو</th>
                <th className="p-8 text-right font-black">الصلاحية</th>
                <th className="p-8 text-right font-black">الحالة</th>
                <th className="p-8 text-center font-black">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={50} /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-32 text-center font-black text-slate-400">لا يوجد أعضاء بهذا الاسم</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}>
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-black dark:text-white text-lg flex items-center gap-2">
                          {user.name}
                          {user.id === mainUserId && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-black">رئيسي</span>}
                        </div>
                        <div className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail size={12}/> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 w-fit ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 border dark:border-slate-700'}`}>
                      {user.role === 'ADMIN' ? <ShieldCheck size={14}/> : <Shield size={14}/>}
                      {user.role === 'ADMIN' ? 'مدير نظام' : 'سكرتارية'}
                    </span>
                  </td>
                  <td className="p-8">
                    <button 
                      onClick={() => user.id !== mainUserId && toggleUserStatus(user)}
                      className={`flex items-center gap-2 font-black text-xs transition-all ${user.isActive ? 'text-emerald-500' : 'text-rose-500'} ${user.id === mainUserId ? 'cursor-default' : 'hover:opacity-70'}`}
                    >
                      {user.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      {user.isActive ? 'نشط الآن' : 'معطل'}
                    </button>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => setModal({ open: true, user })} 
                        className="p-3 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl hover:scale-110 transition-all border border-transparent hover:border-indigo-200"
                        title="تعديل"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        disabled={user.id === mainUserId}
                        onClick={() => deleteUser(user.id)} 
                        className={`p-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl transition-all border border-transparent ${user.id === mainUserId ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 hover:border-rose-200'}`}
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal.open && (
          <UserModal 
            isOpen={modal.open} 
            onClose={() => setModal({ open: false, user: null })} 
            initialData={modal.user}
            onSubmit={handleAction}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}
