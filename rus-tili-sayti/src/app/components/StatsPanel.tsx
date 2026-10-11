"use client";

import { useEffect, useState } from "react";
import { getDisplayStats, DisplayStats } from "../data/stats";

export default function StatsPanel() {
  const [stats, setStats] = useState<DisplayStats | null>(null);

  useEffect(() => {
    setStats(getDisplayStats());
  }, []);

  if (!stats) return null;

  const items = [
    { icon: "🔥", value: stats.streak, label: "kun ketma-ket", color: "text-orange-500", hex: "#f97316" },
    { icon: "📚", value: stats.todayWords, label: "bugun so'z", color: "text-sky-500", hex: "#0ea5e9" },
    { icon: "✅", value: stats.todayTests, label: "bugun test", color: "text-green-600", hex: "#16a34a" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto mb-8">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 text-center"
        >
          <p className="text-2xl">{it.icon}</p>
          <p className="text-2xl font-extrabold" style={{ color: it.hex }}>{it.value}</p>
          <p className="text-xs font-bold text-gray-400">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
