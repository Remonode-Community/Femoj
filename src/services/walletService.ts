/**
 * Wallet Service - Simplified for credit-only purchases
 * Wallet functionality is hidden but kept for backend compatibility
 */

import { apiGet, apiPost } from "@/lib/api-client";
import type { CreditBundle, CreditPurchaseHistoryItem } from "@/types";

const WALLET_ENDPOINTS = {
  CREDIT_BUNDLES: "/payment/credit-bundles",
  CREDIT_BUNDLES_PURCHASE: "/payment/credit-bundles/purchase",
  CREDIT_BUNDLES_VERIFY: "/payment/credit-bundles/verify",
  CREDIT_BUNDLES_HISTORY: "/payment/credit-bundles/history",
  CREDIT_BALANCE: "/payment/credit-balance",
} as const;

const walletService = {
  async getBundles(): Promise<CreditBundle[]> {
    try {
      const response = await apiGet<CreditBundle[]>(
        WALLET_ENDPOINTS.CREDIT_BUNDLES,
        { requiresAuth: false }
      );
      return response.success ? (response.data as CreditBundle[]) : [];
    } catch {
      return [];
    }
  },

  async initializePurchase(data: {
    bundle_id: number;
    payment_method?: string;
  }) {
    const response = await apiPost(
      WALLET_ENDPOINTS.CREDIT_BUNDLES_PURCHASE,
      data,
      { requiresAuth: true }
    );
    return response;
  },

  async verifyPurchase(data: { reference: string }) {
    const response = await apiPost(
      WALLET_ENDPOINTS.CREDIT_BUNDLES_VERIFY,
      data,
      { requiresAuth: true }
    );
    return response;
  },

  async getPurchaseHistory(limit = 20): Promise<CreditPurchaseHistoryItem[]> {
    try {
      const response = await apiGet<CreditPurchaseHistoryItem[]>(
        `${WALLET_ENDPOINTS.CREDIT_BUNDLES_HISTORY}?limit=${limit}`,
        { requiresAuth: true }
      );
      return response.success ? (response.data as CreditPurchaseHistoryItem[]) : [];
    } catch {
      return [];
    }
  },

  async getCreditBalance() {
    try {
      const response = await apiGet<{ credit_balance: number }>(
        WALLET_ENDPOINTS.CREDIT_BALANCE,
        { requiresAuth: true }
      );
      return response.success ? (response.data?.credit_balance ?? 0) : 0;
    } catch {
      return 0;
    }
  },
};

export default walletService;
