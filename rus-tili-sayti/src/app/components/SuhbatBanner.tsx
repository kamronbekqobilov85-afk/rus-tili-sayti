"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const REQUIRED_XP = 500;

// Bosh sahifadagi «Ko'cha suhbati» bo'limiga jozibali kirish bloki
export default function SuhbatBanner() {
  const [xp, setXp] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/me/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setXp(d?.ok ? d.xp : 0))
      .catch(() => setXp(0));
  }, []);

  const unlocked = xp !== null && xp >= REQUIRED_XP;
  const pct = xp === null ? 0 : Math.min(100, Math.max(Math.round((xp / REQUIRED_XP) * 100), 3));

  return (
    <Link
      href="/suhbat"
      className="relative mt-4 block overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-4 text-white shadow-lg shadow-indigo-900/20 transition active:scale-[0.99] sm:p-6"
    >
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-indigo-400/20 blur-2xl" />

      <div className="relative grid gap-4 sm:grid-cols-[1.3fr_1fr] sm:items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-100 ring-1 ring-white/15">
            {unlocked ? "🔓 Ochiq" : "🔒 500 ball bilan ochiladi"}
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold leading-tight sm:text-3xl">Ko&apos;cha suhbati</h2>
          <p className="mt-1 text-sm text-indigo-100/90 sm:text-base">
            Ruslar bilan erkin gaplashing: taksi, bozor, dorixona va boshqa tayyor suhbatlar.
          </p>

          {/* Mini chat ko'rinishi */}
          <div className="mt-3 space-y-1.5">
            <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-1.5 text-sm font-bold text-slate-800">
              Куда едем? <span className="font-medium text-slate-400">— Qayerga boramiz?</span>
            </div>
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500 px-3 py-1.5 text-sm font-bold">
              На вокзал, пожалуйста.
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15">
          {xp === null ? (
            <div className="h-16 animate-pulse rounded-xl bg-white/10" />
          ) : unlocked ? (
            <>
              <p className="text-sm font-bold text-indigo-100">21 ta vaziyat · 24 ta ibora</p>
              <span className="mt-2 block rounded-2xl border-b-4 border-fuchsia-800 bg-fuchsia-600 py-3 text-center font-extrabold uppercase tracking-wide">
                Boshlash
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-indigo-100">
                <span>Sizda: {xp} ball</span>
                <span>{REQUIRED_XP}</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-fuchsia-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-sm font-extrabold">Yana {REQUIRED_XP - xp} ball qoldi</p>
              <span className="mt-2 block rounded-2xl border-b-4 border-indigo-900 bg-white/15 py-2.5 text-center text-sm font-extrabold uppercase tracking-wide">
                Ko&apos;rish
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
