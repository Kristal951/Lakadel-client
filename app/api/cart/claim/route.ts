import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getGuestId } from "@/lib/guest";
import { SelectedColor } from "@/store/types";

export const runtime = "nodejs";

const DEFAULT_VARIANT = "__DEFAULT__";

const norm = (v?: string | null) =>
  v && v.trim() ? v.trim() : DEFAULT_VARIANT;

function normalizeSelectedColorKey(
  value: string | SelectedColor | null | undefined,
): string {
  if (!value) return DEFAULT_VARIANT;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return DEFAULT_VARIANT;

    try {
      const parsed = JSON.parse(trimmed) as Partial<SelectedColor>;
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.name === "string" &&
        typeof parsed.hex === "string"
      ) {
        return JSON.stringify({
          name: parsed.name.trim(),
          hex: parsed.hex.trim(),
        });
      }
    } catch {}

    return trimmed;
  }

  return JSON.stringify({
    name: typeof value.name === "string" ? value.name.trim() : "",
    hex: typeof value.hex === "string" ? value.hex.trim() : "",
  });
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const guestId = await getGuestId();

    if (!guestId) {
      return NextResponse.json({
        ok: true,
        merged: false,
        reason: "no_guest_cookie",
      });
    }

    const guestCart = await prisma.cart.findUnique({
      where: { guestId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      const res = NextResponse.json({
        ok: true,
        merged: false,
        reason: "no_guest_cart",
      });

      res.cookies.set("lakadel_guest_id", "", {
        path: "/",
        maxAge: 0,
      });

      return res;
    }

    if (guestCart.claimedAt) {
      const res = NextResponse.json({
        ok: true,
        merged: false,
        reason: "already_claimed",
      });

      res.cookies.set("lakadel_guest_id", "", {
        path: "/",
        maxAge: 0,
      });

      return res;
    }

    await prisma.$transaction(async (tx) => {
      const userCart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        select: { id: true },
      });

      await Promise.all(
        guestCart.items.map((it) => {
          const selectedColor = normalizeSelectedColorKey(
            it.selectedColor as string | SelectedColor | null | undefined,
          );
          const selectedColorHex = it.selectedColorHex;
          const selectedSize = norm(it.selectedSize);

          return tx.cartItem.upsert({
            where: {
              cartId_productId_selectedColorHex_selectedSize: {
                cartId: userCart.id,
                productId: it.productId,
                selectedColorHex: it.selectedColorHex ?? DEFAULT_VARIANT,
                selectedSize: it.selectedSize ?? DEFAULT_VARIANT,
              },
            },
            create: {
              cartId: userCart.id,
              productId: it.productId,
              selectedColor,
              selectedSize,
              quantity: it.quantity,
            },
            update: {
              quantity: { increment: it.quantity },
            },
          });
        }),
      );

      await tx.cart.delete({
        where: { id: guestCart.id },
      });
    });
    const res = NextResponse.json({
      ok: true,
      merged: true,
    });

    res.cookies.set("lakadel_guest_id", "", {
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("POST /api/cart/claim error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to claim cart" },
      { status: 500 },
    );
  }
}
