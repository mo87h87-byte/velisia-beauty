import { NextResponse } from "next/server";
import { getGmailClient } from "@/lib/gmail";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { STORE_KNOWLEDGE } from "@/lib/email-knowledge";

async function analyzeEmail(subject: string, body: string) {
  const prompt = `أنت مساعد لخدمة عملاء متجر Velisia Beauty. حلل الإيميل التالي وقرر كيفية التعامل معه.

معلومات المتجر:
${STORE_KNOWLEDGE}

عنوان الإيميل: ${subject}
محتوى الإيميل: ${body}

تصنيف الإيميل يكون واحد من ثلاثة:
1. "auto_reply": سؤال واضح من عميل حقيقي يمكن الإجابة عليه من معلومات المتجر أعلاه فقط
2. "escalate": شكوى، طلب استرجاع أموال، طلب إلغاء طلب، نبرة غضب واضحة، أو سؤال حقيقي من عميل لكن غير مغطى في معلومات المتجر
3. "ignore": رسائل تسويقية، إعلانات، نشرات بريدية، رسائل من شركات (مثل استضافة، أدوات، خدمات)، أو أي رسالة ليست استفساراً حقيقياً من عميل عن المتجر - هذه لا تُصعّد ولا يُرد عليها، فقط تُتجاهل

رد فقط بصيغة JSON بالشكل التالي، بدون أي نص إضافي:
{
  "action": "auto_reply" أو "escalate" أو "ignore",
  "reason": "سبب القرار (إذا كان escalate أو ignore)",
  "reply": "نص الرد المقترح بالعربية (إذا كان auto_reply فقط)"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("خطأ من Anthropic API:", response.status, errText);
    return { action: "escalate", reason: "تعذر الاتصال بخدمة التحليل" };
  }

  const data = await response.json();

  // Claude Sonnet 5 بيرجع أحياناً بلوك "تفكير" قبل بلوك النص الفعلي،
  // فلازم ندور على أول بلوك نوعه "text" تحديداً بدل أول عنصر في المصفوفة
  const textBlock = data.content?.find(
    (block: { type: string; text?: string }) => block.type === "text"
  );
  const text = textBlock?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    console.error("تعذر تحليل رد Claude كـ JSON. الرد الخام:", text);
    return { action: "escalate", reason: "تعذر تحليل الإيميل تلقائياً" };
  }
}

export async function GET() {
  try {
    const gmail = await getGmailClient();

    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 10,
    });

    const messages = list.data.messages || [];
    let repliedCount = 0;
    let escalatedCount = 0;
    let ignoredCount = 0;
    let skippedCount = 0;

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

      const already = await db.execute(sql`
        SELECT id FROM auto_replied_emails WHERE gmail_message_id = ${msg.id}
        UNION
        SELECT id FROM support_emails WHERE gmail_message_id = ${msg.id}
      `);
      if (already.rows.length > 0) {
        skippedCount++;
        continue;
      }

      const analysis = await analyzeEmail(subject, body);
      console.log(`تحليل إيميل "${subject}":`, JSON.stringify(analysis));

      if (analysis.action === "ignore") {
        ignoredCount++;
      } else if (analysis.action === "auto_reply" && analysis.reply) {
        const encodedSubject = `=?UTF-8?B?${Buffer.from(
          `Re: ${subject}`
        ).toString("base64")}?=`;

        const replyRaw = [
          `To: ${fromEmail}`,
          `Subject: ${encodedSubject}`,
          `In-Reply-To: ${msg.id}`,
          "MIME-Version: 1.0",
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
          ON CONFLICT (gmail_message_id) DO NOTHING
        `);

        repliedCount++;
      } else {
        await db.execute(sql`
          INSERT INTO support_emails (gmail_message_id, from_email, from_name, subject, body, reason)
          VALUES (${msg.id}, ${fromEmail}, ${fromName}, ${subject}, ${body}, ${analysis.reason || "غير محدد"})
          ON CONFLICT (gmail_message_id) DO NOTHING
        `);

        escalatedCount++;
      }

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
      ignored: ignoredCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("خطأ في أتمتة الإيميلات:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الإيميلات" },
      { status: 500 }
    );
  }
}