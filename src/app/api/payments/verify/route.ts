export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return Response.json({ error: "معرف الدفع مفقود" }, { status: 400 });
    }

    const secretKey = process.env.MOYASAR_SECRET_KEY;
    if (!secretKey) {
      return Response.json({ error: "إعدادات الدفع غير مكتملة" }, { status: 500 });
    }

    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ error: "تعذر التحقق من الدفع" }, { status: 502 });
    }

    const payment = await res.json();

    return Response.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paid: payment.status === "paid",
    });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}