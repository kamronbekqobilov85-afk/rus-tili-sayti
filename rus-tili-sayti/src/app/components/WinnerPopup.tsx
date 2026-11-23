"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Winner = { id: string; name: string | null; image: string | null; xp: number; isMe: boolean; prize?: string };

const SEEN_KEY = "rus-tili-winner-seen";

// G'olib e'loni: har bir foydalanuvchiga (qurilmada) faqat bir marta ko'rsatiladi
export default function WinnerPopup() {
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    fetch("/api/winner")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const w: Winner | null = d?.winner ?? null;
        if (!w) return;
        try {
          if (localStorage.getItem(SEEN_KEY) === w.id) return;
          // Ko'rsatilgan zahoti belgilab qo'yamiz — sahifa yangilansa ham qayta chiqmaydi
          localStorage.setItem(SEEN_KEY, w.id);
        } catch {
          // localStorage mavjud emas — baribir ko'rsatamiz
        }
        setWinner(w);
      })
      .catch(() => {});
  }, []);

  if (!winner) return null;

  const close = () => setWinner(null);
  const name = winner.name || "Noma'lum";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/75 p-4" onClick={close}>
      <style>{`
        @keyframes winner-pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes winner-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 text-center text-white shadow-2xl"
        style={{ animation: "winner-pop 0.5s ease-out" }}
      >
        <div className="pointer-events-none absolute -left-4 top-6 text-5xl opacity-30">🎉</div>
        <div className="pointer-events-none absolute -right-3 top-16 text-5xl opacity-30">🎊</div>

        <p className="text-6xl" style={{ animation: "winner-float 2s ease-in-out infinite" }}>
          🏆
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/85">Challenge g'olibi</p>

        <div className="mt-4 flex justify-center">
          {winner.image ? (
            <Image
              src={winner.image}
              alt=""
              width={84}
              height={84}
              className="rounded-full ring-4 ring-white/80"
            />
          ) : (
            <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-white text-4xl font-extrabold text-orange-500 ring-4 ring-white/80">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <p className="mt-3 text-2xl font-extrabold leading-tight">🥇 {name}</p>
        <p className="mt-1 text-lg font-extrabold text-amber-100">{winner.xp.toLocaleString("ru-RU")} ball</p>

        <p className="mt-4 text-sm text-white/95">
          {winner.isMe
            ? "Tabriklaymiz, siz g'olib bo'ldingiz! 🎉"
            : "G'olibni tabriklaymiz! 🎉"}
        </p>
        {winner.prize ? (
          <p className="mt-2 rounded-2xl bg-white/15 p-3 text-sm font-bold">
            🎁 {winner.prize} sovg&apos;a qilindi! Siz ham ball to&apos;plang va keyingi g&apos;olib bo&apos;ling.
          </p>
        ) : (
          <p className="mt-2 rounded-2xl bg-white/15 p-3 text-sm font-bold">
            🔄 Barcha ballar 0 ga tushirildi — yangi bosqich boshlandi. Endi hammaning imkoniyati teng!
          </p>
        )}

        <button
          onClick={close}
          className="mt-5 w-full rounded-xl border-b-4 border-orange-200 bg-white py-2.5 font-extrabold uppercase tracking-wide text-orange-600 transition active:translate-y-0.5 active:border-b-2"
        >
          Boshladik!
        </button>
      </div>
    </div>
  );
}
