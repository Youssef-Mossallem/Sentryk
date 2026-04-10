import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, User as UserIcon, DownloadCloud } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function Navbar() {
  const { darkMode, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  
  // Logic للحصول على حدث التثبيت (PWA)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
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
      
      {/* جهة اليمين: اللوجو أو اسم النظام (تركتها كما هي لعدم وجودها في الكود الأصلي) */}
      <div className="flex items-center gap-4">
        {/* يمكنك وضع اللوجو هنا إذا أردت */}
      </div>

      {/* جهة اليسار: الأدوات وحساب المستخدم */}
      <div className="flex items-center gap-3">
        
        {/* زر التنزيل الأسطوري - يظهر فقط إذا كان الموقع متاح للتثبيت */}
        <AnimatePresence>
          {showInstallBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" 
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold shadow-lg overflow-hidden transition-all"
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <DownloadCloud size={20} />
              </motion.div>
              <span className="text-sm hidden md:block">تثبيت سنترك</span>
              
              {/* تأثير لمعان (Glow Effect) */}
              <div className="absolute inset-0 bg-white/20 group-hover:left-full -left-full transition-all duration-500 skew-x-12" />
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

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

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
