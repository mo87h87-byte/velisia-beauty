import { google } from "googleapis";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// إنشاء OAuth2 client جديد
export function createOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// رابط تسجيل الدخول لجوجل
export function getAuthUrl() {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.send",
    ],
  });
}

// حفظ التوكنات في قاعدة البيانات بعد أول تسجيل دخول
export async function saveTokens(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  await db.execute(sql`DELETE FROM email_automation_tokens`);
  await db.execute(sql`
    INSERT INTO email_automation_tokens (access_token, refresh_token, expiry_date)
    VALUES (${tokens.access_token}, ${tokens.refresh_token}, ${tokens.expiry_date})
  `);
}

// جلب عميل Gmail جاهز للاستخدام (بيعمل refresh تلقائي لو محتاج)
export async function getGmailClient() {
  const result = await db.execute(sql`
    SELECT access_token, refresh_token, expiry_date
    FROM email_automation_tokens
    ORDER BY id DESC
    LIMIT 1
  `);

  const row = result.rows[0] as
    | { access_token: string; refresh_token: string; expiry_date: number }
    | undefined;

  if (!row) {
    throw new Error("لا يوجد اتصال مفعّل بـ Gmail. لازم تسجل دخول الأول.");
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expiry_date: Number(row.expiry_date),
  });

  // لو التوكن قرب ينتهي، جوجل هتعمله refresh تلقائي
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await db.execute(sql`
        UPDATE email_automation_tokens
        SET access_token = ${tokens.access_token},
            expiry_date = ${tokens.expiry_date},
            updated_at = NOW()
        WHERE id = (SELECT id FROM email_automation_tokens ORDER BY id DESC LIMIT 1)
      `);
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}