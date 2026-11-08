import { auth } from "../../../auth";

// Mashq (so'z/test) orqali endi ball berilmaydi — ball faqat Telegram
// obunasi va do'st taklif qilish orqali olinadi. Bu endpoint faqat
// mavjud mijoz kodlari sinmasligi uchun saqlab qolindi.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type === "test" ? "test" : body?.type === "word" ? "word" : null;
  if (!type) {
    return Response.json({ ok: false }, { status: 400 });
  }

  return Response.json({ ok: true });
}
