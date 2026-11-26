"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { levelName } from "../yugur/engine";
import { card } from "./ui";

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

function Avatar({ row }: { row: Row }) {
  if (row.image) {
    return <Image src={row.image} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full" />;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-extrabold text-slate-500">
      {(row.name ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}

function RowView({ row, rank, mine }: { row: Row; rank: number; mine: boolean }) {
  return (
    <li
      className={`flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2 ${
        mine ? "border-sky-300 bg-sky-50" : "border-slate-100 bg-white"
      }`}
    >
      <span className="w-7 shrink-0 text-center text-base font-extrabold text-slate-500">
        {rank <= 3 ? MEDAL[rank - 1] : rank}
      </span>
      <Avatar row={row} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-800">
          {row.name ?? "Foydalanuvchi"}
          {mine && <span className="ml-1 text-xs font-bold text-sky-600">(siz)</span>}
        </p>
        <p className="truncate text-xs font-semibold text-slate-500">
          {row.level}-daraja · {levelName(row.level)} · 🚪 {row.gates} · {row.distance} m
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-extrabold tabular-nums text-emerald-600">{row.score}</p>
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
    <section className={`${card} mt-4 p-3.5`}>
      <h2 className="text-lg font-extrabold text-slate-800">🏆 Poyga peshqadamlari</h2>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">
        Barcha o&apos;yinchilar reytingi: kim qancha ball to&apos;plagan va qaysi darajaga yetgan
      </p>

      {items === null && !failed && <p className="mt-4 text-center text-sm text-slate-400">Yuklanmoqda...</p>}
      {failed && items === null && (
        <p className="mt-4 text-center text-sm text-slate-400">Reytingni yuklab bo&apos;lmadi</p>
      )}
      {items && items.length === 0 && (
        <p className="mt-4 text-center text-sm font-bold text-slate-500">
          Poyga hali boshlanmadi. Birinchi bo&apos;ling! 🏁
        </p>
      )}
      {items && items.length > 0 && (
        <ol className="mt-3 space-y-1.5">
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
    </section>
  );
}
