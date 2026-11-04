"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nextMondayTashkent, formatCountdown, tashkentDateKey, isChallengeLive } from "../data/challenge";

const STORAGE_PREFIX = "challengeReminderShown-";

// Dushanbadan yakshanbagacha har kuni bir marta chiqadigan "Haftalik Challenge"
// eslatma oynasi — foydalanuvchini sovrin va qoidalar haqida xabardor qiladi
export default function ChallengeReminder() {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [live, setLive] = useState(false);

  useEffect(() => {
    const key = STORAGE_PREFIX + tashkentDateKey();
    try {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setShow(true);
        setLive(isChallengeLive());
        setCountdown(formatCountdown(nextMondayTashkent().getTime() - Date.now()));
      }
    } catch {
      // localStorage mavjud emas — eslatma shunchaki ko'rsatilmaydi
    }
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
              Har dushanba kuni hammaning balli 0'ga tushadi. Faqat <strong>taklif qilingan do'stlaringiz</strong>{" "}
              orqali olgan ball hisoblanadi — shu hafta eng ko'p ball to'plagan 1-o'rin Telegram Premium yutib oladi!
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg font-extrabold">Haftalik Challenge dushanbadan boshlanadi!</p>
            <p className="mt-1 text-sm text-white/90">
              Faqat <strong>taklif qilingan do'stlaringiz</strong> orqali olgan ball hisoblanadi. Challenge
              boshlanguncha do'stlaringizni taklif qilib, ball yig'ib qoling!
            </p>
          </>
        )}

        <p className="mt-2 text-xs font-bold text-white/80">⏳ {countdown} qoldi</p>
        <p className="mt-3 text-xs italic text-white/80">
          Sovrin arzimas bo'lsa ham — g'alaba qozonasiz! Eng muhimi, rus tilini biz bilan birga o'rganishda davom
          eting 💪
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
      </div>
    </div>
  );
}
