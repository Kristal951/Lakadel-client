import { useExchangeRateStore } from "@/store/exchangeRate";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "./prisma";

export const countries = [
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", name: "Eurozone", currency: "EUR", symbol: "€" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "$" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "CHF" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
];

export function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Universal Price Formatter
 * @param amount - The base price (Assumed NGN)
 * @param currency - Target currency code (e.g. "USD")
 * @param rate - The multiplier to convert base to target
 */
export function formatPrice(amount: number, currency: string, rate: number) {
  const converted = Number(amount) * Number(rate);

  if (!Number.isFinite(converted)) return "—";

  const isZeroDecimal = ["NGN", "JPY", "KRW"].includes(currency.toUpperCase());

  const nf = new Intl.NumberFormat("en-US", {
    // "en-US" ensures standard symbol placement
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
  });

  try {
    const parts = nf.formatToParts(converted);
    const symbol = parts.find((p) => p.type === "currency")?.value || "";
    const value = parts
      .filter((p) => p.type !== "currency")
      .map((p) => p.value)
      .join("")
      .trim();

    return `${symbol} ${value}`;
  } catch (e) {
    return `${currency} ${converted.toLocaleString()}`;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const categories = [
  "T-shirts / Tops",
  "Trousers",
  "Flags",
  "Shorts",
  "Dresses",
];
export const sizes = ["XS", "S", "M", "L", "XL"];
export const genders = ["male", "female", "unisex"];

async function compressImage(file: File, maxW = 1600, quality = 0.75) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality,
    );
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let i = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

export async function uploadImagesToCloudinary(files: File[]) {
  const compressed = await Promise.all(
    files.map((f) => compressImage(f, 1600, 0.75)),
  );

  const sigRes = await fetch("/api/admin/cloudinary/signature", {
    method: "POST",
  });
  if (!sigRes.ok) throw new Error("Failed to get upload signature");

  const { timestamp, signature, cloudName, apiKey, folder } =
    await sigRes.json();

  const urls = await mapWithConcurrency(compressed, 2, async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);

    fd.append("eager", "w_600,f_auto,q_auto");
    fd.append("eager_async", "false");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd },
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(data?.error?.message || "Upload failed");

    return (data?.eager?.[0]?.secure_url ?? data.secure_url) as string;
  });

  return urls;
}
export function cld(url: string, w = 800) {
  if (!url?.includes("/upload/")) return url;

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_fill/`);
}

export function parseOrderRef(orderRef?: string) {
  if (!orderRef) return null;

  const cleaned = orderRef.toUpperCase().replace("L-", "");
  const num = Number(cleaned);

  if (!Number.isInteger(num) || num <= 0) return null;
  return num; 
}

export function parseSelectedColor(
  value: unknown
): { name?: string; hex?: string } | null {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return {
          name: typeof parsed.name === "string" ? parsed.name : undefined,
          hex: typeof parsed.hex === "string" ? parsed.hex : undefined,
        };
      }
      return { name: value };
    } catch {
      return { name: value };
    }
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : undefined,
      hex: typeof obj.hex === "string" ? obj.hex : undefined,
    };
  }

  return null;
}