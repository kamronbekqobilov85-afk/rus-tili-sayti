// Client-safe sertifikat darajalari — har 1000 ballda yangi, farqli dizaynli sertifikat ochiladi

export type CertificateTier = {
  tier: number; // 1000, 2000, 3000...
  title: string;
  subtitle: string;
  reason: string;
  medal: string;
  colors: { border: string; borderLight: string; badge: string; badgeText: string; title: string };
};

export const CERTIFICATE_TIERS: CertificateTier[] = [
  {
    tier: 1000,
    title: "Bronza Sertifikat",
    subtitle: "Ishonchli boshlanish darajasi",
    reason:
      "rus tilini o'rganishda ilk katta bosqichni muvaffaqiyatli bosib o'tgani, muntazam mashq qilish orqali 1 000 balldan ortiq bilim va ko'nikma to'plagani uchun",
    medal: "🥉",
    colors: {
      border: "#b45309",
      borderLight: "#fde68a",
      badge: "#b45309",
      badgeText: "#fffbeb",
      title: "#92400e",
    },
  },
  {
    tier: 2000,
    title: "Kumush Sertifikat",
    subtitle: "Barqaror rivojlanish darajasi",
    reason:
      "rus tilini o'rganishda barqarorlik va izchillik namoyish etib, 2 000 balldan ortiq bilim va amaliy ko'nikma egallagani uchun",
    medal: "🥈",
    colors: {
      border: "#475569",
      borderLight: "#e2e8f0",
      badge: "#475569",
      badgeText: "#f8fafc",
      title: "#334155",
    },
  },
  {
    tier: 3000,
    title: "Oltin Sertifikat",
    subtitle: "Yuqori mahorat darajasi",
    reason:
      "rus tilini chuqur va puxta o'rganib, yuqori natijaga — 3 000 balldan ortiq bilim darajasiga erishgani uchun",
    medal: "🥇",
    colors: {
      border: "#ca8a04",
      borderLight: "#fef3c7",
      badge: "#ca8a04",
      badgeText: "#fffbeb",
      title: "#854d0e",
    },
  },
];

export function unlockedTiers(xp: number): CertificateTier[] {
  return CERTIFICATE_TIERS.filter((t) => xp >= t.tier);
}
