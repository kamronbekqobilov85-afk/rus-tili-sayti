# Admin va Google bilan kirishni sozlash

Bu qadamlarni faqat siz (loyiha egasi) Vercel va Google Cloud konsollarida bajarasiz — kod allaqachon tayyor.

## 1. Ma'lumotlar bazasi (Vercel Postgres)

1. https://vercel.com dagi loyihangizni oching → **Storage** bo'limi → **Create Database** → **Postgres**.
2. Yaratilgandan so'ng **Connect to Project** tugmasini bosib, shu loyihaga ulang.
3. Vercel o'zi `POSTGRES_PRISMA_URL` va `POSTGRES_URL_NON_POOLING` o'zgaruvchilarini loyihaga qo'shadi — qo'lda hech narsa yozish shart emas.

## 2. Google bilan kirish (OAuth)

1. https://console.cloud.google.com ga kiring, yangi loyiha yarating (yoki mavjudini tanlang).
2. **APIs & Services → OAuth consent screen**: turi — *External*, ilova nomi — masalan "Rus tili", qo'llab-quvvatlash emaili — o'zingiznikini kiriting. Saqlang.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs ga shuni qo'shing:
     - `https://rus-tili-sayti.vercel.app/api/auth/callback/google`
     - (agar kompyuteringizda sinab ko'rmoqchi bo'lsangiz) `http://localhost:3000/api/auth/callback/google`
4. **Client ID** va **Client secret** chiqadi — ularni nusxalab oling.

## 3. Vercel'da muhit o'zgaruvchilarini qo'shish

Loyiha → **Settings → Environment Variables** bo'limiga quyidagilarni qo'shing:

| Nomi | Qiymati |
|---|---|
| `GOOGLE_CLIENT_ID` | Google'dan olingan Client ID |
| `GOOGLE_CLIENT_SECRET` | Google'dan olingan Client secret |
| `AUTH_SECRET` | Tasodifiy maxfiy satr (pastga qarang) |
| `ADMIN_EMAIL` | Sizning Gmail manzilingiz — shu email bilan kirgan odam avtomatik **admin** bo'ladi |

`AUTH_SECRET` hosil qilish uchun terminalda:

```bash
npx auth secret
```

Chiqqan qiymatni nusxalab, Vercel'dagi `AUTH_SECRET` ga joylashtiring.

Barcha o'zgaruvchilarni qo'shgandan so'ng, loyihani **qayta joylang** (Deployments → ⋯ → Redeploy), chunki yangi env'lar faqat keyingi joylashda ishga tushadi. Baza jadvallari ham shu joylash paytida avtomatik tayyorlanadi.

## 4. Tekshirish

1. Saytni oching, yuqori o'ng burchakdagi **«Google bilan kirish»** tugmasini bosing.
2. O'zingizning (admin qilib belgilagan) Google hisobingiz bilan kiring.
3. Hisob belgisini bosib, **«🛡️ Admin panel»** havolasini bosing — u yerda ro'yxatdan o'tganlar soni, qurilmalar bo'yicha statistika va so'nggi foydalanuvchilar ro'yxati ko'rinadi.

Boshqa hech kim `/admin` sahifasini ocholmaydi — faqat `ADMIN_EMAIL`da ko'rsatilgan hisob.
