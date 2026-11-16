import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";
import { words } from "./data/words";
import { grammarTopics } from "./data/grammar";
import { videos } from "./data/videos";
import { LEVELS, totalGapCount } from "./data/gaplar";

// Taklif havolasi (?ref=...) ulashilganda ko'rinadigan matn — do'st nomidan taklif sifatida
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}): Promise<Metadata> {
  const { ref } = await searchParams;
  if (!ref) return {};
  const title = "Do'stingiz sizni rus tilini birga o'rganishga taklif qilmoqda 🎁";
  const description =
    "Qo'shiling va birga o'rganing: qisqa darslar, reyting, har kungi sovg'alar. O'zbek tilida va bepul — kuniga 10 daqiqa yetarli.";
  return {
    title,
    description,
    openGraph: { type: "website", siteName: "Rus tili", locale: "uz_UZ", title, description },
  };
}

// Sonlar serverda hisoblanadi, shuning uchun katta ma'lumot fayllari bosh sahifaga yuklanmaydi
export default function Home() {
  return (
    <HomeClient
      counts={{
        words: words.length,
        grammar: grammarTopics.length,
        videos: videos.length,
        gaps: totalGapCount(),
        levels: LEVELS.length,
      }}
    />
  );
}
