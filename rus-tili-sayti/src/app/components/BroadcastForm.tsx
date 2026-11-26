"use client";

import { useEffect, useState } from "react";

const PRESETS = [
  {
    label: "🏁 So'z Poygasi",
    title: "🏁 Yangi o'yin: So'z Poygasi!",
    body: "Yuguring, eshikda ruscha tarjimani toping va reytingda hamma bilan bellashing. Boshlaymizmi?",
    url: "/yugur",
  },
  {
    label: "🏃 Kim tez?",
    title: "🏃 Kim eng tez yuguradi?",
    body: "Rus tili o'yini ochildi: to'siqlardan o'ting, so'zlarni o'rganing, peshqadamlar ro'yxatiga kiring!",
    url: "/yugur",
  },
  {
    label: "💡 Kun hikmati",
    title: "💡 Kun hikmati",
    body: "«Не останавливайся, даже если идёшь медленно.» — Sekin yursang ham to'xtama.",
    url: "/",
  },
];

type State = "idle" | "confirm" | "sending" | "done" | "error";

// Admin: hamma obunachilarga push-xabarnoma yuborish. Yuborishdan oldin tasdiqlash so'raladi.
export default function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [state, setState] = useState<State>("idle");
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/broadcast")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.ok && setSubscribers(d.subscribers))
      .catch(() => {});
  }, []);

  const valid = title.trim().length > 0 && body.trim().length > 0;

  const send = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error("fail");
      setMessage(`${d.sent} ta qurilmaga yuborildi${d.removed ? `, ${d.removed} ta eskirgan obuna o'chirildi` : ""}.`);
      setState("done");
    } catch {
      setMessage("Yuborib bo'lmadi. Matn uzunligini tekshiring (sarlavha ≤ 80, matn ≤ 240 belgi).");
      setState("error");
    }
  };

  const input =
    "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-sky-400";

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setTitle(p.title);
              setBody(p.body);
              setUrl(p.url);
              setState("idle");
            }}
            className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <input
          className={input}
          placeholder="Sarlavha"
          maxLength={80}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setState("idle");
          }}
        />
        <textarea
          className={input}
          placeholder="Xabar matni"
          rows={3}
          maxLength={240}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setState("idle");
          }}
        />
        <select className={input} value={url} onChange={(e) => setUrl(e.target.value)}>
          <option value="/">Bosilganda: Bosh sahifa</option>
          <option value="/yugur">Bosilganda: So&apos;z Poygasi</option>
          <option value="/kunlik">Bosilganda: Kunlik mini-mashq</option>
          <option value="/challenge">Bosilganda: Haftalik Challenge</option>
          <option value="/reyting">Bosilganda: Reyting</option>
        </select>
      </div>

      {valid && (
        <div className="mt-3 rounded-xl bg-slate-900 p-3 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Ko&apos;rinishi</p>
          <p className="mt-1 text-sm font-extrabold">{title}</p>
          <p className="text-sm text-white/80">{body}</p>
        </div>
      )}

      {state === "confirm" ? (
        <div className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
          <p className="text-sm font-bold text-amber-900">
            Bu xabar {subscribers === null ? "barcha" : subscribers} ta qurilmaga yuboriladi. Yuborilgan xabarni
            qaytarib bo&apos;lmaydi.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={send}
              className="rounded-xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white active:translate-y-0.5 active:border-b-2"
            >
              Ha, yubor
            </button>
            <button
              onClick={() => setState("idle")}
              className="rounded-xl border-b-4 border-slate-300 bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-slate-600 active:translate-y-0.5 active:border-b-2"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            disabled={!valid || state === "sending"}
            onClick={() => setState("confirm")}
            className="rounded-xl border-b-4 border-sky-700 bg-sky-500 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white active:translate-y-0.5 active:border-b-2 disabled:opacity-50"
          >
            {state === "sending" ? "Yuborilmoqda..." : "🔔 Hammaga yuborish"}
          </button>
          {subscribers !== null && <span className="text-xs font-bold text-slate-400">{subscribers} ta obunachi</span>}
          {state === "done" && <span className="text-sm font-bold text-emerald-600">✅ {message}</span>}
          {state === "error" && <span className="text-sm font-bold text-rose-600">{message}</span>}
        </div>
      )}
    </div>
  );
}
