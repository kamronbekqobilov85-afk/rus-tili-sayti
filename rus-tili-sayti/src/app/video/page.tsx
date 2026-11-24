"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { videos, categories, type VideoCategory } from "../data/videos";

const TAB_KEY = "rus-tili-video-tab";
const INDEX_KEY = "rus-tili-video-index";

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

  const cat = categories.find((c) => c.key === tab)!;
  const list = videos.filter((v) => v.category === tab);
  const selected = list.find((v) => v.id === selectedId) || list[0];

  const embedSrc = selected.playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${selected.playlistId}`
    : `https://www.youtube.com/embed/${selected.youtubeId}?rel=0`;

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
          <div className="aspect-video w-full bg-slate-900">
            <iframe
              key={selected.id}
              className="h-full w-full"
              src={embedSrc}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
