"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { nextMondayTashkent, formatCountdown } from "../data/challenge";

type Row = { id: string; name: string | null; image: string | null; xp: number };

const MEDAL = ["🥇", "🥈", "🥉"];

export default function ChallengePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Row[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch(`/api/leaderboard?period=challenge`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setItems(d.items);
          setMyRank(d.myRank);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const update = () => setCountdown(formatCountdown(nextMondayTashkent().getTime() - Date.now()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🏆"
          title="Haftalik Challenge"
          desc="Shu hafta (dushanbadan yakshanbagacha) eng ko'p ball to'plagan 1-o'rin sovrin yutib oladi!"
        >
          <HeroChip>🎁 Sovrin: Telegram Premium</HeroChip>
          <HeroChip>⏳ {countdown} qoldi</HeroChip>
        </PageHero>

        <div className={`${card} mt-4 divide-y divide-slate-100`}>
          {loading && <p className="p-4 text-sm text-slate-400">Yuklanmoqda...</p>}
          {!loading && items.length === 0 && (
            <p className="p-4 text-sm text-slate-400">
              Hali hech kim ball to'plamagan. Birinchi bo'ling!
            </p>
          )}
          {items.map((row, i) => {
            const isMe = session?.user?.id === row.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 p-4 ${isMe ? "bg-emerald-50" : ""} ${
                  i === 0 ? "bg-amber-50" : ""
                }`}
              >
                <span className="w-7 shrink-0 text-center text-lg font-extrabold text-slate-400">
                  {MEDAL[i] ?? i + 1}
                </span>
                {row.image ? (
                  <Image src={row.image} alt="" width={32} height={32} className="shrink-0 rounded-full" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
                    {(row.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-bold text-slate-700">
                  {row.name || "Noma'lum"} {isMe && <span className="text-emerald-600">(siz)</span>}
                </span>
                <span className="shrink-0 font-extrabold text-emerald-600">{row.xp} ball</span>
              </div>
            );
          })}
        </div>

        {myRank && myRank > items.length && (
          <p className="mt-3 text-center text-sm font-bold text-slate-400">
            Sizning o'rningiz: #{myRank}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          G'olib har dushanba kuni e'lon qilinadi va admin tomonidan bog'lanib, sovrin topshiriladi.
        </p>
      </main>
    </div>
  );
}
