// «Ko'cha suhbati»: ruslar bilan hayotda eng ko'p uchraydigan vaziyatlar uchun tayyor dialoglar.
// who: "you" — siz (o'rganuvchi), "ru" — suhbatdosh (rus).

export type Line = { who: "you" | "ru"; ru: string; uz: string };
export type Tip = { ru: string; uz: string };
export type Scenario = {
  id: string;
  icon: string;
  title: string;
  situation: string;
  lines: Line[];
  tips: Tip[];
};

const Y = "you" as const;
const R = "ru" as const;

export const scenarios: Scenario[] = [
  {
    id: "taksi",
    icon: "🚕",
    title: "Taksida",
    situation: "Vokzalga borish uchun taksi to'xtatdingiz. Haydovchi bilan narx va manzilni kelishasiz.",
    lines: [
      { who: Y, ru: "Здравствуйте! Вы свободны?", uz: "Assalomu alaykum! Bo'shmisiz?" },
      { who: R, ru: "Да, садитесь. Куда едем?", uz: "Ha, o'tiring. Qayerga boramiz?" },
      { who: Y, ru: "На вокзал, пожалуйста.", uz: "Vokzalga, iltimos." },
      { who: R, ru: "Хорошо. Сколько вас человек?", uz: "Yaxshi. Necha kishisiz?" },
      { who: Y, ru: "Нас двое. Сколько это будет стоить?", uz: "Ikkimiz. Bu qancha turadi?" },
      { who: R, ru: "Рублей четыреста, примерно.", uz: "To'rt yuz rubl atrofida." },
      { who: Y, ru: "Хорошо, поехали. Остановите здесь, пожалуйста.", uz: "Yaxshi, ketdik. Shu yerda to'xtating, iltimos." },
      { who: R, ru: "Приехали. С вас четыреста рублей.", uz: "Keldik. Sizdan to'rt yuz rubl." },
      { who: Y, ru: "Вот, держите. Сдачи не надо. Спасибо!", uz: "Mana, oling. Qaytim kerak emas. Rahmat!" },
    ],
    tips: [
      { ru: "Включите счётчик, пожалуйста.", uz: "Schyotchikni yoqing, iltimos." },
      { ru: "Мне до центра.", uz: "Markazgacha." },
      { ru: "Подъезжайте к дому.", uz: "Uyga yaqinroq boring." },
    ],
  },
  {
    id: "bozor",
    icon: "🍅",
    title: "Bozorda",
    situation: "Bozorda pomidor olmoqchisiz: narxini so'rab, savdolashasiz.",
    lines: [
      { who: R, ru: "Подходите, берите! Свежие помидоры!", uz: "Keling, oling! Yangi pomidor!" },
      { who: Y, ru: "Здравствуйте! Почём помидоры?", uz: "Assalomu alaykum! Pomidor qanchadan?" },
      { who: R, ru: "Сто двадцать рублей за килограмм.", uz: "Kilogrammi yuz yigirma rubl." },
      { who: Y, ru: "Дороговато. Можно подешевле?", uz: "Qimmatroq ekan. Arzonroq bo'lmaydimi?" },
      { who: R, ru: "Ладно, для вас — сто рублей.", uz: "Mayli, siz uchun — yuz rubl." },
      { who: Y, ru: "Хорошо. Дайте, пожалуйста, два килограмма.", uz: "Yaxshi. Iltimos, ikki kilogramm bering." },
      { who: R, ru: "Пожалуйста. Ещё что-нибудь?", uz: "Marhamat. Yana nimadir kerakmi?" },
      { who: Y, ru: "Нет, спасибо. Сколько с меня?", uz: "Yo'q, rahmat. Men qancha to'layman?" },
      { who: R, ru: "Двести рублей.", uz: "Ikki yuz rubl." },
    ],
    tips: [
      { ru: "Можно попробовать?", uz: "Tatib ko'rsam bo'ladimi?" },
      { ru: "Взвесьте, пожалуйста.", uz: "Tortib bering, iltimos." },
      { ru: "Это свежее?", uz: "Bu yangimi?" },
    ],
  },
  {
    id: "yol",
    icon: "🧭",
    title: "Yo'l so'rash",
    situation: "Yo'l qidiryapsiz. Notanish odamdan metro va bekatni so'raysiz.",
    lines: [
      { who: Y, ru: "Извините, как пройти к метро?", uz: "Kechirasiz, metroga qanday borsam bo'ladi?" },
      { who: R, ru: "Идите прямо, потом поверните налево.", uz: "To'g'ri yuring, keyin chapga buring." },
      { who: Y, ru: "Это далеко отсюда?", uz: "Bu bu yerdan uzoqmi?" },
      { who: R, ru: "Нет, минут десять пешком.", uz: "Yo'q, yayov o'n daqiqalik yo'l." },
      { who: Y, ru: "Спасибо! А где здесь остановка?", uz: "Rahmat! Bu yerda bekat qayerda?" },
      { who: R, ru: "Вон там, за углом, напротив аптеки.", uz: "O'sha yerda, burchak ortida, dorixona qarshisida." },
      { who: Y, ru: "Понял, большое спасибо!", uz: "Tushundim, katta rahmat!" },
      { who: R, ru: "Пожалуйста. Удачи!", uz: "Marhamat. Omad!" },
    ],
    tips: [
      { ru: "Направо / налево / прямо", uz: "O'ngga / chapga / to'g'ri" },
      { ru: "Вы не подскажете, где…?", uz: "Aytib bera olasizmi, … qayerda?" },
      { ru: "Я заблудился.", uz: "Men adashib qoldim." },
    ],
  },
  {
    id: "kafe",
    icon: "🍲",
    title: "Kafe va restoran",
    situation: "Kafeda ovqat buyurtma qilasiz va hisobni to'laysiz.",
    lines: [
      { who: R, ru: "Добрый день! Вот меню. Что будете заказывать?", uz: "Xayrli kun! Mana menyu. Nima buyurtma qilasiz?" },
      { who: Y, ru: "Здравствуйте! Мне, пожалуйста, борщ и чай.", uz: "Assalomu alaykum! Menga, iltimos, borsh va choy." },
      { who: R, ru: "С хлебом?", uz: "Non bilanmi?" },
      { who: Y, ru: "Да, с хлебом. И чай без сахара, пожалуйста.", uz: "Ha, non bilan. Choy esa shakarsiz, iltimos." },
      { who: R, ru: "Хорошо. Что-нибудь ещё?", uz: "Yaxshi. Yana nimadir?" },
      { who: Y, ru: "Нет, это всё. У вас есть вай-фай?", uz: "Yo'q, hammasi shu. Sizda wi-fi bormi?" },
      { who: R, ru: "Да, пароль на чеке.", uz: "Ha, paroli chekda yozilgan." },
      { who: Y, ru: "Счёт, пожалуйста.", uz: "Hisobni keltiring, iltimos." },
      { who: R, ru: "С вас триста пятьдесят рублей. Картой или наличными?", uz: "Sizdan uch yuz ellik rubl. Kartami yoki naqdmi?" },
    ],
    tips: [
      { ru: "Очень вкусно, спасибо!", uz: "Juda mazali, rahmat!" },
      { ru: "С собой, пожалуйста.", uz: "Olib ketish uchun, iltimos." },
      { ru: "Можно ещё воды?", uz: "Yana suv bo'ladimi?" },
    ],
  },
  {
    id: "dokon",
    icon: "🛒",
    title: "Do'kon kassasida",
    situation: "Do'konda kassada to'lov qilyapsiz. Karta o'tmay qoladi.",
    lines: [
      { who: R, ru: "Пакет нужен?", uz: "Paket kerakmi?" },
      { who: Y, ru: "Да, один пакет, пожалуйста.", uz: "Ha, bitta paket, iltimos." },
      { who: R, ru: "С вас пятьсот сорок рублей.", uz: "Sizdan besh yuz qirq rubl." },
      { who: Y, ru: "Можно картой?", uz: "Karta bilan bo'ladimi?" },
      { who: R, ru: "Да, приложите карту.", uz: "Ha, kartani tegizing." },
      { who: Y, ru: "Не проходит. Попробуйте ещё раз, пожалуйста.", uz: "O'tmayapti. Yana bir urinib ko'ring, iltimos." },
      { who: R, ru: "Всё прошло. Чек нужен?", uz: "Hammasi o'tdi. Chek kerakmi?" },
      { who: Y, ru: "Нет, не нужен. Спасибо, до свидания!", uz: "Yo'q, kerak emas. Rahmat, xayr!" },
    ],
    tips: [
      { ru: "Где у вас молоко?", uz: "Sizda sut qayerda?" },
      { ru: "Есть скидка?", uz: "Chegirma bormi?" },
      { ru: "Вы неправильно посчитали.", uz: "Siz noto'g'ri hisobladingiz." },
    ],
  },
  {
    id: "dorixona",
    icon: "💊",
    title: "Dorixonada",
    situation: "Boshingiz og'riyapti. Dorixonachidan maslahat so'raysiz.",
    lines: [
      { who: Y, ru: "Здравствуйте! У меня болит голова. Что вы посоветуете?", uz: "Assalomu alaykum! Boshim og'riyapti. Nima maslahat berasiz?" },
      { who: R, ru: "Есть таблетки от головной боли. Аллергия на лекарства есть?", uz: "Bosh og'rig'iga tabletkalar bor. Dorilarga allergiyangiz bormi?" },
      { who: Y, ru: "Нет, аллергии нет.", uz: "Yo'q, allergiyam yo'q." },
      { who: R, ru: "Принимайте по одной таблетке два раза в день после еды.", uz: "Kuniga ikki marta ovqatdan keyin bittadan iching." },
      { who: Y, ru: "Сколько это стоит?", uz: "Bu qancha turadi?" },
      { who: R, ru: "Двести рублей.", uz: "Ikki yuz rubl." },
      { who: Y, ru: "Хорошо, я возьму. А ещё мне нужен градусник.", uz: "Yaxshi, olaman. Yana menga termometr kerak." },
      { who: R, ru: "Вот, пожалуйста.", uz: "Mana, marhamat." },
    ],
    tips: [
      { ru: "У меня температура.", uz: "Haroratim bor." },
      { ru: "У меня болит горло.", uz: "Tomog'im og'riyapti." },
      { ru: "Это без рецепта?", uz: "Bu retseptsiz sotiladimi?" },
    ],
  },
  {
    id: "tanishuv",
    icon: "🤝",
    title: "Tanishuv",
    situation: "Ko'chada rus yigit siz bilan gaplashib qoldi. Tanishib olasiz.",
    lines: [
      { who: R, ru: "Привет! Ты не местный? Откуда ты?", uz: "Salom! Sen mahalliy emasmisan? Qayerdansan?" },
      { who: Y, ru: "Привет! Я из Узбекистана, из Самарканда.", uz: "Salom! Men O'zbekistondanman, Samarqanddan." },
      { who: R, ru: "Здорово! А как тебя зовут?", uz: "Zo'r! Isming nima?" },
      { who: Y, ru: "Меня зовут Азиз. А тебя?", uz: "Mening ismim Aziz. Seniki-chi?" },
      { who: R, ru: "Андрей. Приятно познакомиться!", uz: "Andrey. Tanishganimdan xursandman!" },
      { who: Y, ru: "Мне тоже очень приятно. Я только учу русский язык.", uz: "Menga ham juda yoqimli. Men rus tilini endi o'rganyapman." },
      { who: R, ru: "Ты хорошо говоришь! Не переживай.", uz: "Sen yaxshi gapirasan! Xavotir olma." },
      { who: Y, ru: "Спасибо! Говори, пожалуйста, помедленнее.", uz: "Rahmat! Iltimos, sekinroq gapir." },
    ],
    tips: [
      { ru: "Как дела?", uz: "Ishlar qalay?" },
      { ru: "Давай обменяемся номерами.", uz: "Raqamlarimizni almashaylik." },
      { ru: "Мне пора идти. Пока!", uz: "Menga ketish kerak. Hozircha!" },
    ],
  },
  {
    id: "transport",
    icon: "🚌",
    title: "Avtobus va metroda",
    situation: "Avtobus bekatida to'g'ri avtobusni topishingiz kerak.",
    lines: [
      { who: Y, ru: "Скажите, этот автобус идёт до центра?", uz: "Ayting-chi, bu avtobus markazgacha boradimi?" },
      { who: R, ru: "Нет, вам нужен двенадцатый.", uz: "Yo'q, sizga o'n ikkinchisi kerak." },
      { who: Y, ru: "А где его остановка?", uz: "Uning bekati qayerda?" },
      { who: R, ru: "Через дорогу, на той стороне.", uz: "Yo'lning narigi tomonida." },
      { who: Y, ru: "Спасибо. Сколько стоит проезд?", uz: "Rahmat. Yo'l haqi qancha?" },
      { who: R, ru: "Пятьдесят рублей, платите водителю или картой.", uz: "Ellik rubl, haydovchiga yoki karta bilan to'laysiz." },
      { who: Y, ru: "Вы выходите на следующей остановке?", uz: "Keyingi bekatda tushasizmi?" },
      { who: R, ru: "Да, выхожу. Проходите.", uz: "Ha, tushaman. O'ting." },
      { who: Y, ru: "Извините, можно пройти? Мне выходить.", uz: "Kechirasiz, o'tsam bo'ladimi? Men tushishim kerak." },
    ],
    tips: [
      { ru: "Следующая станция — …", uz: "Keyingi bekat — …" },
      { ru: "Осторожно, двери закрываются.", uz: "Ehtiyot bo'ling, eshiklar yopilyapti." },
      { ru: "Где здесь касса?", uz: "Kassa bu yerda qayerda?" },
    ],
  },
  {
    id: "kvartira",
    icon: "🏠",
    title: "Kvartira ijarasi",
    situation: "E'lon bo'yicha kvartira ko'rgani keldingiz. Narx va shartlarni so'raysiz.",
    lines: [
      { who: Y, ru: "Здравствуйте! Я по объявлению. Квартира ещё сдаётся?", uz: "Assalomu alaykum! Men e'lon bo'yicha keldim. Kvartira hali ijaraga beriladimi?" },
      { who: R, ru: "Да, сдаётся. Заходите, посмотрите.", uz: "Ha, beriladi. Kiring, ko'ring." },
      { who: Y, ru: "Сколько стоит аренда в месяц?", uz: "Ijara oyiga qancha turadi?" },
      { who: R, ru: "Двадцать пять тысяч рублей, коммунальные платежи отдельно.", uz: "Yigirma besh ming rubl, kommunal to'lovlar alohida." },
      { who: Y, ru: "А залог нужно платить?", uz: "Garov to'lash kerakmi?" },
      { who: R, ru: "Да, залог — одна месячная оплата.", uz: "Ha, garov — bir oylik to'lov." },
      { who: Y, ru: "Можно подумать до завтра?", uz: "Ertagacha o'ylab ko'rsam bo'ladimi?" },
      { who: R, ru: "Конечно, позвоните мне вечером.", uz: "Albatta, kechqurun menga qo'ng'iroq qiling." },
      { who: Y, ru: "Хорошо, я вам позвоню. Спасибо!", uz: "Yaxshi, qo'ng'iroq qilaman. Rahmat!" },
    ],
    tips: [
      { ru: "Интернет и мебель входят в цену?", uz: "Internet va mebel narxga kiradimi?" },
      { ru: "На сколько человек квартира?", uz: "Kvartira necha kishiga mo'ljallangan?" },
      { ru: "Нужен договор.", uz: "Shartnoma kerak." },
    ],
  },
  {
    id: "yordam",
    icon: "🚑",
    title: "Shoshilinch yordam",
    situation: "Sizga yomon bo'lib qoldi. Odamlardan yordam so'raysiz. Eng muhim jumlalar.",
    lines: [
      { who: Y, ru: "Помогите, пожалуйста! Мне плохо.", uz: "Yordam bering, iltimos! Menga yomon." },
      { who: R, ru: "Что случилось? Вам вызвать скорую?", uz: "Nima bo'ldi? Tez yordam chaqiraymi?" },
      { who: Y, ru: "Да, вызовите, пожалуйста. У меня сильно болит живот.", uz: "Ha, chaqiring, iltimos. Qornim qattiq og'riyapti." },
      { who: R, ru: "Сядьте здесь. Скорая уже едет.", uz: "Mana bu yerga o'tiring. Tez yordam yo'lda." },
      { who: Y, ru: "Спасибо вам большое.", uz: "Sizga katta rahmat." },
      { who: R, ru: "Как вас зовут?", uz: "Ismingiz nima?" },
      { who: Y, ru: "Меня зовут Азиз. Мне двадцать пять лет.", uz: "Mening ismim Aziz. Men yigirma besh yoshdaman." },
      { who: R, ru: "Держитесь, всё будет хорошо.", uz: "Chidang, hammasi yaxshi bo'ladi." },
    ],
    tips: [
      { ru: "Позвоните в скорую — 112 или 103.", uz: "Tez yordamga qo'ng'iroq qiling — 112 yoki 103." },
      { ru: "Мне нужен врач.", uz: "Menga shifokor kerak." },
      { ru: "Я потерял документы.", uz: "Men hujjatlarimni yo'qotdim." },
    ],
  },
  {
    id: "telefon",
    icon: "📱",
    title: "SIM karta olish",
    situation: "Aloqa salonida SIM karta va tarif tanlaysiz.",
    lines: [
      { who: Y, ru: "Здравствуйте! Мне нужна сим-карта.", uz: "Assalomu alaykum! Menga SIM karta kerak." },
      { who: R, ru: "Паспорт с собой?", uz: "Pasport yoningizdami?" },
      { who: Y, ru: "Да, вот мой паспорт.", uz: "Ha, mana pasportim." },
      { who: R, ru: "Какой тариф вы хотите?", uz: "Qaysi tarifni xohlaysiz?" },
      { who: Y, ru: "Подешевле, с интернетом, пожалуйста.", uz: "Arzonroq, internetli, iltimos." },
      { who: R, ru: "Есть тариф за триста рублей в месяц.", uz: "Oyiga uch yuz rubllik tarif bor." },
      { who: Y, ru: "Хорошо, подключите его. Как пополнить баланс?", uz: "Yaxshi, ulang. Balansni qanday to'ldiraman?" },
      { who: R, ru: "Через приложение или в терминале.", uz: "Ilova orqali yoki terminalda." },
      { who: Y, ru: "Понятно, спасибо за помощь.", uz: "Tushunarli, yordamingiz uchun rahmat." },
    ],
    tips: [
      { ru: "Не работает интернет.", uz: "Internet ishlamayapti." },
      { ru: "Положите деньги на счёт.", uz: "Hisobga pul tashlang." },
      { ru: "Телефон разряжен.", uz: "Telefon zaryadi tugagan." },
    ],
  },
];

