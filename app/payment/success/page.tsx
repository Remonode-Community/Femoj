"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import PaymentService from "@/services/paymentService";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CheckCircle, Loader2, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPurchase } = useWallet();

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [paymentInfo, setPaymentInfo] = useState<{
    reference: string;
    credits_added?: number;
    new_credit_balance?: number;
    status: string;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPaymentStatus = async () => {
      const reference = searchParams.get("reference");
      const trxref = searchParams.get("trxref");
      const paymentRef = reference || trxref;

      if (!paymentRef) {
        setStatus("failed");
        return;
      }

      try {
        const result = await verifyPurchase(paymentRef);

        if (result?.success && result?.data) {
          setPaymentInfo({
            reference: result.data.reference || paymentRef,
            credits_added: result.data.credits_added,
            new_credit_balance: result.data.new_credit_balance,
            status: result.data.status || "success",
          });
          setStatus("success");
          PaymentService.clearStoredReference();

          let countdown = 5;
          const timer = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
            if (countdown <= 0) {
              clearInterval(timer);
              router.push("/dashboard/wallet");
            }
          }, 1000);

          return () => clearInterval(timer);
        }

        setStatus("failed");
      } catch {
        setStatus("failed");
      }
    };

    verifyPaymentStatus();
  }, [searchParams, verifyPurchase, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        {status === "verifying" && (
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === "success" && paymentInfo && (
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
            <div className="text-center mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mt-1">
                {paymentInfo.credits_added
                  ? `${paymentInfo.credits_added.toLocaleString()} credits have been added to your balance`
                  : "Your credits have been added"}
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-6">
              {paymentInfo.credits_added && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Credits Added</span>
                  <span className="text-lg font-semibold text-green-600">
                    +{paymentInfo.credits_added.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Reference</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.reference || "")}
                  className="flex items-center gap-1.5 text-xs font-mono text-blue-600 hover:bg-white px-2 py-1 rounded transition-colors"
                >
                  {(paymentInfo.reference || "N/A").slice(0, 20)}...
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              {paymentInfo.new_credit_balance !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">New Balance</span>
                  <span className="text-sm font-medium text-green-600">
                    {paymentInfo.new_credit_balance.toLocaleString()} credits
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-100 text-green-700">
                  SUCCESSFUL
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mb-4">
              Redirecting in{" "}
              <span className="font-medium text-gray-900">{redirectCountdown}s</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="flex-1 h-10 px-4 text-sm font-medium text-blue-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                View Credits
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 h-10 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8">
            <div className="text-center mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-medium text-red-600">Verification Failed</h2>
              <p className="text-sm text-gray-500 mt-1">
                We couldn&apos;t verify your payment. Please contact support if the issue persists.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">
                If you were charged, the amount will be refunded to your card within 3-5 business days.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="flex-1 h-10 px-4 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Buy Credits
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 h-10 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
