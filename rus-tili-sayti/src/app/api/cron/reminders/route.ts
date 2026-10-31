import { prisma } from "../../../../lib/prisma";
import { sendReminderEmail } from "../../../../lib/email";

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

  const today = todayStr();

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;
    if (u.createdAt.toISOString().slice(0, 10) === today) continue; // bugun ro'yxatdan o'tgan

    const stat = await prisma.dailyStat.findUnique({
      where: { userId_date: { userId: u.id, date: today } },
      select: { id: true },
    });
    if (stat) continue; // bugun allaqachon faol bo'lgan

    await sendReminderEmail(u.email, u.name);
    sent++;
  }

  return Response.json({ ok: true, sent, total: users.length });
}
