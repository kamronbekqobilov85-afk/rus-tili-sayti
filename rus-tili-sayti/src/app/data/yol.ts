import { LEVELS, LESSONS_PER_LEVEL } from "./gaplar";

const KEY = "rus-tili-yol";

export type YolProgress = {
  lessons: Record<string, number>; // "daraja-dars": yulduzlar (0..3)
};

function lessonKey(level: number, lesson: number) {
  return `${level}-${lesson}`;
}

export function getProgress(): YolProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lessons: {} };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.lessons) {
      return parsed as YolProgress;
    }
    return { lessons: {} };
  } catch {
    return { lessons: {} };
  }
}

function saveProgress(p: YolProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // localStorage mavjud emas
  }
}

// Aniqlik foizidan yulduzlar soni: 70% dan kam = 0, 70-84 = 1, 85-94 = 2, 95+ = 3
export function percentToStars(percent: number): number {
  if (percent >= 95) return 3;
  if (percent >= 85) return 2;
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
