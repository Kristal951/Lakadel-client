import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const KEY = "lakadel_guest_id";

export async function getGuestId() {
  const jar = await cookies();
  return jar.get(KEY)?.value ?? null;
}

export async function ensureGuestId() {
  const jar = await cookies();
  let id = jar.get(KEY)?.value ?? null;

  if (!id) {
    id = randomUUID();
    jar.set(KEY, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, 
    });
  }

  return id;
}

export async function clearGuestId() {
  const jar = await cookies();
  jar.set(KEY, "", { path: "/", maxAge: 0 });
}