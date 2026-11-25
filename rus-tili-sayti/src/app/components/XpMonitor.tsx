import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { card } from "./ui";

// Admin uchun: ballar qanchalik tez yig'ilayotganini aniq hisoblab, sodda tilda ko'rsatadi.
// Ma'lumot XpEvent jadvalidan olinadi (14 kun saqlanadi).

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;
const TZ = 5 * H; // Toshkent

export type Range = "1h" | "24h" | "7d";

const RANGES: { key: Range; label: string; ms: number; buckets: number; bucketMs: number; title: string }[] = [
  { key: "1h", label: "1 soat", ms: H, buckets: 12, bucketMs: 5 * MIN, title: "oxirgi 1 soat" },
  { key: "24h", label: "24 soat", ms: D, buckets: 24, bucketMs: H, title: "oxirgi 24 soat" },
  { key: "7d", label: "7 kun", ms: 7 * D, buckets: 7, bucketMs: D, title: "oxirgi 7 kun" },
];

type Ev = { amount: number; source: string; t: number };
type Level = "ok" | "warn" | "danger";

type Row = {
  id: string;
  name: string;
  xp: number;
  events: number;
  activeMinutes: number;
  perMinute: number; // faol daqiqada o'rtacha ball
  answersPerMinute: number; // faol daqiqada o'rtacha javob (hodisa)
  maxPerMinute: number; // bitta daqiqadagi eng ko'p hodisa
  max10: number; // eng ko'p ball olingan 10 daqiqa
  fastShare: number; // 2 soniyadan tez oraliqlar ulushi
  sources: [string, number][];
  bars: number[];
  level: Level;
  reasons: string[];
};

function analyze(events: Ev[], now: number, r: (typeof RANGES)[number]): Omit<Row, "id" | "name"> {
  const sorted = [...events].sort((a, b) => a.t - b.t);
  const xp = sorted.reduce((s, e) => s + e.amount, 0);

  // Faol daqiqalar: kamida bitta ball olingan daqiqalar soni
  const minuteCounts = new Map<number, number>();
  for (const e of sorted) {
    const m = Math.floor(e.t / MIN);
    minuteCounts.set(m, (minuteCounts.get(m) ?? 0) + 1);
  }
  const activeMinutes = minuteCounts.size;
  const maxPerMinute = Math.max(0, ...minuteCounts.values());

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) gaps.push((sorted[i].t - sorted[i - 1].t) / 1000);
  const fastShare = gaps.length ? gaps.filter((g) => g < 2).length / gaps.length : 0;

  // Eng ko'p ball olingan 10 daqiqalik oraliq (siljuvchi oyna)
  let max10 = 0;
  let sum = 0;
  let lo = 0;
  for (let hi = 0; hi < sorted.length; hi++) {
    sum += sorted[hi].amount;
    while (sorted[hi].t - sorted[lo].t > 10 * MIN) {
      sum -= sorted[lo].amount;
      lo++;
    }
    if (sum > max10) max10 = sum;
  }

  const bySource: Record<string, number> = {};
  for (const e of sorted) bySource[e.source] = (bySource[e.source] ?? 0) + e.amount;
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  // Grafik uchun ustunlar
  const start = now - r.ms;
  const bars = Array.from({ length: r.buckets }, () => 0);
  for (const e of sorted) {
    const idx = Math.min(r.buckets - 1, Math.max(0, Math.floor((e.t - start) / r.bucketMs)));
    bars[idx] += e.amount;
  }

  const perMinute = activeMinutes ? xp / activeMinutes : 0;
  const answersPerMinute = activeMinutes ? sorted.length / activeMinutes : 0;

  // --- Xulosa: oddiy qoidalar ---
  const reasons: string[] = [];
  let level: Level = "ok";

  if (sorted.length >= 60 && fastShare >= 0.5) {
    level = "danger";
    reasons.push(
      `Ballarning ${Math.round(fastShare * 100)}% i oldingisidan 2 soniyadan tez kelgan. Odam bunday tez javob bera olmaydi.`
    );
  }
  if (maxPerMinute >= 40) {
    level = "danger";
    reasons.push(`Bitta daqiqada ${maxPerMinute} ta javob qayd etilgan (odam ko'pi bilan ~15 ta beradi).`);
  }
  if (level !== "danger") {
    if (maxPerMinute >= 25) {
      level = "warn";
      reasons.push(`Bitta daqiqada ${maxPerMinute} ta javob: juda tez, tekshirib ko'ring.`);
    }
    if (max10 > 1500) {
      level = "warn";
      reasons.push(`10 daqiqada +${max10} ball olingan (odatda 600 dan oshmaydi).`);
    }
    if (activeMinutes >= 10 && perMinute > 80) {
      level = "warn";
      reasons.push(`Faol vaqtda daqiqasiga o'rtacha ${Math.round(perMinute)} ball: odatdagidan ancha yuqori.`);
    }
  }

  return { xp, events: sorted.length, activeMinutes, perMinute, answersPerMinute, maxPerMinute, max10, fastShare, sources, bars, level, reasons };
}

