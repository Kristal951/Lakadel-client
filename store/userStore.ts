import { create } from "zustand";
import { UserState } from "./types";
import { useExchangeRateStore } from "./exchangeRate";
import { signIn } from "next-auth/react";

const countryCurrencyMap: Record<string, { code: string; symbol: string }> = {
  NG: { code: "NGN", symbol: "₦" },
  US: { code: "USD", symbol: "$" },
  GB: { code: "GBP", symbol: "£" },
  EU: { code: "EUR", symbol: "€" },
  CA: { code: "CAD", symbol: "$" },
  AU: { code: "AUD", symbol: "$" },
  JP: { code: "JPY", symbol: "¥" },
  IN: { code: "INR", symbol: "₹" },
  SG: { code: "SGD", symbol: "$" },
  CH: { code: "CHF", symbol: "CHF" },
  ZA: { code: "ZAR", symbol: "R" },
  BR: { code: "BRL", symbol: "R$" },
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
