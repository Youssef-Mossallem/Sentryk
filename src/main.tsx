import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* الـ Toaster هنا عشان تظهر فوق أي صفحة في التطبيق */}
    <Toaster 
      position="top-center"
      toastOptions={{
        className: 'dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700',
        duration: 4000,
      }} 
    />
    <App />
  </React.StrictMode>,
);
