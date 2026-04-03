// 1. التعريفات الأساسية (Enums) - متوافقة تماماً مع قاعدة البيانات (Prisma)
export type Role = 'ADMIN' | 'SECRETARY';
export type Stage = 'PRIMARY' | 'MIDDLE' | 'HIGH';
export type PlanType = 'TRIAL' | 'MONTHLY' | 'YEARLY' | 'FREE'; // أضفنا أنواع الخطط بدقة
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'TRIALING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

// 2. تعريف المستخدم (User)
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  centerId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 3. تعريف السنتر (Center)
// تم إضافة trialStartedAt لضمان عمل حسبة الـ 14 يوم في الفرونت إند بدقة
export interface Center {
  id: number;
  name: string;
  phone: string;
  plan: PlanType | string; // يدعم الأنواع المحددة أو أي مسمى آخر من السيرفر
  trialUsed: boolean;      // هل استخدم الفترة التجريبية سابقاً؟
  trialStartedAt?: string; // تاريخ بدء التجربة (ISO String) - أساسي لحساب isPaid
  referralCode?: string;
  referralCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 4. تعريف رد السيرفر عند المصادقة (AuthResponse)
// يستخدم في الـ Login والـ Signup والـ Verify Status
export interface AuthResponse {
  success: boolean;        // لضمان التحقق من نجاح العملية قبل المعالجة
  message: string;         // رسالة من السيرفر (مثل: تم تسجيل الدخول بنجاح)
  token: string;           // الـ JWT Token
  user: User;              // بيانات المستخدم الحالي
  center: Center;          // بيانات السنتر التابع له المستخدم
}

// 5. تعريف إضافي لرد التحقق من الحالة (اختياري ولكنه مفيد)
export interface VerifyStatusResponse {
  success: boolean;
  user: User;
  token: string;
  center: Center;
}