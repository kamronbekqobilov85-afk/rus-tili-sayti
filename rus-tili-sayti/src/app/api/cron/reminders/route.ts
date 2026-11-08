import { prisma } from "../../../../lib/prisma";
import { sendReminderEmail } from "../../../../lib/email";
import { sendPushToAll } from "../../../../lib/push";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Vercel Cron har kuni shu route'ni chaqiradi (vercel.json'dagi schedule bo'yicha).
// CRON_SECRET sozlangan bo'lsa, Vercel avtomatik Authorization header qo'shadi.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const today = new Date();
  const todayKey = todayStr();

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;
    if (u.createdAt.toISOString().slice(0, 10) === todayKey) continue; // bugun ro'yxatdan o'tgan

    const todayStat = await prisma.dailyStat.findUnique({
      where: { userId_date: { userId: u.id, date: todayKey } },
      select: { id: true },
    });
    if (todayStat) continue; // bugun allaqachon faol bo'lgan

    const lastStat = await prisma.dailyStat.findFirst({
      where: { userId: u.id },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    const lastActiveDate = lastStat ? new Date(lastStat.date) : u.createdAt;
    const daysInactive = Math.max(
      0,
      Math.floor((today.getTime() - lastActiveDate.getTime()) / 86_400_000)
    );

    await sendReminderEmail(u.email, u.name, daysInactive);
    sent++;
  }

  // Toshkent vaqti bilan yakshanba bo'lsa — ertaga Challenge boshlanishi haqida push yuboramiz
  const tashkentNow = new Date(today.getTime() + 5 * 60 * 60 * 1000);
  let push: { sent: number; removed: number } | null = null;
  if (tashkentNow.getUTCDay() === 0) {
    push = await sendPushToAll({
      title: "🏆 Ertaga Haftalik Challenge!",
      body: "Ertaga dushanba — ball hisobi 0'dan boshlanadi. Mashq qiling, do'st taklif qiling va Telegram Premium yuting!",
      url: "/challenge",
    });
  }

  return Response.json({ ok: true, sent, total: users.length, push });
}
