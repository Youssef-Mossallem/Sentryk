import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Center } from "../types";

interface AuthState {
  user: User | null;
  center: Center | null;
  token: string | null;
  isAuthenticated: boolean;
  isPaid: boolean;
  setAuth: (user: User, token: string, center?: Center) => void;
  updateAuth: (user: User, token: string, center?: Center) => void;
  logout: () => void;
  updateSubscriptionStatus: (status: boolean) => void;
  checkSubscription: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      center: null,
      token: null,
      isAuthenticated: false,
      isPaid: false,

      setAuth: (user, token, center) => {
        // حفظ التوكن يدوياً في LocalStorage لضمان وصول Axios له قبل إعادة التشغيل
        localStorage.setItem("token", token);
        
        set({ 
          user, 
          token, 
          center: center || null, 
          isAuthenticated: true 
        });
        
        // تشغيل فحص الاشتراك فوراً
        get().checkSubscription();
      },

      updateAuth: (user, token, center) => {
        set({ 
          user, 
          token, 
          center: center || null, 
          isAuthenticated: true 
        });
        get().checkSubscription();
      },

      checkSubscription: () => {
        const { center, user } = get();

        // 1. إذا كان المستخدم سكرتير، نعتبره "دافع" تلقائياً لأن صلاحية دخوله مرتبطة بالسنتر من جهة السيرفر
        if (user?.role === "SECRETARY") {
          set({ isPaid: true });
          return;
        }

        // 2. لو مفيش بيانات سنتر أصلاً (للمدير)
        if (!center) {
          set({ isPaid: false });
          return;
        }

        // 3. منطق فحص الـ TRIAL (الفترة التجريبية)
        if (center.plan === "TRIAL") {
          if (!center.trialStartedAt) {
            set({ isPaid: false });
            return;
          }

          const trialStartDate = new Date(center.trialStartedAt);
          const now = new Date();
          
          // حساب الفرق بالأيام
          const diffInMs = now.getTime() - trialStartDate.getTime();
          const diffInDays = diffInMs / (1000 * 3600 * 24);

          // هل نحن لا نزال ضمن الـ 14 يوم؟ (أو حسب مدة التجربة عندك)
          const isValidTrial = diffInDays >= 0 && diffInDays <= 14;
          set({ isPaid: isValidTrial });
        } 
        
        // 4. منطق الخطط المدفوعة (تأكد من مطابقة المسميات لما يرسله السيرفر)
        else if (
          [
            "PREMIUM", 
            "PRO", 
            "MONTHLY", 
            "YEARLY", 
            "HALF_MONTH", 
            "COURSE"
          ].includes(center.plan)
        ) {
          set({ isPaid: true });
        }
        
        // 5. أي حالة أخرى (مثل "EXPIRED" أو غير ذلك)
        else {
          set({ isPaid: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          center: null,
          isAuthenticated: false,
          isPaid: false,
        });
      },

      updateSubscriptionStatus: (status) => set({ isPaid: status }),
    }),
    { 
      name: "auth-storage", 
      // نحدد فقط البيانات التي نريد استمرارها (Persistence)
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