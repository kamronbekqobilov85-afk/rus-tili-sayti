import { put } from "@vercel/blob";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ ok: false, error: "no_storage" }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("audio");
  const phraseRu = typeof form?.get("ru") === "string" ? (form.get("ru") as string).slice(0, 300) : "";

  if (!(file instanceof Blob) || !phraseRu) {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE) {
    return Response.json({ ok: false, error: "size" }, { status: 400 });
  }

  const blob = await put(`voice/${session.user.id}/${Date.now()}.webm`, file, {
    access: "public",
    contentType: file.type || "audio/webm",
  });

  await prisma.voiceRecording.create({
    data: {
      userId: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      phraseRu,
      audioUrl: blob.url,
    },
  });

  return Response.json({ ok: true });
}
