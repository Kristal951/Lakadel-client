const SUPPORTED = ["NGN", "USD", "EUR", "GBP", "CAD"] as const;
type Code = (typeof SUPPORTED)[number];
type Rates = Record<Code, number>;

const FALLBACK_RATES: Rates = {
  NGN: 1,
  USD: 0.00067,
  EUR: 0.00062,
  GBP: 0.00053,
  CAD: 0.00092,
};

const FRESH_MS = 1000 * 60 * 60 * 6; 
const RETRY_MS = 1000 * 60 * 2; 
const TIMEOUT_MS = 7000;

let cache: { rates: Rates; fetchedAt: number; live: boolean } | null = null;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=21600",
    },
  });
}

async function fetchLiveRates(): Promise<Rates> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/NGN", {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = (await res.json()) as { rates?: Record<string, number> };
    const raw = data?.rates ?? {};

    const rates = { ...FALLBACK_RATES };
    for (const c of SUPPORTED) {
      if (c === "NGN") continue;
      const v = Number(raw[c]);
      if (Number.isFinite(v) && v > 0) {
        rates[c] = v;
      } else {
        console.warn(`Exchange rate missing for ${c}, using fallback value.`);
      }
    }
    return rates;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const now = Date.now();

  if (cache) {
    const ttl = cache.live ? FRESH_MS : RETRY_MS;
    if (now - cache.fetchedAt < ttl) {
      return json({ rates: cache.rates, stale: !cache.live });
    }
  }

  try {
    const rates = await fetchLiveRates();
    cache = { rates, fetchedAt: now, live: true };
    return json({ rates, stale: false });
  } catch (err) {
    console.error("Exchange rates fetch failed.", err);
    const rates = cache?.rates ?? FALLBACK_RATES;
    cache = { rates, fetchedAt: now, live: false };
    return json({ rates, stale: true });
  }
}