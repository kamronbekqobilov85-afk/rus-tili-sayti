import { prisma } from "../../../../lib/prisma";
import { tgSendMessage, tgIsChannelMember } from "../../../../lib/telegram";
import { awardXp } from "../../../../lib/gamification";
import { XP_TELEGRAM_BONUS } from "../../../data/achievements";

type TgUpdate = {
  message?: {
    text?: string;
    chat?: { id: number };
    from?: { id: number };
  };
};

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  const text = update?.message?.text?.trim() ?? "";
  const chatId = update?.message?.chat?.id;
  const fromId = update?.message?.from?.id;
  if (!text.startsWith("/start") || !chatId || !fromId) {
    return Response.json({ ok: true });
  }

  const code = text.replace("/start", "").trim();
  if (!code) {
    await tgSendMessage(chatId, "Salom! Saytdagi \"Telegram orqali tasdiqlash\" tugmasini bosib qaytadan keling 🙂");
    return Response.json({ ok: true });
  }

  const link = await prisma.telegramLink.findUnique({ where: { linkCode: code } });
  if (!link) {
    await tgSendMessage(chatId, "Havola eskirgan yoki noto'g'ri. Saytga qaytib, qaytadan urinib ko'ring.");
    return Response.json({ ok: true });
  }

  if (link.verifiedAt) {
    await tgSendMessage(chatId, "Siz allaqachon tasdiqlangansiz ✅");
    return Response.json({ ok: true });
  }

  await prisma.telegramLink.update({
    where: { id: link.id },
    data: { telegramId: String(fromId) },
  });

  const isMember = await tgIsChannelMember(fromId);
  if (!isMember) {
    await tgSendMessage(
      chatId,
      "Avval @rustili24soat kanaliga obuna bo'ling, so'ng shu botga yana /start bosing — shunda +500 ball beriladi 🎁"
    );
    return Response.json({ ok: true });
  }

  await prisma.telegramLink.update({
    where: { id: link.id },
    data: { verifiedAt: new Date() },
  });
  await awardXp(link.userId, XP_TELEGRAM_BONUS, { isReferral: true });
  await tgSendMessage(chatId, `Tabriklaymiz! Obunangiz tasdiqlandi va +${XP_TELEGRAM_BONUS} ball berildi 🎉`);

  return Response.json({ ok: true });
}
