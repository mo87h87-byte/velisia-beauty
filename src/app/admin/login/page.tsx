"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

if (data.ok) {      router.push("/admin");
      router.refresh();
    } else {
      setError("كلمة السر غير صحيحة");
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#faf7f5",
      direction: "rtl",
      fontFamily: "sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "360px",
      }}>
        <h1 style={{ fontSize: "22px", marginBottom: "24px", textAlign: "center", color: "#a3336b" }}>
          لوحة تحكم velisiabeauty
        </h1>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
          كلمة السر
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "16px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
          autoFocus
          required
        />
        {error && (
          <p style={{ color: "#d33", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#a3336b",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}