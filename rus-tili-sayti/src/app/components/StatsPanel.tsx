"use client";

import { useEffect, useState } from "react";
import { getDisplayStats, DisplayStats } from "../data/stats";

export default function StatsPanel() {
  const [stats, setStats] = useState<DisplayStats | null>(null);

  useEffect(() => {
    setStats(getDisplayStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 text-center">
        <p className="text-2xl">🔥</p>
        <p className="text-xl font-bold text-blue-900">{stats.streak}</p>
        <p className="text-xs text-gray-500">kun ketma-ket</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 text-center">
        <p className="text-2xl">📚</p>
        <p className="text-xl font-bold text-blue-900">{stats.todayWords}</p>
        <p className="text-xs text-gray-500">bugun so'z</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 text-center">
        <p className="text-2xl">✅</p>
        <p className="text-xl font-bold text-blue-900">{stats.todayTests}</p>
        <p className="text-xs text-gray-500">bugun test</p>
      </div>
    </div>
  );
}
