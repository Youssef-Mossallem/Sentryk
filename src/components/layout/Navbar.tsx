import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, User as UserIcon, DownloadCloud } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function Navbar() {
  const { darkMode, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  
  // Logic للتحقق من إمكانية تثبيت الموقع
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="h-24 px-8 flex justify-between items-center bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40">
      
      {/* جهة اليمين: اللوجو أو اسم المشروع ممكن تحطه هنا */}
      <div className="flex items-center gap-2">
         <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
           SENTRYK
         </span>
      </div>

      {/* جهة اليسار: الأدوات وحساب المستخدم */}
      <div className="flex items-center gap-3">
        
        {/* زرار التنزيل الأسطوري */}
        <AnimatePresence>
          {showInstallBtn && (
            <motion.button
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold text-sm shadow-lg overflow-hidden group"
            >
              {/* تأثير اللمعان الخلفي */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              
              <DownloadCloud size={18} className="animate-bounce" />
              <span className="hidden md:inline">تنزيل التطبيق</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* زر التبديل بين الـ Dark/Light */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm hover:shadow-md transition-all"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </motion.button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* بروفايل المستخدم */}
        <div className="flex items-center gap-3 pr-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black dark:text-white leading-none mb-1 group-hover:text-primary-600 transition-colors">
              {user?.name || "يوسف مسلم"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              {user?.role === 'ADMIN' ? 'مدير النظام' : 'سكرتارية السنتر'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-600 p-[2px] shadow-lg shadow-primary-500/20">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center">
              <UserIcon size={22} className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
