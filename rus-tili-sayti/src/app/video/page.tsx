"use client";
import { useState } from "react";
import Header from "../components/Header";
import { videos } from "../data/videos";

export default function VideoPage() {
  const [selectedId, setSelectedId] = useState(videos[0].id);
  const selected = videos.find((v) => v.id === selectedId) || videos[0];

  const embedSrc = selected.playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${selected.playlistId}`
    : `https://www.youtube.com/embed/${selected.youtubeId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <div className="flex flex-col items-center p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Ruscha qo'shiqlar
        </h1>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className={`py-2 px-4 rounded-full text-sm font-semibold transition ${
                v.id === selectedId
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-900 border border-blue-200"
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>

        <div className="w-full aspect-video">
          <iframe
            className="w-full h-full rounded-xl"
            src={embedSrc}
            title={selected.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}