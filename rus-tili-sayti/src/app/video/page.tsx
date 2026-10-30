"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import PageHero, { HeroChip } from "../components/PageHero";
import { card, pageShell } from "../components/ui";
import { videos } from "../data/videos";

const STORAGE_KEY = "rus-tili-video-index";

export default function VideoPage() {
  const [selectedId, setSelectedId] = useState(videos[0].id);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastIndex = stored ? parseInt(stored, 10) : -1;
    const nextIndex = (lastIndex + 1) % videos.length;
    setSelectedId(videos[nextIndex].id);
    localStorage.setItem(STORAGE_KEY, String(nextIndex));
  }, []);

  const selected = videos.find((v) => v.id === selectedId) || videos[0];

  const embedSrc = selected.playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${selected.playlistId}`
    : `https://www.youtube.com/embed/${selected.youtubeId}`;

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🎬"
          title="Ruscha qo'shiqlar"
          desc="Subtitrli qo'shiqlarni tinglang va matnga qarab birga kuylang — talaffuz va eshitish tez rivojlanadi."
        >
          <HeroChip>{videos.length} ta video</HeroChip>
        </PageHero>

        <div className={`${card} mt-4 overflow-hidden`}>
          <div className="aspect-video w-full bg-slate-900">
            <iframe
              className="h-full w-full"
              src={embedSrc}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              ▶ Hozir
            </span>
            <p className="font-extrabold text-slate-800">{selected.title}</p>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-extrabold text-slate-800">Barcha qo'shiqlar</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {videos.map((v) => {
            const thumbnail = v.youtubeId
              ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
              : null;
            const isSelected = v.id === selectedId;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedId(v.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`overflow-hidden rounded-2xl bg-white text-left shadow-sm transition ${
                  isSelected
                    ? "ring-2 ring-emerald-500"
                    : "ring-1 ring-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="relative aspect-video w-full bg-slate-800">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnail} alt={v.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-700 text-4xl text-white">
                      🎵
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/30">
                      <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-extrabold text-white">
                        ▶ Ijro etilmoqda
                      </span>
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 p-2.5 text-sm font-semibold leading-snug text-slate-700">{v.title}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
