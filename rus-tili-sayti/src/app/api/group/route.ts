import { randomUUID } from "crypto";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

function genCode(): string {
  return randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

// Joriy foydalanuvchining guruhi va a'zolar reytingi
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { groupId: true },
  });

  if (!me?.groupId) {
    return Response.json({ ok: true, group: null, members: [] });
  }

  const group = await prisma.group.findUnique({
    where: { id: me.groupId },
    select: {
      id: true,
      name: true,
      code: true,
      members: {
        orderBy: { xp: "desc" },
        select: { id: true, name: true, image: true, xp: true },
      },
    },
  });

  return Response.json({ ok: true, group: group ? { id: group.id, name: group.name, code: group.code } : null, members: group?.members ?? [] });
}

// Yangi guruh yaratish
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : "";
  if (!name) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: { name, code: genCode() },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return Response.json({ ok: true, group: { id: group.id, name: group.name, code: group.code } });
}

// Guruhdan chiqish
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: null },
  });

  return Response.json({ ok: true });
}
