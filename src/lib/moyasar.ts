/**
 * Verifies a Moyasar payment is actually paid, straight from Moyasar's API —
 * never trust the client's own claim about its payment status.
 */
export async function verifyMoyasarPaid(paymentId: string): Promise<boolean> {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  if (!secretKey) return false;
  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  try {
    const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const payment = await res.json();
    return payment.status === "paid";
  } catch {
    return false;
  }
}
