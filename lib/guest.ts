import { cookies } from "next/headers";

const KEY = "lakadel_guest_id";

export async function getGuestId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(KEY)?.value ?? null;
}