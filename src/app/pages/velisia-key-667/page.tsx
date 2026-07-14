"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminKeyPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("velisia_admin_key", "true");
    router.replace("/admin/login");
  }, [router]);

  return <p style={{ padding: 40, textAlign: "center" }}>جارٍ التفعيل...</p>;
}