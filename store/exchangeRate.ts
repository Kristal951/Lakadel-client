import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExchangeRateState } from "./types";

const DAY = 1000 * 60 * 60 * 24;

type ExchangeRateStateWithHydration = ExchangeRateState & {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  convert: (amount: number, toCurrency: string) => number | null;
};

export const useExchangeRateStore = create<ExchangeRateStateWithHydration>()(
  persist(
    (set, get) => ({
      rates: {},
      loading: false,
      error: null,
      lastFetched: 0,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      fetchRates: async (force = false) => {
        const { lastFetched, loading, rates } = get();
        if (loading) return;

        const hasRates = Object.keys(rates ?? {}).length > 0;
        const fresh = Date.now() - lastFetched < DAY;

        if (!force && hasRates && fresh) return;

        set({ loading: true, error: null });

        try {
          const res = await fetch("/api/users/exchange-rates");
          if (!res.ok) throw new Error(`Rate API failed: ${res.status}`);

          const data = await res.json();
          const incoming = data?.rates ?? data;
          const stale = data?.stale === true;

          if (!incoming || typeof incoming !== "object" || !incoming.NGN) {
            throw new Error("Invalid rates payload");
          }

          set({
            rates: incoming,
            loading: false,
            lastFetched: stale ? 0 : Date.now(),
          });
        } catch (err: unknown) {
          set({
            error: err instanceof Error ? err.message : "Failed to load exchange rates",
            loading: false,
          });
        }
      },

      convert: (amount, toCurrency) => {
        const rate = get().rates[toCurrency];
        if (!Number.isFinite(rate) || !rate) return null;
        return amount * rate;
      },

      resetRates: () => set({ rates: {}, lastFetched: 0, error: null }),
    }),
    {
      name: "exchange-rate-storage",
      version: 1,
      migrate: () => ({ rates: {}, lastFetched: 0 }),
      partialize: (state) => ({
        rates: state.rates,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && Object.keys(state.rates).length === 0) {
          state.fetchRates();
        }
      },
    },
  ),
);