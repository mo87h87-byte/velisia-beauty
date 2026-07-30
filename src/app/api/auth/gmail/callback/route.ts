import { NextResponse } from "next/server";
import { createOAuthClient, saveTokens } from "@/lib/gmail";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "لم يتم استلام كود الموافقة من جوجل" },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    await saveTokens(tokens);

    return NextResponse.json({
      success: true,
      message: "تم ربط Gmail بنجاح! يمكنك إغلاق هذه الصفحة.",
    });
  } catch (error) {
    console.error("خطأ في ربط Gmail:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء ربط Gmail" },
      { status: 500 }
    );
  }
}
