// /lib/cartApi.ts
import type { CartItemPayload } from "@/store/types";
export type CartGetResponse = { items: CartItemPayload[] };

async function getErrorText(res: Response) {
  try {
    const text = await res.text();
    return text ? ` — ${text}` : "";
  } catch {
    return "";
  }
}

export async function cartGet(): Promise<CartGetResponse> {
  try {
    const res = await fetch("/api/cart", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Cart GET failed: ${res.status} ${res.statusText}`);
      return { items: [] };
    }

    const data = (await res.json()) as unknown;
    console.log(data, "cartGet");
    if (Array.isArray((data as any)?.items)) return data as CartGetResponse;
    if (Array.isArray(data as any)) return { items: data as any };

    return { items: [] };
  } catch (err) {
    console.error("Cart GET error:", err);
    return { items: [] };
  }
}

export async function cartAdd(payload: CartItemPayload) {
    console.log(payload, 'payload')
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, action: "add" }),
  });
  console.log(res, 'res')

  if (!res.ok) {
    throw new Error(
      `Cart ADD error: ${res.status} ${res.statusText}${await getErrorText(res)}`,
    );
  }

  return res.json();
}

export async function cartUpdate(
  payload: CartItemPayload & { action: "increase" | "decrease" | "remove" },
) {
  const quantity =
    payload.action === "remove"
      ? 1
      : Math.max(1, Number(payload.quantity ?? 1));

  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, quantity }),
  });
  console.log(res, "resres");

  if (!res.ok) {
    throw new Error(
      `Cart UPDATE error: ${res.status} ${res.statusText}${await getErrorText(res)}`,
    );
  }

  return res.json();
}

export async function cartClear() {
  const res = await fetch("/api/cart", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "clear" }),
  });

  if (!res.ok) {
    throw new Error(
      `Cart CLEAR error: ${res.status} ${res.statusText}${await getErrorText(res)}`,
    );
  }

  return res.json();
}

export async function fetchProduct(productId: string) {
  const res = await fetch(`/api/users/products/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch product: ${res.status} ${res.statusText}${await getErrorText(res)}`,
    );
  }

  return res.json();
}
