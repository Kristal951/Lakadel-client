"use client";

import { useEffect } from "react";
import { useExchangeRateStore } from "@/store/exchangeRate";

export default function ExchangeRateBootstrap() {
  const fetchRates = useExchangeRateStore((s) => s.fetchRates);
  const hasHydrated = useExchangeRateStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    fetchRates(); 
  }, [hasHydrated, fetchRates]);

  return null;
}
