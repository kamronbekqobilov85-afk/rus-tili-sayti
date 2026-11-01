import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { sendFeedbackNotification } from "../../../lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2000) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      message,
    },
  });

  if (ADMIN_EMAIL) {
    // Vercel'ning serverless funksiyasi javob qaytargach to'xtaydi, shuning
    // uchun email yuborishni await qilib, javobdan oldin tugatamiz
    await sendFeedbackNotification(ADMIN_EMAIL, {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      message,
    });
  }

  return Response.json({ ok: true });
}
