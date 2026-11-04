// Client-safe yordamchi funksiyalar — haftalik challenge hisoblagichi uchun

export function nextMondayTashkent(): Date {
  const now = new Date();
  const tashkentNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const day = tashkentNow.getUTCDay();
  const daysLeft = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(
    Date.UTC(tashkentNow.getUTCFullYear(), tashkentNow.getUTCMonth(), tashkentNow.getUTCDate() + daysLeft)
  );
  return new Date(nextMonday.getTime() - 5 * 60 * 60 * 1000);
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 kun 0 soat";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days} kun ${hours} soat ${minutes} daqiqa`;
}

export function tashkentDateKey(): string {
  const tashkentNow = new Date(Date.now() + 5 * 60 * 60 * 1000);
  return tashkentNow.toISOString().slice(0, 10);
}

// Challenge rasman shu kundan (dushanba, Toshkent vaqti) boshlanadi —
// shu sanagacha "tayyorgarlik" rejimi ko'rsatiladi
export const CHALLENGE_LAUNCH_DATE = "2026-11-09";

export function isChallengeLive(): boolean {
  return tashkentDateKey() >= CHALLENGE_LAUNCH_DATE;
}
