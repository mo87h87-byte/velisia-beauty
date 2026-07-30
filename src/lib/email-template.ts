// Shared HTML chrome (header gradient, card shell, CTA button, footer bar)
// for the transactional order-status emails and the weekly sales report —
// same "Velisia Beauty" branding, different content/sizing per caller.

export interface EmailShellOptions {
  // First line renders 14px/#f6dbe4/margin-top:6px, any further lines
  // render 12px/#eec3d2/margin-top:4px — matches the two email templates
  // this was extracted from.
  subheadLines: string[];
  maxWidth: number;
  bodyPadding: string;
  headline?: string;
  cta: { href: string; label: string; marginTop: number };
  // Purely a whitespace-fidelity knob (blank line before the closing </td>)
  // to keep byte-for-byte parity with each caller's original template.
  blankLineAfterCta?: boolean;
  footerText: string;
}

export function wrapEmailShell(bodyHtml: string, opts: EmailShellOptions): string {
  const { subheadLines, maxWidth, bodyPadding, headline, cta, footerText, blankLineAfterCta } = opts;

  const subheadHtml = subheadLines
    .map((line, i) =>
      i === 0
        ? `<div style="font-size:14px;color:#f6dbe4;margin-top:6px;">${line}</div>`
        : `<div style="font-size:12px;color:#eec3d2;margin-top:4px;">${line}</div>`,
    )
    .join("\n            ");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f4f5;font-family:Tahoma,Arial,sans-serif;" dir="rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:${maxWidth}px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">

        <tr>
          <td style="background:linear-gradient(135deg,#c96a8c,#7a2440);padding:26px 24px;text-align:center;">
            <div style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">Velisia Beauty</div>
            ${subheadHtml}
          </td>
        </tr>

        <tr>
          <td style="padding:${bodyPadding};">${headline ? `\n            <h2 style="font-size:18px;color:#7a2440;margin:0 0 14px;">${headline}</h2>` : "\n"}
            ${bodyHtml}

            <div style="text-align:center;margin-top:${cta.marginTop}px;">
              <a href="${cta.href}"
                 style="display:inline-block;background:#7a2440;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:8px;font-size:14px;">
                ${cta.label}
              </a>
            </div>
${blankLineAfterCta ? "\n" : ""}          </td>
        </tr>

        <tr>
          <td style="background:#fdf2f6;padding:16px;text-align:center;font-size:11px;color:#a08b95;">
            ${footerText}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
