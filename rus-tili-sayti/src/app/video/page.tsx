"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="flex flex-col items-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Ruscha qo'shiqlar
        </h1>

        <div className="w-full aspect-video mb-8">
          <iframe
            className="w-full h-full rounded-xl shadow-lg"
            src={embedSrc}
            title={selected.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {videos.map((v) => {
            const thumbnail = v.youtubeId
              ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
              : null;
            const isSelected = v.id === selectedId;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`text-left rounded-xl overflow-hidden bg-white shadow-sm ring-1 transition-all ${
                  isSelected
                    ? "ring-2 ring-blue-600 shadow-md"
                    : "ring-gray-100 hover:ring-blue-300 hover:shadow-md"
                }`}
              >
                <div className="relative w-full aspect-video bg-blue-900">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-white text-4xl">
                      🎵
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Ijro etilmoqda
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 p-2 leading-snug line-clamp-2">
                  {v.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}