"use client";

import { useState, useEffect } from "react";
import useUserStore from "@/store/userStore";
import { countries } from "@/lib";

export default function CountrySelectorModal() {
  const { country, setCountry, setCurrency, currencySymbol } = useUserStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!country) setShow(true);
  }, [country]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-8 rounded-3xl max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Select Your Country</h2>
        <p className="text-sm mb-6">
          We will show prices in your local currency ({currencySymbol})
        </p>

        <div className="grid grid-cols-2 gap-4 max-h-96 ">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCountry(c.name);
                setCurrency(c.currency);
                setShow(false);
              }}
              className="flex items-center justify-between py-3 px-4 rounded-xl border hover:bg-foreground hover:text-background transition"
            >
              <span className="font-semibold">{c.name}</span>
              <span className="text-lg font-bold">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
