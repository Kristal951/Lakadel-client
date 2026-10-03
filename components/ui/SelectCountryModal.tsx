"use client";

import { useEffect, useRef, useState } from "react";
import useUserStore from "@/store/userStore";
import { countries } from "@/lib";

export default function CountrySelectorModal() {
  const { country, setCountry, setCurrency } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const show = mounted && !country;

  useEffect(() => {
    if (!show) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-background p-6 text-center outline-none sm:p-8"
      >
        <h2 id="country-modal-title" className="mb-2 text-2xl font-bold">
          Select Your Country
        </h2>
        <p className="mb-6 text-sm text-foreground/70">
          We'll show prices in your local currency.
        </p>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCountry(c.name);
                setCurrency(c.currency);
              }}
              className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 sm:odd:last:col-span-2 sm:odd:last:w-[calc(50%-0.375rem)] sm:odd:last:justify-self-center"
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