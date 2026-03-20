import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./authOptions";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session) {
    return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (role !== "ADMIN") {
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}
