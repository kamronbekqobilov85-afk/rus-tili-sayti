import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReminderEmail(to: string, name: string | null, daysInactive: number) {
  if (!resend) return;

  const isWinBack = daysInactive >= 3;
  const subject = isWinBack
    ? "Sizni sog'indik 😔 Rus tili bilimingiz pasayib ketmasin"
    : "Bugun hali mashq qilmadingiz 👀";
  const body = isWinBack
    ? `Siz ${daysInactive} kundan beri mashq qilmadingiz. Til bilimi mashq qilmasa tez unutiladi — endi qaytib, yo'qotgan vaqtni tez tiklab olishingiz mumkin.`
    : "Bugun rus tilini o'rganishni hali boshlamadingiz. Hatto 5 daqiqalik mashq ham bilimingizni mustahkamlaydi.";

  try {
    await resend.emails.send({
      from: "Rus tili <onboarding@resend.dev>",
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Salom${name ? `, ${name}` : ""}! ${isWinBack ? "😔" : "👋"}</h2>
          <p>${body}</p>
          <p>
            <a href="https://rus-tili-sayti.vercel.app" style="display:inline-block; background:#10b981; color:#fff; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none;">
              Davom etish →
            </a>
          </p>
        </div>
      `,
    });
  } catch {
    // email yuborilmadi — keyingi kunga qoldiramiz, foydalanuvchini bloklamaymiz
  }
}

export async function sendFeedbackNotification(
  adminEmail: string,
  from: { name: string | null; email: string | null; message: string }
) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Rus tili <onboarding@resend.dev>",
      to: adminEmail,
      subject: "📩 Yangi xabar — Rus tili sayti",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Yangi fikr/taklif keldi</h2>
          <p><strong>Kimdan:</strong> ${from.name || "Noma'lum"} (${from.email || "email yo'q"})</p>
          <p style="white-space: pre-wrap; background:#f1f5f9; padding:12px; border-radius:10px;">${from.message}</p>
          <p>
            <a href="https://rus-tili-sayti.vercel.app/admin" style="display:inline-block; background:#10b981; color:#fff; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none;">
              Admin panelda ko'rish →
            </a>
          </p>
        </div>
      `,
    });
  } catch {
    // email yuborilmadi — xabar baribir bazada saqlanadi
  }
}
