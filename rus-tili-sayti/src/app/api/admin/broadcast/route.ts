import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { sendPushToAll } from "../../../../lib/push";

// Hamma obunachilarga push-xabarnoma yuborish (faqat admin)

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// Nechta qurilmaga yuborilishini ko'rsatadi
export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const subscribers = await prisma.pushSubscription.count();
  return Response.json({ ok: true, subscribers });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  let url = typeof body?.url === "string" ? body.url.trim() : "/";
  if (!title || !text || title.length > 80 || text.length > 240) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  // Faqat sayt ichidagi havola ruxsat etiladi
  if (!url.startsWith("/") || url.startsWith("//")) url = "/";

  const result = await sendPushToAll({ title, body: text, url });
  return Response.json({ ok: true, ...result });
}
