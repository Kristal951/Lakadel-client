'use client'
import { cn, formatPrice } from "@/lib";
import { useExchangeRateStore } from "@/store/exchangeRate";
import { useEffect } from "react";

export default function PriceContainer({
  price,
  currency,
  textSize = "base",
  textColor = "text-foreground",
}: {
  price: number;
  currency: string;
  textSize?: string;
  textColor?: string;
}) {
  const ccy = (currency || "NGN").toUpperCase();
  const { rates, fetchRates, hasHydrated } = useExchangeRateStore();

  useEffect(() => {
    fetchRates();
  }, [fetchRates, rates, currency]);

  const isBaseCurrency = ccy === "NGN";
  const rate = rates?.[ccy];

  if (
    !hasHydrated ||
    (!isBaseCurrency && rate === undefined) ||
    Object.keys(rates || {}).length <= 1
  ) {
    return (
      <div className={cn("h-6 w-20 bg-slate-100 animate-pulse rounded-md")} />
    );
  }

  const finalRate = isBaseCurrency ? 1 : rate;

  return (
    <div
      className={cn(
        "flex items-baseline gap-1.5 font-bold",
        `text-${textSize}`,
        textColor,
      )}
    >
      {!isBaseCurrency && <span className="text-sm text-foreground/60">≈</span>}
      <p className="whitespace-nowrap">
        {formatPrice(price, currency, finalRate)}
      </p>
    </div>
  );
}
