let cachedRates: Record<string, number> | null = null;
let lastFetched = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

const SUPPORTED = ["NGN", "USD", "EUR", "GBP"] as const;

const FALLBACK_RATES: Record<(typeof SUPPORTED)[number], number> = {
  NGN: 1,
  USD: 0.00067,
  EUR: 0.00062,
  GBP: 0.00053,
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      // optional caching hints (CDN/browser)
      "Cache-Control": "public, max-age=600",
    },
  });
}

export async function GET() {
  const now = Date.now();

  if (cachedRates && now - lastFetched < CACHE_DURATION) {
    return json(cachedRates);
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 7000);

    const res = await fetch("https://api.exchangerate-api.com/v4/latest/NGN", {
      signal: controller.signal,
    });

    clearTimeout(t);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    const rates: Record<string, number> = data?.rates ?? {};
    const filtered: Record<string, number> = {};

    for (const c of SUPPORTED) {
      if (c === "NGN") filtered.NGN = 1;
      else if (Number.isFinite(rates[c])) filtered[c] = Number(rates[c]);
      else filtered[c] = FALLBACK_RATES[c]; // fill missing
    }

    cachedRates = filtered;
    lastFetched = now;

    return json(filtered);
  } catch (err) {
    console.error("Exchange rates fetch failed, using fallback.", err);

    if (cachedRates) return json(cachedRates);

    cachedRates = FALLBACK_RATES;
    lastFetched = now;
    return json(FALLBACK_RATES);
  }
}
