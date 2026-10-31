"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell } from "../components/ui";

type Row = { id: string; name: string | null; image: string | null; xp: number };
type Period = "week" | "all";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function ReytingPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>("week");
  const [items, setItems] = useState<Row[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setItems(d.items);
          setMyRank(d.myRank);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🏆"
          title="Reyting"
          desc="Eng ko'p ball to'plagan foydalanuvchilar. Siz ham yuqoriga chiqishingiz mumkin!"
        />

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setPeriod("week")}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition ${
              period === "week"
                ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Shu hafta
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition ${
              period === "all"
                ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Umumiy
          </button>
        </div>

        <div className={`${card} mt-4 divide-y divide-slate-100`}>
          {loading && <p className="p-4 text-sm text-slate-400">Yuklanmoqda...</p>}
          {!loading && items.length === 0 && (
            <p className="p-4 text-sm text-slate-400">Hali statistika yo'q.</p>
          )}
          {items.map((row, i) => {
            const isMe = session?.user?.id === row.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 p-4 ${isMe ? "bg-emerald-50" : ""}`}
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
      </main>
    </div>
  );
}
