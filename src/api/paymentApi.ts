import axiosInstance from "./axios";

// =============================================
// 1️⃣ تعريف واجهات البيانات للـ Frontend
// =============================================

export interface CreatePaymentRequest {
  type: "PLAN" | "SMS" | "NEW";
  plan?: "TRIAL" | "BASIC" | "PRO" | "ULTIMATE" | "YEARLY";
  amount: number;
  smsCount?: number;
}

export interface KashierPaymentData {
  mid: string;
  amount: number;
  orderId: string;
  hash: string;
  currency: string;
  merchantOrderId: string;
  mode: "test" | "live";
}

export interface KashierPaymentResponse {
  success: boolean;
  method: "KASHIER_CHECKOUT";
  paymentData: KashierPaymentData;
}

export interface PaymentHistoryItem {
  id: number;
  centerId: number;
  centerSubscriptionId?: number | null;
  amount: number;
  plan?: string | null;
  paymentMethod: string;
  transactionId?: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
}

// =============================================
// 2️⃣ دالة إنشاء طلب دفع جديد
// =============================================
export const createKashierPayment = async (
  data: CreatePaymentRequest
): Promise<KashierPaymentResponse> => {
  try {
    const response = await axiosInstance.post<KashierPaymentResponse>(
      "/payments/create",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Payment API Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("فشل الاتصال بسيرفر المدفوعات");
  }
};

// =============================================
// 3️⃣ دالة استرجاع سجل المدفوعات
// =============================================
export const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  try {
    const response = await axiosInstance.get<PaymentHistoryItem[]>(
      "/payments/history"
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Get Payment History Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("فشل جلب سجل المدفوعات");
  }
};