import { create } from "zustand";
import { UserState } from "./types";
import { useExchangeRateStore } from "./exchangeRate";
import { signIn } from "next-auth/react";

type Currency = { code: string; symbol: string };

const NGN: Currency = { code: "NGN", symbol: "₦" };
const USD: Currency = { code: "USD", symbol: "$" };
const GBP: Currency = { code: "GBP", symbol: "£" };
const EUR: Currency = { code: "EUR", symbol: "€" };
const CAD: Currency = { code: "CAD", symbol: "CA$" };

const countryCurrencyMap: Record<string, Currency> = {
  NG: NGN,
  US: USD,
  GB: GBP,
  CA: CAD,
  DE: EUR,
  FR: EUR,
  IT: EUR,
  ES: EUR,
  NL: EUR,
  IE: EUR,
  BE: EUR,
  PT: EUR,
};

const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  currency: "USD",
  currencySymbol: "$",
  country: "",
  loggingOut: false,

  setUser: (user) => set({ user, isAuthenticated: true, loading: false }),
  setLoggingOut: (loggingOut) => set({ loggingOut }),

  setCurrency: (currency: string) => {
    set({ currency });
  },

  setCountry: (countryCode: string) => {
    const curr = countryCurrencyMap[countryCode] || {
      code: "USD",
      symbol: "$",
    };
    set({
      country: countryCode,
      currency: curr.code,
      currencySymbol: curr.symbol,
    });
  },

  registerUser: async (data: any) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result?.message || "Registration failed");

      const login = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (login?.error) throw new Error(login.error);

      const symbol =
        Object.values(countryCurrencyMap).find(
          (c) => c.code === result.user.currency,
        )?.symbol || "$";

      set({
        user: result.user,
        currency: result.user.currency,
        currencySymbol: symbol,
        isAuthenticated: true,
        loading: false,
      });

      return result;
    } catch (err: any) {
      set({ error: err?.message || "Registration failed", loading: false });
      return err;
    }
  },
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      currency: "USD",
      currencySymbol: "$",
      country: "",
      error: null,
      loading: false,
    });
    useExchangeRateStore.getState().resetRates();
  },
}));

export default useUserStore;
