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
  if (!orderNumber) return notFound();

  const res = await fetch(
     `${getBaseUrl()}/api/users/orders/getByOrderNumber?orderNumber=${encodeURIComponent(Number(orderNumber))}`,
  );
  if (!res.ok) return notFound();

  const order = await res.json();

  return <OrderClient order={order} orderRef={orderRef} />;
}
