import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const KEY = "lakadel_guest_id";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const existingGuestId = request.cookies.get(KEY)?.value;

  if (!existingGuestId) {
    const newId = crypto.randomUUID(); 

    response.cookies.set(KEY, newId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};