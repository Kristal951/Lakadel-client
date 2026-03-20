import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { country } = await req.json();

  if (!country) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }

  const res = await fetch(
    "https://countriesnow.space/api/v0.1/countries/states",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    },
  );

  const json = await res.json();
  return NextResponse.json(json);
}
