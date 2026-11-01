import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const VALID_STATUSES = new Set(["new", "read", "resolved"]);

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ ok: false }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!id || !VALID_STATUSES.has(status)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await prisma.feedback.update({ where: { id }, data: { status } });

  return Response.json({ ok: true });
}
