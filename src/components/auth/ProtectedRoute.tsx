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
  const { isAuthenticated, isPaid, user } = useAuthStore();
  const location = useLocation();

  // 1. فحص تسجيل الدخول: إذا لم يكن مسجلاً، اذهب لصفحة الدخول
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. فحص الصلاحيات (Roles): إذا كان الدور غير مسموح به لهذه الصفحة
  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    // إذا كان سكرتير يحاول دخول صفحة أدمن، وجهه لصفحة الطلاب (المسموحة له)
    if (user.role === 'SECRETARY') {
      return <Navigate to="/students" replace />;
    }
    // لغير ذلك، ارجع للصفحة الرئيسية
    return <Navigate to="/" replace />;
  }

  // 3. فحص الاشتراك المدفوع (Paid Status)
  if (requiresPaid && !isPaid) {
    // إذا كان أدمن وغير دافع، وجهه لصفحة الخطط
    if (user?.role === 'ADMIN') {
      return <Navigate to="/plans" replace />;
    }
    
    // إذا كان سكرتير وغير دافع (بسبب انتهاء اشتراك السنتر مثلاً)
    // لا نوجهه للخطط لأنه ليس لديه صلاحية الدفع، نوجهه لصفحة الطلاب أو الدعم
    return <Navigate to="/contact" replace />;
  }

  // إذا اجتاز كل الفحوصات، اعرض محتوى الصفحة
  return <Outlet />;
}