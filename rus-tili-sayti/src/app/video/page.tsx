"use client";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { videos, categories, type VideoCategory } from "../data/videos";
import { recordActivity, syncXp } from "../data/stats";

const TAB_KEY = "rus-tili-video-tab";
const INDEX_KEY = "rus-tili-video-index";
const XP_DAY_KEY = "rus-tili-video-xp";
const BROKEN_KEY = "rus-tili-video-broken"; // shu qurilmada ochilmaydigan (cheklangan) videolar

// Ko'rish uchun ball: har 5 daqiqalik haqiqiy ko'rish = +20 ball, kuniga ko'pi bilan 5 marta (100 ball)
const WATCH_SECONDS = 300;
const MAX_AWARDS_PER_DAY = 5;

type YTPlayer = { destroy: () => void; getPlayerState: () => number };
type YTApi = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYT(): Promise<YTApi> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT as YTApi);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getAwardsToday(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(XP_DAY_KEY) || "{}");
    return raw.date === todayKey() ? Number(raw.count) || 0 : 0;
  } catch {
    return 0;
  }
}

function setAwardsToday(count: number) {
  try {
    localStorage.setItem(XP_DAY_KEY, JSON.stringify({ date: todayKey(), count }));
  } catch {
    // ignore
  }
}

export default function VideoPage() {
  const [tab, setTab] = useState<VideoCategory>("kino");
  const [selectedId, setSelectedId] = useState(videos.find((v) => v.category === "kino")!.id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TAB_KEY) as VideoCategory | null;
      const t = saved && categories.some((c) => c.key === saved) ? saved : "kino";
      setTab(t);
      const list = videos.filter((v) => v.category === t);
      // Har kirganda ro'yxatdagi keyingi video (har bo'limda alohida aylanadi)
      const stored = parseInt(localStorage.getItem(`${INDEX_KEY}-${t}`) || "-1", 10);
      const next = (isNaN(stored) ? -1 : stored) + 1;
      const idx = next % list.length;
      setSelectedId(list[idx].id);
      localStorage.setItem(`${INDEX_KEY}-${t}`, String(idx));
    } catch {
      // localStorage mavjud emas
    }
  }, []);

  const switchTab = (t: VideoCategory) => {
    setTab(t);
    setSelectedId(videos.find((v) => v.category === t)!.id);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      // ignore
    }
  };

  const playerBox = useRef<HTMLDivElement>(null);
  const [watched, setWatched] = useState(0);
  const [awards, setAwards] = useState(0);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setAwards(getAwardsToday());
  }, []);

  const [broken, setBroken] = useState<number[]>([]);
  useEffect(() => {
    try {
      setBroken(JSON.parse(localStorage.getItem(BROKEN_KEY) || "[]") as number[]);
    } catch {
      // ignore
    }
  }, []);

  const cat = categories.find((c) => c.key === tab)!;
  const all = videos.filter((v) => v.category === tab);
  // Ochilmaydigan videolar yashiriladi (hammasi buzilgan bo'lsa, to'liq ro'yxat qoladi)
  const playable = all.filter((v) => !broken.includes(v.id));
  const list = playable.length > 0 ? playable : all;
  const selected = list.find((v) => v.id === selectedId) || list[0];

  // Video bu qurilmada/mamlakatda ochilmasa: ro'yxatdan chiqarib, keyingisiga o'tamiz
  const onBroken = useRef<(id: number) => void>(() => {});
  onBroken.current = (id: number) => {
    const next = Array.from(new Set([...broken, id]));
    setBroken(next);
    try {
      localStorage.setItem(BROKEN_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    const rest = all.filter((v) => !next.includes(v.id));
    if (rest.length > 0) setSelectedId(rest[0].id);
  };

  // YouTube pleyeri: haqiqatan ko'rilgan vaqtni sanaymiz va ball beramiz
  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    let sec = 0;
    setWatched(0);

    loadYT().then((YT) => {
      if (cancelled || !playerBox.current) return;
      const holder = document.createElement("div");
      playerBox.current.innerHTML = "";
      playerBox.current.appendChild(holder);
      const vars: Record<string, unknown> = { rel: 0, playsinline: 1 };
      const vid = selected.id;
      const opts: Record<string, unknown> = {
        width: "100%",
        height: "100%",
        playerVars: vars,
        events: {
          onError: () => {
            if (!cancelled) onBroken.current(vid);
          },
        },
      };
      if (selected.playlistId) {
        vars.listType = "playlist";
        vars.list = selected.playlistId;
      } else {
        opts.videoId = selected.youtubeId;
      }
      player = new YT.Player(holder, opts);

      timer = setInterval(() => {
        if (!player || document.visibilityState !== "visible") return;
        let state = -1;
        try {
          state = player.getPlayerState();
        } catch {
          return;
        }
        if (state !== 1) return; // 1 = ijro etilmoqda
        sec += 1;
        if (sec >= WATCH_SECONDS) {
          sec = 0;
          const done = getAwardsToday();
          if (done < MAX_AWARDS_PER_DAY) {
            recordActivity("test", { noXp: true }); // statistika
            syncXp({ type: "watch" }); // +20 ball
            setAwardsToday(done + 1);
            setAwards(done + 1);
            setToast(true);
            setTimeout(() => setToast(false), 4000);
          }
        }
        setWatched(sec);
      }, 1000);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      try {
        player?.destroy();
      } catch {
        // ignore
      }
    };
  }, [selected.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <PageHero icon={cat.icon} title={`Ruscha ${cat.label.toLowerCase()}`} desc={cat.desc}>
          <HeroChip>{list.length} ta video</HeroChip>
        </PageHero>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {categories.map((c) => {
            const active = c.key === tab;
            return (
              <button
                key={c.key}
                onClick={() => switchTab(c.key)}
                className={`rounded-2xl px-2 py-3 text-center transition active:scale-[0.97] ${
                  active
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50"
                }`}
              >
                <span className="block text-2xl">{c.icon}</span>
                <span className="mt-0.5 block text-sm font-extrabold">{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`${card} mt-4 overflow-hidden`}>
          <div className="relative aspect-video w-full bg-slate-900">
            <div ref={playerBox} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
            {toast && (
              <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                <span className="rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-amber-950 shadow-lg">
                  ⭐ +20 ball! Ko&apos;rganingiz uchun
                </span>
              </div>
            )}
          </div>
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700 ring-1 ring-indigo-200">
                ▶ Hozir
              </span>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-800">{selected.title}</p>
                {selected.note && <p className="text-sm text-slate-500">{selected.note}</p>}
              </div>
            </div>
            <div className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800">
              {awards >= MAX_AWARDS_PER_DAY ? (
                <>⭐ Bugungi ko&apos;rish uchun ball tugadi (100/100). Ertaga yana oling!</>
              ) : (
                <>
                  ⭐ Har 5 daqiqa ko&apos;rish = +20 ball · Bugun: {awards * 20}/{MAX_AWARDS_PER_DAY * 20}
                  {watched > 0 && (
                    <> · Hozirgi: {Math.floor(watched / 60)}:{String(watched % 60).padStart(2, "0")} / 5:00</>
                  )}
                </>
              )}
            </div>
            {tab !== "musiqa" && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                💡 Maslahat: avval rus tilida tinglang, tushunmasangiz YouTube&apos;da ⚙ → Subtitrlar (CC) ni yoqing.
              </p>
            )}
          </div>
        </div>

        <h2 className="mt-8 text-lg font-extrabold text-slate-800">Barcha {cat.label.toLowerCase()}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((v) => {
            const thumbnail = v.youtubeId
              ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
              : null;
            const isSelected = v.id === selected.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedId(v.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`overflow-hidden rounded-2xl bg-white text-left shadow-sm transition ${
                  isSelected
                    ? "ring-2 ring-indigo-500"
                    : "ring-1 ring-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="relative aspect-video w-full bg-slate-800">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnail} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-4xl text-white">
                      {cat.icon}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40">
                      <span className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-extrabold text-white">
                        ▶ Ijro etilmoqda
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-700">{v.title}</p>
                  {v.note && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{v.note}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
