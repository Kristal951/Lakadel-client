export async function paystackInitialize({
  email,
  amountKobo,
  callback_url,
  metadata,
}: {
  email: string;
  amountKobo: number;
  callback_url: string;
  metadata?: any;
}) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      callback_url,
      metadata,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Paystack initialize failed");
  return json; // json.data.authorization_url, json.data.reference
}

export async function paystackVerify(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Paystack verify failed");
  return json;
}
