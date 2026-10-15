// Gaplarni oraliqli takrorlash (spaced repetition). Alohida kalit: rus-tili-yol-srs
const KEY = "rus-tili-yol-srs";
const INTERVALS = [1, 3, 7, 14, 30, 60]; // kunlar

type Entry = { box: number; next: string }; // next: "YYYY-MM-DD"
type Data = Record<number, Entry>;

function dateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Data) : {};
  } catch {
    return {};
  }
}

function save(d: Data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // localStorage mavjud emas
  }
}

// results: gap id -> birinchi urinishda to'g'ri javob berildimi
export function recordGapResults(results: Record<number, boolean>) {
  const data = load();
  for (const key of Object.keys(results)) {
    const id = Number(key);
    const ok = results[id];
    const cur = data[id];
    if (!cur) {
      data[id] = ok
        ? { box: 0, next: dateStr(INTERVALS[0]) }
        : { box: 0, next: dateStr(0) };
    } else if (ok) {
      const box = Math.min(cur.box + 1, INTERVALS.length - 1);
      data[id] = { box, next: dateStr(INTERVALS[box]) };
    } else {
      data[id] = { box: 0, next: dateStr(0) };
    }
  }
  save(data);
}

// Bugun takrorlash vaqti kelgan gaplar id lari
export function getDueIds(): number[] {
  const today = dateStr(0);
  const data = load();
  return Object.keys(data)
    .map(Number)
    .filter((id) => data[id].next <= today);
}
