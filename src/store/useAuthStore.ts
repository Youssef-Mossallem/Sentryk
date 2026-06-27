import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthCenter } from "../types";
import api from "../api/axios";

interface AuthState {
  user: User | null;
  center: AuthCenter | null;
  token: string | null;
  isAuthenticated: boolean;
  isPaid: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string, center?: AuthCenter | null) => void;
  updateAuth: (user: User, token: string, center?: AuthCenter | null) => void;
  updateCenter: (partialCenter: Partial<AuthCenter>) => void;
  refreshStatus: () => Promise<boolean>;
  logout: () => void;
  updateSubscriptionStatus: (status: boolean) => void;
  checkSubscription: () => void;
  forceCheckSubscription: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      center: null,
      token: null,
      isAuthenticated: false,
      isPaid: false,
      isLoading: false,

      // ====================== تسجيل الدخول ======================
      setAuth: (user, token, center) => {
        localStorage.setItem("token", token);

        if (api.defaults.headers) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        set({
          user,
          token,
          center: center || null,
          isAuthenticated: true,
        });

        get().checkSubscription();
      },

      // ====================== تحديث الجلسة ======================
      updateAuth: (user, token, center) => {
        localStorage.setItem("token", token);

        if (api.defaults.headers) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        set({
          user,
          token,
          center: center || null,
          isAuthenticated: true,
        });

        get().checkSubscription();
      },

      // ====================== تحديث جزئي للسنتر ======================
      updateCenter: (partialCenter) => {
        const currentCenter = get().center;
        if (!currentCenter) return;

        set({
          center: { ...currentCenter, ...partialCenter },
        });

        get().checkSubscription();
      },

      // ====================== فحص الاشتراك الهيكلي الحصين ======================
      checkSubscription: () => {
        const { center, user } = get();

        // 1. السكرتارية دائماً تملك صلاحية دخول للوحة لتجنب شلل السناتر التعليمية
        if (user?.role === "SECRETARY") {
          set({ isPaid: true });
          return;
        }

        if (!center) {
          set({ isPaid: false });
          return;
        }

        const maxStudents = center.maxStudents || 0;
        const now = new Date();

        // 2. التحقق الاحتياطي: لو في دفع ناجح بآخر 30 دقيقة يتم التفعيل فوراً لضمان تجربة مستخدم فورية
        const hasRecentSuccessPayment =
          center.payments?.some?.(
            (p) =>
              p.status === "SUCCESS" &&
              new Date(p.paidAt || p.createdAt || "") >
                new Date(Date.now() - 1000 * 60 * 30),
          ) || false;

        if (hasRecentSuccessPayment) {
          set({ isPaid: true });
          return;
        }

        // 3. معالجة خطة الـ TRIAL (الحد الأقصى للطلاب = 100)
        if (maxStudents === 100) {
          if (!center.trialStartedAt || !center.trialUsed) {
            set({ isPaid: false });
            return;
          }

          const trialStart = new Date(center.trialStartedAt);
          const diffInDays =
            (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
          const isValidTrial = diffInDays >= 0 && diffInDays <= 14;

          set({ isPaid: isValidTrial });
          return;
        }

        // 4. الخطط المدفوعة: التحقق من قيم سعة الطلاب المعتمدة (BASIC: 250, PREMIUM: 1000, ELITE: 3000000)
        const validStudentLimits = [250, 1000, 3000000];
        const isMatchedPlanLimit = validStudentLimits.includes(maxStudents);

        if (isMatchedPlanLimit) {
          // التحقق من الصلاحية الزمنية للاشتراك إذا كان الحقل متاحاً
          if (center.subscriptionExpiresAt) {
            const expiryDate = new Date(center.subscriptionExpiresAt);
            if (expiryDate > now) {
              set({ isPaid: true });
              return;
            }
          } else {
            // صمام أمان: إذا كان الباك إند يقوم بتحديث السعة دون تحديث حقل التاريخ، نثق في السعة المدفوعة
            set({ isPaid: true });
            return;
          }
        }

        // إذا سقطت كل شروط التفعيل السابقة، يتم قفل الحساب
        set({ isPaid: false });
      },

      forceCheckSubscription: () => {
        get().checkSubscription();
      },

      // ====================== تسجيل الخروج ======================
      logout: () => {
        localStorage.removeItem("token");

        if (api.defaults.headers) {
          delete api.defaults.headers.common["Authorization"];
        }

        set({
          user: null,
          token: null,
          center: null,
          isAuthenticated: false,
          isPaid: false,
          isLoading: false,
        });
      },

      updateSubscriptionStatus: (status: boolean) => {
        set({ isPaid: status });
      },

      // ====================== تحديث دوري للجلسة والمزامنة اللحظية ======================
      refreshStatus: async () => {
        const currentToken = get().token;
        if (!currentToken) {
          get().logout();
          return false;
        }

        set({ isLoading: true });

        try {
          const response = await api.get("/auth/verify-status");

          if (response.data.success) {
            const { user, token: rotatedToken, center } = response.data;
            get().updateAuth(user, rotatedToken, center);
            set({ isLoading: false });
            return true;
          }

          get().logout();
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("❌ Auth Store Sync Failure:", error);
          get().logout();
          set({ isLoading: false });
          return false;
        }
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        center: state.center,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isPaid: state.isPaid,
      }),
    },
  ),
);
