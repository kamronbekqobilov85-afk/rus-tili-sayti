// Daraja imtihoni: mijoz va server uchun umumiy (javoblarsiz) ma'lumotlar.
// Savollarning o'zi va to'g'ri javoblar faqat serverda: imtihon.ts

export const PER_TIER = 5; // har bir pog'onada nechta savol
export const PASS_PER_TIER = 3; // pog'onadan o'tish uchun kamida nechta to'g'ri javob

export const TIERS = [
  { code: "A1", name: "Boshlang'ich" },
  { code: "A2", name: "Elementar" },
  { code: "B1", name: "O'rta" },
  { code: "B2", name: "O'rta-yuqori" },
  { code: "C1", name: "Ilg'or" },
  { code: "C2", name: "Mukammal" },
] as const;

export const EXAM_TOTAL = TIERS.length * PER_TIER; // 30

// Natija darajasi: ketma-ket nechta pog'ona muvaffaqiyatli o'tilgani (0..6)
export const LEVELS = [
  { code: "A0", name: "Endi boshlayapsiz" },
  ...TIERS,
] as const;

export function levelLabel(level: number): string {
  const l = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level))];
  return level <= 0 ? l.name : `${l.code} · ${l.name}`;
}

export type ExamQuestionPublic = {
  index: number;
  tier: number; // 0..5
  instruction: string;
  text: string;
  options: string[];
};

export type TierResult = { code: string; name: string; correct: number; total: number };

export type ExamResult = {
  level: number;
  correct: number;
  total: number;
  score: number;
  tiers: TierResult[];
  rank: number | null;
};
