import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { auth } from "../../auth";
import { prisma, daysAgo } from "../../lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

const DEVICE_LABEL: Record<string, string> = {
  mobile: "📱 Telefon",
  tablet: "📱 Planshet",
  desktop: "💻 Kompyuter",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">🔒</p>
          <p className="mt-3 text-lg font-bold text-slate-600">
            Bu sahifani ko'rish uchun Google hisobingiz bilan kiring.
          </p>
        </main>
      </div>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center">
          <p className="text-5xl">⛔</p>
          <p className="mt-3 text-lg font-bold text-slate-600">
            Bu sahifa faqat admin uchun. Sizda ruxsat yo'q.
          </p>
        </main>
      </div>
    );
  }

  const [totalUsers, totalVisits, byDeviceRaw, recentUsers, last7dVisits] = await Promise.all([
    prisma.user.count(),
    prisma.visit.count(),
    prisma.visit.groupBy({ by: ["device"], _count: { device: true } }),
    prisma.user.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 20,
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, lastSeenAt: true },
    }),
    prisma.visit.count({
      where: { createdAt: { gte: daysAgo(7) } },
    }),
  ]);

  const byDevice = byDeviceRaw
    .map((d) => ({ device: d.device, count: d._count.device }))
    .sort((a, b) => b.count - a.count);

  // Har bir foydalanuvchining oxirgi qaysi qurilmadan kirganini topamiz
  const lastVisitPerUser = await prisma.visit.findMany({
    where: { userId: { in: recentUsers.map((u) => u.id) } },
    orderBy: { createdAt: "desc" },
    distinct: ["userId"],
    select: { userId: true, device: true, browser: true, os: true },
  });
  const deviceByUser = new Map(lastVisitPerUser.map((v) => [v.userId, v]));

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <PageHero icon="🛡️" title="Admin panel" desc="Saytdan faqat siz ko'ra oladigan statistika.">
          <HeroChip>{session.user.email}</HeroChip>
        </PageHero>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon="👤" value={totalUsers} label="Ro'yxatdan o'tganlar" color="text-emerald-600" />
          <StatCard icon="👁️" value={totalVisits} label="Jami sahifa ko'rishlar" color="text-sky-600" />
          <StatCard icon="📅" value={last7dVisits} label="Oxirgi 7 kunda" color="text-orange-500" />
          <StatCard
            icon="📱"
            value={byDevice.find((d) => d.device === "mobile")?.count ?? 0}
            label="Telefondan kirish"
            color="text-violet-600"
          />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-slate-800">Qurilmalar bo'yicha</h2>
          <div className={`${card} mt-3 divide-y divide-slate-100`}>
            {byDevice.length === 0 && (
              <p className="p-4 text-sm text-slate-400">Hali statistika yo'q.</p>
            )}
            {byDevice.map((d) => {
              const pct = totalVisits > 0 ? Math.round((d.count / totalVisits) * 100) : 0;
              return (
                <div key={d.device} className="flex items-center gap-4 p-4">
                  <span className="w-32 shrink-0 font-bold text-slate-700">
                    {DEVICE_LABEL[d.device] || d.device}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-extrabold text-slate-600">
                    {d.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 mb-10">
          <h2 className="text-lg font-extrabold text-slate-800">So'nggi faol foydalanuvchilar</h2>
          <div className={`${card} mt-3 divide-y divide-slate-100`}>
            {recentUsers.length === 0 && (
              <p className="p-4 text-sm text-slate-400">Hali hech kim Google bilan kirmagan.</p>
            )}
            {recentUsers.map((u) => {
              const lastVisit = deviceByUser.get(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  {u.image ? (
                    <Image src={u.image} alt="" width={36} height={36} className="shrink-0 rounded-full" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
                      {(u.name || u.email || "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-bold text-slate-800">
                      {u.name || "Noma'lum"}
                      {u.role === "admin" && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs font-semibold text-slate-500">
                    <p>{lastVisit ? DEVICE_LABEL[lastVisit.device] || lastVisit.device : "—"}</p>
                    <p className="text-slate-400">{lastVisit?.browser || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value.toLocaleString("ru-RU")}</p>
    </div>
  );
}
