export type VideoCategory = "kino" | "multfilm" | "musiqa";

export type VideoItem = {
  id: number;
  category: VideoCategory;
  title: string;
  note?: string; // qisqa izoh (janr, yil, davomiylik)
  youtubeId?: string;
  playlistId?: string;
};

export const categories: { key: VideoCategory; icon: string; label: string; desc: string }[] = [
  {
    key: "kino",
    icon: "🎬",
    label: "Kinolar",
    desc: "Mosfilm'ning rasmiy kanalidagi sevimli sovet kinolari — to'liq va bepul. Ruscha nutqni tinglab o'rganing.",
  },
  {
    key: "multfilm",
    icon: "🧸",
    label: "Multfilmlar",
    desc: "Oddiy va aniq nutq — rus tilini boshlovchilar uchun eng yaxshi mashq. Rasmiy kanallardan.",
  },
  {
    key: "musiqa",
    icon: "🎵",
    label: "Musiqalar",
    desc: "Qo'shiqlarni tinglang va matnga qarab birga kuylang — talaffuz va eshitish tez rivojlanadi.",
  },
];

export const videos: VideoItem[] = [
  // ───────── Kinolar (Mosfilm — rasmiy kanal) ─────────
  { id: 101, category: "kino", title: "Бриллиантовая рука", note: "Komediya · 1968 · 99 daqiqa", youtubeId: "M9cGHdVbNXI" },
  { id: 102, category: "kino", title: "Операция «Ы» и другие приключения Шурика", note: "Komediya · 1965 · 95 daqiqa", youtubeId: "7ICl3sPny94" },
  { id: 103, category: "kino", title: "Кавказская пленница", note: "Komediya · 1966 · 81 daqiqa", youtubeId: "0f1LxDfNpv0" },
  { id: 104, category: "kino", title: "Иван Васильевич меняет профессию", note: "Komediya · 1973 · 92 daqiqa", youtubeId: "TQ8onQu5QKY" },
  { id: 105, category: "kino", title: "Джентльмены удачи", note: "Komediya · 1971 · 83 daqiqa", youtubeId: "8tJPKSz6Gaw" },
  { id: 106, category: "kino", title: "Невероятные приключения итальянцев в России", note: "Komediya · 1973 · 102 daqiqa", youtubeId: "0B3nK-k0KzQ" },
  { id: 107, category: "kino", title: "Ирония судьбы, или С лёгким паром (1 серия)", note: "Komediya · 1976 · 100 daqiqa", youtubeId: "L5GnqepBJkE" },
  { id: 108, category: "kino", title: "Служебный роман (1 серия)", note: "Komediya · 1977 · 87 daqiqa", youtubeId: "hR-1QGMK75c" },
  { id: 109, category: "kino", title: "Москва слезам не верит (1 серия)", note: "Drama · 1979 · 67 daqiqa", youtubeId: "X7GuhjGZ-xs" },
  { id: 110, category: "kino", title: "Девчата", note: "Komediya · 1961 · 96 daqiqa", youtubeId: "8CYY8EM5xYE" },
  { id: 111, category: "kino", title: "Человек с бульвара Капуцинов", note: "Komediya · 1987 · 93 daqiqa", youtubeId: "4JZzsIncaVo" },

  // ───────── Multfilmlar (rasmiy kanallar) ─────────
  { id: 201, category: "multfilm", title: "Ну, погоди! (выпуск 1)", note: "Mashhur sovet multfilmi · 10 daqiqa", youtubeId: "rqZABGit6X4" },
  { id: 202, category: "multfilm", title: "Новое Простоквашино — 1 серия", note: "Soyuzmultfilm · 7 daqiqa", youtubeId: "7Gb7ORxkQbw" },
  { id: 203, category: "multfilm", title: "Новое Простоквашино — 2 серия", note: "Soyuzmultfilm · 7 daqiqa", youtubeId: "wTLRSJH7Jj4" },
  { id: 204, category: "multfilm", title: "Новое Простоквашино — все серии подряд", note: "Soyuzmultfilm · 3 soat", youtubeId: "APy0ziPwGW4" },
  { id: 205, category: "multfilm", title: "Чебурашка — все серии подряд", note: "Soyuzmultfilm · 1 soat", youtubeId: "BgKYc4_REE8" },
  { id: 206, category: "multfilm", title: "Маша и Медведь — Раз, два, три! Ёлочка, гори!", note: "Oddiy nutq · 8 daqiqa", youtubeId: "CU5o1wGnHsY" },
  { id: 207, category: "multfilm", title: "Лунтик — Повар (сборник)", note: "Bolalar uchun · 56 daqiqa", youtubeId: "m16EGzxfOW8" },
  { id: 208, category: "multfilm", title: "Лунтик — Доброе дело (сборник)", note: "Bolalar uchun · 70 daqiqa", youtubeId: "nB3UqgPv5yc" },
  { id: 209, category: "multfilm", title: "Фиксики — Батут", note: "Oddiy nutq · 6 daqiqa", youtubeId: "c1o4lPeZAaw" },

  // ───────── Musiqalar ─────────
  { id: 2, category: "musiqa", title: "Пусть всегда будет солнце (subtitr bilan)", note: "Bolalar qo'shig'i", youtubeId: "2YoFSyKMMbg" },
  { id: 3, category: "musiqa", title: "В лесу родилась ёлочка (subtitr bilan)", note: "Yangi yil qo'shig'i", youtubeId: "oZw3cPM1wws" },
  { id: 1, category: "musiqa", title: "Катюша (subtitr bilan)", note: "Mashhur xalq qo'shig'i", youtubeId: "4rhp7Q7Ceq8" },
  { id: 4, category: "musiqa", title: "Калинка (subtitr bilan)", note: "Xalq qo'shig'i", youtubeId: "pGZ8SVB_vWM" },
  { id: 5, category: "musiqa", title: "103 ta qo'shiq (to'plam, matn bilan)", note: "Pleylist", playlistId: "PL-7NkxlnsDlVQB5wBSWVUyBPjKm5smjDh" },
  { id: 301, category: "musiqa", title: "Разговор со счастьем", note: "«Иван Васильевич меняет профессию» filmidan", youtubeId: "1t3h9osiFuE" },
  { id: 302, category: "musiqa", title: "Если б я был султан", note: "«Кавказская пленница» filmidan", youtubeId: "m6NtmPuVOWI" },
  { id: 6, category: "musiqa", title: "Rauf & Faik — Детство", note: "Zamonaviy pop", youtubeId: "m-el0pQLQE4" },
  { id: 7, category: "musiqa", title: "JONY — Комета", note: "Zamonaviy pop", youtubeId: "yM1QjdoLmxQ" },
  { id: 8, category: "musiqa", title: "Miyagi & Andy Panda — I Got Love", note: "Zamonaviy", youtubeId: "nidQCt_HEsY" },
  { id: 9, category: "musiqa", title: "SLAVA MARLOW — Мания", note: "Zamonaviy pop", youtubeId: "y9BaC30NLd4" },
  { id: 10, category: "musiqa", title: "HammAli & Navai — У окна", note: "Zamonaviy pop", youtubeId: "olOnunHLoUc" },
];
