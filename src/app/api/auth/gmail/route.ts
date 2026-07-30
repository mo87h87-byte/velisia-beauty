import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const url = getAuthUrl();
  return NextResponse.redirect(url);
}