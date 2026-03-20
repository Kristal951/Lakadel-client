import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExchangeRateState } from "./types";

const DAY = 1000 * 60 * 60 * 24;

type ExchangeRateStateWithHydration = ExchangeRateState & {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  convert: (amount: number, toCurrency: string) => number;
};

export const useExchangeRateStore = create<ExchangeRateStateWithHydration>()(
  persist(
    (set, get) => ({
      rates: { USD: 1 },
      loading: false,
      error: null,
      lastFetched: 0,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      fetchRates: async (force = false) => {
        const { lastFetched, loading, rates } = get();
        if (loading) return;

        const hasRates = Object.keys(rates ?? {}).length > 1; 
        const fresh = Date.now() - lastFetched < DAY;

        if (!force && hasRates && fresh) return;

        set({ loading: true, error: null });

        try {
          const res = await fetch("/api/users/exchange-rates");
          if (!res.ok) throw new Error(`Rate API failed: ${res.status}`);

          const data = await res.json();

          if (!data || typeof data !== "object" || !data.NGN) {
            throw new Error("Invalid rates payload");
          }

          set({ rates: data, loading: false, lastFetched: Date.now() });
        } catch (err: any) {
          set({
            error: err?.message || "Failed to load exchange rates",
            loading: false,
          });
        }
      },

      convert: (amount, toCurrency) => {
        const { rates } = get();
        const rate = rates[toCurrency];
        if (!rate) return amount;
        return amount * rate;
      },

      resetRates: () => set({ rates: { USD: 1 }, lastFetched: 0, error: null }),
    }),
    {
      name: "exchange-rate-storage",
      partialize: (state) => ({
        rates: state.rates,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && Object.keys(state.rates).length <= 1) {
          state.fetchRates();
        }
      },
    },
  ),
);
