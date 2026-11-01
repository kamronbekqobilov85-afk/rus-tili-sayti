import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const group = await prisma.group.findUnique({ where: { code }, select: { id: true, name: true } });
  if (!group) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return Response.json({ ok: true, group });
}
