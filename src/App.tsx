import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet"; // 🛡️ استيراد الهيلمت لإدارة الميتا داتا ديناميكياً
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import ScrollToTop from "./components/ScrollToTop";

// ===========================================================================
// 1. استدعاء الصفحات العامة (Public Pages) - طبقاً لـ image_ad155f.png
// ===========================================================================
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Policy from "./pages/public/Policy";
import FAQ from "./pages/public/FAQ";

// ===========================================================================
// 2. صفحات الحساب والتحقق العميقة (Auth Pages) - طبقاً لـ image_ad155f.png
// ===========================================================================
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword"; // الصفحة الجديدة المكتشفة
import ResetPassword from "./pages/auth/ResetPassword";   // الصفحة الجديدة المكتشفة

// ===========================================================================
// 3. صفحات لوحة التحكم المخصصة للسناتر (Center Dashboard)
// ===========================================================================
import Plans from "./pages/protected/Plans";
import Checkout from "./pages/protected/Checkout"; 
import Dashboard from "./pages/dashboard/Dashboard";
import Students from "./pages/dashboard/Students";
import Teachers from "./pages/dashboard/Teachers"; 
import RoomsManager from "./pages/dashboard/RoomsManager";
import Users from "./pages/dashboard/Users";
import ActivityLog from "./pages/dashboard/Activity-Log";
import Setting from "./pages/dashboard/Setting";
import SmsWallet from "./pages/dashboard/SMS-Wallet";
import Help from "./pages/dashboard/Contact-dash";
import Attendance from "./pages/dashboard/Attendance";  
import SessionsManager from "./pages/dashboard/SessionsManager"; 
import Schedule from "./pages/dashboard/Schedule"; 

// ===========================================================================
// 4. قطاع الخزنة السيادية الكبرى والبنية التحتية (Super Vault) - طبقاً لـ image_ad155f.png
// ===========================================================================
import VerifyGate from "./pages/super-vault/VerifyGate";
import SuperDashboard from "./pages/super-vault/SuperDashboard";
// import SuperVaultGuard from './pages/super-vault/SuperVaultGuard';


/**
 * 🛡️ جدار حماية البنية التحتية العليا للمنصة (Vault Protected Route Guard)
 * يقوم بالتحقق الصارم من وجود مفاتيح فك التشفير السيادية داخل المتصفح (Session Storage)
 * لمنع الاختراقات العشوائية أو محاولات التسلل المباشر للوحة التحكم العليا دون العبور من البوابة.
 */
const VaultProtectedRoute = () => {
  const vaultKey = sessionStorage.getItem("sentryk_vault_key");
  const vaultSecret = sessionStorage.getItem("sentryk_vault_secret");

  if (!vaultKey || !vaultSecret) {
    console.warn("🔒 [Security Intercept]: Direct access to Super Dashboard blocked. Redirecting to VerifyGate.");
    return <Navigate to="/super-vault/verify" replace />;
  }

  return <Outlet />;
};

