"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";

export function useCredits() {
  const queryClient = useQueryClient();

  const {
    data: creditBalance = 0,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: async () => {
      const result = await creditService.getBalance();
      return result?.data?.credit_balance ?? 0;
    },
    staleTime: 30 * 1000,
  });

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ["credits", "transactions"],
    queryFn: async () => {
      const result = await creditService.getTransactions({ limit: 20 });
      return result?.data ?? [];
    },
    staleTime: 60 * 1000,
  });

  return {
    creditBalance,
    transactions,
    balanceLoading,
    transactionsLoading,
    refetchBalance,
  };
}
