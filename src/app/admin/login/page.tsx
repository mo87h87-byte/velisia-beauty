"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    if (data.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("كلمة السر غير صحيحة");
    }
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#faf7f5] font-sans"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] rounded-2xl bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      >
        <h1 className="mb-6 text-center text-[22px] text-[#a3336b]">
          لوحة تحكم velisiabeauty
        </h1>
        <label className="mb-2 block text-sm">كلمة السر</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 box-border w-full rounded-lg border border-[#ddd] p-3 text-base"
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-[10px] cursor-pointer border-none bg-transparent text-lg"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-[#d33]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg border-none bg-[#a3336b] p-3 text-base text-white"
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
