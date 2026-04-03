import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import api from "./api/axios";
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import ScrollToTop from "./components/ScrollToTop";

// --- استدعاء الصفحات العامة ---
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Policy from "./pages/public/Policy";
import FAQ from "./pages/public/FAQ";

// --- استدعاء صفحات الحساب (Auth) ---
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// --- استدعاء صفحات لوحة التحكم ---
import Plans from "./pages/protected/Plans";
import Checkout from "./pages/protected/Checkout"; // الصفحة الأسطورية الجديدة
import Dashboard from "./pages/dashboard/Dashboard";
import Students from "./pages/dashboard/Students";
import Subjects from "./pages/dashboard/Subjects";
import Groups from "./pages/dashboard/Groups";
import Users from "./pages/dashboard/Users";
import ActivityLog from "./pages/dashboard/Activity-Log";
import Setting from "./pages/dashboard/Setting";
import SmsWallet from "./pages/dashboard/SMS-Wallet";

function App() {
  const { darkMode } = useThemeStore();
  const {
    isAuthenticated,
    isPaid,
    token,
    user,
    checkSubscription,
    updateAuth,
    logout,
  } = useAuthStore();

  // 1. مزامنة الوضع الليلي مع الـ HTML tag
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 2. التحقق الدوري من حالة الحساب (Silent Refresh)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const verifyAccount = async () => {
      if (!isAuthenticated || !token) return;

      try {
        const response = await api.get("/auth/verify-status");
        if (response.data.success) {
          const { user: updatedUser, token: newToken, center } = response.data;
          updateAuth(updatedUser, newToken, center);
        }
      } catch (error: any) {
        // لا تخرج المستخدم إلا إذا كان الخطأ 401 (انتهت الجلسة فعلياً)
        if (error.response?.status === 401) {
          console.error("❌ Session expired. Logging out...");
          logout();
        }
      }
    };

    if (isAuthenticated) {
      verifyAccount();
      checkSubscription(); // تحديث حالة isPaid بناءً على بيانات السنتر

      interval = setInterval(
        () => {
          verifyAccount();
          checkSubscription();
        },
        5 * 60 * 1000,
      ); // كل 5 دقائق
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, token, updateAuth, logout, checkSubscription]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ================= 1. الصفحات العامة ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/policy" element={<Policy />} />

        {/* ================= 2. صفحات الـ Auth ================= */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : user?.role === "ADMIN" ? (
              // الأدمن يوجه للداشبورد لو دافع، أو للخطط لو مش دافع
              isPaid ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/plans" replace />
              )
            ) : (
              // السكرتير يوجه دائماً لصفحة الطلاب (المسموحة له)
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

        {/* ================= 3. صفحات الدفع والخطط (ADMIN فقط) ================= */}
        <Route
          element={
            <ProtectedRoute requiresAuth={true} allowedRoles={["ADMIN"]} />
          }
        >
          {/* صفحة اختيار الخطط */}
          <Route
            path="/plans"
            element={
              // أضف && user?.role === "ADMIN" للتأكد
              isAuthenticated && isPaid ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Plans />
              )
            }
          />
          {/* صفحة الدفع اليدوي الأسطورية (Checkout) */}
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* ================= 4. لوحة التحكم (Auth + Paid) ================= */}
        <Route
          element={
            <ProtectedRoute
              requiresAuth={true}
              requiresPaid={true} // السكرتير isPaid عنده true تلقائياً في الـ Store
              allowedRoles={["ADMIN", "SECRETARY"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            {/* صفحات مشتركة */}
            <Route path="/students" element={<Students />} />
            <Route path="/groups" element={<Groups />} />

            {/* صفحات الـ ADMIN فقط داخل الداشبورد */}
            <Route
              element={
                <ProtectedRoute requiresAuth={true} allowedRoles={["ADMIN"]} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/users" element={<Users />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/settings" element={<Setting />} />
              <Route path="/sms-wallet" element={<SmsWallet />} />
            </Route>
          </Route>
        </Route>

        {/* ================= 5. إعادة التوجيه الافتراضي ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
