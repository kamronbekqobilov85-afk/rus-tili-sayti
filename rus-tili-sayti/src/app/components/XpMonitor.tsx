import { prisma } from "../../lib/prisma";
import { card } from "./ui";

// Admin uchun: ballar qanchalik tez yig'ilayotganini ko'rsatadi va shubhali faollikni belgilaydi.
// Ma'lumot XpEvent jadvalidan olinadi (14 kun saqlanadi).

const H = 3_600_000;

type Ev = { amount: number; source: string; t: number };

type Row = {
  id: string;
  name: string;
  xp1h: number;
  xp24h: number;
  events24h: number;
  medianGap: number | null; // soniya
  fastShare: number; // 2 soniyadan tez oraliqlar ulushi (0..1)
  maxIn10min: number;
  sources: [string, number][];
  flags: string[];
};

function analyze(events: Ev[], now: number): Omit<Row, "id" | "name"> {
  const sorted = [...events].sort((a, b) => a.t - b.t);
  const xp24h = sorted.reduce((s, e) => s + e.amount, 0);
  const xp1h = sorted.filter((e) => e.t >= now - H).reduce((s, e) => s + e.amount, 0);

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) gaps.push((sorted[i].t - sorted[i - 1].t) / 1000);
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const medianGap = sortedGaps.length ? sortedGaps[Math.floor(sortedGaps.length / 2)] : null;
  const fastShare = gaps.length ? gaps.filter((g) => g < 2).length / gaps.length : 0;

  // Eng ko'p ball olingan 10 daqiqalik oraliq
  let maxIn10min = 0;
  let sum = 0;
  let lo = 0;
  for (let hi = 0; hi < sorted.length; hi++) {
    sum += sorted[hi].amount;
    while (sorted[hi].t - sorted[lo].t > 10 * 60_000) {
      sum -= sorted[lo].amount;
      lo++;
    }
    if (sum > maxIn10min) maxIn10min = sum;
  }

  const bySource: Record<string, number> = {};
  for (const e of sorted) bySource[e.source] = (bySource[e.source] ?? 0) + e.amount;
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  const flags: string[] = [];
  if (sorted.length >= 60 && (fastShare >= 0.5 || (medianGap !== null && medianGap < 1.2))) {
    flags.push("🚨 Skript ehtimoli: ballar odam qila olmaydigan tezlikda keladi");
  }
  if (maxIn10min > 1500) flags.push("⚠️ 10 daqiqada juda ko'p ball");
  if (xp1h > 3500) flags.push("⚠️ Bir soatda juda ko'p ball");

  return { xp1h, xp24h, events24h: sorted.length, medianGap, fastShare, maxIn10min, sources, flags };
}

const SOURCE_LABEL: Record<string, string> = {
  word: "so'z/javob",
  test: "dars/test",
  section: "mavzu +10",
  pair: "so'z testi",
  chest: "sandiq",
  challenge: "kunlik challenge",
  voice: "ovoz",
  referral: "taklif",
  telegram: "telegram",
  other: "boshqa",
};

export default async function XpMonitor() {
  const now = Date.now();
  const since24 = new Date(now - 24 * H);
  const since1 = new Date(now - H);

  const [top24, top1, totals] = await Promise.all([
    prisma.xpEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since24 } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),
    prisma.xpEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since1 } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),
    prisma.xpEvent.aggregate({
      where: { createdAt: { gte: since24 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const ids = Array.from(new Set([...top24.map((r) => r.userId), ...top1.map((r) => r.userId)]));
  const [users, events] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } }),
    prisma.xpEvent.findMany({
      where: { userId: { in: ids }, createdAt: { gte: since24 } },
      orderBy: { createdAt: "desc" },
      take: 30000,
      select: { userId: true, amount: true, source: true, createdAt: true },
    }),
  ]);

  const nameOf = new Map(users.map((u) => [u.id, u.name || u.email || u.id.slice(0, 6)]));
  const byUser = new Map<string, Ev[]>();
  for (const e of events) {
    const list = byUser.get(e.userId) ?? [];
    list.push({ amount: e.amount, source: e.source, t: e.createdAt.getTime() });
    byUser.set(e.userId, list);
  }

  const rows: Row[] = ids
    .map((id) => ({ id, name: nameOf.get(id) ?? "?", ...analyze(byUser.get(id) ?? [], now) }))
    .sort((a, b) => b.xp24h - a.xp24h);

  const flagged = rows.filter((r) => r.flags.length > 0);

  return (
    <section className={`${card} mt-6 p-5`}>
      <h2 className="text-lg font-extrabold text-slate-800">📈 Ball nazorati (oxirgi 24 soat)</h2>
      <p className="mt-1 text-sm text-slate-500">
        Kim ballarni qanchalik tez yig&apos;ayotganini ko&apos;rsatadi. Odam bir javobga kamida bir necha soniya sarflaydi.
        Soniyalar ichida yuzlab ball kelsa, bu skript ishlayotganini bildiradi.
      </p>

      <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
          Jami: {(totals._sum.amount ?? 0).toLocaleString("ru-RU")} ball
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          Hodisalar: {totals._count._all.toLocaleString("ru-RU")}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${flagged.length ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {flagged.length ? `⚠️ Shubhali: ${flagged.length} ta` : "✅ Shubhali faollik yo'q"}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          Hali ma&apos;lumot yo&apos;q. Yangi tizim yoqilgandan keyin ballar shu yerda ko&apos;rinadi.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl p-3 ring-1 ${r.flags.length ? "bg-red-50 ring-red-200" : "bg-slate-50 ring-slate-200"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold text-slate-800">{r.name}</p>
                <p className="text-sm font-extrabold text-indigo-600">
                  1 soatda +{r.xp1h.toLocaleString("ru-RU")} · 24 soatda +{r.xp24h.toLocaleString("ru-RU")}
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {r.events24h} ta hodisa · o&apos;rtacha oraliq:{" "}
                {r.medianGap === null ? "-" : `${r.medianGap.toFixed(1)} soniya`} · 2 soniyadan tez:{" "}
                {Math.round(r.fastShare * 100)}% · eng ko&apos;p 10 daqiqada: +{r.maxIn10min}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {r.sources.map(([s, v]) => `${SOURCE_LABEL[s] ?? s}: ${v}`).join(" · ")}
              </p>
              {r.flags.map((f) => (
                <p key={f} className="mt-1 text-sm font-extrabold text-red-700">
                  {f}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Batafsil bitta odam uchun: <code>/api/admin/xp-audit?q=ism</code>
      </p>
    </section>
  );
}
