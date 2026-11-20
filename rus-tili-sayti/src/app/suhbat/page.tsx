import Link from "next/link";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell, btnPrimary } from "../components/ui";
import { scenarios, phrases } from "../data/suhbat";
import SuhbatClient from "./SuhbatClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ko'cha suhbati — Rus tili" };

// Sahifa ochilishi uchun kerakli ball
const REQUIRED_XP = 500;

// Boshida nechta suhbat ochiq va qachondan boshlab har kuni bittadan ochila boradi (Toshkent vaqti)
const START_OPEN = 5;
const OPEN_FROM = "2026-11-20";
const DAY_MS = 24 * 60 * 60 * 1000;

function openCount(total: number): number {
  const today = Math.floor((Date.now() + 5 * 60 * 60 * 1000) / DAY_MS);
  const start = Math.floor(Date.parse(`${OPEN_FROM}T00:00:00Z`) / DAY_MS);
  return Math.min(total, START_OPEN + Math.max(0, today - start));
}

export default async function SuhbatPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { xp: true } })
    : null;
  const xp = user?.xp ?? 0;
  const unlocked = xp >= REQUIRED_XP;

  if (unlocked) {
    // Dialoglar faqat ochilgan foydalanuvchiga yuboriladi; yopiq suhbatlarning matni yuborilmaydi
    const open = openCount(scenarios.length);
    const openList = scenarios.slice(0, open);
    const lockedList = scenarios.slice(open).map((sc, i) => ({
      id: sc.id,
      icon: sc.icon,
      title: sc.title,
      daysLeft: i + 1,
    }));
    return (
      <div className={pageShell}>
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <SuhbatClient scenarios={openList} locked={lockedList} phrases={phrases} />
        </main>
      </div>
    );
  }

  const left = REQUIRED_XP - xp;
  const pct = Math.max(Math.round((xp / REQUIRED_XP) * 100), 2);

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <PageHero
          icon="💬"
          title="Ko'cha suhbati"
          desc="Ruslar bilan hayotda eng ko'p kerak bo'ladigan suhbatlar: taksi, bozor, dorixona va boshqalar."
        >
          <HeroChip>🔒 {REQUIRED_XP} ball kerak</HeroChip>
        </PageHero>

        <section className={`${card} mt-4 p-5 text-center`}>
          <p className="text-5xl">🔒</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-800">Bu bo&apos;lim hali yopiq</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ochish uchun kamida <strong>{REQUIRED_XP} ball</strong> to&apos;plang.
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Sizda: {xp} ball</span>
              <span>Maqsad: {REQUIRED_XP}</span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-extrabold text-indigo-700">Yana {left} ball qoldi</p>
          </div>

          <div className="mt-5 grid gap-2 text-left sm:grid-cols-3">
            <Link href="/yol" className="rounded-xl bg-indigo-50 p-3 text-sm font-bold text-indigo-800 active:bg-indigo-100">
              🛤️ Gaplar yo&apos;lida dars o&apos;ting
            </Link>
            <Link href="/kunlik" className="rounded-xl bg-violet-50 p-3 text-sm font-bold text-violet-800 active:bg-violet-100">
              ⚡ Kunlik mini-mashq
            </Link>
            <Link href="/" className="rounded-xl bg-fuchsia-50 p-3 text-sm font-bold text-fuchsia-800 active:bg-fuchsia-100">
              🎁 Sirli sandiqni oching
            </Link>
          </div>

          <Link href="/yol" className={`${btnPrimary} mt-5 block`}>
            Ball to&apos;plashni boshlash
          </Link>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-slate-800">Ichida nimalar bor?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {scenarios.map((s) => (
              <div key={s.id} className={`${card} flex items-center gap-3 p-3 opacity-80`}>
                <span className="text-2xl grayscale">{s.icon}</span>
                <span className="min-w-0 flex-1 text-sm font-bold text-slate-600">{s.title}</span>
                <span className="text-slate-300">🔒</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            + ruslar ko&apos;p ishlatadigan {phrases.length} ta qisqa ibora
          </p>
        </section>
      </main>
    </div>
  );
}
