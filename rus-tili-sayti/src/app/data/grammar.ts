export type Exercise = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type GrammarTopic = {
  id: number;
  slug: string;
  title: string;
  description: string;
  exercises: Exercise[];
};

export const grammarTopics: GrammarTopic[] = [
  {
    id: 1,
    slug: "otlarning-jinsi",
    title: "Otlarning jinsi (род)",
    description: "Rus tilida har bir ot uch jinsdan biriga tegishli: erkak (мужской), ayol (женский), o'rta (средний). Odatda so'zning oxirgi harfiga qarab aniqlanadi: undosh harf bilan tugasa - erkak, -a/-ya bilan tugasa - ayol, -o/-e bilan tugasa - o'rta jins.",
    exercises: [
      {
        id: 1,
        question: "\"дом\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Erkak (мужской)",
      },
      {
        id: 2,
        question: "\"семья\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Ayol (женский)",
      },
      {
        id: 3,
        question: "\"окно\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "O'rta (средний)",
      },
      {
        id: 4,
        question: "\"книга\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Ayol (женский)",
      },
      {
        id: 5,
        question: "\"стол\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Erkak (мужской)",
      },
    ],
  },
  {
    id: 2,
    slug: "predlojniy-kelishik",
    title: "Predlojniy kelishik (о ком? о чём?)",
    description: "Bu kelishik narsa yoki odam haqida gapirganda (о ком? о чём?) yoki joyni bildirganda (где?) ishlatiladi. Har doim predlog bilan keladi: о, об, в, на. Ko'pincha ot oxiriga -е qo'shiladi: школа - в школе, стол - на столе.",
    exercises: [
      {
        id: 1,
        question: "\"Men maktabda o'qiyman\" - to'g'ri variantni tanlang:",
        options: ["Я учусь в школе", "Я учусь в школа", "Я учусь школе"],
        correctAnswer: "Я учусь в школе",
      },
      {
        id: 2,
        question: "\"стол\" so'zi predlojniy kelishikda qanday bo'ladi?",
        options: ["на столе", "на стол", "на стола"],
        correctAnswer: "на столе",
      },
      {
        id: 3,
        question: "\"Kitob haqida gapiryapman\" - to'g'ri variant:",
        options: ["Я говорю о книге", "Я говорю о книга", "Я говорю про книге"],
        correctAnswer: "Я говорю о книге",
      },
      {
        id: 4,
        question: "\"дом\" so'zi predlojniy kelishikda qanday bo'ladi?",
        options: ["в доме", "в дом", "в дома"],
        correctAnswer: "в доме",
      },
      {
        id: 5,
        question: "Predlojniy kelishik qaysi savollarga javob beradi?",
        options: ["о ком? о чём? где?", "кто? что?", "кого? чего?"],
        correctAnswer: "о ком? о чём? где?",
      },
    ],
  },
  {
    id: 3,
    slug: "vinitelniy-kelishik",
    title: "Vinitelniy kelishik (кого? что?)",
    description: "Bu kelishik gapdagi to'g'ridan-to'g'ri to'ldiruvchini bildiradi - ya'ni fe'l ta'sir qiladigan narsa yoki odamni (кого? что?). Erkak jinsdagi jonsiz otlar va o'rta jinsdagi otlar bosh kelishik bilan bir xil bo'ladi. Ayol jinsdagi otlarda -а -> -у, -я -> -ю ga o'zgaradi: книга -> книгу, мама -> маму.",
    exercises: [
      {
        id: 1,
        question: "\"Men kitob o'qiyapman\" - to'g'ri variant:",
        options: ["Я читаю книгу", "Я читаю книга", "Я читаю книге"],
        correctAnswer: "Я читаю книгу",
      },
      {
        id: 2,
        question: "\"мама\" so'zi vinitelniy kelishikda qanday bo'ladi?",
        options: ["маму", "мама", "маме"],
        correctAnswer: "маму",
      },
      {
        id: 3,
        question: "\"Men uyni ko'ryapman\" - to'g'ri variant:",
        options: ["Я вижу дом", "Я вижу дома", "Я вижу доме"],
        correctAnswer: "Я вижу дом",
      },
      {
        id: 4,
        question: "\"вода\" so'zi vinitelniy kelishikda qanday bo'ladi?",
        options: ["воду", "вода", "воде"],
        correctAnswer: "воду",
      },
      {
        id: 5,
        question: "Vinitelniy kelishik qaysi savollarga javob beradi?",
        options: ["кого? что?", "о ком? о чём?", "кому? чему?"],
        correctAnswer: "кого? что?",
      },
    ],
  },
  {
    id: 4,
    slug: "roditelniy-kelishik",
    title: "Roditelniy kelishik (кого? чего?)",
    description: "Bu kelishik egalik (kimningdir narsasi), miqdor (stakan suvi) va yo'qlik (нет чего) ma'nolarini ifodalaydi (кого? чего?). Ayol jinsdagi otlarda -а -> -ы/-и ga o'zgaradi: вода -> воды, книга -> книги. Erkak jinsda ko'pincha -а/-я qo'shiladi: друг -> друга.",
    exercises: [
      {
        id: 1,
        question: "\"Suv yo'q\" - to'g'ri variant:",
        options: ["Нет воды", "Нет вода", "Нет воду"],
        correctAnswer: "Нет воды",
      },
      {
        id: 2,
        question: "\"друг\" so'zi roditelniy kelishikda qanday bo'ladi?",
        options: ["друга", "другу", "другом"],
        correctAnswer: "друга",
      },
      {
        id: 3,
        question: "\"Bu do'stimning kitobi\" - to'g'ri variant:",
        options: ["Это книга друга", "Это книга друг", "Это книга другу"],
        correctAnswer: "Это книга друга",
      },
      {
        id: 4,
        question: "\"Bir stakan suv\" - to'g'ri variant:",
        options: ["Стакан воды", "Стакан вода", "Стакан воду"],
        correctAnswer: "Стакан воды",
      },
      {
        id: 5,
        question: "Roditelniy kelishik qaysi savollarga javob beradi?",
        options: ["кого? чего?", "кого? что?", "кем? чем?"],
        correctAnswer: "кого? чего?",
      },
    ],
  },
  {
    id: 5,
    slug: "datelniy-kelishik",
    title: "Datelniy kelishik (кому? чему?)",
    description: "Bu kelishik harakat qaratilgan shaxs yoki narsani bildiradi (кому? чему?) - odatda \"kimgadir biror narsa berish/aytish\" ma'nosida. Ayol jinsda -а -> -е: мама -> маме. Erkak jinsda ko'pincha -у/-ю qo'shiladi: друг -> другу. Shuningdek \"menga yoqadi\" kabi iboralarda ishlatiladi: мне нравится.",
    exercises: [
      {
        id: 1,
        question: "\"Do'stimga kitob berdim\" - to'g'ri variant:",
        options: ["Я дал книгу другу", "Я дал книгу друга", "Я дал книгу друг"],
        correctAnswer: "Я дал книгу другу",
      },
      {
        id: 2,
        question: "\"Menga musiqa yoqadi\" - to'g'ri variant:",
        options: ["Мне нравится музыка", "Я нравится музыка", "Меня нравится музыка"],
        correctAnswer: "Мне нравится музыка",
      },
      {
        id: 3,
        question: "\"мама\" so'zi datelniy kelishikda qanday bo'ladi?",
        options: ["маме", "маму", "мамы"],
        correctAnswer: "маме",
      },
      {
        id: 4,
        question: "\"Onamga xat yozyapman\" - to'g'ri variant:",
        options: ["Я пишу письмо маме", "Я пишу письмо мама", "Я пишу письмо маму"],
        correctAnswer: "Я пишу письмо маме",
      },
      {
        id: 5,
        question: "Datelniy kelishik qaysi savollarga javob beradi?",
        options: ["кому? чему?", "кого? что?", "о ком? о чём?"],
        correctAnswer: "кому? чему?",
      },
    ],
  },
  {
    id: 6,
    slug: "tvoritelniy-kelishik",
    title: "Tvoritelniy kelishik (кем? чем?)",
    description: "Bu kelishik ish-harakat qanday vosita bilan bajarilishini (кем? чем?) yoki kasb-shug'ullanishni (быть/работать kem?) bildiradi. Erkak jinsda -ом/-ем qo'shiladi: врач -> врачом. Ayol jinsda -а -> -ой: ручка -> ручкой.",
    exercises: [
      {
        id: 1,
        question: "\"Men ruchka bilan yozyapman\" - to'g'ri variant:",
        options: ["Я пишу ручкой", "Я пишу ручка", "Я пишу ручку"],
        correctAnswer: "Я пишу ручкой",
      },
      {
        id: 2,
        question: "\"врач\" so'zi tvoritelniy kelishikda qanday bo'ladi?",
        options: ["врачом", "врача", "врачу"],
        correctAnswer: "врачом",
      },
      {
        id: 3,
        question: "\"U shifokor bo'lib ishlaydi\" - to'g'ri variant:",
        options: ["Он работает врачом", "Он работает врач", "Он работает врача"],
        correctAnswer: "Он работает врачом",
      },
      {
        id: 4,
        question: "\"нож\" so'zi tvoritelniy kelishikda qanday bo'ladi?",
        options: ["ножом", "ножа", "ножу"],
        correctAnswer: "ножом",
      },
      {
        id: 5,
        question: "Tvoritelniy kelishik qaysi savollarga javob beradi?",
        options: ["кем? чем?", "кого? чего?", "кому? чему?"],
        correctAnswer: "кем? чем?",
      },
    ],
  },
  {
    id: 7,
    slug: "koplik-son",
    title: "Otlarning ko'pligi (множественное число)",
    description: "Ko'plikni yasash uchun ko'pincha oxirgi harf o'zgaradi: erkak va ayol jinsdagi otlarda -a/-я -> -ы/-и (книга -> книги, стол -> столы), o'rta jinsda -о/-е -> -а/-я (окно -> окна). Ba'zi so'zlar qoidadan tashqari (istisno) shakllanadi.",
    exercises: [
      {
        id: 1,
        question: "\"книга\" so'zining ko'pligi qanday?",
        options: ["книги", "книгы", "книга"],
        correctAnswer: "книги",
      },
      {
        id: 2,
        question: "\"стол\" so'zining ko'pligi qanday?",
        options: ["столы", "столи", "стола"],
        correctAnswer: "столы",
      },
      {
        id: 3,
        question: "\"окно\" so'zining ko'pligi qanday?",
        options: ["окна", "окны", "окно"],
        correctAnswer: "окна",
      },
      {
        id: 4,
        question: "\"дом\" so'zining ko'pligi qanday? (istisno)",
        options: ["дома", "домы", "домов"],
        correctAnswer: "дома",
      },
      {
        id: 5,
        question: "\"машина\" so'zining ko'pligi qanday?",
        options: ["машины", "машина", "машини"],
        correctAnswer: "машины",
      },
    ],
  },
  {
    id: 8,
    slug: "hozirgi-zamon",
    title: "Fe'llarning hozirgi zamoni (настоящее время)",
    description: "Hozirgi zamonda fe'l shaxs va sonlarga qarab o'zgaradi (tuslanadi). Masalan \"читать\" (o'qimoq) fe'li: я читаю, ты читаешь, он/она читает, мы читаем, вы читаете, они читают.",
    exercises: [
      {
        id: 1,
        question: "\"Men o'qiyman\" - to'g'ri variant (\"читать\" fe'lidan):",
        options: ["Я читаю", "Я читаешь", "Я читает"],
        correctAnswer: "Я читаю",
      },
      {
        id: 2,
        question: "\"Sen o'qiysan\" - to'g'ri variant:",
        options: ["Ты читаешь", "Ты читаю", "Ты читают"],
        correctAnswer: "Ты читаешь",
      },
      {
        id: 3,
        question: "\"Ular o'qishadi\" - to'g'ri variant:",
        options: ["Они читают", "Они читает", "Они читаю"],
        correctAnswer: "Они читают",
      },
      {
        id: 4,
        question: "\"У o'qiydi\" (u - erkak) - to'g'ri variant:",
        options: ["Он читает", "Он читаю", "Он читаешь"],
        correctAnswer: "Он читает",
      },
      {
        id: 5,
        question: "\"Biz o'qiymiz\" - to'g'ri variant:",
        options: ["Мы читаем", "Мы читаете", "Мы читают"],
        correctAnswer: "Мы читаем",
      },
    ],
  },
  {
    id: 9,
    slug: "otgan-zamon",
    title: "Fe'llarning o'tgan zamoni (прошедшее время)",
    description: "O'tgan zamonda rus fe'llari shaxsga emas, balki eganing jinsi va soniga qarab o'zgaradi: erkak jinsda -л, ayol jinsda -ла, o'rta jinsda -ло, ko'plikda -ли qo'shiladi. Masalan \"читать\" fe'lidan: он читал, она читала, оно читало, они читали.",
    exercises: [
      {
        id: 1,
        question: "\"U (erkak) o'qidi\" - to'g'ri variant:",
        options: ["Он читал", "Он читала", "Он читало"],
        correctAnswer: "Он читал",
      },
      {
        id: 2,
        question: "\"U (ayol) o'qidi\" - to'g'ri variant:",
        options: ["Она читала", "Она читал", "Она читали"],
        correctAnswer: "Она читала",
      },
      {
        id: 3,
        question: "\"Ular o'qishdi\" - to'g'ri variant:",
        options: ["Они читали", "Они читал", "Они читала"],
        correctAnswer: "Они читали",
      },
      {
        id: 4,
        question: "\"Men (erkak) yozdim\" - to'g'ri variant (\"писать\" fe'lidan):",
        options: ["Я писал", "Я писала", "Я писали"],
        correctAnswer: "Я писал",
      },
      {
        id: 5,
        question: "O'tgan zamonda fe'l nimaga qarab o'zgaradi?",
        options: ["Jinsi va soniga", "Shaxsiga", "Kelishigiga"],
        correctAnswer: "Jinsi va soniga",
      },
    ],
  },
  {
    id: 10,
    slug: "kelasi-zamon",
    title: "Fe'llarning kelasi zamoni (будущее время)",
    description: "Ko'pgina fe'llarning kelasi zamoni \"быть\" (bo'lmoq) fe'lini tuslash va asosiy fe'lning infinitiv shaklini qo'shish orqali yasaladi: я буду читать, ты будешь читать, он будет читать va h.k.",
    exercises: [
      {
        id: 1,
        question: "\"Men o'qiyman\" (kelasi zamon) - to'g'ri variant:",
        options: ["Я буду читать", "Я буду читал", "Я читаю читать"],
        correctAnswer: "Я буду читать",
      },
      {
        id: 2,
        question: "\"Sen yozasan\" (kelasi zamon) - to'g'ri variant:",
        options: ["Ты будешь писать", "Ты будешь писал", "Ты будет писать"],
        correctAnswer: "Ты будешь писать",
      },
      {
        id: 3,
        question: "\"Быть\" fe'lining \"u\" (он) shakli qanday?",
        options: ["будет", "буду", "будешь"],
        correctAnswer: "будет",
      },
      {
        id: 4,
        question: "\"Biz ishlaymiz\" (kelasi zamon) - to'g'ri variant:",
        options: ["Мы будем работать", "Мы будете работать", "Мы будешь работать"],
        correctAnswer: "Мы будем работать",
      },
      {
        id: 5,
        question: "Kelasi zamon qaysi fe'l yordamida yasaladi?",
        options: ["быть", "читать", "делать"],
        correctAnswer: "быть",
      },
    ],
  },
  {
    id: 11,
    slug: "shaxs-olmoshlari",
    title: "Shaxs olmoshlari (личные местоимения)",
    description: "Rus tilida shaxs olmoshlari: я (men), ты (sen), он (u - erkak), она (u - ayol), оно (u - narsa/o'rta jins), мы (biz), вы (siz/sizlar), они (ular).",
    exercises: [
      {
        id: 1,
        question: "\"Men\" so'zi ruscha qanday?",
        options: ["я", "ты", "мы"],
        correctAnswer: "я",
      },
      {
        id: 2,
        question: "\"Sen\" so'zi ruscha qanday?",
        options: ["ты", "я", "вы"],
        correctAnswer: "ты",
      },
      {
        id: 3,
        question: "\"U\" (ayol) so'zi ruscha qanday?",
        options: ["она", "он", "оно"],
        correctAnswer: "она",
      },
      {
        id: 4,
        question: "\"Biz\" so'zi ruscha qanday?",
        options: ["мы", "вы", "они"],
        correctAnswer: "мы",
      },
      {
        id: 5,
        question: "\"Ular\" so'zi ruscha qanday?",
        options: ["они", "мы", "вы"],
        correctAnswer: "они",
      },
    ],
  },
  {
    id: 12,
    slug: "egalik-olmoshlari",
    title: "Egalik olmoshlari (притяжательные местоимения)",
    description: "Egalik olmoshlari otning jinsiga qarab o'zgaradi: мой/моя/моё (mening), твой/твоя/твоё (sening), наш/наша/наше (bizning), ваш/ваша/ваше (sizning).",
    exercises: [
      {
        id: 1,
        question: "\"Mening uyim\" - to'g'ri variant (\"дом\" - erkak jins):",
        options: ["Мой дом", "Моя дом", "Моё дом"],
        correctAnswer: "Мой дом",
      },
      {
        id: 2,
        question: "\"Mening kitobim\" - to'g'ri variant (\"книга\" - ayol jins):",
        options: ["Моя книга", "Мой книга", "Моё книга"],
        correctAnswer: "Моя книга",
      },
      {
        id: 3,
        question: "\"Mening oynam\" - to'g'ri variant (\"окно\" - o'rta jins):",
        options: ["Моё окно", "Мой окно", "Моя окно"],
        correctAnswer: "Моё окно",
      },
      {
        id: 4,
        question: "\"Bizning uyimiz\" - to'g'ri variant:",
        options: ["Наш дом", "Наша дом", "Наше дом"],
        correctAnswer: "Наш дом",
      },
      {
        id: 5,
        question: "\"Sening kitobing\" - to'g'ri variant:",
        options: ["Твоя книга", "Твой книга", "Твоё книга"],
        correctAnswer: "Твоя книга",
      },
    ],
  },
];