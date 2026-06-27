import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserPlus,
  Users,
  Menu,
  TableProperties,
  X,
  PhoneCall,
  Sun,
  Moon,
  Camera,
  Calendar
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: '/dashboard', roles: ['ADMIN'] },
  { icon: <Users size={20} />, label: 'الطلاب', path: '/students', roles: ['ADMIN', 'SECRETARY'] },
  { icon: <BookOpen size={20} />, label: ' المدرسين والمواد', path: '/subjects', roles: ['ADMIN'] },
  { icon: <Layers size={20} />, label: 'القاعات والغرف', path: '/groups', roles: ['ADMIN', 'SECRETARY'] },
  { icon: <Calendar size={20} />, label: 'الحصص والمجموعات', path: '/sessions', roles: ['ADMIN', 'SECRETARY'] },
  { icon: <TableProperties size={20} />, label: 'الجدول الزمني', path: '/schedule', roles: ['ADMIN', 'SECRETARY'] },
  { icon: <UserPlus size={20} />, label: ' المستخدمين', path: '/users', roles: ['ADMIN'] },
  { icon: <MessageSquare size={20} />, label: 'محفظة whatsapp', path: '/sms-wallet', roles: ['ADMIN'] },
  { icon: <Camera size={20} />, label: 'الحضور والغياب', path: '/attendance', roles: ['ADMIN', 'SECRETARY'] },
  { icon: <History size={20} />, label: 'سجل النشاط', path: '/activity-log', roles: ['ADMIN'] },
  { icon: <PhoneCall size={20} />, label: 'تواصل معنا', path: '/contact-dash', roles: ['ADMIN', 'SECRETARY'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { darkMode, toggleTheme } = useThemeStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'SECRETARY';
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // مكون محتوى السايد بار المشترك
  const SidebarContent = () => (
    <>
      <div className="p-8 flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-600/30 overflow-hidden"
        >
          <img src="/favicon.svg" alt="Sentryk Logo" className="w-8 h-8 object-contain" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter dark:text-white leading-none">SENTRYK</h1>
          <span className="text-[10px] font-black text-primary-600 tracking-[0.2em] uppercase">Pro Version</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">القائمة الرئيسية</p>
        {menuItems.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "group flex items-center gap-4 px-4 py-4 rounded-[1.5rem] font-bold transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-primary-600"
              )}
            >
              <span className={clsx("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>
                {item.icon}
              </span>
              <span className="text-base">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-2 w-1.5 h-6 bg-white/40 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-2">
        {/* زر تبديل الوضع داخل السايد بار (اختياري إضافي) */}
        <button 
          onClick={toggleTheme}
          className="flex lg:hidden items-center gap-4 px-4 py-4 w-full rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          {darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
        </button>

        {userRole === 'ADMIN' && (
          <Link 
            to="/settings"
            className="flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all"
          >
            <Settings size={20} />
            إعدادات النظام
          </Link>
        )}
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. ناف بار الموبايل العلوي (تمت إضافة زر الثيم هنا) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/favicon.svg" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-xl font-black dark:text-white">SENTRYK</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* زر الدارك مود للموبايل */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
          >
            {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>

          {/* زر المنيو */}
          <button 
              onClick={() => setIsOpen(true)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-300"
          >
              <Menu size={24} />
          </button>
        </div>
      </div>

      {/* 2. السايد بار للديسك توب */}
      <aside className="w-72 h-screen hidden lg:flex flex-col bg-white dark:bg-[#020617] border-l border-slate-200 dark:border-slate-800/50 sticky top-0 z-50">
        <SidebarContent />
      </aside>

      {/* 3. دراور الموبايل (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white dark:bg-[#020617] z-[80] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="absolute left-4 top-6">
                 <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-rose-500 shadow-sm"
                 >
                    <X size={24} />
                 </button>
              </div>
              
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
