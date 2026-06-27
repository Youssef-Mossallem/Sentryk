// =============================================
// 1. التعريفات الأساسية (Enums) - مطابقة تماماً لـ Prisma
// =============================================
export type Role = "ADMIN" | "SECRETARY";
export type Stage = "PRIMARY" | "MIDDLE" | "HIGH";
export type SubscriptionType =
  | "PER_SESSION"
  | "MONTHLY"
  | "HALF_MONTH"
  | "COURSE";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PlanType = "TRIAL" | "MONTHLY" | "YEARLY" | "FREE";
export type BillingCycle = "MONTHLY" | "YEARLY" | "BOTH";
export type WhatsAppTransactionType = "CHARGE" | "SEND";

// =============================================
// 2. الكيانات والموديلات الأساسية (Entities)
// =============================================

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

export interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  durationMonths: number;
  applicableCycle: BillingCycle;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Center {
  id: number;
  name: string;
  phone: string;
  plan: PlanType | string;
  trialUsed: boolean;
  trialStartedAt?: string | Date | null;
  subscriptionExpiresAt?: string | Date | null; // 🆕 مضاف لفحص الصلاحية الزمنية للخطط
  isActive?: boolean;
  maxStudents?: number;
  maxUsers?: number;
  referralCode?: string;
  referralCount?: number;
  referredById?: number | null;
  referralMilestoneAchieved?: boolean;

  activePromoCodeId?: number | null;
  activePromoCode?: PromoCode | null;
  promoMonthsUsed?: number;
  promoAppliedAt?: string | null;
  isPromoPaused?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// 🛡️ واجهة مخصصة وموسعة للـ AuthCenter تدعم مصفوفة المدفوعات والـ Wallet
export interface AuthCenter extends Center {
  whatsappWallet?: {
    id: number;
    centerId: number;
    balance: number;
    updatedAt: string | Date;
  } | null;
  payments?: Array<{
    status: string;
    paidAt?: string | Date | null;
    createdAt?: string | Date;
  }> | null;
}

export interface Student {
  id: number;
  name: string;
  phone: string;
  stage: Stage;
  grade: number;
  centerId: number;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  computedStatus?: "ACTIVE" | "EXPIRED";
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  phone?: string;
  centerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: number;
  name: string;
  maxStudents?: number;
  centerId: number;
}

export interface Session {
  id: number;
  name: string;
  teacherId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  maxStudents?: number;
  stage: Stage;
  grade: number;
  teacher?: Teacher;
  room?: Room;
}

export interface Attendance {
  id: number;
  studentId: number;
  sessionId: number;
  centerId: number;
  status: AttendanceStatus;
  scannedAt: string;
  createdAt: string;
  student?: Student;
  session?: Session;
}

export interface Subscription {
  id: number;
  studentId: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  totalPrice: number;
  subscriptionType: SubscriptionType;
  createdBy?: number;
  items?: SubscriptionItem[];
  createdAt: string;
}

export interface SubscriptionItem {
  id: number;
  subscriptionId: number;
  teacherId: number;
  priceSnapshot: number;
  teacher?: Teacher;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  center: AuthCenter;
}

export interface VerifyStatusResponse {
  success: boolean;
  user: User;
  token: string;
  center: AuthCenter;
}

export interface DashboardStats {
  success: boolean;
  stats: {
    students: {
      total: number;
      active: number;
      expired: number;
      nearExpiry: number;
    };
    revenue: {
      thisMonth: number;
      lastMonth: number;
      difference: number;
      trend: "up" | "down";
    };
    sms: {
      messages: number;
      balanceInMoney: string;
      pricePerMessage: number;
      sentThisMonth: number;
    };
    content: {
      teachers: number;
      groups: number;
    };
    attendance: {
      todayScansCount: number;
    };
    recentActivity: Array<{
      id: number;
      time: string;
      user: string;
      action: string;
      details: any;
      target: string | null;
    }>;
  };
}
