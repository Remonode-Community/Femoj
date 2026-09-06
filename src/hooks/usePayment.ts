"use client";

import { useState, useCallback } from "react";
import PaymentService from "@/services/paymentService";
import type { Currency, RegionInfo } from "@/types";

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    successMessage: null,
  });

  const initializeCreditPurchase = useCallback(
    async (bundleId: number, currency: Currency) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await PaymentService.initializeCreditPurchase(
          bundleId,
          currency
        );

        if (result.success && result.data) {
          setState({
            isLoading: false,
            error: null,
            successMessage: "Payment initialized. Redirecting to checkout...",
          });

          const url = result.data.authorization_url || result.data.url;
          if (url) {
            PaymentService.storePaymentReference(result.data.reference);
            PaymentService.redirectToCheckout(url);
          }

          return result.data;
        } else {
          setState({
            isLoading: false,
            error: result.message || "Failed to initialize payment",
            successMessage: null,
          });
          return null;
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Payment initialization failed";
        setState({
          isLoading: false,
          error: message,
          successMessage: null,
        });
        return null;
      }
    },
    []
  );

  const verifyCreditPurchase = useCallback(async (reference: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await PaymentService.verifyCreditPurchase(reference);

      if (result.success && result.data) {
        setState({
          isLoading: false,
          error: null,
          successMessage: "Payment verified successfully!",
        });
        return result.data;
      } else {
        setState({
          isLoading: false,
          error: result.message || "Verification failed",
          successMessage: null,
        });
        return null;
      }
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error?.message || "Verification failed",
        successMessage: null,
      });
      return null;
    }
  }, []);

  const detectRegion = useCallback(async () => {
    return PaymentService.detectRegion();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, successMessage: null }));
  }, []);

  return {
    ...state,
    initializeCreditPurchase,
    verifyCreditPurchase,
    detectRegion,
    clearError,
    clearSuccess,
  };
};
