import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

export async function clearCartForPayer(input: {
  tx?: PrismaClient;
  userId?: string | null;
  guestId?: string | null;
}) {
  const tx = input.tx ?? prisma;

  if (!input.userId && !input.guestId) return;

  const cart = await tx.cart.findFirst({
    where: {
      OR: [
        input.userId ? { userId: input.userId } : undefined,
        input.guestId ? { guestId: input.guestId } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true },
  });

  if (!cart) return;

  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

  await tx.cart.update({
    where: { id: cart.id },
    data: { claimedAt: null },
  });
}

export async function generateOrderNumber() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const next = (lastOrder?.orderNumber ?? 100000) + 1;

  return next;
}

export function formatOrderNumber(orderNumber: number ) {
  return `LDK-${orderNumber.toString().padStart(6, "0")}`;
}

export function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXTAUTH_URL;
  return "http://localhost:3000";
}