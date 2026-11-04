"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { nextMondayTashkent, formatCountdown, isChallengeLive, CHALLENGE_LAUNCH_LABEL } from "../data/challenge";

type Row = { id: string; name: string | null; image: string | null; xp: number };

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_BG = [
  "bg-gradient-to-r from-amber-50 to-amber-50/40 ring-1 ring-amber-200",
  "bg-gradient-to-r from-slate-50 to-slate-50/40 ring-1 ring-slate-200",
  "bg-gradient-to-r from-orange-50 to-orange-50/40 ring-1 ring-orange-200",
];

function getRules(live: boolean) {
  return [
    {
      icon: "🔄",
      title: "Har dushanba — qaytadan boshlanadi",
      desc: "Barchaning challenge balli dushanba kuni 0'dan hisoblanadi.",
    },
    live
      ? {
          icon: "📚",
          title: "Mashq qiling, ball to'plang",
          desc: "So'z, test, dars va kundalik mashqlarni bajarib to'plagan har bir ballingiz challenge uchun ham hisoblanadi.",
        }
      : {
          icon: "📚",
          title: `${CHALLENGE_LAUNCH_LABEL}dan — mashq balli ham qo'shiladi`,
          desc: "Hozircha faqat do'st taklif qilish hisoblanadi. Shu sanadan boshlab so'z, test va darslarni o'zlashtirib ham ball yig'asiz.",
        },
    {
      icon: "🤝",
      title: live ? "Do'stlaringizni ham taklif qiling" : "Hozircha do'st taklif qilib ball yig'ing",
      desc: "Profilingizdagi shaxsiy havola orqali do'stingiz ro'yxatdan o'tsa, sizga ball beriladi.",
    },
    {
      icon: "🏁",
      title: "Hafta oxirida g'olib aniqlanadi",
      desc: "Yakshanba kuni eng ko'p ball to'plagan 1-o'rin sovrinni yutib oladi.",
    },
  ];
}

export default function ChallengePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Row[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(isChallengeLive());
  }, []);

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
          desc={
            live
              ? "Mashq qiling, do'stlaringizni taklif qiling, ball to'plang — hafta g'olibi sovrin yutib oladi!"
              : `Bu hafta faqat do'stlaringizni tilni o'rganishga chorlang va ball yig'ing. ${CHALLENGE_LAUNCH_LABEL}dan boshlab o'zlashtirishingiz orqali ham ball yig'asiz — ham tilni o'rganasiz, ham Telegram Premium yutasiz!`
          }
        >
          <HeroChip>{live ? "✅ Hozir faol" : `🚀 ${CHALLENGE_LAUNCH_LABEL}dan boshlanadi`}</HeroChip>
          <HeroChip>⏳ {countdown} qoldi</HeroChip>
        </PageHero>

        {/* Sovrin banneri */}
        <div className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-5 text-center text-white shadow-lg">
          <div className="pointer-events-none absolute -right-6 -top-6 text-8xl opacity-20">🎁</div>
          <p className="text-4xl">🎁</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wide text-white/80">Bu haftaning sovrini</p>
          <p className="mt-1 text-2xl font-extrabold">Telegram Premium</p>
          <p className="mt-1 text-sm text-white/90">
            Sovrin — asosiy maqsad emas, balki rus tilini birgalikda, qiziqarli raqobat orqali o'rganish uchun
            kichik motivatsiya. Asosiy maqsad — tilni chuqur o'zlashtirish! 📖
          </p>
        </div>

        {/* Qoidalar */}
        <div className={`${card} mt-4 p-5`}>
          <p className="font-extrabold text-slate-800">📜 Qanday ishlaydi</p>
          <div className="mt-3 space-y-3">
            {getRules(live).map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg ring-1 ring-emerald-200">
                  {r.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-800">{r.title}</p>
                  <p className="text-sm text-slate-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href="/profil"
              className="flex items-center justify-center gap-1.5 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2"
            >
              🤝 Do'stlarni taklif qilish
            </Link>
            <a
              href="https://t.me/rustili24soat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border-b-4 border-sky-700 bg-sky-500 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-sky-400 active:translate-y-0.5 active:border-b-2"
            >
              📢 Telegram kanal
            </a>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Albatta Telegram kanalimizga obuna bo'ling va tushunmagan narsalaringizni izohlarda so'rab boring!
          </p>
        </div>

        {/* Reyting */}
        <h2 className="mt-6 text-lg font-extrabold text-slate-800">🏅 Shu haftaning reytingi</h2>
        <div className={`${card} mt-3 divide-y divide-slate-100`}>
          {loading && <p className="p-4 text-sm text-slate-400">Yuklanmoqda...</p>}
          {!loading && items.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-3xl">🤷</p>
              <p className="mt-2 text-sm font-bold text-slate-500">Hali hech kim ball to'plamagan.</p>
              <p className="mt-1 text-sm text-slate-400">Do'stlaringizni taklif qilib, birinchi bo'ling!</p>
            </div>
          )}
          {items.map((row, i) => {
            const isMe = session?.user?.id === row.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 p-4 ${isMe ? "ring-2 ring-inset ring-emerald-400" : ""} ${
                  PODIUM_BG[i] ?? ""
                }`}
              >
                <span className="w-8 shrink-0 text-center text-lg font-extrabold text-slate-400">
                  {MEDAL[i] ?? `#${i + 1}`}
                </span>
                {row.image ? (
                  <Image src={row.image} alt="" width={36} height={36} className="shrink-0 rounded-full" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">
                    {(row.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-bold text-slate-700">
                  {row.name || "Noma'lum"} {isMe && <span className="text-emerald-600">(siz)</span>}
                </span>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                  {row.xp} ball
                </span>
              </div>
            );
          })}
        </div>

        {myRank && myRank > items.length && (
          <p className="mt-3 text-center text-sm font-bold text-slate-400">
            Sizning o'rningiz: <span className="text-emerald-600">#{myRank}</span>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          G'olib har dushanba kuni e'lon qilinadi va admin tomonidan bog'lanib, sovrin topshiriladi.
        </p>
      </main>
    </div>
  );
}
