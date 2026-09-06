"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useWallet } from "@/hooks/useWallet";
import { useCredits } from "@/hooks/useCredits";
import PaymentService from "@/services/paymentService";
import { motion } from "framer-motion";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Region, Currency, RegionInfo } from "@/types";
import {
  CreditCard,
  Check,
  Loader2,
  Package,
  Shield,
  Zap,
  Globe,
  MapPin,
  ChevronRight,
  History,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.06 },
  }),
};

const regionLabels: Record<Region, { label: string; icon: typeof Globe }> = {
  africa: { label: "Africa", icon: MapPin },
  international: { label: "International", icon: Globe },
};

export default function WalletPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("international");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [purchasingBundleId, setPurchasingBundleId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    creditBalance,
    bundles,
    purchaseHistory,
    isLoading,
    historyLoading,
    initializePurchase,
    isInitializing,
    refetchBalance,
  } = useWallet();

  const { transactions: creditTransactions } = useCredits();

  // Detect region on mount
  useEffect(() => {
    PaymentService.detectRegion().then((info: RegionInfo) => {
      setSelectedRegion(info.region);
      setSelectedCurrency(info.currencies[0]);
    });
  }, []);

  // Update currency when region changes
  useEffect(() => {
    if (selectedRegion === "africa") {
      setSelectedCurrency("NGN");
    } else {
      setSelectedCurrency("USD");
    }
  }, [selectedRegion]);

  const getPrice = (bundle: any) => {
    if (selectedCurrency === "NGN") {
      return bundle.price_ngn;
    }
    return bundle.price_usd;
  };

  const handlePurchase = async (bundleId: number) => {
    setPurchasingBundleId(bundleId);
    try {
      initializePurchase(
        { bundle_id: bundleId, currency: selectedCurrency },
        {
          onSuccess: (response: any) => {
            if (response?.success && response?.data) {
              const url =
                response.data.authorization_url || response.data.url;
              if (url) {
                PaymentService.storePaymentReference(response.data.reference);
                PaymentService.redirectToCheckout(url);
              } else {
                toast.success("Credits added successfully!");
                refetchBalance();
              }
            } else {
              toast.error(response?.message || "Failed to initialize payment");
            }
            setPurchasingBundleId(null);
          },
          onError: (error: any) => {
            toast.error(error?.message || "Payment failed");
            setPurchasingBundleId(null);
          },
        }
      );
    } catch {
      setPurchasingBundleId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Buy Credits</h1>
          <p className="text-sm text-gray-500 mt-1">
            Purchase credits to use for virtual numbers and services
          </p>
        </motion.div>

        {/* Credit Balance Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Available Credits</p>
              <p className="text-4xl font-bold mt-1">{creditBalance.toLocaleString()}</p>
              <p className="text-blue-200 text-xs mt-1">credits available for use</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        {/* Region Selection */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Select Region</span>
          </div>
          <div className="flex gap-2">
            {(Object.keys(regionLabels) as Region[]).map((region) => {
              const Icon = regionLabels[region].icon;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedRegion === region
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {regionLabels[region].label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
          <div className="flex gap-2">
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-blue-500 text-blue-700 font-medium"
            >
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-semibold">Paystack</p>
                <p className="text-xs text-blue-500">
                  Pay with {selectedCurrency === "NGN" ? "NGN (card, bank transfer)" : "USD (credit/debit card)"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Currency indicator */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-gray-500">Currency:</span>
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
            {selectedCurrency}
          </span>
        </motion.div>

        {/* Credit Bundles */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Choose a Package</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bundles.map((bundle, index) => {
                const price = getPrice(bundle);
                const isPurchasing = purchasingBundleId === bundle.id;
                const isPopular = bundle.name === "Premium";

                return (
                  <motion.div
                    key={bundle.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={5 + index}
                  >
                    <button
                      onClick={() => handlePurchase(bundle.id)}
                      disabled={isPurchasing || isInitializing}
                      className={`relative w-full text-left rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${
                        isPopular
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-300"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-2.5 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          BEST VALUE
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className={`text-2xl font-bold ${
                            isPopular ? "text-white" : "text-blue-600"
                          }`}
                        >
                          {bundle.credits}
                        </span>
                      </div>

                      <p
                        className={`text-xs font-medium mb-3 ${
                          isPopular ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {bundle.name}
                      </p>

                      <div
                        className={`border-t ${
                          isPopular ? "border-blue-400" : "border-gray-200"
                        } pt-3`}
                      >
                        {isPurchasing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <p
                            className={`text-lg font-bold ${
                              isPopular ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {PaymentService.formatCurrency(price, selectedCurrency)}
                          </p>
                        )}
                      </div>

                      {bundle.description && (
                        <p
                          className={`text-[10px] mt-2 ${
                            isPopular ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {bundle.description}
                        </p>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: Package,
                title: "Choose a Package",
                desc: "Select the credit amount that suits you",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "Pay safely via Paystack",
              },
              {
                icon: Zap,
                title: "Instant Credits",
                desc: "Credits are added to your balance immediately",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-4"
              >
                <div className="bg-blue-100 rounded-lg p-2">
                  <step.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Purchase History */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={10}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <History className="w-4 h-4" />
            Purchase History
            <ChevronRight
              className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`}
            />
          </button>

          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {historyLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </div>
              ) : purchaseHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No purchases yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {purchaseHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-lg p-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.bundle_name || "Credit Purchase"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          +{item.credits} credits
                        </p>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            item.status === "success"
                              ? "bg-green-100 text-green-700"
                              : item.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
