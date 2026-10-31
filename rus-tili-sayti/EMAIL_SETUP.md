# Eslatma email'larini yoqish (ixtiyoriy)

Sayt har kuni mashq qilmagan foydalanuvchilarga avtomatik eslatma email yuboradi. Bu ixtiyoriy — `RESEND_API_KEY` sozlanmasa, email jim o'chirilgan bo'ladi, sayt boshqa hech narsaga ta'sir qilmaydi.

## 1. Resend'da ro'yxatdan o'ting

1. https://resend.com ga kiring, bepul hisob oching.
2. **API Keys** bo'limidan **Create API Key** tugmasini bosing, nomini `rus-tili-sayti` deb qo'yib, yaratilgan kalitni nusxalab oling (`re_...` bilan boshlanadi).

Domen tasdiqlash shart emas — `onboarding@resend.dev` manzilidan bepul yuborish mumkin (kuniga cheklangan miqdorda, lekin eslatma uchun yetarli).

## 2. Vercel'da environment variable qo'shing

1. Vercel loyihangiz > **Settings** > **Environment Variables**.
2. Qo'shing:
   - `RESEND_API_KEY` = (1-qadamda olingan kalit)
   - `CRON_SECRET` = istalgan uzun tasodifiy matn (masalan, parol generatordan)
3. Saqlang va loyihani qayta deploy qiling (Redeploy).

## 3. Tayyor

`vercel.json`da allaqachon sozlangan cron har kuni soat 15:00 (UTC) — O'zbekiston vaqti bilan taxminan soat 20:00 — da `/api/cron/reminders` route'ini chaqiradi va bugun faollik ko'rsatmagan foydalanuvchilarga email yuboradi.

Vercel avtomatik ravishda cron so'roviga `Authorization: Bearer <CRON_SECRET>` header qo'shadi, shu orqali route tashqaridan chaqirilishdan himoyalangan.
