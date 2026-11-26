"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { levelName } from "../yugur/engine";

type Row = {
  id: string;
  name: string | null;
  image: string | null;
  score: number;
  level: number;
  gates: number;
  distance: number;
  plays: number;
};

const MEDAL = ["🥇", "🥈", "🥉"];

// Top-3 uchun rangli kartalar
const PODIUM = [
  "border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-white",
  "border-slate-300 bg-gradient-to-r from-slate-100 to-white",
  "border-orange-300 bg-gradient-to-r from-orange-100 via-amber-50 to-white",
];

// Daraja rangi: oson so'zlar / qiyin so'zlar / gaplar
function levelTone(level: number): string {
  if (level <= 3) return "bg-emerald-100 text-emerald-700";
  if (level <= 6) return "bg-amber-100 text-amber-700";
  return "bg-violet-100 text-violet-700";
}

function Avatar({ row, size }: { row: Row; size: number }) {
  const cls = "shrink-0 rounded-full ring-2 ring-white shadow-sm";
  if (row.image) {
    return <Image src={row.image} alt="" width={size} height={size} className={cls} style={{ width: size, height: size }} />;
  }
  return (
    <span
      className={`${cls} flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 font-extrabold text-slate-600`}
      style={{ width: size, height: size }}
    >
      {(row.name ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}

function RowView({ row, rank, mine }: { row: Row; rank: number; mine: boolean }) {
  const top = rank <= 3;
  const tone = mine
    ? "border-sky-300 bg-gradient-to-r from-sky-50 to-white"
    : top
      ? PODIUM[rank - 1]
      : "border-slate-100 bg-white";
  return (
    <li className={`flex items-center gap-2.5 rounded-2xl border-2 px-2.5 ${top ? "py-2.5" : "py-2"} ${tone}`}>
      <span className={`w-7 shrink-0 text-center font-black ${top ? "text-xl" : "text-sm text-slate-400"}`}>
        {top ? MEDAL[rank - 1] : rank}
      </span>
      <Avatar row={row} size={top ? 40 : 34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-800">
          {row.name ?? "Foydalanuvchi"}
          {mine && <span className="ml-1 rounded-md bg-sky-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">siz</span>}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-semibold text-slate-500">
          <span className={`rounded-md px-1.5 py-0.5 font-extrabold ${levelTone(row.level)}`}>
            {row.level}-daraja
          </span>
          <span>{levelName(row.level)}</span>
          <span className="text-slate-300">·</span>
          <span>🚪 {row.gates}</span>
          <span className="text-slate-300">·</span>
          <span>{row.distance} m</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-black tabular-nums ${top ? "text-xl text-amber-600" : "text-base text-emerald-600"}`}>{row.score}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">ball</p>
      </div>
    </li>
  );
}

// "So'z Poygasi" reytingi: eng yuqori ball, yetib borilgan daraja, eshiklar soni
export default function RunnerLeaderboard({ refreshKey }: { refreshKey: number }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<Row[] | null>(null);
  const [me, setMe] = useState<(Row & { rank: number }) | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // O'yin tugagach natija bazaga yozilishi uchun biroz kutamiz
    const t = setTimeout(
      () => {
        fetch("/api/yugur/leaderboard")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (cancelled) return;
            if (d?.ok) {
              setItems(d.items);
              setMe(d.me);
              setFailed(false);
            } else setFailed(true);
          })
          .catch(() => !cancelled && setFailed(true));
      },
      refreshKey > 0 ? 1200 : 0
    );
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [refreshKey]);

  const myId = session?.user?.id;
  const meInTop = !!me && !!items && items.some((r) => r.id === me.id);

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:mt-0">
      <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 px-4 py-3.5 text-white">
        <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 text-6xl opacity-25">
          🏆
        </span>
        <h2 className="relative text-lg font-black leading-tight drop-shadow-sm">Poyga peshqadamlari</h2>
        <p className="relative mt-0.5 text-xs font-semibold text-white/90">
          Kim qancha ball to&apos;plagan va qaysi darajaga yetgan
        </p>
        {me && (
          <p className="relative mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold ring-1 ring-white/30">
            Sizning o&apos;rningiz: {me.rank}-o&apos;rin · {me.score} ball
          </p>
        )}
      </div>

      <div className="p-3">
        {items === null && !failed && (
          <div className="space-y-1.5" aria-label="Yuklanmoqda">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}
        {failed && items === null && (
          <p className="py-6 text-center text-sm font-semibold text-slate-400">Reytingni yuklab bo&apos;lmadi</p>
        )}
        {items && items.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-4xl">🏁</p>
            <p className="mt-1 text-sm font-extrabold text-slate-600">Poyga hali boshlanmadi</p>
            <p className="text-xs font-semibold text-slate-400">Birinchi bo&apos;ling va reytingni boshlab bering!</p>
          </div>
        )}
        {items && items.length > 0 && (
          <ol className="max-h-[34rem] space-y-1.5 overflow-y-auto">
            {items.map((r, i) => (
              <RowView key={r.id} row={r} rank={i + 1} mine={r.id === myId} />
            ))}
            {me && !meInTop && (
              <>
                <li className="py-0.5 text-center text-xs font-bold text-slate-300">• • •</li>
                <RowView row={me} rank={me.rank} mine />
              </>
            )}
          </ol>
        )}
      </div>
    </section>
  );
}
