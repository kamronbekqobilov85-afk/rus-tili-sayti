import { auth } from "../../../../auth";
import { sendPushToAll } from "../../../../lib/push";

// Kunига 3 marta (ertalab / tushlik / kechqurun) chaqirilishi mo'ljallangan —
// Vercel'ning bepul tarifida cron kuniga 1 martagina ishga tushgani uchun bu
// endpoint tashqi bepul cron xizmati (masalan cron-job.org) orqali chaqiriladi.
// Xabar matni joriy Toshkent soatiga qarab avtomatik tanlanadi, shuning uchun
// bitta URL kuniga necha marta chaqirilsa ham to'g'ri ishlaydi.
// Admin sessiyasi bilan ham (brauzerdan to'g'ridan-to'g'ri ochib) qo'lda ishga
// tushirish mumkin — CRON_SECRET faqat tashqi xizmat uchun.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const hasValidSecret = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!hasValidSecret) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const { searchParams } = new URL(req.url);
  const forcedSlot = searchParams.get("slot");

  const tashkentNow = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const hour = tashkentNow.getUTCHours();

  let slot: "morning" | "midday" | "evening" | "skip";
  if (forcedSlot === "morning" || forcedSlot === "midday" || forcedSlot === "evening") slot = forcedSlot;
  else if (hour >= 6 && hour < 11) slot = "morning";
  else if (hour >= 11 && hour < 16) slot = "midday";
  else if (hour >= 16 && hour < 23) slot = "evening";
  else slot = "skip";

  if (slot === "skip") {
    return Response.json({ ok: true, slot, push: null });
  }

  const messages: Record<Exclude<typeof slot, "skip">, { title: string; body: string }> = {
    morning: {
      title: "☀️ Xayrli tong!",
      body: "Kunni rus tili bilan boshlang — 5 daqiqalik mashq sizni kutmoqda.",
    },
    midday: {
      title: "📖 Tanaffus vaqti",
      body: "Bir chashka choy bilan birga bir nechta yangi so'z o'rganib oling.",
    },
    evening: {
      title: "🌙 Kun yakunida",
      body: "Bugungi mashqni bajarishni unutmang — ketma-ketlikni (streak) uzmang!",
    },
  };

  const push = await sendPushToAll({ ...messages[slot], url: "/kunlik" });

  return Response.json({ ok: true, slot, push });
}
