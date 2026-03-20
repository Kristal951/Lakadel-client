// /lib/cartApi.ts
import type { CartItemPayload } from "@/store/types";
import { getSession } from "next-auth/react";

export type CartGetResponse = { items: CartItemPayload[] };

async function hasSession() {
  const session = await getSession();
  return !!session;
}

async function getErrorText(res: Response) {
  try {
    const text = await res.text();
    return text ? ` — ${text}` : "";
  } catch {
    return "";
  }
}

export async function cartGet(): Promise<CartGetResponse> {
  if (!(await hasSession())) return { items: [] };

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
        console.log(data, 'cartGet')
    if (Array.isArray((data as any)?.items)) return data as CartGetResponse;
    if (Array.isArray(data as any)) return { items: data as any };

    return { items: [] };
  } catch (err) {
    console.error("Cart GET error:", err);
    return { items: [] };
  }
}

export async function cartAdd(payload: CartItemPayload) {
  if (!(await hasSession())) throw new Error("Not authenticated");

  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, action: "add" }),
  });

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
  if (!(await hasSession())) throw new Error("Not authenticated");

  const quantity =
    payload.action === "remove"
      ? 1
      : Math.max(1, Number(payload.quantity ?? 1));

  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, quantity }),
  });

  if (!res.ok) {
    throw new Error(
      `Cart UPDATE error: ${res.status} ${res.statusText}${await getErrorText(res)}`,
    );
  }

  return res.json();
}

export async function cartClear() {
  if (!(await hasSession())) throw new Error("Not authenticated");

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
  if (!(await hasSession())) throw new Error("Not authenticated");

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
