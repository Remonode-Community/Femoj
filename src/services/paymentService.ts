/**
 * Payment Service
 * Handles credit bundle purchases via Paystack (NGN/Africa) or Stripe (USD/International)
 */

import { apiGet, apiPost } from "@/lib/api-client";
import type {
  CreditBundle,
  CreditBundlePurchaseResponse,
  CreditBundleVerifyResponse,
  RegionInfo,
  PaymentMethod,
  Currency,
} from "@/types";

const PAYMENT_ENDPOINTS = {
  CREDIT_BUNDLES: "/payment/credit-bundles",
  CREDIT_BUNDLES_PURCHASE: "/payment/credit-bundles/purchase",
  CREDIT_BUNDLES_VERIFY: "/payment/credit-bundles/verify",
  CREDIT_BUNDLES_HISTORY: "/payment/credit-bundles/history",
  CREDIT_BALANCE: "/payment/credit-balance",
  DETECT_REGION: "/payment/detect-region",
} as const;

class PaymentService {
  /**
   * Detect user's region based on IP geolocation
   */
  static async detectRegion(): Promise<RegionInfo> {
    try {
      const response = await apiGet<RegionInfo>(
        PAYMENT_ENDPOINTS.DETECT_REGION,
        { requiresAuth: false }
      );
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }
    return {
      country_code: "US",
      region: "international",
      payment_methods: ["stripe"],
      currencies: ["USD"],
    };
  }

  /**
   * Get all active credit bundles with dual pricing
   */
  static async getCreditBundles(): Promise<CreditBundle[]> {
    try {
      const response = await apiGet<CreditBundle[]>(
        PAYMENT_ENDPOINTS.CREDIT_BUNDLES,
        { requiresAuth: false }
      );
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }
    return [];
  }

  /**
   * Initialize credit bundle purchase via Paystack (NGN or USD)
   * @returns Purchase init result with redirect URL
   */
  static async initializeCreditPurchase(
    bundleId: number,
    currency: Currency
  ): Promise<{
    success: boolean;
    data?: CreditBundlePurchaseResponse;
    message?: string;
  }> {
    try {
      const response = await apiPost<CreditBundlePurchaseResponse>(
        PAYMENT_ENDPOINTS.CREDIT_BUNDLES_PURCHASE,
        {
          bundle_id: bundleId,
          currency: currency,
        },
        { requiresAuth: true }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      }

      return { success: false, message: response.message || "Failed to initialize purchase" };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || "Payment initialization failed",
      };
    }
  }

  /**
   * Verify a credit bundle purchase
   */
  static async verifyCreditPurchase(
    reference: string
  ): Promise<{
    success: boolean;
    data?: CreditBundleVerifyResponse;
    message?: string;
  }> {
    try {
      const response = await apiPost<CreditBundleVerifyResponse>(
        PAYMENT_ENDPOINTS.CREDIT_BUNDLES_VERIFY,
        { reference },
        { requiresAuth: true }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      }

      return { success: false, message: response.message || "Verification failed" };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || "Verification failed",
      };
    }
  }

  /**
   * Get credit purchase history
   */
  static async getCreditHistory(limit = 20) {
    try {
      const response = await apiGet(
        `${PAYMENT_ENDPOINTS.CREDIT_BUNDLES_HISTORY}?limit=${limit}`,
        { requiresAuth: true }
      );
      return response.success ? (response.data as any) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user's credit balance
   */
  static async getCreditBalance(): Promise<number> {
    try {
      const response = await apiGet<{ credit_balance: number }>(
        PAYMENT_ENDPOINTS.CREDIT_BALANCE,
        { requiresAuth: true }
      );
      if (response.success && response.data) {
        return response.data.credit_balance ?? 0;
      }
    } catch {
      // fallback
    }
    return 0;
  }

  // ── Helpers ──────────────────────────────────────────────────────

  static redirectToCheckout(url: string): void {
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }

  static storePaymentReference(reference: string): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("payment_reference", reference);
      sessionStorage.setItem("payment_start_time", Date.now().toString());
    }
  }

  static getStoredReference(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("payment_reference");
    }
    return null;
  }

  static clearStoredReference(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("payment_reference");
      sessionStorage.removeItem("payment_start_time");
    }
  }

  static getCallbackParams() {
    if (typeof window === "undefined") {
      return { reference: null, status: null, reason: null };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      reference: params.get("reference"),
      status: params.get("status"),
      reason: params.get("reason"),
    };
  }

  static formatCurrency(amount: number, currency: Currency = "NGN"): string {
    const locale = currency === "NGN" ? "en-NG" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(amount);
  }
}

export default PaymentService;
