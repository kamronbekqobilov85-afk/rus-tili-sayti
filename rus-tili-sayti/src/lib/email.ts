import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReminderEmail(to: string, name: string | null) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Rus tili <onboarding@resend.dev>",
      to,
      subject: "Bugun hali mashq qilmadingiz 👀",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Salom${name ? `, ${name}` : ""}! 👋</h2>
          <p>Bugun rus tilini o'rganishni hali boshlamadingiz. Hatto 5 daqiqalik mashq ham bilimingizni mustahkamlaydi.</p>
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
