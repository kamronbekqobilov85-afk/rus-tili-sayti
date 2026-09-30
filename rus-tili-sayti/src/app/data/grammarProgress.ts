const STORAGE_KEY = "rus-tili-grammar-progress";

export type ProgressMap = Record<string, number>; // slug -> eng yaxshi foiz

export function getProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

// Yangi natija eskisidan yaxshiroq bo'lsagina saqlanadi
export function saveTopicScore(slug: string, percentage: number) {
  try {
    const current = getProgress();
    const best = current[slug] || 0;
    if (percentage > best) {
      current[slug] = percentage;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    // localStorage mavjud emas — e'tiborsiz qoldiramiz
  }
}
