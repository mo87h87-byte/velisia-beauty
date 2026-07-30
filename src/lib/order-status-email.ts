interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string | null;
  carrier?: string | null;
}

function wrapEmail(headline: string, subhead: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f4f5;font-family:Tahoma,Arial,sans-serif;" dir="rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">

        <tr>
          <td style="background:linear-gradient(135deg,#c96a8c,#7a2440);padding:26px 24px;text-align:center;">
            <div style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">Velisia Beauty</div>
            <div style="font-size:14px;color:#f6dbe4;margin-top:6px;">${subhead}</div>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 24px;">
            <h2 style="font-size:18px;color:#7a2440;margin:0 0 14px;">${headline}</h2>
            ${bodyHtml}

            <div style="text-align:center;margin-top:28px;">
              <a href="https://velisiabeauty.com/pages/track-order"
                 style="display:inline-block;background:#7a2440;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:8px;font-size:14px;">
                تتبّعي طلبك
              </a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#fdf2f6;padding:16px;text-align:center;font-size:11px;color:#a08b95;">
            Velisia Beauty · إشعار تلقائي بخصوص طلبك
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function shippingDetailsRow(data: OrderEmailData): string {
  if (!data.trackingNumber && !data.carrier) return "";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fdf2f6;border-radius:10px;margin-top:6px;">
      ${
        data.carrier
          ? `<tr><td style="padding:10px 14px;font-size:13px;color:#9b7280;">شركة الشحن</td><td style="padding:10px 14px;text-align:left;font-size:13px;font-weight:bold;color:#3f2530;">${data.carrier}</td></tr>`
          : ""
      }
      ${
        data.trackingNumber
          ? `<tr><td style="padding:10px 14px;font-size:13px;color:#9b7280;">رقم التتبع</td><td style="padding:10px 14px;text-align:left;font-size:13px;font-weight:bold;color:#3f2530;" dir="ltr">${data.trackingNumber}</td></tr>`
          : ""
      }
    </table>`;
}

export function buildShippedEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `📦 طلبك ${data.orderNumber} في الطريق إليكِ`;
  const body = `
    <p style="font-size:14px;color:#3f2530;line-height:1.8;margin:0 0 14px;">
      عزيزتنا ${data.customerName}، تم شحن طلبك رقم <strong>${data.orderNumber}</strong> وهو في طريقه إليكِ الآن.
    </p>
    ${shippingDetailsRow(data)}
  `;
  return { subject, html: wrapEmail("📦 تم شحن طلبك", "حالة الطلب: تم الشحن", body) };
}

export function buildDeliveredEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `✅ تم توصيل طلبك ${data.orderNumber}`;
  const body = `
    <p style="font-size:14px;color:#3f2530;line-height:1.8;margin:0 0 14px;">
      عزيزتنا ${data.customerName}، تم توصيل طلبك رقم <strong>${data.orderNumber}</strong> بنجاح. نتمنى أن تنال المنتجات إعجابك!
    </p>
    ${shippingDetailsRow(data)}
  `;
  return { subject, html: wrapEmail("✅ تم توصيل طلبك", "حالة الطلب: تم التوصيل", body) };
}
