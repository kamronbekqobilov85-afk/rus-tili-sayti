const STORAGE_KEY = "rus-tili-stats";

type StatsData = {
  lastActiveDate: string; // "YYYY-MM-DD"
  streak: number;
  todayWords: number;
  todayTests: number;
  totalWords: number;
  totalTests: number;
};

export type DisplayStats = {
  streak: number;
  todayWords: number;
  todayTests: number;
  totalWords: number;
  totalTests: number;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadRaw(): StatsData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StatsData;
  } catch {
    return null;
  }
}

function saveRaw(data: StatsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable — ignore
  }
}

// O'qish uchun (hech narsani o'zgartirmasdan) - panelda ko'rsatish uchun
export function getDisplayStats(): DisplayStats {
  const raw = loadRaw();
  if (!raw) {
    return { streak: 0, todayWords: 0, todayTests: 0, totalWords: 0, totalTests: 0 };
  }
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (raw.lastActiveDate === today) {
    return {
      streak: raw.streak,
      todayWords: raw.todayWords,
      todayTests: raw.todayTests,
      totalWords: raw.totalWords,
      totalTests: raw.totalTests,
    };
  }
  if (raw.lastActiveDate === yesterday) {
    // Streak hali buzilmagan, lekin bugun hali faoliyat bo'lmagan
    return {
      streak: raw.streak,
      todayWords: 0,
      todayTests: 0,
      totalWords: raw.totalWords,
      totalTests: raw.totalTests,
    };
  }
  // 2 kundan ortiq tanaffus — streak uzilgan
  return {
    streak: 0,
    todayWords: 0,
    todayTests: 0,
    totalWords: raw.totalWords,
    totalTests: raw.totalTests,
  };
}

// Faoliyatni qayd etish (so'z ko'rilganda yoki test tugaganda chaqiriladi)
export function recordActivity(type: "word" | "test") {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const raw = loadRaw();

  let next: StatsData;

  if (!raw) {
    next = {
      lastActiveDate: today,
      streak: 1,
      todayWords: 0,
      todayTests: 0,
      totalWords: 0,
      totalTests: 0,
    };
  } else if (raw.lastActiveDate === today) {
    next = { ...raw };
  } else if (raw.lastActiveDate === yesterday) {
    next = {
      ...raw,
      lastActiveDate: today,
      streak: raw.streak + 1,
      todayWords: 0,
      todayTests: 0,
    };
  } else {
    next = {
      ...raw,
      lastActiveDate: today,
      streak: 1,
      todayWords: 0,
      todayTests: 0,
    };
  }

  if (type === "word") {
    next.todayWords += 1;
    next.totalWords += 1;
  } else {
    next.todayTests += 1;
    next.totalTests += 1;
  }

  saveRaw(next);
}
