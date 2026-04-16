// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGuestId } from "@/lib/guest";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.id) {
    return NextResponse.json({
      userId: user.id,
      role: user.role ?? "USER",
      guestId: null,
    });
  }

  const guestId = await getGuestId();

  return NextResponse.json({
    userId: null,
    role: "USER",
    guestId,
  });
}