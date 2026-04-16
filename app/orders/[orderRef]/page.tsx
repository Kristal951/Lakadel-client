import { notFound } from "next/navigation";
import { parseOrderRef } from "@/lib";
import { getBaseUrl } from "@/lib/cartDB";
import OrderClient from "./OrderClient";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;
  const orderNumber = parseOrderRef(orderRef);

  if (!orderNumber) {
    notFound();
  }

  const url = `${getBaseUrl()}/api/users/orders/getByOrderNumber?orderNumber=${encodeURIComponent(
    String(orderNumber)
  )}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch order:", {
      status: res.status,
      statusText: res.statusText,
      url,
    });
    notFound();
  }

  const order = await res.json();

  if (!order) {
    notFound();
  }

  return <OrderClient order={order} orderRef={orderRef} />;
}