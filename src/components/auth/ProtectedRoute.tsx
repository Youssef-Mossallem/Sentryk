import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  requiresAuth?: boolean;
  requiresPaid?: boolean;
  allowedRoles?: ('ADMIN' | 'SECRETARY')[];
}

export default function ProtectedRoute({ 
  requiresAuth = true, 
  requiresPaid = false,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isPaid, user, center } = useAuthStore();
  const location = useLocation();

  // ===========================================================================
  // 1. الصفحات العامة (مثل Login/Signup) — إذا كان مسجل دخول → وجهه حسب حالته
  // ===========================================================================
  if (!requiresAuth && isAuthenticated && user) {
    if (user.role === 'SECRETARY') {
      return <Navigate to="/students" replace />;
    }
    // ADMIN → يروح حسب حالة الاشتراك
    return isPaid ? 
      <Navigate to="/dashboard" replace /> : 
      <Navigate to="/plans" replace />;
  }

  // ===========================================================================
  // 2. يجب تسجيل الدخول أولاً
  // ===========================================================================
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ===========================================================================
  // 3. فحص الصلاحيات حسب الدور (RBAC)
  // ===========================================================================
  if (requiresAuth && allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    console.warn(`🔒 محاولة وصول غير مصرح بها - User ID: ${user.id} | Role: ${user.role}`);
    
    if (user.role === 'SECRETARY') {
      return <Navigate to="/students" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // ===========================================================================
  // 4. فحص حالة الاشتراك (الأهم - Subscription Guard)
  // ===========================================================================
  if (requiresAuth && requiresPaid) {
    let hasActiveAccess = isPaid;

    // تحقق إضافي دقيق للـ TRIAL (حتى لو الـ Store لم يحدث بعد)
    if (!hasActiveAccess && center?.plan === 'TRIAL') {
      if (center.trialStartedAt && !center.trialUsed) {
        const trialStart = new Date(center.trialStartedAt);
        const now = new Date();
        const diffInDays = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
        
        hasActiveAccess = diffInDays >= 0 && diffInDays <= 14;
      }
    }

    if (!hasActiveAccess) {
      console.warn(`🚫 الاشتراك منتهي أو الفترة التجريبية انتهت - Center ID: ${center?.id}`);

      if (user?.role === 'ADMIN') {
        return <Navigate to="/plans" replace />;
      }
      
      // للسكرتارية
      return <Navigate to="/contact" state={{ error: 'expired_center' }} replace />;
    }
  }

  // ===========================================================================
  // 5. كل الفحوصات نجحت → عرض الصفحة
  // ===========================================================================
  return <Outlet />;
}