"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { TIERS, levelLabel } from "../data/imtihonMeta";
import type { ExamQuestionPublic, ExamResult } from "../data/imtihonMeta";

type ExamState =
  | { state: "loading" }
  | { state: "new"; total: number }
  | { state: "progress"; total: number; question: ExamQuestionPublic }
  | { state: "done"; total: number; result: ExamResult }
  | { state: "error" };

type Row = { id: string; name: string | null; image: string | null; level: number; correct: number; score: number };
type Board = { items: Row[]; me: (Row & { rank: number }) | null; total: number; examTotal: number };

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM = [
  "border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-white",
  "border-slate-300 bg-gradient-to-r from-slate-100 to-white",
  "border-orange-300 bg-gradient-to-r from-orange-100 via-amber-50 to-white",
];

// Daraja rangi (0..6)
const LEVEL_TONE = [
  "bg-slate-100 text-slate-600",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function LevelBadge({ level, big = false }: { level: number; big?: boolean }) {
  return (
    <span className={`inline-block rounded-lg font-extrabold ${LEVEL_TONE[level] ?? LEVEL_TONE[0]} ${big ? "px-4 py-2 text-xl" : "px-2 py-0.5 text-xs"}`}>
      {levelLabel(level)}
    </span>
  );
}

function Avatar({ row, size }: { row: Row; size: number }) {
  const cls = "shrink-0 rounded-full ring-2 ring-white shadow-sm";
  if (row.image) return <Image src={row.image} alt="" width={size} height={size} className={cls} style={{ width: size, height: size }} />;
  return (
    <span className={`${cls} flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 font-extrabold text-slate-600`} style={{ width: size, height: size }}>
      {(row.name ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}

function BoardRow({ row, rank, mine, examTotal }: { row: Row; rank: number; mine: boolean; examTotal: number }) {
  const top = rank <= 3;
  const tone = mine ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-white" : top ? PODIUM[rank - 1] : "border-slate-100 bg-white";
  return (
    <li className={`flex items-center gap-2.5 rounded-2xl border-2 px-2.5 ${top ? "py-2.5" : "py-2"} ${tone}`}>
      <span className={`w-7 shrink-0 text-center font-black ${top ? "text-xl" : "text-sm text-slate-400"}`}>{top ? MEDAL[rank - 1] : rank}</span>
      <Avatar row={row} size={top ? 40 : 34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-800">
          {row.name ?? "Foydalanuvchi"}
          {mine && <span className="ml-1 rounded-md bg-indigo-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">siz</span>}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-semibold text-slate-500">
          <LevelBadge level={row.level} />
          <span>
            {row.correct}/{examTotal} to&apos;g&apos;ri
          </span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-black tabular-nums ${top ? "text-xl text-amber-600" : "text-base text-indigo-600"}`}>{row.score}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">ball</p>
      </div>
    </li>
  );
}

export default function LevelExam() {
  const { data: session } = useSession();
  const [exam, setExam] = useState<ExamState>({ state: "loading" });
  const [board, setBoard] = useState<Board | null>(null);
  const [boardFailed, setBoardFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pledged, setPledged] = useState(false); // halollik va'dasi
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const loadBoard = useCallback(() => {
    fetch("/api/imtihon/leaderboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setBoard({ items: d.items, me: d.me, total: d.total, examTotal: d.examTotal });
          setBoardFailed(false);
        } else setBoardFailed(true);
      })
      .catch(() => setBoardFailed(true));
  }, []);

  useEffect(() => {
    fetch("/api/imtihon")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setExam(d?.ok ? d : { state: "error" }))
      .catch(() => setExam({ state: "error" }));
    loadBoard();
  }, [loadBoard]);

  const post = useCallback(async (body: object) => {
    setBusy(true);
    try {
      const res = await fetch("/api/imtihon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => null);
      if (d?.ok) {
        setExam(d);
        return d as ExamState;
      }
    } catch {
      // tarmoq xatosi
    } finally {
      setBusy(false);
    }
    return null;
  }, []);

  const start = async () => {
    setConfirming(false);
    setPicked(null);
    await post({ action: "start" });
  };

  const submit = useCallback(
    async (q: ExamQuestionPublic, choice: number) => {
      setPicked(null);
      const d = await post({ action: "answer", index: q.index, choice });
      if (d && "state" in d && d.state === "done") loadBoard();
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [post, loadBoard]
  );

  // Klaviatura: 1–4 tanlaydi, Enter tasdiqlaydi
  useEffect(() => {
    if (exam.state !== "progress") return;
    const q = exam.question;
    const onKey = (e: KeyboardEvent) => {
      if (busy) return;
      if (e.key >= "1" && e.key <= String(q.options.length)) setPicked(Number(e.key) - 1);
      else if (e.key === "Enter" && picked !== null) void submit(q, picked);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exam, picked, busy, submit]);

  const myId = session?.user?.id;

  return (
    <div className="mx-auto w-full max-w-2xl" ref={topRef}>
      {/* Sarlavha */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
        <span aria-hidden className="pointer-events-none absolute -right-3 -top-4 text-8xl opacity-20">🎯</span>
        <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">Daraja imtihoni</p>
        <h1 className="relative mt-2 text-2xl font-black leading-tight sm:text-3xl">
          Keling, rus tilida qanday darajada ekanligingizni sinaymiz!
        </h1>
        <p className="relative mt-2 text-sm font-semibold text-white/85">
          Oddiy savollardan boshlab, har keyingisi qiyinroq. Oxirida darajangiz va reytingdagi o&apos;rningiz aniq bo&apos;ladi.
        </p>
      </section>

      {/* Holat */}
      <div className="mt-4">
        {exam.state === "loading" && <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />}
        {exam.state === "error" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <p className="font-extrabold text-slate-700">Imtihonni yuklab bo&apos;lmadi</p>
            <p className="mt-1 text-sm text-slate-500">Tizimga kirganingizni tekshirib, sahifani yangilang.</p>
          </div>
        )}

        {exam.state === "new" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-800">Imtihon qoidalari</h2>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <li>📝 {exam.total} ta savol, 6 ta pog&apos;ona: A1 dan C2 gacha</li>
              <li>📈 Har keyingi savol oldingisidan qiyinroq</li>
              <li>🔍 Variantlar bir-biriga o&apos;xshash, diqqat bilan o&apos;qing</li>
              <li>🚫 Javobni tasdiqlagach o&apos;zgartirib bo&apos;lmaydi, orqaga qaytilmaydi</li>
              <li>🤝 Tarjimon, lug&apos;at, sun&apos;iy intellekt yoki do&apos;stdan yordam olmasdan, o&apos;zingiz yeching</li>
              <li className="rounded-xl bg-amber-50 p-3 font-extrabold text-amber-800 ring-1 ring-amber-200">
                ⚠️ Imtihonni faqat BIR marta topshirasiz. Qayta topshirib bo&apos;lmaydi.
              </li>
            </ul>

            {/* Halollik va'dasi */}
            <div className="mt-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <p className="text-base font-black text-indigo-900">🤝 Halol bo&apos;ling: bu imtihon faqat o&apos;zingiz uchun</p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-indigo-900/80">
                Bu imtihon sizning <b>haqiqiy</b> darajangizni ko&apos;rsatadi, shunda qaysi mavzudan boshlash kerakligini aniq bilib olasiz.
                Yordam bilan yechilgan natija sizni aldaydi: noto&apos;g&apos;ri darajadan boshlab, vaqtingizni yo&apos;qotasiz.
                Reytingdagi o&apos;rin ham faqat o&apos;z bilimingiz bilan olinganda qadrli.
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-indigo-900">
                Bilmagan savolda taxmin qiling, xato qilishdan qo&apos;rqmang. Halol 15 ball soxta 30 balldan yaxshi!
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-indigo-200">
                <input
                  type="checkbox"
                  checked={pledged}
                  onChange={(e) => setPledged(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-600"
                />
                <span className="text-sm font-bold text-slate-800">
                  Vijdonan va&apos;da beraman: hech kimdan va hech narsadan yordam olmay, o&apos;zim yechaman.
                </span>
              </label>
            </div>

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={!pledged}
                className="mt-5 w-full rounded-2xl border-b-4 border-indigo-800 bg-gradient-to-b from-indigo-400 to-indigo-600 py-3.5 text-base font-black uppercase tracking-wide text-white shadow-lg transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🎯 Imtihonni boshlash
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-extrabold text-rose-800">
                  Tayyormisiz? Boshlagach, imtihonni faqat davom ettirish mumkin, qaytadan topshirib bo&apos;lmaydi.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={start}
                    disabled={busy}
                    className="flex-1 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-2.5 text-sm font-extrabold uppercase text-white active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
                  >
                    Ha, boshlayman
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-xl border-b-4 border-slate-300 bg-white py-2.5 text-sm font-extrabold uppercase text-slate-600 active:translate-y-0.5 active:border-b-2"
                  >
                    Hali emas
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {exam.state === "progress" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {/* Pog'onalar */}
            <div className="flex gap-1.5">
              {TIERS.map((t, i) => (
                <div key={t.code} className="flex-1">
                  <div className={`h-2 rounded-full ${i < exam.question.tier ? "bg-indigo-500" : i === exam.question.tier ? "bg-gradient-to-r from-amber-400 to-rose-400" : "bg-slate-200"}`} />
                  <p className={`mt-1 text-center text-[10px] font-extrabold ${i === exam.question.tier ? "text-indigo-700" : "text-slate-400"}`}>{t.code}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                Savol {exam.question.index + 1} / {exam.total}
              </span>
              <span>
                {TIERS[exam.question.tier].code} · {TIERS[exam.question.tier].name}
              </span>
            </div>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">{exam.question.instruction}</p>
            <p className="mt-1 break-words text-2xl font-black leading-snug text-slate-900">{exam.question.text}</p>

            <div className="mt-4 grid gap-2.5">
              {exam.question.options.map((opt, i) => {
                const on = picked === i;
                return (
                  <button
                    key={i}
                    disabled={busy}
                    onClick={() => setPicked(i)}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-base font-bold transition ${
                      on ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 active:bg-slate-50"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${on ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                    <span className="min-w-0 break-words">{opt}</span>
                  </button>
                );
              })}
            </div>

            <button
              disabled={picked === null || busy}
              onClick={() => picked !== null && submit(exam.question, picked)}
              className="mt-5 w-full rounded-2xl border-b-4 border-indigo-800 bg-gradient-to-b from-indigo-400 to-indigo-600 py-3.5 text-base font-black uppercase tracking-wide text-white shadow-lg transition active:translate-y-0.5 active:border-b-2 disabled:opacity-40"
            >
              {busy ? "Saqlanmoqda..." : exam.question.index + 1 === exam.total ? "Yakunlash" : "Javobni tasdiqlash →"}
            </button>
            <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">Klaviatura: 1–4 tanlash, Enter tasdiqlash</p>
            <p className="mt-1 text-center text-[11px] font-bold text-indigo-400">🤝 O&apos;zingiz yeching. Natija faqat siz uchun halol bo&apos;lsin.</p>
          </div>
        )}

        {exam.state === "done" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Sizning darajangiz</p>
            <div className="mt-2">
              <LevelBadge level={exam.result.level} big />
            </div>
            <p className="mt-3 text-4xl font-black tabular-nums text-slate-900">
              {exam.result.correct}
              <span className="text-xl text-slate-400"> / {exam.result.total}</span>
            </p>
            <p className="text-xs font-bold text-slate-400">to&apos;g&apos;ri javob</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-800">⭐ {exam.result.score} ball</span>
              {exam.result.rank !== null && <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-extrabold text-indigo-800">🏅 Reytingda {exam.result.rank}-o&apos;rin</span>}
            </div>

            <div className="mt-5 space-y-2 text-left">
              {exam.result.tiers.map((t) => (
                <div key={t.code}>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{t.code} · {t.name}</span>
                    <span>{t.correct}/{t.total}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${t.correct >= 3 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-amber-300 to-rose-400"}`} style={{ width: `${(t.correct / t.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm font-extrabold text-indigo-900">
              👏 Bu sizning halol natijangiz. Endi darajangizga mos mavzulardan boshlab, bilimingizni oshiring!
            </p>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              Pog&apos;onadan o&apos;tish uchun 5 tadan kamida 3 ta to&apos;g&apos;ri javob kerak. Imtihonni qayta topshirib bo&apos;lmaydi.
            </p>
          </div>
        )}
      </div>

      {/* Reyting */}
      <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-3.5 text-white">
          <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 text-6xl opacity-25">🏆</span>
          <h2 className="relative text-lg font-black leading-tight">Imtihon reytingi</h2>
          <p className="relative mt-0.5 text-xs font-semibold text-white/90">
            Kim qaysi darajani ko&apos;rsatdi va nechanchi o&apos;rinda
            {board ? ` · ${board.total} ta ishtirokchi` : ""}
          </p>
          {board?.me && (
            <p className="relative mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold ring-1 ring-white/30">
              Sizning o&apos;rningiz: {board.me.rank}-o&apos;rin · {levelLabel(board.me.level)}
            </p>
          )}
        </div>
        <div className="p-3">
          {!board && !boardFailed && (
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          )}
          {boardFailed && !board && <p className="py-6 text-center text-sm font-semibold text-slate-400">Reytingni yuklab bo&apos;lmadi</p>}
          {board && board.items.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-4xl">🎯</p>
              <p className="mt-1 text-sm font-extrabold text-slate-600">Hali hech kim imtihon topshirmagan</p>
              <p className="text-xs font-semibold text-slate-400">Birinchi bo&apos;ling!</p>
            </div>
          )}
          {board && board.items.length > 0 && (
            <ol className="max-h-[36rem] space-y-1.5 overflow-y-auto">
              {board.items.map((r, i) => (
                <BoardRow key={r.id} row={r} rank={i + 1} mine={r.id === myId} examTotal={board.examTotal} />
              ))}
              {board.me && !board.items.some((r) => r.id === board.me!.id) && (
                <>
                  <li className="py-0.5 text-center text-xs font-bold text-slate-300">• • •</li>
                  <BoardRow row={board.me} rank={board.me.rank} mine examTotal={board.examTotal} />
                </>
              )}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
