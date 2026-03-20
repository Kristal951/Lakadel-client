import { NextResponse } from "next/server";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(
    "https://countriesnow.space/api/v0.1/countries/positions"
  );

  return NextResponse.json(await res.json());
}