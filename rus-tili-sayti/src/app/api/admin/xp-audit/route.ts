import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

// Admin uchun tekshiruv: foydalanuvchi ballari qanday yig'ilganini ko'rsatadi.
// Ishlatish (admin sifatida kirgan brauzerda): /api/admin/xp-audit?q=Fayoza
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ ok: false }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return Response.json({ ok: false, error: "q (ism) kerak, kamida 2 harf" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    take: 3,
    select: { id: true, name: true, email: true, xp: true, createdAt: true, referredBy: true },
  });

  const report = [];
  for (const u of users) {
    const [stats, chests, challenges, voice, referred, visits] = await Promise.all([
      prisma.dailyStat.findMany({
        where: { userId: u.id },
        orderBy: { date: "desc" },
        take: 30,
        select: { date: true, xp: true, referralXp: true },
      }),
      prisma.dailyChest.findMany({ where: { userId: u.id }, select: { date: true, reward: true } }),
      prisma.dailyChallenge.count({ where: { userId: u.id } }),
      prisma.voiceRecording.findMany({ where: { userId: u.id }, select: { createdAt: true } }),
      prisma.user.findMany({
        where: { referredBy: u.id },
        orderBy: { createdAt: "asc" },
        select: { name: true, createdAt: true, xp: true },
      }),
      prisma.visit.findMany({
        where: { userId: u.id },
        orderBy: { createdAt: "desc" },
        take: 400,
        select: { createdAt: true, device: true, browser: true, os: true },
      }),
    ]);

    const chestByDate = new Map(chests.map((c) => [c.date, c.reward]));
    const voiceByDay: Record<string, number> = {};
    for (const v of voice) {
      const d = v.createdAt.toISOString().slice(0, 10);
      voiceByDay[d] = (voiceByDay[d] ?? 0) + 1;
    }
    const visitsByDay: Record<string, number> = {};
    const devices: Record<string, number> = {};
    for (const v of visits) {
      const d = v.createdAt.toISOString().slice(0, 10);
      visitsByDay[d] = (visitsByDay[d] ?? 0) + 1;
      const label = `${v.device}/${v.os ?? "?"}/${v.browser ?? "?"}`;
      devices[label] = (devices[label] ?? 0) + 1;
    }

    const days = stats.map((s) => ({
      date: s.date,
      xp: s.xp,
      referralXp: s.referralXp,
      chest: chestByDate.get(s.date) ?? 0,
      voiceUploads: voiceByDay[s.date] ?? 0,
      pageVisits: visitsByDay[s.date] ?? 0,
      // Sahifa ko'rishlariga nisbatan ball: juda yuqori bo'lsa, qo'lda emas, skript bilan ehtimoli bor
      xpPerVisit: visitsByDay[s.date] ? Math.round(s.xp / visitsByDay[s.date]) : null,
    }));

    report.push({
      user: { name: u.name, email: u.email, xp: u.xp, joined: u.createdAt, invitedBy: u.referredBy },
      totals: {
        sumLast30Days: stats.reduce((a, s) => a + s.xp, 0),
        referralXpLast30Days: stats.reduce((a, s) => a + s.referralXp, 0),
        chestsOpened: chests.length,
        challengesDone: challenges,
        voiceUploads: voice.length,
        invitedUsers: referred.length,
      },
      invited: referred.map((r) => ({ name: r.name, joined: r.createdAt, xp: r.xp })),
      devices,
      days,
    });
  }

  return Response.json({ ok: true, query: q, found: report.length, report });
}