// Ruslar kundalik gapda eng ko'p ishlatadigan qisqa iboralar
export type Phrase = { ru: string; uz: string; note?: string };

export const phrases: Phrase[] = [
  { ru: "Ну да.", uz: "Ha-da, albatta.", note: "Rozilik bildirish" },
  { ru: "Да ладно!", uz: "Qo'ysangchi! / Yo'g'-e!", note: "Hayron bo'lganda" },
  { ru: "Нормально.", uz: "Yaxshi / bo'ladi.", note: "«Как дела?» ga javob" },
  { ru: "Понятно.", uz: "Tushunarli." },
  { ru: "Давай!", uz: "Qani! / Mayli, boshladik!", note: "Do'stlar o'rtasida" },
  { ru: "Ладно.", uz: "Mayli." },
  { ru: "Слушай…", uz: "Quloq sol… / Eshit…", note: "Gapni boshlash uchun" },
  { ru: "Ничего страшного.", uz: "Hechqisi yo'q." },
  { ru: "Не за что.", uz: "Arzimaydi (rahmatga javob)." },
  { ru: "Без проблем.", uz: "Muammo yo'q." },
  { ru: "Конечно!", uz: "Albatta!" },
  { ru: "Может быть.", uz: "Balki." },
  { ru: "Всё равно.", uz: "Baribir." },
  { ru: "Не понимаю.", uz: "Tushunmayapman." },
  { ru: "Повторите, пожалуйста.", uz: "Takrorlang, iltimos." },
  { ru: "Говорите медленнее, пожалуйста.", uz: "Sekinroq gapiring, iltimos." },
  { ru: "Я плохо говорю по-русски.", uz: "Men rus tilida yaxshi gapirolmayman." },
  { ru: "Что это значит?", uz: "Bu nima degani?" },
  { ru: "Как это по-русски?", uz: "Buni ruscha qanday aytiladi?" },
  { ru: "Подождите минутку.", uz: "Bir daqiqa kuting." },
  { ru: "Я опаздываю.", uz: "Kechikyapman." },
  { ru: "Давно не виделись!", uz: "Ko'rishmaganimizga ancha bo'ldi!" },
  { ru: "Будьте здоровы!", uz: "Sog' bo'ling! (aksirganda)" },
  { ru: "Приятного аппетита!", uz: "Yoqimli ishtaha!" },
];
