import type { PushPayload } from "../../../../lib/push";

export type Slot = "morning" | "midday" | "evening";

// Har bir vaqt uchun 12 tadan turli xabar. Kun raqamiga qarab navbat bilan almashadi,
// shuning uchun 12 kun davomida bir xil xabar takrorlanmaydi.
const POOLS: Record<Slot, PushPayload[]> = {
  morning: [
    { title: "☀️ Xayrli tong! Доброе утро!", body: "Kunni rus tili bilan boshlang: 5 daqiqalik mashq miyangizni uyg'otadi.", url: "/kunlik" },
    { title: "🎁 Sirli sandiq sizni kutyapti", body: "Bugungi sandiqda 10 dan 500 gacha ball bor. Ochib ko'ring, omadingiz kelsa-chi!", url: "/" },
    { title: "💡 Bilasizmi?", body: "Rus alifbosida 33 ta harf bor. Bugun yana bittasini yodlab oling: «Я» yoki «Ы»?", url: "/sozlar" },
    { title: "🔥 Seriyani davom ettiring!", body: "Har kuni ozgina o'qigan odam oyiga 30 ta yangi mavzu o'rganadi. Bugungi birinchi qadamni tashlang.", url: "/yol" },
    { title: "🗣 Bugungi ibora", body: "«Доброе утро!» (Dobroye utro) — xayrli tong. Bugun kimgadir ruscha salom bering!", url: "/suhbat" },
    { title: "🏆 Reyting qizib ketdi", body: "Birinchi o'rin uchun kurash davom etmoqda. Bugun bir pog'ona yuqoriga chiqing!", url: "/reyting" },
    { title: "💬 Ruslar bilan gaplashishga tayyormisiz?", body: "«Ko'cha suhbati»da taksi, bozor va bankdagi suhbatlarni mashq qiling.", url: "/suhbat" },
    { title: "🍵 Ertalabki 5 daqiqa", body: "Choy ichgancha 10 ta yangi so'z o'rganing. Kunning boshlanishi shunday bo'lsin!", url: "/sozlar" },
    { title: "🧠 Maqol: «Повторение — мать учения»", body: "Takrorlash o'rganish onasi. Bugun kechagi so'zlarni qaytaring.", url: "/sozlar" },
    { title: "🎬 Bugun nima ko'ramiz?", body: "«Бриллиантовая рука»dan boshlab, kino ko'rib rus tilini o'rganing. Har 5 daqiqaga +20 ball!", url: "/video" },
    { title: "⚡ 5 ta tezkor savol", body: "Kunlik mini-mashq: 5 ta savol, bonus ball. Hozir boshlang!", url: "/kunlik" },
    { title: "🌍 Bilasizmi?", body: "Rus tilida 250 milliondan ortiq odam gaplashadi va u BMTning 6 ta rasmiy tilidan biri.", url: "/yol" },
  ],
  midday: [
    { title: "📖 Tanaffus vaqti", body: "Bir piyola choy va bir nechta yangi so'z: tushlik vaqtini foydali o'tkazing.", url: "/sozlar" },
    { title: "🧪 So'z testini sinab ko'ring", body: "5 ta variantdan toping: har to'g'ri javob +0,5 ball. Siz nechtasini topasiz?", url: "/sozlar" },
    { title: "🔥 Do'stingiz sizdan oldinda!", body: "Reytingda kimdir sizni quvib o'tdi. Tushlikda 10 daqiqa mashq qilib, o'rningizni qaytaring.", url: "/reyting" },
    { title: "🎧 Eshitib topishni mashq qiling", body: "Rus ovozini tinglab, tarjimasini toping. Talaffuz va eshitish birga rivojlanadi.", url: "/sozlar" },
    { title: "💡 «Спасибо» qayerdan kelgan?", body: "«Спаси Бог» («Xudo asrasin») iborasi qisqarib, «спасибо» — «rahmat» bo'lib qolgan. Qiziq-a?", url: "/sozlar" },
    { title: "🎬 Multfilm ko'rib o'rganing", body: "«Ну, погоди!» va «Простоквашино»: oddiy nutq, ko'p yangi so'z.", url: "/video" },
    { title: "🏅 Bugungi maqsad qanday?", body: "Kunlik maqsadingizga oz qoldi. Bir-ikkita mashq va bugungi reja bajariladi.", url: "/kunlik" },
    { title: "🧠 Maqol: «Тише едешь — дальше будешь»", body: "Sekin yursang, uzoqqa borasan. Kuniga ozgina, lekin har kuni!", url: "/yol" },
    { title: "🚕 Taksida ruscha gapira olasizmi?", body: "«Куда едем?» — Qayerga boramiz? Ko'cha suhbatida to'liq dialogni tinglang.", url: "/suhbat" },
    { title: "🎵 Ruscha qo'shiq tinglang", body: "«Катюша» va «Калинка»ni matn bilan kuylang: talaffuzga zo'r mashq.", url: "/video" },
    { title: "⭐ Ball yig'ish vaqti", body: "Ko'cha suhbati mashqi: har to'g'ri javob +5 ball, tugatsangiz yana +20!", url: "/suhbat" },
    { title: "📚 Bugun qaysi mavzu?", body: "Fe'llar, sifatlar yoki ovqat? Mavzuni oxirigacha o'qib chiqsangiz, +10 ball!", url: "/sozlar" },
  ],
  evening: [
    { title: "🌙 Kun yakunida", body: "Bugungi mashqni bajarishni unutmang: seriyangiz (streak) uzilmasin!", url: "/kunlik" },
    { title: "⏰ Seriya xavf ostida!", body: "Bugun hali mashq qilmadingiz. Atigi 5 daqiqa, seriyangizni saqlab qoling.", url: "/kunlik" },
    { title: "🏆 Reytingni tekshirdingizmi?", body: "Kun oxirida kim yuqorida? Yana bir mashq qilib, o'rningizni ko'taring!", url: "/reyting" },
    { title: "💪 Raqobat harakatga keltiradi", body: "Eng yaxshi natijalar kimdir sizdan oldinda turganda chiqadi. Bugun bir pog'ona yuqoriga!", url: "/reyting" },
    { title: "🎁 Sandiqni ochdingizmi?", body: "Bugungi sirli sandiq yarim tungacha ochiq. Ball olishni unutmang!", url: "/" },
    { title: "🧠 Maqol: «Утро вечера мудренее»", body: "Ertalab ish kechqurundagidan oqilona. Bugungi darsni tugatib, tinch uxlang.", url: "/yol" },
    { title: "🎬 Kechki kino vaqti", body: "Rus komediyasini subtitr bilan ko'ring: dam olasiz va o'rganasiz.", url: "/video" },
    { title: "📝 Bugun nima o'rgandingiz?", body: "Uxlashdan oldin 5 ta so'zni takrorlang: miya uxlaganda ularni yaxshi saqlaydi.", url: "/sozlar" },
    { title: "🗣 Ibora: «Спокойной ночи!»", body: "Xayrli tun! Kun oxirida bitta yangi ibora o'rganib, ruscha tilak bilan uxlang.", url: "/suhbat" },
    { title: "🔁 Takrorlash vaqti keldi", body: "Unutilayotgan gaplar sizni kutyapti. 5 daqiqalik takrorlash — eng samarali usul.", url: "/yol/takrorlash" },
    { title: "🧪 Kun oxirida tezkor test", body: "10 ta savol, 5 daqiqa, 5 tagacha ball. Yutuq bilan yakunlang!", url: "/sozlar" },
    { title: "✨ Bugun ham boshladingiz — zo'r!", body: "Hali mashq qilmagan bo'lsangiz, hali kech emas: «Лучше поздно, чем никогда!» (Hech qachondan kech yaxshi).", url: "/kunlik" },
  ],
};

export function pickMessage(slot: Slot, tashkentNow: Date): PushPayload {
  const pool = POOLS[slot];
  const dayNumber = Math.floor(tashkentNow.getTime() / 86_400_000);
  return pool[dayNumber % pool.length];
}
