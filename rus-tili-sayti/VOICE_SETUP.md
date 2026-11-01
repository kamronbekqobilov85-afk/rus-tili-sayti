# Gapirish mashqini yoqish (ixtiyoriy)

"Gapirish" bo'limida foydalanuvchilar ovozlarini yozib yuborishi uchun fayl saqlash joyi kerak. Bu ixtiyoriy — sozlanmasa, "Gapirish" sahifasi ochiladi, lekin yozuv yuborilganda "hali sozlanmagan" degan xabar chiqadi, boshqa hech narsaga ta'sir qilmaydi.

## Vercel'da Blob Storage yaratish

1. Vercel loyihangiz (`rus-tili-sayti`) > chap menyudan **Storage** bo'limiga o'ting.
2. **Create Database** tugmasini bosing, **Blob** turini tanlang.
3. Nom bering (masalan `rus-tili-voice`) va yarating.
4. Yaratilgandan so'ng, uni loyihangizga **Connect** qiling (odatda avtomatik so'raladi).

Shu bilan `BLOB_READ_WRITE_TOKEN` environment variable avtomatik ravishda loyihangizga qo'shiladi — qo'lda hech narsa kiritish shart emas.

## Qayta deploy qiling

Environment variable qo'shilgandan so'ng, **Deployments** bo'limidan oxirgi deploymentni **Redeploy** qiling, shunda o'zgarish kuchga kiradi.

## Tayyor

Shundan so'ng `/gapirish` sahifasidagi yozuvlar saqlanadi va admin panelda (`/admin`, "Ovozli mashqlar" bo'limi) faqat sizga ko'rinadi va eshitilishi mumkin.