const SOURCE_LABEL: Record<string, string> = {
  word: "So'z/javob",
  test: "Dars/test tugashi",
  section: "Mavzu bonusi",
  pair: "So'z testi",
  chest: "Sirli sandiq",
  challenge: "Kunlik challenge",
  voice: "Ovoz yozuvi",
  referral: "Do'st taklifi",
  telegram: "Telegram bonusi",
  other: "Boshqa",
};

function fmtTashkent(ms: number, withDate = false): string {
  const d = new Date(ms + TZ);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  if (!withDate) return `${hh}:${mm}`;
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")} ${hh}:${mm}`;
}

const LEVEL_UI: Record<Level, { badge: string; box: string; text: string }> = {
  ok: { badge: "✅ Oddiy", box: "bg-white ring-slate-200", text: "bg-green-100 text-green-700" },
  warn: { badge: "⚠️ Tez, tekshiring", box: "bg-amber-50 ring-amber-300", text: "bg-amber-200 text-amber-900" },
  danger: { badge: "🚨 Skript ehtimoli", box: "bg-red-50 ring-red-300", text: "bg-red-200 text-red-800" },
};

export default async function XpMonitor({ range }: { range: Range }) {
  const r = RANGES.find((x) => x.key === range) ?? RANGES[1];
  const now = Date.now();
  const since = new Date(now - r.ms);

  const [topGroups, totals, activeUsers, firstEvent] = await Promise.all([
    prisma.xpEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 12,
    }),
    prisma.xpEvent.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.xpEvent.groupBy({ by: ["userId"], where: { createdAt: { gte: since } } }),
    prisma.xpEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);

  const ids = topGroups.map((g) => g.userId);
  const [users, events] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } }),
    prisma.xpEvent.findMany({
      where: { userId: { in: ids }, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 40000,
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

  const rows: Row[] = ids.map((id) => ({
    id,
    name: nameOf.get(id) ?? "Noma'lum",
    ...analyze(byUser.get(id) ?? [], now, r),
  }));
  const dangerCount = rows.filter((x) => x.level === "danger").length;
  const warnCount = rows.filter((x) => x.level === "warn").length;
  const startedAt = firstEvent?.createdAt.getTime() ?? null;
  const coversRange = startedAt !== null && startedAt <= now - r.ms;

  return (
    <section className={`${card} mt-6 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-800">📈 Ball nazorati</h2>
        <div className="flex gap-1.5">
          {RANGES.map((x) => (
            <Link
              key={x.key}
              href={`/admin?r=${x.key}`}
              scroll={false}
              className={`rounded-full px-3.5 py-1.5 text-sm font-extrabold transition ${
                x.key === r.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {x.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Kim <strong>{r.title}</strong> ichida qancha ball olgani va <strong>qanchalik tez</strong> olgani. Odam bir
        javobga 3–10 soniya sarflaydi, shuning uchun soniyalar ichida yuzlab ball kelsa, bu skript belgisi.
      </p>

      {/* Umumiy raqamlar */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={(totals._sum.amount ?? 0).toLocaleString("ru-RU")} label="Berilgan ball" tone="text-indigo-600" />
        <Stat value={activeUsers.length.toLocaleString("ru-RU")} label="Faol odamlar" tone="text-slate-800" />
        <Stat value={totals._count._all.toLocaleString("ru-RU")} label="Ball hodisalari" tone="text-slate-800" />
        <Stat
          value={dangerCount + warnCount === 0 ? "0" : `${dangerCount} + ${warnCount}`}
          label={dangerCount + warnCount === 0 ? "Shubhali yo'q ✅" : "Skript + tez (shubhali)"}
          tone={dangerCount ? "text-red-600" : warnCount ? "text-amber-600" : "text-green-600"}
        />
      </div>

      {startedAt !== null && !coversRange && (
        <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          ℹ️ Kuzatuv <strong>{fmtTashkent(startedAt, true)}</strong> (Toshkent vaqti) dan boshlangan, shuning uchun
          tanlangan davrning boshidagi ballar ko&apos;rinmaydi.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
          Bu davrda hech kim ball olmagan.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((u, rank) => {
            const ui = LEVEL_UI[u.level];
            const maxBar = Math.max(1, ...u.bars);
            return (
              <div key={u.id} className={`rounded-2xl p-4 ring-1 ${ui.box}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold text-slate-800">
                    <span className="mr-2 text-slate-400">{rank + 1}.</span>
                    {u.name}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${ui.text}`}>{ui.badge}</span>
                </div>

                <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                  +{u.xp.toLocaleString("ru-RU")} <span className="text-sm font-bold text-slate-400">ball</span>
                </p>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <Metric label="Faol vaqt" value={`${u.activeMinutes} daqiqa`} hint="ball olingan daqiqalar" />
                  <Metric
                    label="Tezlik"
                    value={`${Math.round(u.perMinute)} ball/daq.`}
                    hint="faol vaqtda o'rtacha (odatda 5–40)"
                  />
                  <Metric
                    label="Javoblar"
                    value={`${u.answersPerMinute.toFixed(1)} /daq.`}
                    hint={`eng ko'pi: ${u.maxPerMinute} ta/daq. (odam ≤ 15)`}
                  />
                  <Metric label="Eng tez 10 daq." value={`+${u.max10}`} hint="odatda 600 gacha" />
                </div>

                {/* Faollik grafigi */}
                <div className="mt-3">
                  <div className="flex h-12 items-end gap-0.5">
                    {u.bars.map((v, i) => (
                      <div
                        key={i}
                        title={`${v} ball`}
                        className={`flex-1 rounded-t ${v > 0 ? "bg-indigo-400" : "bg-slate-200"}`}
                        style={{ height: `${Math.max(v > 0 ? 8 : 3, (v / maxBar) * 100)}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-0.5 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>{r.key === "7d" ? "7 kun oldin" : fmtTashkent(now - r.ms)}</span>
                    <span>hozir</span>
                  </div>
                </div>

                {/* Ball manbalari */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u.sources.map(([s, v]) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                      {SOURCE_LABEL[s] ?? s}: {v} ({Math.round((v / Math.max(1, u.xp)) * 100)}%)
                    </span>
                  ))}
                </div>

                {u.reasons.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-xl bg-white/70 p-3 text-sm font-semibold text-slate-700">
                    {u.reasons.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-extrabold text-slate-700">Qanday o&apos;qiladi?</summary>
        <ul className="mt-2 space-y-1">
          <li>
            <strong>Faol vaqt</strong>: ball olingan daqiqalar soni (tanaffuslar hisoblanmaydi).
          </li>
          <li>
            <strong>Tezlik</strong>: ballni faol daqiqalarga bo&apos;lgan o&apos;rtacha. Oddiy o&apos;quvchi 5–40 ball/daqiqa oladi.
          </li>
          <li>
            <strong>Javoblar</strong>: daqiqasiga nechta javob. Odam bir javobga 3–10 soniya sarflaydi, ya&apos;ni ko&apos;pi bilan 15 ta.
          </li>
          <li>
            🚨 <strong>Skript ehtimoli</strong>: javoblarning yarmidan ko&apos;pi 2 soniyadan tez kelgan yoki bir daqiqada 40 dan ortiq javob.
          </li>
          <li>
            ⚠️ <strong>Tez, tekshiring</strong>: bir daqiqada 25+ javob, 10 daqiqada 1500+ ball yoki daqiqasiga 80+ ball.
          </li>
          <li>Belgi faqat ogohlantirish. Qaror sizniki: ballarni avtomatik kamaytirmaydi.</li>
        </ul>
      </details>

      <p className="mt-3 text-xs text-slate-400">
        Bitta odam uchun kunlar kesimida: <code>/api/admin/xp-audit?q=ism</code>
      </p>
    </section>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-200">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-extrabold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}
