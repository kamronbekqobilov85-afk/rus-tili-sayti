"use client";

import { useState } from "react";

type Preview = { winner: { name: string | null; xp: number } | null; affected: number };

// Admin: g'olibni e'lon qilib, barcha ballarni 0 ga tushirish. Ikki bosqichli tasdiqlash
// (native confirm() ba'zi brauzerlarda ishlamaydi, shuning uchun sahifaning o'zida).
export default function SeasonResetButton() {
  const [state, setState] = useState<"idle" | "loading" | "confirm" | "running" | "done" | "error">("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState("");

  const loadPreview = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/admin/season-reset");
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error("fail");
      setPreview({ winner: d.winner, affected: d.affected });
      setState("confirm");
    } catch {
      setMessage("Ma'lumotni yuklab bo'lmadi");
      setState("error");
    }
  };

  const run = async () => {
    setState("running");
    try {
      const res = await fetch("/api/admin/season-reset", { method: "POST" });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error("fail");
      setMessage(`G'olib: ${d.winner.name || "Noma'lum"} (${d.winner.xp} ball). ${d.reset} ta foydalanuvchining bali 0 ga tushirildi.`);
      setState("done");
    } catch {
      setMessage("Xatolik yuz berdi");
      setState("error");
    }
  };

  if (state === "confirm" && preview) {
    return (
      <div className="mt-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-4">
        {preview.winner ? (
          <>
            <p className="text-sm font-bold text-rose-800">
              G'olib sifatida e'lon qilinadi:{" "}
              <span className="font-extrabold">
                🥇 {preview.winner.name || "Noma'lum"} — {preview.winner.xp} ball
              </span>
            </p>
            <p className="mt-1 text-sm font-bold text-rose-700">
              Shundan keyin {preview.affected} ta foydalanuvchining bali 0 ga tushiriladi va haftalik statistika
              o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={run}
                className="rounded-xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-rose-400 active:translate-y-0.5 active:border-b-2"
              >
                Ha, e'lon qil va nolla
              </button>
              <button
                onClick={() => setState("idle")}
                className="rounded-xl border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
              >
                Bekor qilish
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-rose-700">Hozir hech kimda ball yo'q — g'olib aniqlab bo'lmaydi.</p>
            <button
              onClick={() => setState("idle")}
              className="mt-2 rounded-xl border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-slate-600"
            >
              Yopish
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        onClick={loadPreview}
        disabled={state === "loading" || state === "running" || state === "done"}
        className="rounded-xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-rose-400 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
      >
        {state === "loading"
          ? "Yuklanmoqda..."
          : state === "running"
            ? "Bajarilmoqda..."
            : "🏆 G'olibni e'lon qilish va ballarni nollash"}
      </button>
      {state === "done" && <span className="text-sm font-bold text-emerald-600">✅ {message}</span>}
      {state === "error" && <span className="text-sm font-bold text-rose-600">{message}</span>}
    </div>
  );
}
