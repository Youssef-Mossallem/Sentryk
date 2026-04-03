import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, X, BookOpen, Layers, 
  DollarSign, Clock, Check, Loader2, 
  Edit3, ChevronRight, Hash
} from 'lucide-react';
import api from '../../api/axios';

// --- Interfaces ---
interface IPrice {
  id?: number;
  stage: 'PRIMARY' | 'MIDDLE' | 'HIGH';
  subscriptionType: 'MONTHLY' | 'COURSE';
  price: number | string;
  durationInMonths?: number | null;
}

interface ISubject {
  id?: number;
  name: string;
  prices: IPrice[];
}

// --- Constants ---
const STAGES = {
  PRIMARY: 'الابتدائية',
  MIDDLE: 'الإعدادية',
  HIGH: 'الثانوية'
} as const;

const SUB_TYPES = {
  MONTHLY: 'اشتراك شهري',
  COURSE: 'كورس كامل'
} as const;

// --- Subject Modal Component ---
const SubjectModal = ({ isOpen, onClose, onSubmit, initialData }: any) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<ISubject[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSubjects([{
          id: initialData.id,
          name: initialData.name,
          prices: initialData.prices.map((p: any) => ({
            stage: p.stage,
            subscriptionType: p.subscriptionType,
            price: p.price,
            durationInMonths: p.durationInMonths || 1
          }))
        }]);
      } else {
        setSubjects([{ name: '', prices: [{ stage: 'HIGH', subscriptionType: 'MONTHLY', price: '', durationInMonths: 1 }] }]);
      }
    }
  }, [initialData, isOpen]);

  const isFormValid = useMemo(() => {
    return subjects.every(sub => 
      sub.name.trim() !== '' && 
      sub.prices.length > 0 &&
      sub.prices.every((p: any) => Number(p.price) > 0)
    );
  }, [subjects]);

  const addSubject = () => setSubjects([...subjects, { name: '', prices: [{ stage: 'HIGH', subscriptionType: 'MONTHLY', price: '', durationInMonths: 1 }] }]);
  const removeSubject = (index: number) => setSubjects(subjects.filter((_, i) => i !== index));

  const addPrice = (sIndex: number) => {
    const updated = [...subjects];
    updated[sIndex].prices.push({ stage: 'HIGH', subscriptionType: 'MONTHLY', price: '', durationInMonths: 1 });
    setSubjects(updated);
  };

  const removePrice = (sIndex: number, pIndex: number) => {
    const updated = [...subjects];
    updated[sIndex].prices = updated[sIndex].prices.filter((_, i) => i !== pIndex);
    setSubjects(updated);
  };

  const updateVal = (sIndex: number, pIndex: number | null, field: string, val: any) => {
    const updated = [...subjects];
    if (pIndex === null) {
      (updated[sIndex] as any)[field] = val;
    } else {
      (updated[sIndex].prices[pIndex] as any)[field] = val;
    }
    setSubjects(updated);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);

    try {
      const cleanedSubjects = subjects.map(s => ({
        name: s.name.trim(),
        prices: s.prices.map((p) => ({
          stage: p.stage,
          subscriptionType: p.subscriptionType,
          price: Number(p.price),
          durationInMonths: p.subscriptionType === 'COURSE' ? Number(p.durationInMonths) : null
        }))
      }));

      const payload = initialData 
        ? { 
            subjects: cleanedSubjects,
            name: cleanedSubjects[0].name,
            prices: cleanedSubjects[0].prices
          }
        : { subjects: cleanedSubjects };

      await onSubmit(payload);
    } catch (err: any) {
      alert(err.response?.data?.error || "فشل الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black dark:text-white">{initialData ? 'تحديث مادة' : 'إضافة مواد جديدة'}</h3>
              <p className="text-xs text-slate-500 font-bold">إدارة تفاصيل المنهج</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleFinalSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {subjects.map((sub, sIndex) => (
            <div key={sIndex} className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 relative">
              {!initialData && subjects.length > 1 && (
                <button type="button" onClick={() => removeSubject(sIndex)} className="absolute -top-3 -left-3 p-2 bg-rose-500 text-white rounded-lg shadow-md hover:scale-110 transition-all"><Trash2 size={16} /></button>
              )}

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-xs font-black text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-2">
                      <Hash size={14} className="text-indigo-500" /> اسم المادة الدراسية
                    </label>
                    <input 
                      required value={sub.name} onChange={e => updateVal(sIndex, null, 'name', e.target.value)}
                      placeholder="مثال: رياضيات، لغة عربية..." 
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold dark:text-white transition-all text-base"
                    />
                  </div>
                  {!initialData && (
                    <button type="button" onClick={addSubject} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-black hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 text-sm">
                      <Plus size={18} /> مادة أخرى
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-sm font-black text-indigo-600 flex items-center gap-2">
                      <DollarSign size={16} /> تسعير المراحل
                    </h4>
                    <button type="button" onClick={() => addPrice(sIndex)} className="text-[11px] font-black bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5">
                      <Plus size={14} /> إضافة سعر
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {sub.prices.map((price, pIndex) => (
                      <div key={pIndex} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border dark:border-slate-800">
                        <select 
                          value={price.stage} onChange={e => updateVal(sIndex, pIndex, 'stage', e.target.value)}
                          className="flex-1 min-w-[120px] bg-white dark:bg-slate-800 p-2.5 rounded-lg border-none font-bold text-xs dark:text-white"
                        >
                          {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <select 
                          value={price.subscriptionType} onChange={e => updateVal(sIndex, pIndex, 'subscriptionType', e.target.value)}
                          className="flex-1 min-w-[130px] bg-white dark:bg-slate-800 p-2.5 rounded-lg border-none font-bold text-xs dark:text-white"
                        >
                          {Object.entries(SUB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>

                        <div className="relative flex-1 min-w-[100px]">
                          <input 
                            type="number" required placeholder="السعر" value={price.price}
                            onChange={e => updateVal(sIndex, pIndex, 'price', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 p-2.5 pr-8 rounded-lg border-none font-bold text-xs dark:text-white"
                          />
                          <DollarSign className="absolute right-2 top-2.5 text-slate-400" size={14} />
                        </div>

                        {price.subscriptionType === 'COURSE' && (
                          <div className="relative flex-1 min-w-[90px]">
                            <input 
                              type="number" required placeholder="شهور" value={price.durationInMonths || ''}
                              onChange={e => updateVal(sIndex, pIndex, 'durationInMonths', e.target.value)}
                              className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 p-2.5 pr-8 rounded-lg border-none font-bold text-xs dark:text-indigo-600"
                            />
                            <Clock className="absolute right-2 top-2.5 text-indigo-400" size={14} />
                          </div>
                        )}

                        {sub.prices.length > 1 && (
                          <button type="button" onClick={() => removePrice(sIndex, pIndex)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </form>

        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 flex gap-4 border-t dark:border-slate-800">
          <button 
            disabled={loading || !isFormValid} 
            onClick={handleFinalSubmit}
            className={`flex-[2] py-3.5 rounded-xl font-black text-base shadow-lg transition-all flex justify-center items-center gap-2 ${
              isFormValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {initialData ? 'حفظ التعديلات' : 'إضافة المادة'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white dark:bg-slate-800 dark:text-white rounded-xl font-bold border dark:border-slate-700 hover:bg-slate-50">إلغاء</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page ---
export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{open: boolean, data: ISubject | null}>({ open: false, data: null });

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleAction = async (payload: any) => {
    try {
      if (modal.data && modal.data.id) {
        await api.put(`/subjects/${modal.data.id}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      setModal({ open: false, data: null });
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "حدث خطأ");
    }
  };

  const deleteSubject = async (id: number) => {
    if (!window.confirm("حذف المادة بشكل نهائي؟")) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err: any) { alert(err.response?.data?.error); }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1440px] mx-auto space-y-10" dir="rtl">
      
      {/* Header - المصغر والأنيق */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">المواد الدراسية</h1>
            <p className="text-slate-500 font-bold text-sm">إدارة وتسعير المناهج التعليمية</p>
          </div>
        </div>
        <button 
          onClick={() => setModal({ open: true, data: null })}
          className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-black shadow-indigo-600/20 shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-base w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> إضافة مادة
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <motion.div 
              layout key={sub.id} className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all duration-300 flex flex-col group overflow-hidden"
            >
              <div className="p-6 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal({ open: true, data: sub })} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"><Edit3 size={18} /></button>
                    <button onClick={() => sub.id && deleteSubject(sub.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black dark:text-white leading-tight">{sub.name}</h3>
                  <div className="space-y-2">
                    {sub.prices.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl border dark:border-slate-700/30">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-indigo-500">{(STAGES as any)[p.stage]}</span>
                          <span className="text-[9px] font-bold text-slate-400">{(SUB_TYPES as any)[p.subscriptionType]}</span>
                        </div>
                        <span className="font-black text-lg text-slate-900 dark:text-white">{p.price} <small className="text-[10px]">ج.م</small></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50/30 dark:bg-slate-800/20 border-t dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Hash size={10} /> {sub.id}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <SubjectModal 
            isOpen={modal.open} onClose={() => setModal({ open: false, data: null })}
            initialData={modal.data} onSubmit={handleAction}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}