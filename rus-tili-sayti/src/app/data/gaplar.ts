import { LEVEL_01 } from "./gaplar/level01";
import { LEVEL_02 } from "./gaplar/level02";
import { LEVEL_03 } from "./gaplar/level03";
import { LEVEL_04 } from "./gaplar/level04";
import { LEVEL_05 } from "./gaplar/level05";
import { LEVEL_06 } from "./gaplar/level06";
import { LEVEL_07 } from "./gaplar/level07";
import { LEVEL_08 } from "./gaplar/level08";
import { LEVEL_09 } from "./gaplar/level09";
import { LEVEL_10 } from "./gaplar/level10";
import { LEVEL_11 } from "./gaplar/level11";
import { LEVEL_12 } from "./gaplar/level12";
import { LEVEL_13 } from "./gaplar/level13";
import { LEVEL_14 } from "./gaplar/level14";
import { LEVEL_15 } from "./gaplar/level15";
import { LEVEL_16 } from "./gaplar/level16";
import { LEVEL_17 } from "./gaplar/level17";
import { LEVEL_18 } from "./gaplar/level18";
import { LEVEL_19 } from "./gaplar/level19";
import { LEVEL_20 } from "./gaplar/level20";
import { LEVEL_21 } from "./gaplar/level21";
import { LEVEL_22 } from "./gaplar/level22";
import { LEVEL_23 } from "./gaplar/level23";
import { LEVEL_24 } from "./gaplar/level24";
import { LEVEL_25 } from "./gaplar/level25";

import { LESSON_SIZE, LESSONS_PER_LEVEL, LEVELS } from "./gaplarMeta";
import type { Gap, LevelInfo } from "./gaplarMeta";

export * from "./gaplarMeta";

const RAW: Record<number, [string, string][]> = {
  1: LEVEL_01,
  2: LEVEL_02,
  3: LEVEL_03,
  4: LEVEL_04,
  5: LEVEL_05,
  6: LEVEL_06,
  7: LEVEL_07,
  8: LEVEL_08,
  9: LEVEL_09,
  10: LEVEL_10,
  11: LEVEL_11,
  12: LEVEL_12,
  13: LEVEL_13,
  14: LEVEL_14,
  15: LEVEL_15,
  16: LEVEL_16,
  17: LEVEL_17,
  18: LEVEL_18,
  19: LEVEL_19,
  20: LEVEL_20,
  21: LEVEL_21,
  22: LEVEL_22,
  23: LEVEL_23,
  24: LEVEL_24,
  25: LEVEL_25,
};

export function getLevelInfo(level: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.level === level);
}

export function getLessonGaps(level: number, lesson: number): Gap[] {
  const raw = RAW[level];
  if (!raw || lesson < 1 || lesson > LESSONS_PER_LEVEL) return [];
  const start = (lesson - 1) * LESSON_SIZE;
  return raw.slice(start, start + LESSON_SIZE).map(([ru, uz], i) => ({
    id: level * 1000 + start + i + 1,
    ru,
    uz,
    level,
    lesson,
  }));
}

export function getLevelGaps(level: number): Gap[] {
  const result: Gap[] = [];
  for (let lesson = 1; lesson <= LESSONS_PER_LEVEL; lesson++) {
    result.push(...getLessonGaps(level, lesson));
  }
  return result;
}

export function totalGapCount(): number {
  return Object.values(RAW).reduce((sum, arr) => sum + arr.length, 0);
}

// id dan gapni topadi (id = daraja * 1000 + tartib raqami)
export function getGapById(id: number): Gap | undefined {
  const level = Math.floor(id / 1000);
  const idx = (id % 1000) - 1;
  const raw = RAW[level];
  if (!raw || idx < 0 || idx >= raw.length) return undefined;
  const [ru, uz] = raw[idx];
  return { id, ru, uz, level, lesson: Math.floor(idx / LESSON_SIZE) + 1 };
}
