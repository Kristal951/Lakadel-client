// components/providers/StoreInitializer.tsx
"use client";

import { useEffect } from "react";
import { useExchangeRateStore } from "@/store/exchangeRate";

export default function StoreInitializer() {
  const fetchRates = useExchangeRateStore((s) => s.fetchRates);
  const hasHydrated = useExchangeRateStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      fetchRates(); // This checks the 24h stale logic internally
    }
  }, [hasHydrated, fetchRates]);

  return null; // This component renders nothing
}