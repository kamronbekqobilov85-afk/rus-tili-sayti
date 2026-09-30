export type Exercise = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type GrammarRule = {
  title: string;
  text: string;
};

export type GrammarExample = {
  ru: string;
  uz: string;
};

export type GrammarLesson = {
  intro: string;
  rules: GrammarRule[];
  table: {
    headers: string[];
    rows: string[][];
  };
  examples: GrammarExample[];
};

export type GrammarTopic = {
  id: number;
  slug: string;
  title: string;
  description: string;
  lesson: GrammarLesson;
  exercises: Exercise[];
};

export const grammarTopics: GrammarTopic[] = [
  {
    id: 1,
    slug: "otlarning-jinsi",
    title: "Otlarning jinsi (род)",
    description: "Rus tilida har bir ot uch jinsdan biriga tegishli: erkak, ayol yoki o'rta jins.",
    lesson: {
      intro: "Rus tilidagi har bir ot (narsa, odam, tushuncha nomi) uchta jinsdan biriga tegishli bo'ladi: erkak jins (мужской род), ayol jins (женский род) yoki o'rta jins (средний род). Jinsni bilish juda muhim, chunki sifatlar, olmoshlar va fe'llarning o'tgan zamon shakli otning jinsiga qarab o'zgaradi.",
      rules: [
        {
          title: "Erkak jins",
          text: "Ko'pincha undosh harf bilan tugaydi: дом, стол, друг, врач.",
        },
        {
          title: "Ayol jins",
          text: "Ko'pincha -а yoki -я bilan tugaydi: мама, книга, семья.",
        },
        {
          title: "O'rta jins",
          text: "Ko'pincha -о yoki -е bilan tugaydi: окно, море, письмо.",
        },
      ],
      table: {
        headers: ["Jins", "Oxiri", "Misollar"],
        rows: [
          ["Erkak (мужской)", "undosh, -й", "дом, стол, музей"],
          ["Ayol (женский)", "-а, -я", "мама, книга, неделя"],
          ["O'rta (средний)", "-о, -е", "окно, море, письмо"],
        ],
      },
      examples: [
        {
          ru: "Это большой дом.",
          uz: "Bu katta uy. (erkak jins)",
        },
        {
          ru: "Это моя книга.",
          uz: "Bu mening kitobim. (ayol jins)",
        },
        {
          ru: "Это новое окно.",
          uz: "Bu yangi deraza. (o'rta jins)",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"учитель\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Erkak (мужской)",
      },
      {
        id: 7,
        question: "\"улица\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "Ayol (женский)",
      },
      {
        id: 8,
        question: "\"море\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "O'rta (средний)",
      },
      {
        id: 9,
        question: "\"письмо\" so'zi qaysi jinsga tegishli?",
        options: ["Erkak (мужской)", "Ayol (женский)", "O'rta (средний)"],
        correctAnswer: "O'rta (средний)",
      },
      {
        id: 10,
        question: "\"неделя\" so'zi qaysi jinsga tegishli?",
        options: ["Ayol (женский)", "Erkak (мужской)", "O'rta (средний)"],
        correctAnswer: "Ayol (женский)",
      },
    ],
  },
  {
    id: 2,
    slug: "predlojniy-kelishik",
    title: "Predlojniy kelishik (о ком? о чём?)",
    description: "Narsa yoki joy haqida gapirganda ishlatiladigan kelishik.",
    lesson: {
      intro: "Predlojniy kelishik narsa yoki odam haqida gapirganda (о ком? о чём?) yoki joyni bildirganda (где?) ishlatiladi. U hech qachon predlogsiz kelmaydi — doim о, об, в yoki на predloglaridan biri bilan birga ishlatiladi.",
      rules: [
        {
          title: "Asosiy predloglar",
          text: "о/об (haqida), в (ichida), на (ustida) predloglari bilan ishlatiladi.",
        },
        {
          title: "Ko'pchilik otlar",
          text: "Oxiriga -е qo'shiladi: школа → в школе, стол → на столе.",
        },
        {
          title: "-ий/-ие bilan tugaydigan otlar",
          text: "Oxiriga -и qo'shiladi: здание → в здании.",
        },
      ],
      table: {
        headers: ["Bosh kelishik", "Predlojniy kelishik", "Misol"],
        rows: [
          ["школа", "в школе", "Я учусь в школе."],
          ["стол", "на столе", "Книга на столе."],
          ["книга", "о книге", "Я говорю о книге."],
          ["город", "в городе", "Мы живём в городе."],
        ],
      },
      examples: [
        {
          ru: "Я думаю о тебе.",
          uz: "Men sen haqingda o'ylayapman.",
        },
        {
          ru: "Мы отдыхаем на море.",
          uz: "Biz dengizda dam olyapmiz.",
        },
        {
          ru: "Он живёт в Москве.",
          uz: "U Moskvada yashaydi.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"город\" so'zi predlojniy kelishikda qanday bo'ladi?",
        options: ["в городе", "в город", "в города"],
        correctAnswer: "в городе",
      },
      {
        id: 7,
        question: "\"Men dengizda dam olyapman\" - to'g'ri variant:",
        options: ["Я отдыхаю на море", "Я отдыхаю на моря", "Я отдыхаю о море"],
        correctAnswer: "Я отдыхаю на море",
      },
      {
        id: 8,
        question: "\"здание\" so'zi predlojniy kelishikda qanday bo'ladi?",
        options: ["в здании", "в здание", "в зданию"],
        correctAnswer: "в здании",
      },
      {
        id: 9,
        question: "\"Do'stim haqida o'ylayapman\" - to'g'ri variant:",
        options: ["Я думаю о друге", "Я думаю о друг", "Я думаю про друге"],
        correctAnswer: "Я думаю о друге",
      },
      {
        id: 10,
        question: "Predlojniy kelishik qaysi predloglar bilan ishlatiladi?",
        options: ["о, об, в, на", "у, без, для", "к, по"],
        correctAnswer: "о, об, в, на",
      },
    ],
  },
  {
    id: 3,
    slug: "vinitelniy-kelishik",
    title: "Vinitelniy kelishik (кого? что?)",
    description: "Gapdagi to'g'ridan-to'g'ri to'ldiruvchini bildiruvchi kelishik.",
    lesson: {
      intro: "Vinitelniy kelishik gapdagi to'g'ridan-to'g'ri to'ldiruvchini, ya'ni fe'l ta'sir qiladigan narsa yoki odamni bildiradi (кого? что?). Masalan, \"Men kitob o'qiyapman\" gapida \"kitob\" so'zi vinitelniy kelishikda bo'ladi.",
      rules: [
        {
          title: "Jonsiz erkak/o'rta jins otlar",
          text: "Bosh kelishik bilan bir xil qoladi: дом → дом, окно → окно.",
        },
        {
          title: "Ayol jinsdagi otlar",
          text: "-а → -у, -я → -ю ga o'zgaradi: книга → книгу, семья → семью.",
        },
        {
          title: "Jonli erkak jins otlar",
          text: "Roditelniy kelishik bilan bir xil bo'ladi: друг → друга, брат → брата.",
        },
      ],
      table: {
        headers: ["Bosh kelishik", "Vinitelniy kelishik", "Misol"],
        rows: [
          ["книга", "книгу", "Я читаю книгу."],
          ["мама", "маму", "Я вижу маму."],
          ["дом", "дом", "Я вижу дом."],
          ["брат", "брата", "Я вижу брата."],
        ],
      },
      examples: [
        {
          ru: "Я смотрю фильм.",
          uz: "Men film ko'ryapman.",
        },
        {
          ru: "Она любит музыку.",
          uz: "U musiqani yaxshi ko'radi.",
        },
        {
          ru: "Мы видим озеро.",
          uz: "Biz ko'lni ko'ryapmiz.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Men filmni tomosha qilyapman\" - to'g'ri variant:",
        options: ["Я смотрю фильм", "Я смотрю фильма", "Я смотрю фильму"],
        correctAnswer: "Я смотрю фильм",
      },
      {
        id: 7,
        question: "\"музыка\" so'zi vinitelniy kelishikda qanday bo'ladi?",
        options: ["музыку", "музыка", "музыке"],
        correctAnswer: "музыку",
      },
      {
        id: 8,
        question: "\"брат\" so'zi vinitelniy kelishikda qanday bo'ladi? (jonli, erkak)",
        options: ["брата", "брат", "брату"],
        correctAnswer: "брата",
      },
      {
        id: 9,
        question: "\"Men ko'lni ko'ryapman\" - to'g'ri variant:",
        options: ["Я вижу озеро", "Я вижу озера", "Я вижу озеру"],
        correctAnswer: "Я вижу озеро",
      },
      {
        id: 10,
        question: "Jonli erkak jinsdagi otlar vinitelniy kelishikda qaysi kelishikka o'xshaydi?",
        options: ["Roditelniy", "Datelniy", "Predlojniy"],
        correctAnswer: "Roditelniy",
      },
    ],
  },
  {
    id: 4,
    slug: "roditelniy-kelishik",
    title: "Roditelniy kelishik (кого? чего?)",
    description: "Egalik, miqdor va yo'qlik ma'nolarini ifodalovchi kelishik.",
    lesson: {
      intro: "Roditelniy kelishik egalik (kimningdir narsasi), miqdor (bir stakan suv) va yo'qlik (нет чего) ma'nolarini ifodalaydi (кого? чего?). Bu rus tilida eng ko'p ishlatiladigan kelishiklardan biri.",
      rules: [
        {
          title: "Ayol jinsdagi otlar",
          text: "-а → -ы/-и ga o'zgaradi: вода → воды, книга → книги.",
        },
        {
          title: "Erkak jinsdagi otlar",
          text: "Oxiriga -а/-я qo'shiladi: друг → друга, учитель → учителя.",
        },
        {
          title: "\"нет\" bilan ishlatiladi",
          text: "Yo'qlikni bildirish uchun: нет времени, нет денег.",
        },
      ],
      table: {
        headers: ["Bosh kelishik", "Roditelniy kelishik", "Misol"],
        rows: [
          ["вода", "воды", "Стакан воды."],
          ["книга", "книги", "У меня нет книги."],
          ["друг", "друга", "Это дом друга."],
          ["время", "времени", "У меня нет времени."],
        ],
      },
      examples: [
        {
          ru: "У меня нет денег.",
          uz: "Mening pulim yo'q.",
        },
        {
          ru: "Это машина брата.",
          uz: "Bu akamning mashinasi.",
        },
        {
          ru: "Стакан молока.",
          uz: "Bir stakan sut.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Mening pulim yo'q\" - to'g'ri variant:",
        options: ["У меня нет денег", "У меня нет деньги", "У меня нет деньгами"],
        correctAnswer: "У меня нет денег",
      },
      {
        id: 7,
        question: "\"время\" so'zi roditelniy kelishikda qanday bo'ladi?",
        options: ["времени", "время", "времена"],
        correctAnswer: "времени",
      },
      {
        id: 8,
        question: "\"Bu akamning mashinasi\" - to'g'ri variant:",
        options: ["Это машина брата", "Это машина брат", "Это машина брату"],
        correctAnswer: "Это машина брата",
      },
      {
        id: 9,
        question: "\"учитель\" so'zi roditelniy kelishikda qanday bo'ladi?",
        options: ["учителя", "учитель", "учителю"],
        correctAnswer: "учителя",
      },
      {
        id: 10,
        question: "Roditelniy kelishik qanday ma'nolarni ifodalaydi?",
        options: ["Egalik, miqdor, yo'qlik", "Harakat vositasi", "Joy"],
        correctAnswer: "Egalik, miqdor, yo'qlik",
      },
    ],
  },
  {
    id: 5,
    slug: "datelniy-kelishik",
    title: "Datelniy kelishik (кому? чему?)",
    description: "Harakat qaratilgan shaxs yoki narsani bildiruvchi kelishik.",
    lesson: {
      intro: "Datelniy kelishik harakat qaratilgan shaxs yoki narsani bildiradi (кому? чему?) — odatda \"kimgadir biror narsa berish/aytish\" ma'nosida ishlatiladi. Shuningdek, \"menga yoqadi\" kabi juda ko'p qo'llaniladigan iboralarda ham ishlatiladi.",
      rules: [
        {
          title: "Ayol jinsdagi otlar",
          text: "-а → -е ga o'zgaradi: мама → маме, сестра → сестре.",
        },
        {
          title: "Erkak jinsdagi otlar",
          text: "Oxiriga -у/-ю qo'shiladi: друг → другу, учитель → учителю.",
        },
        {
          title: "\"нравится\" iborasi",
          text: "\"Yoqadi\" ma'nosida datelniy kelishik bilan ishlatiladi: мне нравится, ей нравится.",
        },
      ],
      table: {
        headers: ["Bosh kelishik", "Datelniy kelishik", "Misol"],
        rows: [
          ["мама", "маме", "Я звоню маме."],
          ["друг", "другу", "Я дал книгу другу."],
          ["сестра", "сестре", "Это подарок сестре."],
        ],
      },
      examples: [
        {
          ru: "Мне нравится это платье.",
          uz: "Menga bu ko'ylak yoqadi.",
        },
        {
          ru: "Я звоню сестре.",
          uz: "Men singlimga qo'ng'iroq qilyapman.",
        },
        {
          ru: "Дай книгу учителю.",
          uz: "Kitobni o'qituvchiga ber.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Men singlimga qo'ng'iroq qilyapman\" - to'g'ri variant:",
        options: ["Я звоню сестре", "Я звоню сестра", "Я звоню сестру"],
        correctAnswer: "Я звоню сестре",
      },
      {
        id: 7,
        question: "\"Menga bu ko'ylak yoqadi\" - to'g'ri variant:",
        options: ["Мне нравится это платье", "Я нравится это платье", "Меня нравится это платье"],
        correctAnswer: "Мне нравится это платье",
      },
      {
        id: 8,
        question: "\"учитель\" so'zi datelniy kelishikda qanday bo'ladi?",
        options: ["учителю", "учителя", "учителем"],
        correctAnswer: "учителю",
      },
      {
        id: 9,
        question: "\"Kitobni o'qituvchiga ber\" - to'g'ri variant:",
        options: ["Дай книгу учителю", "Дай книгу учитель", "Дай книгу учителя"],
        correctAnswer: "Дай книгу учителю",
      },
      {
        id: 10,
        question: "\"Yoqadi\" ma'nosidagi \"нравится\" fe'li qaysi kelishik bilan ishlatiladi?",
        options: ["Datelniy", "Vinitelniy", "Roditelniy"],
        correctAnswer: "Datelniy",
      },
    ],
  },
  {
    id: 6,
    slug: "tvoritelniy-kelishik",
    title: "Tvoritelniy kelishik (кем? чем?)",
    description: "Ish-harakat vositasini yoki kasbni bildiruvchi kelishik.",
    lesson: {
      intro: "Tvoritelniy kelishik ish-harakat qanday vosita bilan bajarilishini (кем? чем?) yoki kasb-shug'ullanishni (работать кем?) bildiradi. \"С\" (bilan) predlogi bilan ham tez-tez ishlatiladi.",
      rules: [
        {
          title: "Erkak jinsdagi otlar",
          text: "Oxiriga -ом/-ём qo'shiladi: врач → врачом, нож → ножом.",
        },
        {
          title: "Ayol jinsdagi otlar",
          text: "-а → -ой ga o'zgaradi: ручка → ручкой, сестра → сестрой.",
        },
        {
          title: "Kasb bilan ishlatilishi",
          text: "работать кем: он работает врачом (u shifokor bo'lib ishlaydi).",
        },
      ],
      table: {
        headers: ["Bosh kelishik", "Tvoritelniy kelishik", "Misol"],
        rows: [
          ["ручка", "ручкой", "Я пишу ручкой."],
          ["врач", "врачом", "Он работает врачом."],
          ["сестра", "сестрой", "Я иду с сестрой."],
        ],
      },
      examples: [
        {
          ru: "Я разговариваю с другом.",
          uz: "Men do'stim bilan gaplashyapman.",
        },
        {
          ru: "Она работает учителем.",
          uz: "U o'qituvchi bo'lib ishlaydi.",
        },
        {
          ru: "Мы едем поездом.",
          uz: "Biz poyezdda ketyapmiz.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Men do'stim bilan gaplashyapman\" - to'g'ri variant:",
        options: ["Я разговариваю с другом", "Я разговариваю с друг", "Я разговариваю друга"],
        correctAnswer: "Я разговариваю с другом",
      },
      {
        id: 7,
        question: "\"U o'qituvchi bo'lib ishlaydi\" (ayol) - to'g'ri variant:",
        options: ["Она работает учителем", "Она работает учитель", "Она работает учителю"],
        correctAnswer: "Она работает учителем",
      },
      {
        id: 8,
        question: "\"сестра\" so'zi tvoritelniy kelishikda qanday bo'ladi?",
        options: ["сестрой", "сестре", "сестру"],
        correctAnswer: "сестрой",
      },
      {
        id: 9,
        question: "\"Biz poyezdda ketyapmiz\" - to'g'ri variant:",
        options: ["Мы едем поездом", "Мы едем поезд", "Мы едем поезду"],
        correctAnswer: "Мы едем поездом",
      },
      {
        id: 10,
        question: "\"C\" (bilan) predlogi qaysi kelishik bilan ishlatiladi?",
        options: ["Tvoritelniy", "Datelniy", "Vinitelniy"],
        correctAnswer: "Tvoritelniy",
      },
    ],
  },
  {
    id: 7,
    slug: "koplik-son",
    title: "Otlarning ko'pligi (множественное число)",
    description: "Otlarning ko'plik shaklini yasash qoidalari.",
    lesson: {
      intro: "Rus tilida ko'plikni yasash uchun otning oxirgi harfi o'zgaradi. Qoida otning jinsiga bog'liq, lekin ba'zi so'zlar istisno tariqasida boshqacha shakllanadi — bularni alohida yodlash kerak.",
      rules: [
        {
          title: "Erkak va ayol jins",
          text: "-а/-я → -ы/-и: книга → книги, стол → столы.",
        },
        {
          title: "O'rta jins",
          text: "-о/-е → -а/-я: окно → окна, море → моря.",
        },
        {
          title: "Istisnolar",
          text: "дом → дома, город → города, друг → друзья.",
        },
      ],
      table: {
        headers: ["Birlik", "Ko'plik", "Izoh"],
        rows: [
          ["книга", "книги", "Qoida bo'yicha"],
          ["окно", "окна", "Qoida bo'yicha"],
          ["дом", "дома", "Istisno"],
          ["друг", "друзья", "Istisno"],
        ],
      },
      examples: [
        {
          ru: "У меня две книги.",
          uz: "Mening ikkita kitobim bor.",
        },
        {
          ru: "Это красивые дома.",
          uz: "Bu chiroyli uylar.",
        },
        {
          ru: "Мои друзья приехали.",
          uz: "Do'stlarim keldi.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"друг\" so'zining ko'pligi qanday? (istisno)",
        options: ["друзья", "други", "друга"],
        correctAnswer: "друзья",
      },
      {
        id: 7,
        question: "\"город\" so'zining ko'pligi qanday? (istisno)",
        options: ["города", "городы", "город"],
        correctAnswer: "города",
      },
      {
        id: 8,
        question: "\"море\" so'zining ko'pligi qanday?",
        options: ["моря", "моры", "морё"],
        correctAnswer: "моря",
      },
      {
        id: 9,
        question: "\"Mening ikkita kitobim bor\" - to'g'ri variant:",
        options: ["У меня две книги", "У меня две книга", "У меня две книгу"],
        correctAnswer: "У меня две книги",
      },
      {
        id: 10,
        question: "O'rta jinsdagi otlarda ko'plik qanday yasaladi?",
        options: ["-о/-е → -а/-я", "-а/-я → -ы/-и", "O'zgarmaydi"],
        correctAnswer: "-о/-е → -а/-я",
      },
    ],
  },
  {
    id: 8,
    slug: "hozirgi-zamon",
    title: "Fe'llarning hozirgi zamoni (настоящее время)",
    description: "Fe'llarning shaxs va songa qarab tuslanishi.",
    lesson: {
      intro: "Hozirgi zamonda rus fe'llari shaxs va songa qarab o'zgaradi — bu jarayon \"tuslanish\" (спряжение) deyiladi. Fe'llar ikki asosiy guruhga bo'linadi: I tuslanish (-ать/-ять) va II tuslanish (-ить).",
      rules: [
        {
          title: "I tuslanish (читать)",
          text: "я читаю, ты читаешь, он читает, мы читаем, вы читаете, они читают.",
        },
        {
          title: "II tuslanish (говорить)",
          text: "я говорю, ты говоришь, он говорит, мы говорим, вы говорите, они говорят.",
        },
        {
          title: "Qoidadan tashqari fe'llar",
          text: "хотеть, идти kabi fe'llar o'ziga xos tuslanadi, alohida yodlanadi.",
        },
      ],
      table: {
        headers: ["Shaxs", "читать (I)", "говорить (II)"],
        rows: [
          ["я", "читаю", "говорю"],
          ["ты", "читаешь", "говоришь"],
          ["он/она", "читает", "говорит"],
          ["мы", "читаем", "говорим"],
          ["вы", "читаете", "говорите"],
          ["они", "читают", "говорят"],
        ],
      },
      examples: [
        {
          ru: "Она говорит по-русски.",
          uz: "U ruscha gapiradi.",
        },
        {
          ru: "Мы работаем каждый день.",
          uz: "Biz har kuni ishlaymiz.",
        },
        {
          ru: "Ты понимаешь меня?",
          uz: "Sen meni tushunyapsanmi?",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"U ruscha gapiradi\" (ayol) - to'g'ri variant (\"говорить\" fe'lidan):",
        options: ["Она говорит по-русски", "Она говорю по-русски", "Она говоришь по-русски"],
        correctAnswer: "Она говорит по-русски",
      },
      {
        id: 7,
        question: "\"Sen tushunyapsan\" - to'g'ri variant (\"понимать\" fe'lidan):",
        options: ["Ты понимаешь", "Ты понимаю", "Ты понимает"],
        correctAnswer: "Ты понимаешь",
      },
      {
        id: 8,
        question: "\"Biz ishlaymiz\" - to'g'ri variant (\"работать\" fe'lidan):",
        options: ["Мы работаем", "Мы работаете", "Мы работают"],
        correctAnswer: "Мы работаем",
      },
      {
        id: 9,
        question: "\"говорить\" fe'lining \"вы\" shakli qanday?",
        options: ["говорите", "говорят", "говоришь"],
        correctAnswer: "говорите",
      },
      {
        id: 10,
        question: "Rus tilida fe'llar necha asosiy tuslanish guruhiga bo'linadi?",
        options: ["2 ta (I va II)", "3 ta", "4 ta"],
        correctAnswer: "2 ta (I va II)",
      },
    ],
  },
  {
    id: 9,
    slug: "otgan-zamon",
    title: "Fe'llarning o'tgan zamoni (прошедшее время)",
    description: "Fe'llarning eganing jinsi va soniga qarab o'zgarishi.",
    lesson: {
      intro: "O'tgan zamonda rus fe'llari shaxsga emas, balki eganing (subjektning) jinsi va soniga qarab o'zgaradi. Bu boshqa zamonlardan farqli, chunki bu yerda \"men/sen/u\" emas, balki gapiruvchining jinsi muhim.",
      rules: [
        {
          title: "Erkak jinsda",
          text: "Fe'l tugagan (infinitiv)dagi -ть o'rniga -л qo'shiladi: читать → читал.",
        },
        {
          title: "Ayol jinsda",
          text: "-ла qo'shiladi: читать → читала.",
        },
        {
          title: "O'rta jins va ko'plikda",
          text: "-ло va -ли qo'shiladi: читало, читали.",
        },
      ],
      table: {
        headers: ["Jins/son", "Qo'shimcha", "читать fe'lidan"],
        rows: [
          ["Erkak (он)", "-л", "читал"],
          ["Ayol (она)", "-ла", "читала"],
          ["O'rta (оно)", "-ло", "читало"],
          ["Ko'plik (они)", "-ли", "читали"],
        ],
      },
      examples: [
        {
          ru: "Я (муж.) работал вчера.",
          uz: "Men (erkak) kecha ishladim.",
        },
        {
          ru: "Она смотрела фильм.",
          uz: "U (ayol) film ko'rdi.",
        },
        {
          ru: "Дети играли во дворе.",
          uz: "Bolalar hovlida o'ynashdi.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Men (erkak) kecha ishladim\" - to'g'ri variant:",
        options: ["Я работал вчера", "Я работала вчера", "Я работали вчера"],
        correctAnswer: "Я работал вчера",
      },
      {
        id: 7,
        question: "\"U (ayol) film ko'rdi\" - to'g'ri variant:",
        options: ["Она смотрела фильм", "Она смотрел фильм", "Она смотрели фильм"],
        correctAnswer: "Она смотрела фильм",
      },
      {
        id: 8,
        question: "\"Bolalar hovlida o'ynashdi\" - to'g'ri variant:",
        options: ["Дети играли во дворе", "Дети играл во дворе", "Дети играла во дворе"],
        correctAnswer: "Дети играли во дворе",
      },
      {
        id: 9,
        question: "O'tgan zamonda \"оно\" (u, narsa) uchun qanday qo'shimcha qo'shiladi?",
        options: ["-ло", "-л", "-ла"],
        correctAnswer: "-ло",
      },
      {
        id: 10,
        question: "\"Она читала книгу\" jumlasida \"читала\" fe'li qaysi jinsga mos?",
        options: ["Ayol jins", "Erkak jins", "O'rta jins"],
        correctAnswer: "Ayol jins",
      },
    ],
  },
  {
    id: 10,
    slug: "kelasi-zamon",
    title: "Fe'llarning kelasi zamoni (будущее время)",
    description: "\"быть\" fe'li yordamida yasaladigan kelasi zamon.",
    lesson: {
      intro: "Ko'pgina rus fe'llarining kelasi zamoni (murakkab kelasi zamon) \"быть\" (bo'lmoq) fe'lini tuslash va asosiy fe'lning infinitiv (boshlang'ich) shaklini qo'shish orqali yasaladi.",
      rules: [
        {
          title: "быть fe'lining tuslanishi",
          text: "я буду, ты будешь, он будет, мы будем, вы будете, они будут.",
        },
        {
          title: "Tuzilishi",
          text: "быть (tuslangan) + fe'l (infinitiv): я буду читать, ты будешь писать.",
        },
        {
          title: "Sodda kelasi zamon",
          text: "Ba'zi fe'llar (masalan, prefiksli fe'llar) hozirgi zamon shaklida kelasi ma'noni ham beradi: я пойду (men boraman).",
        },
      ],
      table: {
        headers: ["Shaxs", "быть", "Misol (читать bilan)"],
        rows: [
          ["я", "буду", "буду читать"],
          ["ты", "будешь", "будешь читать"],
          ["он/она", "будет", "будет читать"],
          ["мы", "будем", "будем читать"],
          ["вы", "будете", "будете читать"],
          ["они", "будут", "будут читать"],
        ],
      },
      examples: [
        {
          ru: "Я буду учиться завтра.",
          uz: "Men ertaga o'qiyman.",
        },
        {
          ru: "Они будут работать вместе.",
          uz: "Ular birga ishlashadi.",
        },
        {
          ru: "Вы будете дома вечером?",
          uz: "Siz kechqurun uyda bo'lasizmi?",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Men ertaga o'qiyman\" (kelasi zamon) - to'g'ri variant:",
        options: ["Я буду учиться завтра", "Я учился завтра", "Я учусь завтра буду"],
        correctAnswer: "Я буду учиться завтра",
      },
      {
        id: 7,
        question: "\"Ular birga ishlashadi\" - to'g'ri variant:",
        options: ["Они будут работать вместе", "Они будет работать вместе", "Они будете работать вместе"],
        correctAnswer: "Они будут работать вместе",
      },
      {
        id: 8,
        question: "\"быть\" fe'lining \"вы\" shakli qanday?",
        options: ["будете", "будешь", "будем"],
        correctAnswer: "будете",
      },
      {
        id: 9,
        question: "\"Siz kechqurun uyda bo'lasizmi?\" - to'g'ri variant:",
        options: ["Вы будете дома вечером?", "Вы будешь дома вечером?", "Вы будем дома вечером?"],
        correctAnswer: "Вы будете дома вечером?",
      },
      {
        id: 10,
        question: "Murakkab kelasi zamon qanday yasaladi?",
        options: ["быть + infinitiv", "быть + o'tgan zamon", "Faqat infinitiv"],
        correctAnswer: "быть + infinitiv",
      },
    ],
  },
  {
    id: 11,
    slug: "shaxs-olmoshlari",
    title: "Shaxs olmoshlari (личные местоимения)",
    description: "Men, sen, u, biz, siz, ular so'zlarining ruscha shakllari.",
    lesson: {
      intro: "Shaxs olmoshlari gapda kim harakat qilayotganini bildiradi. Rus tilida ular otlar kabi kelishiklarga qarab ham o'zgaradi, lekin dastlab bosh kelishikdagi shakllarini yaxshi bilish kerak.",
      rules: [
        {
          title: "Birlik",
          text: "я (men), ты (sen), он (u-erkak), она (u-ayol), оно (u-narsa).",
        },
        {
          title: "Ko'plik",
          text: "мы (biz), вы (siz/sizlar), они (ular).",
        },
        {
          title: "Muomala",
          text: "\"вы\" rasmiy murojaatda ham, ko'plikda ham ishlatiladi.",
        },
      ],
      table: {
        headers: ["Olmosh", "Ma'nosi"],
        rows: [
          ["я", "men"],
          ["ты", "sen"],
          ["он / она / оно", "u (erkak/ayol/narsa)"],
          ["мы", "biz"],
          ["вы", "siz, sizlar"],
          ["они", "ular"],
        ],
      },
      examples: [
        {
          ru: "Я студент.",
          uz: "Men talabaman.",
        },
        {
          ru: "Он мой друг.",
          uz: "U mening do'stim.",
        },
        {
          ru: "Вы говорите по-английски?",
          uz: "Siz inglizcha gapirasizmi?",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"U\" (narsa/o'rta jins) so'zi ruscha qanday?",
        options: ["оно", "он", "она"],
        correctAnswer: "оно",
      },
      {
        id: 7,
        question: "\"Siz\" (rasmiy) so'zi ruscha qanday?",
        options: ["вы", "ты", "мы"],
        correctAnswer: "вы",
      },
      {
        id: 8,
        question: "\"Men talabaman\" - to'g'ri variant:",
        options: ["Я студент", "Ты студент", "Он студент"],
        correctAnswer: "Я студент",
      },
      {
        id: 9,
        question: "\"U mening do'stim\" (erkak) - to'g'ri variant:",
        options: ["Он мой друг", "Она мой друг", "Оно мой друг"],
        correctAnswer: "Он мой друг",
      },
      {
        id: 10,
        question: "\"вы\" olmoshi qachon ishlatiladi?",
        options: ["Ko'plikda va rasmiy murojaatda", "Faqat birlikda", "Faqat ayollarga"],
        correctAnswer: "Ko'plikda va rasmiy murojaatda",
      },
    ],
  },
  {
    id: 12,
    slug: "egalik-olmoshlari",
    title: "Egalik olmoshlari (притяжательные местоимения)",
    description: "Mening, sening, bizning, sizning so'zlarining otning jinsiga qarab o'zgarishi.",
    lesson: {
      intro: "Egalik olmoshlari kimningdir narsasi ekanligini bildiradi. Rus tilida bu olmoshlar otning jinsiga qarab o'zgaradi — bu o'zbek tilidan farqli xususiyat, shuning uchun alohida e'tibor talab qiladi.",
      rules: [
        {
          title: "мой (mening)",
          text: "Erkak jinsda мой, ayol jinsda моя, o'rta jinsda моё: мой дом, моя книга, моё окно.",
        },
        {
          title: "твой (sening)",
          text: "Xuddi мой kabi o'zgaradi: твой дом, твоя книга, твоё окно.",
        },
        {
          title: "наш / ваш (bizning/sizning)",
          text: "наш дом, наша книга, наше окно; ваш dom, ваша книга, ваше окно.",
        },
      ],
      table: {
        headers: ["Egalik", "Erkak", "Ayol", "O'rta"],
        rows: [
          ["mening", "мой", "моя", "моё"],
          ["sening", "твой", "твоя", "твоё"],
          ["bizning", "наш", "наша", "наше"],
          ["sizning", "ваш", "ваша", "ваше"],
        ],
      },
      examples: [
        {
          ru: "Это мой брат.",
          uz: "Bu mening akam.",
        },
        {
          ru: "Это твоя сумка?",
          uz: "Bu sening sumkangmi?",
        },
        {
          ru: "Наше окно большое.",
          uz: "Bizning oynamiz katta.",
        },
      ],
    },
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
      {
        id: 6,
        question: "\"Bu sening sumkangmi?\" (\"сумка\" - ayol jins) - to'g'ri variant:",
        options: ["Это твоя сумка?", "Это твой сумка?", "Это твоё сумка?"],
        correctAnswer: "Это твоя сумка?",
      },
      {
        id: 7,
        question: "\"Bizning oynamiz katta\" - to'g'ri variant:",
        options: ["Наше окно большое", "Наш окно большое", "Наша окно большое"],
        correctAnswer: "Наше окно большое",
      },
      {
        id: 8,
        question: "\"Bu mening akam\" - to'g'ri variant:",
        options: ["Это мой брат", "Это моя брат", "Это моё брат"],
        correctAnswer: "Это мой брат",
      },
      {
        id: 9,
        question: "\"Sizning uyingiz\" (\"дом\" - erkak jins) - to'g'ri variant:",
        options: ["Ваш дом", "Ваша дом", "Ваше дом"],
        correctAnswer: "Ваш дом",
      },
      {
        id: 10,
        question: "Egalik olmoshlari nimaga qarab o'zgaradi?",
        options: ["Otning jinsiga", "Gapiruvchining yoshiga", "Vaqtga"],
        correctAnswer: "Otning jinsiga",
      },
    ],
  },
];