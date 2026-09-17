"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import walletService from "@/services/walletService";
import PaymentService from "@/services/paymentService";
import type { CreditBundle, CreditPurchaseHistoryItem, Currency } from "@/types";

export function useWallet() {
  const queryClient = useQueryClient();

  // Credit balance
  const {
    data: creditBalance = 0,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: () => walletService.getCreditBalance(),
    staleTime: 30 * 1000,
  });

  // Credit bundles
  const {
    data: bundles = [],
    isLoading: bundlesLoading,
  } = useQuery({
    queryKey: ["credit-bundles"],
    queryFn: () => walletService.getBundles(),
    staleTime: 5 * 60 * 1000,
  });

  // Purchase history
  const {
    data: purchaseHistory = [],
    isLoading: historyLoading,
  } = useQuery<CreditPurchaseHistoryItem[]>({
    queryKey: ["credit-bundles", "history"],
    queryFn: () => walletService.getPurchaseHistory(20),
    staleTime: 60 * 1000,
  });

  // Initialize purchase mutation
  const initializePurchaseMutation = useMutation({
    mutationFn: (data: { bundle_id: number; currency: Currency }) =>
      PaymentService.initializeCreditPurchase(data.bundle_id, data.currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credit-bundles", "history"] });
    },
  });

  // Verify purchase mutation
  const verifyPurchaseMutation = useMutation({
    mutationFn: (reference: string) =>
      PaymentService.verifyCreditPurchase(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credit-bundles", "history"] });
    },
  });

  return {
    creditBalance,
    bundles,
    purchaseHistory,
    isLoading: balanceLoading || bundlesLoading,
    balanceLoading,
    bundlesLoading,
    historyLoading,
    initializePurchase: initializePurchaseMutation.mutate,
    isInitializing: initializePurchaseMutation.isPending,
    purchaseError: initializePurchaseMutation.error,
    purchaseData: initializePurchaseMutation.data,
    verifyPurchase: verifyPurchaseMutation.mutateAsync,
    isVerifying: verifyPurchaseMutation.isPending,
    refetchBalance,
  };
}
