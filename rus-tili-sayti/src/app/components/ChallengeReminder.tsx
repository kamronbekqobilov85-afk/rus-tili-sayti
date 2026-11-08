"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  nextMondayTashkent,
  formatCountdown,
  isChallengeLive,
  CHALLENGE_LAUNCH_LABEL,
} from "../data/challenge";
import PushSubscribeButton from "./PushSubscribeButton";

// Ilovaga har kirilganda (har sahifa yuklanganda) chiqadigan "Haftalik Challenge"
// eslatma oynasi — foydalanuvchini sovrin, qoidalar va boshlanish sanasi haqida xabardor qiladi
export default function ChallengeReminder() {
  const [show, setShow] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(isChallengeLive());
    setCountdown(formatCountdown(nextMondayTashkent().getTime() - Date.now()));
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={() => setShow(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 p-6 text-center text-white shadow-2xl"
      >
        <button
          onClick={() => setShow(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-white/80 transition hover:bg-white/15"
          aria-label="Yopish"
        >
          ✕
        </button>
        <p className="text-4xl">🏆</p>

        {live ? (
          <>
            <p className="mt-3 text-lg font-extrabold">Haftalik Challenge davom etmoqda!</p>
            <p className="mt-1 text-sm text-white/90">
              Endi o'zlashtirishingiz orqali ham ball yig'asiz! Mashq qiling (so'z, test, dars) va{" "}
              <strong>do'st ham taklif qiling</strong> — shu hafta eng ko'p ball yig'gan 1-o'rin Telegram Premium
              yutib oladi. Ham tilni o'rganasiz, ham sovrin yutasiz!
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg font-extrabold">Haftalik Challenge hali boshlanmadi!</p>
            <p className="mt-1 text-sm text-white/90">
              Bu hafta — faqat <strong>do'stlaringizni rus tilini o'rganishga chorlang</strong> va ball yig'ing.
              Eng muhimi: <strong>{CHALLENGE_LAUNCH_LABEL}</strong>dan boshlab o'zlashtirishingiz orqali ham ball
              yig'asiz — ham tilni o'rganasiz, ham Telegram Premium yutasiz!
            </p>
          </>
        )}

        <p className="mt-2 text-xs font-bold text-white/80">⏳ {countdown} qoldi</p>
        <p className="mt-3 text-xs italic text-white/80">
          Sovrin — asosiy maqsad emas, balki rus tilini birgalikda, qiziqarli raqobat orqali o'rganish uchun kichik
          motivatsiya. Asosiy maqsad — tilni chuqur o'zlashtirish! 📖
        </p>
        <p className="mt-2 text-xs font-bold text-white/90">
          📢 Albatta Telegram kanalimizga obuna bo'ling va tushunmagan narsalaringizni izohlarda so'rab boring!
        </p>

        <Link
          href="/profil"
          onClick={() => setShow(false)}
          className="mt-4 block rounded-xl bg-white py-2.5 text-center font-extrabold uppercase tracking-wide text-rose-600 transition hover:bg-white/90"
        >
          Do'stlarni taklif qilish →
        </Link>
        <Link
          href="/challenge"
          onClick={() => setShow(false)}
          className="mt-2 block rounded-xl bg-white/15 py-2.5 text-center font-extrabold uppercase tracking-wide text-white ring-1 ring-white/30 transition hover:bg-white/25"
        >
          Reytingni ko'rish →
        </Link>
        <a
          href="https://t.me/rustili24soat"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block rounded-xl bg-white/15 py-2.5 text-center font-extrabold uppercase tracking-wide text-white ring-1 ring-white/30 transition hover:bg-white/25"
        >
          📢 Telegram kanal →
        </a>
        <PushSubscribeButton className="mt-2 block w-full rounded-xl bg-white/15 py-2.5 text-center text-sm font-extrabold uppercase tracking-wide text-white ring-1 ring-white/30 transition hover:bg-white/25 disabled:opacity-60" />
      </div>
    </div>
  );
}
