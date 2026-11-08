// Client-safe sertifikat darajalari — har 1000 ballda yangi, farqli dizaynli sertifikat ochiladi

export type CertificateTier = {
  tier: number; // 1000, 2000, 3000...
  title: string;
  subtitle: string;
  colors: { from: string; via: string; to: string; accent: string; text: string };
};

export const CERTIFICATE_TIERS: CertificateTier[] = [
  {
    tier: 1000,
    title: "Bronza Sertifikat",
    subtitle: "Ishonchli boshlanish",
    colors: { from: "#78350f", via: "#b45309", to: "#f59e0b", accent: "#fde68a", text: "#451a03" },
  },
  {
    tier: 2000,
    title: "Kumush Sertifikat",
    subtitle: "Barqaror rivojlanish",
    colors: { from: "#334155", via: "#64748b", to: "#cbd5e1", accent: "#f1f5f9", text: "#0f172a" },
  },
  {
    tier: 3000,
    title: "Oltin Sertifikat",
    subtitle: "Yuqori mahorat",
    colors: { from: "#78350f", via: "#d97706", to: "#fcd34d", accent: "#fffbeb", text: "#451a03" },
  },
];

export function unlockedTiers(xp: number): CertificateTier[] {
  return CERTIFICATE_TIERS.filter((t) => xp >= t.tier);
}
