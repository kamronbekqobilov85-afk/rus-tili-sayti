const STORAGE_KEY = "rus-tili-srs";

// Har bir bosqichdan keyin necha kundan so'ng qayta ko'rsatiladi
const LEVEL_INTERVALS = [1, 3, 7, 14, 30, 60];
const NEW_WORDS_PER_SESSION = 20;

type SrsEntry = {
  level: number; // 0-based index in LEVEL_INTERVALS
  nextReview: string; // "YYYY-MM-DD"
};

type SrsData = Record<number, SrsEntry>; // wordId -> entry

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function loadData(): SrsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SrsData;
  } catch {
    return {};
  }
}

function saveData(data: SrsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage mavjud emas
  }
}

// "Bilaman" desa keyingi bosqichga o'tadi, "Bilmadim" desa 1-bosqichga qaytadi
export function recordResult(wordId: number, known: boolean) {
  const data = loadData();
  const current = data[wordId];
  let level = current ? current.level : 0;

  if (known) {
    level = Math.min(level + 1, LEVEL_INTERVALS.length - 1);
  } else {
    level = 0;
  }

  const interval = LEVEL_INTERVALS[level];
  data[wordId] = {
    level,
    nextReview: addDays(interval),
  };
  saveData(data);
}

// Bugun takrorlash kerak bo'lgan so'zlar + yangi so'zlar ro'yxati (id lar)
export function getDueWordIds(allWordIds: number[]): {
  dueIds: number[];
  newIds: number[];
} {
  const data = loadData();
  const today = todayStr();

  const dueIds: number[] = [];
  const neverSeenIds: number[] = [];

  for (const id of allWordIds) {
    const entry = data[id];
    if (!entry) {
      neverSeenIds.push(id);
    } else if (entry.nextReview <= today) {
      dueIds.push(id);
    }
  }

  const newIds = neverSeenIds.slice(0, NEW_WORDS_PER_SESSION);

  return { dueIds, newIds };
}

export function getSrsStats(allWordIds: number[]): {
  dueCount: number;
  newCount: number;
  learnedCount: number;
} {
  const data = loadData();
  const today = todayStr();
  let dueCount = 0;
  let newCount = 0;
  let learnedCount = 0;

  for (const id of allWordIds) {
    const entry = data[id];
    if (!entry) {
      newCount += 1;
    } else {
      learnedCount += 1;
      if (entry.nextReview <= today) {
        dueCount += 1;
      }
    }
  }

  return { dueCount, newCount: Math.min(newCount, NEW_WORDS_PER_SESSION), learnedCount };
}
