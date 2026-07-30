import { wrapEmailShell } from "@/lib/email-template";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string | null;
  carrier?: string | null;
}

function wrapEmail(headline: string, subhead: string, bodyHtml: string): string {
  return wrapEmailShell(bodyHtml, {
    subheadLines: [subhead],
    maxWidth: 520,
    bodyPadding: "28px 24px",
    headline,
    cta: { href: "https://velisiabeauty.com/pages/track-order", label: "تتبّعي طلبك", marginTop: 28 },
    footerText: "Velisia Beauty · إشعار تلقائي بخصوص طلبك",
  });
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