function App() {
  const darkMode = useThemeStore((state) => state.darkMode);

  // استخدام الـ Selectors المستقرة من الـ Zustand Store لمنع حالات الـ Re-render العشوائي
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isPaid = useAuthStore((state) => state.isPaid);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const refreshStatus = useAuthStore((state) => state.refreshStatus);

  // 1. مزامنة وتدوير الوضع الليلي (Dark Mode Engine) مع وسم الـ HTML الرئيسي للمنصة
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 2. محرك الفحص والتحقق الدوري الصامت لحالة تجميد السناتر وصلاحية الاشتراكات (Silent Refresh Engine)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const verifyAccount = async () => {
      if (!isAuthenticated || !token) return;
      
      // إطلاق استدعاء تحديث الحالة الشامل وفحص صلاحية السنتر من قواعد البيانات
      await refreshStatus();
    };

    if (isAuthenticated) {
      verifyAccount();

      // جدولة الفحص الأمني التلقائي ليعمل بدقة كل 5 دقائق بدون إزعاج المستخدم
      interval = setInterval(() => {
        verifyAccount();
      }, 5 * 60 * 1000); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, token, refreshStatus]);

  return (
    <Router>
      {/* 🚀 إعدادات الـ Helmet الافتراضية والأسطورية لكامل المنصة لتأمين الفهرسة الذكية */}
      <Helmet>
        <title>SENTRYK | المنظومة التعليمية الذكية المتكاملة ونظام تشغيل السناتر SaaS</title>
        <meta name="description" content="منصة سنترك Sentryk SaaS هي المنظومة التشغيلية المتكاملة لإدارة السناتر ومراكز الدروس الخصوصية بمعمارية Multi-Tenant، حضور ذكي QR، وأتمتة كاملة للواتساب." />
        <meta name="keywords" content="Sentryk, سنترك, نظام إدارة السناتر, حضور ذكي QR, محفظة واتساب مالية, Multi-Tenant SaaS" />
        <meta property="og:title" content="SENTRYK | المنظومة التعليمية الذكية المتكاملة ونظام تشغيل السناتر" />
        <meta property="og:description" content="أتمتة كاملة، حضور ذكي بالـ QR، إدارة اشتراكات مرنة بتقنية priceSnapshot ومحفظة واتساب مالية مستقلة." />
      </Helmet>

      <ScrollToTop />
      <Routes>
        {/* ================= 1. قطاع المسارات والصفحات العامة ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/policy" element={<Policy />} />

        {/* ================= 2. قطاع إدارة الحساب المصحح (Auth System Routes) ================= */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : user?.role === "ADMIN" ? (
              isPaid ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/plans" replace />
              )
            ) : (
              <Navigate to="/students" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/reset-password"
          element={
            !isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />
          }
        />

        {/* ================= 3. قطاع خطط الأسعار وبوابات الدفع والاشتراك (ADMIN فقط) ================= */}
        <Route
          element={
            <ProtectedRoute requiresAuth={true} allowedRoles={["ADMIN"]} />
          }
        >
          {/* اختيار وتعديل باقة السنتر */}
          <Route
            path="/plans"
            element={
              isAuthenticated && isPaid ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Plans />
              )
            }
          />
          {/* صفحة الدفع والتحويل والمراجعة اليدوية للمالية */}
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* ================= 4. غرف العمليات ولوحات تحكم السناتر المقيدة (Auth + Paid) ================= */}
        <Route
          element={
            <ProtectedRoute
              requiresAuth={true}
              requiresPaid={true} 
              allowedRoles={["ADMIN", "SECRETARY"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            {/* صفحات مخصصة ومتاحة للمدراء والمساعدين (السكرتارية) معاً */}
            <Route path="/students" element={<Students />} />
            <Route path="/groups" element={<RoomsManager />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/sessions" element={<SessionsManager />} />
            
            {/* صفحات القيادة والتحليلات السيادية المقيدة للـ ADMIN فقط داخل السنتر */}
            <Route
              element={
                <ProtectedRoute requiresAuth={true} allowedRoles={["ADMIN"]} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects" element={<Teachers />} />
              <Route path="/users" element={<Users />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/settings" element={<Setting />} />
              <Route path="/sms-wallet" element={<SmsWallet />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/contact-dash" element={<Help />} />
            </Route>
          </Route>
        </Route>

        {/* ================= 5. منظومة الخزنة السيادية العليا لحماية البنية التحتية للمنصة الكبرى ================= */}
        {/* بوابة فحص رموز الحماية المشفرة والولوج للخزنة */}
        <Route path="/super-vault/verify" element={<VerifyGate />} />
        
        {/* لوحة التحكم الكبرى للمنصة لإدارة فك التجميد وتوليد الأكواد، محصنة كلياً بالـ Guard */}
        <Route element={<VaultProtectedRoute />}>
          <Route path="/super-vault/dashboard" element={<SuperDashboard />} />
        </Route>

        {/* ================= 6. مسار الطوارئ وإعادة التوجيه التلقائي (Fallback Route) ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;