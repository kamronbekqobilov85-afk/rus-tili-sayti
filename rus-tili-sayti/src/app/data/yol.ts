import { LEVELS, LESSONS_PER_LEVEL } from "./gaplarMeta";

const KEY = "rus-tili-yol";

// Har bir darsdan olinadigan eng ko'p yulduz
export const MAX_STARS = 5;

export type YolProgress = {
  lessons: Record<string, number>; // "daraja-dars": yulduzlar (0..5)
  scale?: number; // yulduz shkalasi (eski saqlangan natijalar 3 talik edi)
};

// Eski 3 talik shkaladagi natijani 5 talikka o'tkazadi: 1→1, 2→3, 3→5
function migrateToFiveStars(p: YolProgress): YolProgress {
  const map: Record<number, number> = { 1: 1, 2: 3, 3: 5 };
  const lessons: Record<string, number> = {};
  for (const [k, v] of Object.entries(p.lessons)) {
    // "exam-<daraja>" kalitlarida yulduz emas, foiz saqlanadi
    lessons[k] = k.startsWith("exam-") ? v : (map[v] ?? v);
  }
  return { lessons, scale: MAX_STARS };
}

function lessonKey(level: number, lesson: number) {
  return `${level}-${lesson}`;
}

export function getProgress(): YolProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lessons: {}, scale: MAX_STARS };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.lessons) {
      const p = parsed as YolProgress;
      if (p.scale === MAX_STARS) return p;
      const migrated = migrateToFiveStars(p);
      saveProgress(migrated);
      return migrated;
    }
    return { lessons: {}, scale: MAX_STARS };
  } catch {
    return { lessons: {}, scale: MAX_STARS };
  }
}

function saveProgress(p: YolProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // localStorage mavjud emas
  }
}

// Aniqlik foizidan yulduzlar soni:
// 70% dan kam = 0, 70-79 = 1, 80-84 = 2, 85-94 = 3, 95-99 = 4, 100 = 5
export function percentToStars(percent: number): number {
  if (percent >= 100) return 5;
  if (percent >= 95) return 4;
  if (percent >= 85) return 3;
  if (percent >= 80) return 2;
  if (percent >= 70) return 1;
  return 0;
}

export function getStars(p: YolProgress, level: number, lesson: number): number {
  return p.lessons[lessonKey(level, lesson)] || 0;
}

// Natijani saqlaydi (eng yaxshi natija saqlanadi), olingan yulduzlarni qaytaradi
export function saveLessonResult(
  level: number,
  lesson: number,
  percent: number
): number {
  const p = getProgress();
  const stars = percentToStars(percent);
  const k = lessonKey(level, lesson);
  if (stars > (p.lessons[k] || 0)) {
    p.lessons[k] = stars;
    saveProgress(p);
  }
  return stars;
}

// Darajadagi barcha 5 dars o'tilganmi (imtihonga kirish sharti)
export function areLessonsDone(p: YolProgress, level: number): boolean {
  for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
    if (getStars(p, level, lesson) < 1) return false;
  }
  return true;
}

export const EXAM_PASS = 85;

// Imtihon: eng yaxshi foiz "exam-<daraja>" kalitida saqlanadi
export function getExamPercent(p: YolProgress, level: number): number {
  return p.lessons[`exam-${level}`] || 0;
}

export function isExamPassed(p: YolProgress, level: number): boolean {
  return getExamPercent(p, level) >= EXAM_PASS;
}

// Imtihonga kirish: darajadagi barcha darslar o'tilgan bo'lishi kerak
export function isExamUnlocked(p: YolProgress, level: number): boolean {
  return areLessonsDone(p, level);
}

// Natijani saqlaydi (eng yaxshisi); o'tgan bo'lsa true
export function saveExamResult(level: number, percent: number): boolean {
  const p = getProgress();
  const k = `exam-${level}`;
  if (percent > (p.lessons[k] || 0)) {
    p.lessons[k] = percent;
    saveProgress(p);
  }
  return percent >= EXAM_PASS;
}

// Daraja to'liq tugagan: 5 dars + imtihon
export function isLevelComplete(p: YolProgress, level: number): boolean {
  return areLessonsDone(p, level) && isExamPassed(p, level);
}

export function isLessonUnlocked(
  p: YolProgress,
  level: number,
  lesson: number
): boolean {
  if (lesson > 1) return getStars(p, level, lesson - 1) >= 1;
  if (level === 1) return true;
  return isLevelComplete(p, level - 1);
}

export function levelStars(p: YolProgress, level: number): number {
  let total = 0;
  for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
    total += getStars(p, level, lesson);
  }
  return total;
}

export function totalStarsAll(p: YolProgress): number {
  return LEVELS.reduce((sum, l) => sum + levelStars(p, l.level), 0);
}
