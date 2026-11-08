"use client";

import { useState } from "react";

export default function RecalcXpButton() {
  const [state, setState] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");
  const [updated, setUpdated] = useState<number | null>(null);

  const run = async () => {
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

  if (state === "confirm") {
    return (
      <div className="mt-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-3">
        <p className="text-sm font-bold text-rose-700">
          Barcha foydalanuvchilarning ballari qayta hisoblanadi (faqat Telegram obuna +500 va do'st taklif +100
          qoladi). Davom etasizmi?
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={run}
            className="rounded-xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-rose-400 active:translate-y-0.5 active:border-b-2"
          >
            Ha, davom et
          </button>
          <button
            onClick={() => setState("idle")}
            className="rounded-xl border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => setState("confirm")}
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
