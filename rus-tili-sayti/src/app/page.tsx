import HomeClient from "./components/HomeClient";
import { words } from "./data/words";
import { grammarTopics } from "./data/grammar";
import { videos } from "./data/videos";
import { LEVELS, totalGapCount } from "./data/gaplar";

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
