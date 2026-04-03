import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-700" dir="rtl">
      {/* السايد بار ثابت */}
      <Sidebar />

      {/* المحتوى الرئيسي المحمول */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        
        {/* منطقة المحتوى القابلة للتمرير */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            <Outlet /> 
          </motion.div>
        </div>
      </main>
    </div>
  );
}