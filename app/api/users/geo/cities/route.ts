import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { country, state } = await req.json();

  if (!country) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }

  const url = state 
    ? "https://countriesnow.space/api/v0.1/countries/state/cities"
    : "https://countriesnow.space/api/v0.1/countries/cities";
    console.log(url)

  const body = state ? { country, state } : { country };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  return NextResponse.json(json);
}
