import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getGuestId, clearGuestId } from "@/lib/guest";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const guestId = await getGuestId();
    if (!guestId) {
      return NextResponse.json({ ok: true, merged: false, reason: "no_guest_cookie" });
    }

    const guestCart = await prisma.cart.findUnique({
      where: { guestId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      await clearGuestId();
      return NextResponse.json({ ok: true, merged: false, reason: "no_guest_cart" });
    }

    await prisma.$transaction(async (tx) => {
      const userCart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        select: { id: true },
      });

      for (const it of guestCart.items) {
        await tx.cartItem.upsert({
          where: {
            cartId_productId_selectedColor_selectedSize: {
              cartId: userCart.id,
              productId: it.productId,
              selectedColor: it.selectedColor ?? "",
              selectedSize: it.selectedSize ?? "",
            },
          },
          create: {
            cartId: userCart.id,
            productId: it.productId,
            selectedColor: it.selectedColor,
            selectedSize: it.selectedSize,
            quantity: it.quantity,
          },
          update: {
            quantity: { increment: it.quantity },
          },
        });
      }

      await tx.cart.update({
        where: { id: guestCart.id },
        data: { claimedAt: new Date() },
      });

      await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      await tx.cart.delete({ where: { id: guestCart.id } });
    });

    await clearGuestId();

    return NextResponse.json({ ok: true, merged: true });
  } catch (e) {
    console.error("POST /api/cart/claim error:", e);
    return NextResponse.json({ ok: false, error: "Failed to claim cart" }, { status: 500 });
  }
}