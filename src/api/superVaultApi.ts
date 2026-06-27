import axios from "axios";

// جلب الرابط من متغيرات البيئة بدعم كامل لـ Vite (VITE_API_URL) أو React App (REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * إنشاء مثيل مخصص ومعزول تماماً لطلبات الخزنة الكبرى
 */
const vaultClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * وظائف مساعدة لجلب التوكن والمفاتيح
 */
const getSuperToken = () => localStorage.getItem("sentryk_super_token");
const getAdminKey = () => sessionStorage.getItem("sentryk_vault_key");
const getAdminSecret = () => sessionStorage.getItem("sentryk_vault_secret");

/**
 * 🔐 Request Interceptor
 */
vaultClient.interceptors.request.use(
  (config) => {
    const token = getSuperToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const adminKey = getAdminKey();
    const adminSecret = getAdminSecret();

    if (adminKey && adminSecret) {
      config.headers["x-sentryk-admin-key"] = adminKey.trim();
      config.headers["x-sentryk-admin-secret"] = adminSecret.trim();
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 🛡️ Response Interceptor — مُحسّن لمنع حذف التوكن أثناء التحميل
 */
vaultClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("⚠️ [Vault Security Alert]: Unauthorized access detected.");

      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";

      // لا نحذف التوكن إلا إذا كنا فعلاً داخل الداشبورد (لمنع السباق أثناء الـ navigate)
      if (currentPath.includes("/super-vault/dashboard")) {
        console.warn("Purging credentials and redirecting to verify gate.");

        localStorage.removeItem("sentryk_super_token");
        sessionStorage.removeItem("sentryk_vault_key");
        sessionStorage.removeItem("sentryk_vault_secret");

        if (typeof window !== "undefined") {
          window.location.href = "/super-vault/verify";
        }
      }
    }
    return Promise.reject(error);
  },
);

/**
 * واجهة خدمات الخزنة (Super Vault API)
 */
export const superVaultApi = {
  /**
   * 1. التحقق من بوابة الخزنة
   */
  verifyGate: async (token: string) => {
    const response = await vaultClient.post("/super-vault/verify-gate", {
      token,
    });
    return response.data;
  },

  /**
   * 2. جلب الإحصائيات الكبرى
   */
  getDashboardStats: async () => {
    const response = await vaultClient.get("/super-vault/dashboard-stats");
    return response.data;
  },

  /**
   * 3. جلب جميع السناتر
   */
  getCenters: async () => {
    const response = await vaultClient.get("/super-vault/centers");
    return response.data;
  },

  /**
   * 4. التحكم في سنتر
   */
  controlCenter: async (
    id: number,
    data: {
      plan?: string;
      maxStudents?: number;
      maxUsers?: number;
      isActive?: boolean;
    },
  ) => {
    const response = await vaultClient.put(
      `/super-vault/centers/${id}/control`,
      data,
    );
    return response.data;
  },

  /**
   * 5. حذف سنتر نهائياً
   */
  deleteCenter: async (id: number) => {
    const response = await vaultClient.delete(`/super-vault/centers/${id}`);
    return response.data;
  },

  // ===========================================================================
  // 🎟️ إدارة أكواد الخصم
  // ===========================================================================

  /**
   * 6. جلب أكواد الخصم مع التحليلات
   */
  getPromoCodes: async () => {
    const response = await vaultClient.get("/promo-codes/list");
    return response.data;
  },

  /**
   * 7. إنشاء كود خصم جديد
   */
  createPromoCode: async (data: {
    code: string;
    discountPercent: number;
    durationMonths: number;
    applicableCycle: "MONTHLY" | "YEARLY" | "BOTH";
    maxUses: number;
    expiresAt: string;
  }) => {
    const response = await vaultClient.post("/promo-codes/create", data);
    return response.data;
  },

  /**
   * 8. تحديث كود خصم
   */
  updatePromoCode: async (
    id: number,
    data: {
      discountPercent?: number;
      durationMonths?: number;
      applicableCycle?: "MONTHLY" | "YEARLY" | "BOTH";
      maxUses?: number;
      expiresAt?: string;
    },
  ) => {
    const response = await vaultClient.put(`/promo-codes/update/${id}`, data);
    return response.data;
  },

  /**
   * 9. حذف كود خصم
   */
  deletePromoCode: async (id: number) => {
    const response = await vaultClient.delete(`/promo-codes/delete/${id}`);
    return response.data;
  },
};
