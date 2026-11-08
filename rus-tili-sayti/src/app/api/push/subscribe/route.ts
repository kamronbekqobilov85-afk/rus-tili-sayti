import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth_ = typeof body?.keys?.auth === "string" ? body.keys.auth : "";
  if (!endpoint || !p256dh || !auth_) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: session.user.id, endpoint, p256dh, auth: auth_ },
    update: { userId: session.user.id, p256dh, auth: auth_ },
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) return Response.json({ ok: false }, { status: 400 });

  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
  return Response.json({ ok: true });
}
