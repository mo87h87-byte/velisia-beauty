"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-client";

const MIN_LENGTH = 8;

function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const verify = async () => {
    setError("");
    if (!password) return;
    setVerifying(true);
    try {
      const res = await adminFetch("/api/admin/verify-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        onUnlock(password);
      } else {
        setError(data.error || "كلمة السر غير صحيحة");
      }
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-1 font-bold text-plum-900">🔒 منطقة محمية</h3>
      <p className="mb-4 text-xs text-plum-900/50">
        أدخلي كلمة السر الحالية للمتابعة إلى إعدادات الحساب
      </p>

      <div className="max-w-sm">
        <label className="mb-1 block text-xs font-semibold text-plum-900/70">كلمة السر الحالية</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
          autoComplete="current-password"
          autoFocus
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={verify}
          disabled={verifying || !password}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
        >
          {verifying ? "جاري التحقق..." : "متابعة"}
        </button>
        {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function ChangePasswordForm({ initialCurrentPassword }: { initialCurrentPassword: string }) {
  const [currentPassword, setCurrentPassword] = useState(initialCurrentPassword);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const save = async () => {
    setMessage(null);

    if (newPassword.length < MIN_LENGTH) {
      setMessage({ type: "error", text: `كلمة السر الجديدة لازم تكون ${MIN_LENGTH} أحرف على الأقل` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمة السر الجديدة وتأكيدها مش متطابقين" });
      return;
    }

    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "✅ تم تغيير كلمة السر بنجاح" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "فشل تغيير كلمة السر" });
      }
    } catch {
      setMessage({ type: "error", text: "خطأ في الاتصال بالخادم" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-1 font-bold text-plum-900">تغيير كلمة السر</h3>
      <p className="mb-4 text-xs text-plum-900/50">
        كلمة سر حساب الأدمن المستخدمة لتسجيل الدخول للوحة التحكم
      </p>

      <div className="max-w-sm space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">كلمة السر الحالية</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">كلمة السر الجديدة</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">تأكيد كلمة السر الجديدة</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "💾 تغيير كلمة السر"}
        </button>
        {message && (
          <span className={`text-xs font-semibold ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminAccountPanel() {
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);

  if (verifiedPassword === null) {
    return <PasswordGate onUnlock={setVerifiedPassword} />;
  }
  return <ChangePasswordForm initialCurrentPassword={verifiedPassword} />;
}
