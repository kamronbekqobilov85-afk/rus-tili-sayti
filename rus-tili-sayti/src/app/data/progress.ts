// Bilingan so'zlar ID'larini saqlash va o'qish

const KNOWN_WORDS_KEY = "rus-tili-known-words";
const GRAMMAR_PROGRESS_KEY = "rus-tili-grammar-progress";

export function getKnownWordIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KNOWN_WORDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export function addKnownWordId(id: number) {
  if (typeof window === "undefined") return;
  const current = getKnownWordIds();
  if (!current.includes(id)) {
    current.push(id);
    localStorage.setItem(KNOWN_WORDS_KEY, JSON.stringify(current));
  }
}

export function getKnownWordsCount(): number {
  return getKnownWordIds().length;
}

// Grammatika mavzulari progressi

export type GrammarProgress = {
  [slug: string]: {
    correct: number;
    total: number;
  };
};

export function getGrammarProgress(): GrammarProgress {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(GRAMMAR_PROGRESS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as GrammarProgress;
  } catch {
    return {};
  }
}

export function saveGrammarProgress(slug: string, correct: number, total: number) {
  if (typeof window === "undefined") return;
  const current = getGrammarProgress();
  current[slug] = { correct, total };
  localStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(current));
}

export function getTopicProgress(slug: string): { correct: number; total: number } | null {
  const all = getGrammarProgress();
  return all[slug] ?? null;
}