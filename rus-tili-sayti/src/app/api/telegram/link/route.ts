import { randomUUID } from "crypto";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "rustili24soat_bot";

// Foydalanuvchi uchun bir martalik kod hosil qiladi va botga deep-link qaytaradi.
// Foydalanuvchi shu havolani ochib botga /start bosganda, webhook orqali bog'lanadi.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const existing = await prisma.telegramLink.findUnique({ where: { userId: session.user.id } });
  if (existing?.verifiedAt) {
    return Response.json({ ok: true, verified: true });
  }

  const linkCode = existing?.linkCode ?? randomUUID().slice(0, 12);
  await prisma.telegramLink.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, linkCode },
    update: { linkCode },
  });

  return Response.json({
    ok: true,
    verified: false,
    url: `https://t.me/${BOT_USERNAME}?start=${linkCode}`,
  });
}
