import { put } from "@vercel/blob";
import { isAuthorized } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "الملف المرفوع ليس صورة" }, { status: 400 });
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeBytes) {
    return Response.json({ error: "حجم الصورة أكبر من 5 ميجابايت" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const key = `products/${Date.now()}-${safeName}`;

  const blob = await put(key, file, {
    access: "public",
    token: process.env.PRODUCTS_BLOB_READ_WRITE_TOKEN,
  });

  return Response.json({ url: blob.url });
}