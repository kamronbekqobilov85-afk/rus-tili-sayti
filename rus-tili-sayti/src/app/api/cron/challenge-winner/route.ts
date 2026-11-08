import { prisma, previousWeekRange } from "../../../../lib/prisma";
import { sendChallengeWinnerEmail } from "../../../../lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

// Vercel Cron har dushanba ertalab (Toshkent vaqti) shu route'ni chaqiradi —
// o'tgan haftaning g'olibini aniqlab, adminga email yuboradi.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { start, end } = previousWeekRange();
  const since = start.toISOString().slice(0, 10);
  const until = end.toISOString().slice(0, 10);

  const grouped = await prisma.dailyStat.groupBy({
    by: ["userId"],
    where: { date: { gte: since, lt: until } },
    _sum: { referralXp: true },
    having: { referralXp: { _sum: { gt: 0 } } },
    orderBy: { _sum: { referralXp: "desc" } },
    take: 1,
  });

  const top = grouped[0];
  let winner: { name: string | null; email: string | null; xp: number } | null = null;

  if (top) {
    const user = await prisma.user.findUnique({
      where: { id: top.userId },
      select: { name: true, email: true },
    });
    if (user) {
      winner = { name: user.name, email: user.email, xp: top._sum.referralXp ?? 0 };
    }
  }

  if (ADMIN_EMAIL) {
    await sendChallengeWinnerEmail(ADMIN_EMAIL, winner);
  }

  return Response.json({ ok: true, winner });
}
