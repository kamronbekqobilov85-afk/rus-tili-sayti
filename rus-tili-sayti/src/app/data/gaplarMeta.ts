// Gaplar yo'li tuzilishi (yengil fayl: gaplarning o'zi gaplar.ts da)

export type Gap = {
  id: number; // daraja * 1000 + tartib raqami (barqaror, yangi gap qo'shilsa ham o'zgarmaydi)
  ru: string;
  uz: string;
  level: number;
  lesson: number;
};

export type LevelInfo = {
  level: number;
  title: string;
  desc: string;
  icon: string;
  lessonTitles: string[];
};

export const LESSON_SIZE = 20;
export const LESSONS_PER_LEVEL = 5;
export const TOTAL_PLANNED_LEVELS = 25;

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: "Birinchi qadamlar",
    desc: "2-3 so'zli birikmalar va eng oddiy gaplar",
    icon: "🌱",
    lessonTitles: ["Salomlashish", "Men, sen, u", "Sifat va ot", "Mening narsalarim", "Ha, yo'q, raqamlar"],
  },
  {
    level: 2,
    title: "Oddiy gaplar",
    desc: "Hozirgi zamon, savollar, kundalik hayot",
    icon: "🌿",
    lessonTitles: ["Kundalik harakatlar", "Boshqalar nima qiladi", "Savollar", "Ovqat va do'kon", "Oila va kun tartibi"],
  },
  {
    level: 3,
    title: "Joy va yo'nalish",
    desc: "Qayerda, qayerga, shahar va uy",
    icon: "📍",
    lessonTitles: ["Qayerda?", "Qayerga?", "Shahar va transport", "Uy ichida", "Do'kon va bozor"],
  },
  {
    level: 4,
    title: "Vaqt va kun tartibi",
    desc: "Soat, hafta kunlari, fasllar",
    icon: "⏰",
    lessonTitles: ["Soat va vaqt", "Hafta kunlari", "Fasllar va ob-havo", "Ertalab va kechqurun", "Rejalar va odatlar"],
  },
  {
    level: 5,
    title: "Xohlash va qila olish",
    desc: "Хочу, могу, надо, можно",
    icon: "💪",
    lessonTitles: ["Men xohlayman", "Men qila olaman", "Kerak va zarur", "Mumkin va mumkin emas", "Yoqtirish"],
  },
  {
    level: 6,
    title: "Odamlar va munosabatlar",
    desc: "Oila, do'stlar, tasvirlash",
    icon: "👨‍👩‍👧",
    lessonTitles: ["Oilam", "Do'stlarim", "Odamlarni tasvirlash", "Birga vaqt o'tkazish", "Sovg'a va bayram"],
  },
  {
    level: 7,
    title: "O'tgan zamon",
    desc: "Kecha nima bo'ldi",
    icon: "⏪",
    lessonTitles: ["Kecha nima qildim", "Men va sen", "Qayerda edik", "Nima bo'ldi?", "Hafta oxiri"],
  },
  {
    level: 8,
    title: "Kelasi zamon",
    desc: "Rejalar, va'dalar, taxminlar",
    icon: "⏩",
    lessonTitles: ["Ertangi rejalar", "Kelasi hafta", "Va'dalar", "Taxminlar", "Katta rejalar"],
  },
  {
    level: 9,
    title: "Buyruq va iltimos",
    desc: "Buyruq, taklif, maslahat, taqiq",
    icon: "📣",
    lessonTitles: ["Buyruqlar", "Iltimoslar", "Taklif va taklifnomalar", "Ruxsat va taqiqlar", "Maslahatlar"],
  },
  {
    level: 10,
    title: "Taqqoslash",
    desc: "Kattaroq, eng yaxshi, xuddi shunday",
    icon: "⚖️",
    lessonTitles: ["Kattaroq va kichikroq", "Yaxshiroq va yomonroq", "Eng ...", "Xuddi shunday", "Taqqoslashning boshqa shakllari"],
  },
  {
    level: 11,
    title: "Sabab va maqsad",
    desc: "Потому что, поэтому, чтобы",
    icon: "🔗",
    lessonTitles: ["Chunki", "Shuning uchun", "Maqsad uchun", "Sabab va oqibat", "Nega va nima uchun"],
  },
  {
    level: 12,
    title: "Shart va payt",
    desc: "Если, когда, пока",
    icon: "🔀",
    lessonTitles: ["Agar shunday bo'lsa", "Qachon", "Hali ... ekan", "Shu zahoti", "Agar ... bo'lganida"],
  },
  {
    level: 13,
    title: "Ish va o'qish",
    desc: "Suhbat, ofis, imtihon",
    icon: "💼",
    lessonTitles: ["Ish qidirish", "Suhbat", "Hamkasblar va ofis", "Ish jarayoni", "O'qish va imtihon"],
  },
  {
    level: 14,
    title: "Sayohat",
    desc: "Aeroport, poyezd, mehmonxona",
    icon: "✈️",
    lessonTitles: ["Safarga tayyorgarlik", "Aeroportda", "Poyezd va yo'l", "Mehmonxonada", "Marshrut va diqqatga sazovor joylar"],
  },
  {
    level: 15,
    title: "Sog'liq",
    desc: "Shifokor, dorixona, sport",
    icon: "🩺",
    lessonTitles: ["Shifokorda", "Dorixona", "Simptomlar", "Sog'lom turmush", "Sport va dam olish"],
  },
  {
    level: 16,
    title: "Texnologiya",
    desc: "Telefon, internet, ilovalar",
    icon: "📱",
    lessonTitles: ["Telefon", "Internet", "Ijtimoiy tarmoqlar", "Ilovalar va kompyuter", "Xavfsizlik"],
  },
  {
    level: 17,
    title: "Idoralar va xizmatlar",
    desc: "Bank, pochta, hujjatlar",
    icon: "🏦",
    lessonTitles: ["Bankda", "Pochtada", "Poliklinika va hujjatlar", "Soliq va ijara", "Ta'mir va politsiya"],
  },
  {
    level: 18,
    title: "Fikr va his-tuyg'u",
    desc: "Fikr bildirish, shubha, rozilik",
    icon: "💭",
    lessonTitles: ["Fikr bildirish", "Quvonch va xursandchilik", "Xavotir va shubha", "Rozilik va norozilik", "Garchi, chunki, uchun"],
  },
  {
    level: 19,
    title: "Murakkab gaplar",
    desc: "Который, ikki fikr bir gapda",
    icon: "🧩",
    lessonTitles: ["Kotoriy (kim/nima)", "Aytilgan gap", "Savol-gaplar ichida", "Ikki fikr bir gapda", "Tavsif"],
  },
  {
    level: 20,
    title: "Muloqot odobi",
    desc: "Iltimos, taklif, mehmondorchilik",
    icon: "🤝",
    lessonTitles: ["Iltimos va rahmat", "Telefonda", "Taklif va rad", "Mehmondorchilik", "Kichik suhbat"],
  },
  {
    level: 21,
    title: "Jamiyat va yangiliklar",
    desc: "Yangiliklar, ekologiya, ta'lim",
    icon: "📰",
    lessonTitles: ["Yangiliklar", "Jamiyat va hayot", "Ekologiya", "Ta'lim", "Sog'liqni saqlash"],
  },
  {
    level: 22,
    title: "Biznes",
    desc: "Muzokara, soliq, hisobot",
    icon: "📈",
    lessonTitles: ["Biznes asoslari", "Muzokaralar va shartnoma", "Narxlar va soliqlar", "Foyda va investitsiya", "Hisobot va buxgalteriya"],
  },
  {
    level: 23,
    title: "Maqol va hikmatlar",
    desc: "Mehnat, do'stlik, ibora ma'nolari",
    icon: "🧠",
    lessonTitles: ["Mehnat va sabr", "Do'stlik va odamlar", "Aql va bilim", "Hayot hikmatlari", "Iboralar va ularning ma'nosi"],
  },
  {
    level: 24,
    title: "Madaniyat",
    desc: "Adabiyot, kino, tarix, an'analar",
    icon: "🎭",
    lessonTitles: ["Adabiyot va kitoblar", "Kino va teatr", "Musiqa va tasviriy san'at", "Tarix va an'analar", "O'zbekiston va Rossiya madaniyati"],
  },
  {
    level: 25,
    title: "Ustoz darajasi",
    desc: "Rasmiy nutq, munozara, falsafa",
    icon: "👑",
    lessonTitles: ["Rasmiy nutq va hujjatlar", "Munozara va dalillar", "Hikoya va tasvir", "Falsafa va hayot haqida", "Yakuniy sinov"],
  },
];
