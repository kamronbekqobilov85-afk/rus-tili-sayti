// Daraja imtihoni savollari — FAQAT SERVERDA ishlatiladi (to'g'ri javoblar shu yerda).
//
// MUHIM: bu ro'yxat QASDDAN o'zgarmas. Savollar, ularning tartibi va variantlar
// tartibi har safar bir xil bo'ladi va egasi aytmaguncha YANGILANMAYDI. Savol
// qo'shsangiz/o'zgartirsangiz, avval topshirgan foydalanuvchilarning natijalari
// (bazada saqlangan daraja va ball) o'zgarmaydi, lekin yangi topshirganlar bilan
// taqqoslash adolatli bo'lmay qoladi.
//
// Tuzilishi: 6 pog'ona (A1..C2) × 5 savol, oddiydan qiyinga. Variantlar bir-biriga
// ataylab o'xshash qilib tanlangan.

export type ExamQuestion = {
  tier: number; // 0..5
  instruction: string;
  text: string;
  options: [string, string, string, string];
  correct: number;
};

const W = "So'zning tarjimasini toping:";
const S = "Gapning tarjimasini toping:";
const F = "Bo'sh joyga to'g'ri shaklni qo'ying:";
const C = "To'g'ri variantni tanlang:";

export const EXAM: ExamQuestion[] = [
  // ───── A1 ─────
  { tier: 0, instruction: W, text: "дом", options: ["xona", "uy", "hovli", "eshik"], correct: 1 },
  { tier: 0, instruction: W, text: "спасибо", options: ["kechirasiz", "iltimos", "rahmat", "xayr"], correct: 2 },
  { tier: 0, instruction: S, text: "Как тебя зовут?", options: ["Yoshing nechada?", "Isming nima?", "Qayerdansan?", "Nima ish qilasan?"], correct: 1 },
  { tier: 0, instruction: W, text: "брат", options: ["opa yoki singil", "amaki", "o'g'il", "aka yoki uka"], correct: 3 },
  { tier: 0, instruction: S, text: "Я живу в Ташкенте.", options: ["Men Toshkentga boraman.", "Men Toshkentdan keldim.", "Men Toshkentda yashayman.", "Men Toshkentni yaxshi ko'raman."], correct: 2 },

  // ───── A2 ─────
  { tier: 1, instruction: W, text: "вчера", options: ["bugun", "kecha", "ertaga", "hozir"], correct: 1 },
  { tier: 1, instruction: W, text: "магазин", options: ["bozor", "dorixona", "kutubxona", "do'kon"], correct: 3 },
  { tier: 1, instruction: S, text: "Мне нужно купить хлеб.", options: ["Men non sotib olmoqchiman.", "Men non sotib oldim.", "Menga non sotib olish kerak.", "Men non sotib olmayman."], correct: 2 },
  { tier: 1, instruction: F, text: "Я иду в ___.", options: ["школа", "школу", "школе", "школы"], correct: 1 },
  { tier: 1, instruction: F, text: "Она ___ в Москве.", options: ["живу", "живут", "живёшь", "живёт"], correct: 3 },

  // ───── B1 ─────
  { tier: 2, instruction: W, text: "опаздывать", options: ["ulgurmoq", "shoshilmoq", "kechikmoq", "kutmoq"], correct: 2 },
  { tier: 2, instruction: S, text: "Я давно не видел тебя.", options: ["Men seni kecha ko'rmadim.", "Men seni anchadan beri ko'rmadim.", "Men seni hech qachon ko'rmaganman.", "Men seni hozirgina ko'rdim."], correct: 1 },
  { tier: 2, instruction: F, text: "Я интересуюсь ___.", options: ["музыка", "музыку", "музыке", "музыкой"], correct: 3 },
  { tier: 2, instruction: F, text: "Если бы я знал, я бы ___ тебе.", options: ["помогу", "помогаю", "помог", "помогать"], correct: 2 },
  { tier: 2, instruction: F, text: "Вчера я ___ эту книгу за один вечер.", options: ["читал", "читаю", "прочту", "прочитал"], correct: 3 },

  // ───── B2 ─────
  { tier: 3, instruction: S, text: "Несмотря на дождь, мы пошли гулять.", options: ["Yomg'ir tufayli sayrga chiqmadik.", "Yomg'ir yog'ishiga qaramay, sayrga chiqdik.", "Yomg'ir to'xtagach, sayrga chiqdik.", "Yomg'ir yog'sa, sayrga chiqamiz."], correct: 1 },
  { tier: 3, instruction: S, text: "Он сделал это вопреки моему совету.", options: ["U buni maslahatimga ko'ra qildi.", "U buni maslahatim tufayli qildi.", "U buni maslahatimdan keyin qildi.", "U buni maslahatimga qaramay qildi."], correct: 3 },
  { tier: 3, instruction: F, text: "Благодаря ___ друзей мы успели.", options: ["помощь", "помощи", "помощью", "о помощи"], correct: 1 },
  { tier: 3, instruction: F, text: "Я с ним ___ давно.", options: ["знаю", "знакомый", "знаком", "знакомлюсь"], correct: 2 },
  { tier: 3, instruction: F, text: "Вместо того чтобы ___, он пошёл гулять.", options: ["учился", "учиться", "учится", "учатся"], correct: 1 },

  // ───── C1 ─────
  { tier: 4, instruction: S, text: "Он слывёт честным человеком.", options: ["U halol odam bo'lishga intiladi.", "U halol odamga o'xshab ko'rinishni xohlaydi.", "U halol odam degan nom qozongan.", "U halol odam bo'lib qolgan."], correct: 2 },
  { tier: 4, instruction: F, text: "Дом, ___ мы живём, построен в 1950 году.", options: ["который", "в который", "котором", "в котором"], correct: 3 },
  { tier: 4, instruction: F, text: "Мы пришли к выводу, ___ проект нереален.", options: ["чтобы", "что", "как", "будто"], correct: 1 },
  { tier: 4, instruction: F, text: "Он не может свыкнуться ___ мыслью об отъезде.", options: ["к", "на", "с", "по"], correct: 2 },
  { tier: 4, instruction: F, text: "Принимая во ___ обстоятельства, суд смягчил наказание.", options: ["вниманием", "внимании", "внимания", "внимание"], correct: 3 },

  // ───── C2 ─────
  { tier: 5, instruction: C, text: "Это человек, ___ слову можно верить.", options: ["кому", "чьему", "чему", "которому"], correct: 1 },
  { tier: 5, instruction: F, text: "В комнате было пять ___.", options: ["человеков", "людей", "человек", "человека"], correct: 2 },
  { tier: 5, instruction: F, text: "Это комната, окна ___ выходят во двор.", options: ["которая", "которых", "чьи", "которой"], correct: 3 },
  { tier: 5, instruction: F, text: "Книга, ___ мной вчера, очень интересная.", options: ["читающая", "прочитанная", "прочитавшая", "читаемая"], correct: 1 },
  { tier: 5, instruction: F, text: "Едва он вошёл, ___ зазвонил телефон.", options: ["когда", "что", "как", "и"], correct: 2 },
];

// Natijani hisoblash: pog'onadan o'tish = kamida PASS_PER_TIER ta to'g'ri javob;
// daraja = pastdan boshlab ketma-ket o'tilgan pog'onalar soni;
// ball = Σ (to'g'ri javoblar × pog'ona raqami) — qiyinroq savol ko'proq ball beradi.
import { PASS_PER_TIER, PER_TIER, TIERS } from "./imtihonMeta";

export function gradeExam(answers: number[]) {
  const tierCorrect = TIERS.map(() => 0);
  let correct = 0;
  let score = 0;
  EXAM.forEach((q, i) => {
    if (answers[i] === q.correct) {
      tierCorrect[q.tier]++;
      correct++;
      score += q.tier + 1;
    }
  });
  let level = 0;
  for (const c of tierCorrect) {
    if (c >= PASS_PER_TIER) level++;
    else break;
  }
  const tiers = TIERS.map((t, i) => ({ code: t.code, name: t.name, correct: tierCorrect[i], total: PER_TIER }));
  return { correct, score, level, tiers };
}
