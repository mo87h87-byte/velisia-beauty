import { NextResponse } from "next/server";
import { getGmailClient } from "@/lib/gmail";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { STORE_KNOWLEDGE } from "@/lib/email-knowledge";

// دالة تحلل الإيميل باستخدام Claude وتقرر: رد تلقائي ولا تصعيد لمراجعة بشرية
async function analyzeEmail(subject: string, body: string) {
  const prompt = `أنت مساعد لخدمة عملاء متجر Velisia Beauty. حلل الإيميل التالي وقرر كيفية التعامل معه.

معلومات المتجر:
${STORE_KNOWLEDGE}

عنوان الإيميل: ${subject}
محتوى الإيميل: ${body}

مهم جداً: إذا كان الإيميل يحتوي على شكوى، طلب استرجاع أموال، طلب إلغاء طلب، نبرة غضب واضحة، أو سؤال لا تغطيه معلومات المتجر أعلاه - يجب تصعيده لمراجعة بشرية ولا يتم الرد تلقائياً.

رد فقط بصيغة JSON بالشكل التالي، بدون أي نص إضافي:
{
  "action": "auto_reply" أو "escalate",
  "reason": "سبب القرار (إذا كان escalate)",
  "reply": "نص الرد المقترح بالعربية (إذا كان auto_reply فقط)"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return { action: "escalate", reason: "تعذر تحليل الإيميل تلقائياً" };
  }
}
export async function GET() {
  try {
    const gmail = await getGmailClient();

    // جلب الإيميلات غير المقروءة فقط
    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 10,
    });

    const messages = list.data.messages || [];
    let repliedCount = 0;
    let escalatedCount = 0;

    for (const msg of messages) {
      if (!msg.id) continue;

      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = fullMessage.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const fromEmail = from.match(/<(.+)>/)?.[1] || from;
      const fromName = from.replace(/<.+>/, "").trim();

      // استخراج نص الإيميل
      let body = "";
      const parts = fullMessage.data.payload?.parts;
      if (parts) {
        const textPart = parts.find((p) => p.mimeType === "text/plain");
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (fullMessage.data.payload?.body?.data) {
        body = Buffer.from(
          fullMessage.data.payload.body.data,
          "base64"
        ).toString("utf-8");
      }

      // تجاهل لو سبق التعامل مع نفس الإيميل
      const already = await db.execute(sql`
        SELECT id FROM auto_replied_emails WHERE gmail_message_id = ${msg.id}
        UNION
        SELECT id FROM support_emails WHERE gmail_message_id = ${msg.id}
      `);
      if (already.rows.length > 0) continue;

      const analysis = await analyzeEmail(subject, body);

      if (analysis.action === "auto_reply" && analysis.reply) {
        // إرسال الرد التلقائي
        const replyRaw = [
          `To: ${fromEmail}`,
          `Subject: Re: ${subject}`,
          `In-Reply-To: ${msg.id}`,
          "Content-Type: text/plain; charset=UTF-8",
          "",
          analysis.reply,
        ].join("\n");

        const encodedMessage = Buffer.from(replyRaw)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw: encodedMessage, threadId: fullMessage.data.threadId },
        });

        await db.execute(sql`
          INSERT INTO auto_replied_emails (gmail_message_id, from_email, subject, category)
          VALUES (${msg.id}, ${fromEmail}, ${subject}, 'auto_reply')
        `);

        repliedCount++;
      } else {
        // تصعيد لمراجعة بشرية
        await db.execute(sql`
          INSERT INTO support_emails (gmail_message_id, from_email, from_name, subject, body, reason)
          VALUES (${msg.id}, ${fromEmail}, ${fromName}, ${subject}, ${body}, ${analysis.reason || "غير محدد"})
        `);

        escalatedCount++;
      }

      // تعليم الإيميل كمقروء
      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: { removeLabelIds: ["UNREAD"] },
      });
    }

    return NextResponse.json({
      success: true,
      processed: messages.length,
      replied: repliedCount,
      escalated: escalatedCount,
    });
  } catch (error) {
    console.error("خطأ في أتمتة الإيميلات:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الإيميلات" },
      { status: 500 }
    );
  }
}