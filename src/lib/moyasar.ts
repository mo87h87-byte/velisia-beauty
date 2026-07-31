/**
 * Fetches a Moyasar payment's raw status straight from their API — never
 * trust the client's own claim about its payment status.
 */
export async function getMoyasarPaymentStatus(paymentId: string): Promise<string | null> {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  if (!secretKey) return null;
  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  try {
    const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payment = await res.json();
    return typeof payment.status === "string" ? payment.status : null;
  } catch {
    return null;
  }
}

export async function verifyMoyasarPaid(paymentId: string): Promise<boolean> {
  return (await getMoyasarPaymentStatus(paymentId)) === "paid";
}
