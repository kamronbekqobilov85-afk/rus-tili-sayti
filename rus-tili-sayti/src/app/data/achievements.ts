// Gamifikatsiya konstantalari — bu fayl client komponentlarda ham ishlatiladi,
// shuning uchun bazaga (prisma) hech qanday bog'liqligi yo'q.

export const XP_PER_WORD = 5;
export const XP_PER_TEST = 20;
export const XP_REFERRAL_BONUS = 100;

export type Achievement = {
  key: string;
  icon: string;
  title: string;
  desc: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_step", icon: "🌱", title: "Birinchi qadam", desc: "Birinchi ball to'pladingiz" },
  { key: "xp_100", icon: "🥉", title: "Bronza", desc: "100 ball to'pladingiz" },
  { key: "xp_500", icon: "🥈", title: "Kumush", desc: "500 ball to'pladingiz" },
  { key: "xp_1500", icon: "🥇", title: "Oltin", desc: "1 500 ball to'pladingiz" },
  { key: "xp_5000", icon: "💎", title: "Olmos", desc: "5 000 ball to'pladingiz" },
  { key: "xp_15000", icon: "👑", title: "Tilshunos", desc: "15 000 ball to'pladingiz" },
  { key: "referral_1", icon: "🤝", title: "Elchi", desc: "1 do'stingizni taklif qildingiz" },
  { key: "referral_5", icon: "📣", title: "Jamoa yetakchisi", desc: "5 do'stingizni taklif qildingiz" },
];

export const XP_THRESHOLDS: { key: string; xp: number }[] = [
  { key: "first_step", xp: 1 },
  { key: "xp_100", xp: 100 },
  { key: "xp_500", xp: 500 },
  { key: "xp_1500", xp: 1500 },
  { key: "xp_5000", xp: 5000 },
  { key: "xp_15000", xp: 15000 },
];

export const REFERRAL_THRESHOLDS: { key: string; count: number }[] = [
  { key: "referral_1", count: 1 },
  { key: "referral_5", count: 5 },
];
