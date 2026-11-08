"use client";

import { useState } from "react";

export default function RecalcXpButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [updated, setUpdated] = useState<number | null>(null);

  const run = async () => {
    if (!confirm("Barcha foydalanuvchilarning ballari qayta hisoblanadi (faqat Telegram obuna +500 va do'st taklif +100 qoladi). Davom etasizmi?")) {
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/admin/recalc-xp", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setUpdated(data.updated);
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={run}
        disabled={state === "loading"}
        className="rounded-xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-rose-400 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
      >
        {state === "loading" ? "Hisoblanmoqda..." : "⚠️ Ballarni qayta hisoblash"}
      </button>
      {state === "done" && (
        <span className="text-sm font-bold text-emerald-600">✅ {updated} ta foydalanuvchi yangilandi</span>
      )}
      {state === "error" && <span className="text-sm font-bold text-rose-600">Xatolik yuz berdi</span>}
    </div>
  );
}
