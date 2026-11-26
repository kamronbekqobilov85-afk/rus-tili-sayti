// "Yugur va o'rgan" — 3 yo'lakli cheksiz yugurish o'yini (psevdo-3D, canvas).
// Bu fayl React'ga bog'liq emas: faqat canvas va hodisalar bilan ishlaydi.

export type Question = {
  kind: "word" | "gap";
  prompt: string; // ruscha so'z yoki gap
  hint?: string; // transkripsiya (faqat so'zlar uchun)
  options: string[];
  correct: number; // to'g'ri javob indeksi
  timeLimit: number; // soniya
};

export type WordItem = { id: number; russian: string; uzbek: string; transcription: string; category: string; level: string };
export type GapItem = { ru: string; uz: string };

export type Bank = {
  words: WordItem[];
  gaps: (level: number) => GapItem[];
};

export type Mistake = { prompt: string; correct: string };

export type RunResult = {
  distance: number;
  score: number;
  gates: number; // to'g'ri ochilgan eshiklar soni
  mistakes: Mistake[];
};

export type Hud = { score: number; lives: number; gates: number };

export type Callbacks = {
  onHud: (h: Hud) => void;
  onQuestion: (q: Question | null) => void;
  onReveal: (r: { chosen: number; correct: number } | null) => void;
  onOver: (r: RunResult) => void;
  onGateBar: (frac: number) => void; // keyingi eshikgacha (0..1)
  onAskBar: (frac: number) => void; // savol vaqti (1..0)
};

// ───────── Sozlamalar ─────────
const SPAWN_D = 56; // to'siqlar paydo bo'ladigan masofa
const FOCAL = 7; // perspektiva
const STOP_D = 4; // eshik oldida to'xtash masofasi
const BRAKE_D = 9;
const GATE_AFTER = 4.8; // oldingi eshikdan keyin shuncha soniya yugurilgach yangi eshik ko'rinadi (yetib kelgunicha ≈ 10 s)
const MAX_LIVES = 3;
const JUMP_V = 7.2;
const GRAVITY = 27;
const SLIDE_TIME = 0.62;
const LANE_W_FRAC = 0.3; // yo'lak kengligi (ekran kengligiga nisbatan, s=1 da)

type ObsType = "low" | "high" | "block";
type Obs = { lane: number; d: number; type: ObsType; hit: boolean };
type Scn = { side: number; d: number; off: number; kind: number; tone: number };
type Part = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Gate = {
  d: number;
  open: number; // 0 yopiq .. 1 ochiq
  state: "coming" | "ask" | "reveal" | "passed";
  result: "none" | "ok" | "bad";
  label: string;
};

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Engine = {
  answer: (index: number) => void;
  input: (cmd: "left" | "right" | "jump" | "slide") => void;
  resize: () => void;
  setPaused: (p: boolean) => void;
  destroy: () => void;
};

export function createEngine(canvas: HTMLCanvasElement, bank: Bank, cb: Callbacks): Engine {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  let W = 300;
  let H = 400;
  let dpr = 1;
  let horizonY = 0;
  let playerY = 0;
  let laneW = 0;
  let bg: HTMLCanvasElement | null = null;
  let hazeGrad: CanvasGradient | null = null;

  // ───────── Holat ─────────
  let paused = false;
  let raf = 0;
  let last = 0;
  let time = 0;
  let runTime = 0;
  let distance = 0;
  let lives = MAX_LIVES;
  let gatesOk = 0; // to'g'ri javoblar
  let gatesSeen = 0; // uchragan eshiklar (qiyinlik shunga bog'liq)
  let phase: "run" | "over" = "run";
  let overT = 0;

  let laneTarget = 0;
  let px = 0; // yo'lak koordinatasi (uzluksiz)
  let jumpH = 0;
  let jumpV = 0;
  let airborne = false;
  let slideT = 0;
  let invT = 0;
  let shake = 0;
  let flash = 0; // qizil/yashil miltillash
  let flashColor = "255,60,60";
  let resumeT = 1; // to'xtagandan keyin tezlanish (0..1)

  let obs: Obs[] = [];
  let scn: Scn[] = [];
  let parts: Part[] = [];
  let gate: Gate | null = null;
  let gateTimer = 0;
  let sinceRow = 0;
  let rowGap = 8;
  let sinceScn = 0;
  const used = new Set<string>();
  const mistakes: Mistake[] = [];
  let curQ: Question | null = null;
  let askT = 0;
  let revealT = 0;
  let lastHud = "";

  const clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 0.22 + Math.random() * 0.1, y: rnd(0.05, 0.2), s: rnd(0.6, 1.3), v: rnd(0.004, 0.012) }));

  // ───────── Geometriya ─────────
  const proj = (d: number) => FOCAL / (FOCAL + d);
  const Y = (s: number) => horizonY + (playerY - horizonY) * s;

  function buildBackground() {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.floor(W * dpr));
    c.height = Math.max(1, Math.floor(H * dpr));
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    // osmon
    const sky = g.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, "#4aa8ff");
    sky.addColorStop(1, "#cdeeff");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, horizonY + 1);
    // quyosh
    const sunX = W * 0.76;
    const sunY = horizonY * 0.55;
    const sg = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.22);
    sg.addColorStop(0, "rgba(255,244,190,1)");
    sg.addColorStop(0.25, "rgba(255,236,150,.9)");
    sg.addColorStop(1, "rgba(255,236,150,0)");
    g.fillStyle = sg;
    g.fillRect(0, 0, W, horizonY);
    g.fillStyle = "#fff6c8";
    g.beginPath();
    g.arc(sunX, sunY, W * 0.05, 0, Math.PI * 2);
    g.fill();
    // uzoq tog'lar
    g.fillStyle = "#8fb8d9";
    g.beginPath();
    g.moveTo(0, horizonY);
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * W;
      const h = (Math.sin(i * 1.7) * 0.5 + 0.7) * horizonY * 0.28;
      g.lineTo(x, horizonY - h);
    }
    g.lineTo(W, horizonY);
    g.closePath();
    g.fill();
    g.fillStyle = "#6fa2cf";
    g.beginPath();
    g.moveTo(0, horizonY);
    for (let i = 0; i <= 9; i++) {
      const x = (i / 9) * W;
      const h = (Math.cos(i * 2.3 + 1) * 0.5 + 0.6) * horizonY * 0.17;
      g.lineTo(x, horizonY - h);
    }
    g.lineTo(W, horizonY);
    g.closePath();
    g.fill();
    // maysazor
    const gr = g.createLinearGradient(0, horizonY, 0, H);
    gr.addColorStop(0, "#7ccf6a");
    gr.addColorStop(1, "#3f9f4a");
    g.fillStyle = gr;
    g.fillRect(0, horizonY, W, H - horizonY);
    bg = c;

    hazeGrad = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + H * 0.16);
    hazeGrad.addColorStop(0, "rgba(205,238,255,.95)");
    hazeGrad.addColorStop(1, "rgba(205,238,255,0)");
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(200, Math.round(r.width));
    H = Math.max(200, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizonY = H * 0.3;
    playerY = H * 0.87;
    laneW = W * LANE_W_FRAC;
    buildBackground();
  }

  // ───────── Savollar ─────────
  function makeQuestion(): Question {
    const g = gatesSeen; // 1 dan boshlanadi
    const stage = g <= 3 ? 0 : g <= 6 ? 1 : 2;

    if (stage < 2) {
      const pool = bank.words.filter((w) => (stage === 0 ? w.level === "boshlang'ich" : true) && !used.has("w" + w.id));
      const w = pickOne(pool.length ? pool : bank.words);
      used.add("w" + w.id);
      const n = stage === 0 ? 3 : 4;
      const same = shuffle(bank.words.filter((x) => x.category === w.category && x.uzbek !== w.uzbek));
      const rest = shuffle(bank.words.filter((x) => x.uzbek !== w.uzbek));
      const wrong: string[] = [];
      for (const x of [...same, ...rest]) {
        if (wrong.length >= n - 1) break;
        if (!wrong.includes(x.uzbek) && x.uzbek !== w.uzbek) wrong.push(x.uzbek);
      }
      const options = shuffle([w.uzbek, ...wrong]);
      const timeLimit = stage === 0 ? Math.max(7, 9.5 - g * 0.8) : Math.max(5.5, 7.5 - (g - 4) * 0.7);
      return { kind: "word", prompt: w.russian, hint: w.transcription, options, correct: options.indexOf(w.uzbek), timeLimit };
    }

    // Oxirgi bosqich: gaplar, vaqt biroz ko'proq
    const step = g - 7;
    const level = Math.min(25, 1 + Math.floor(step * 1.5));
    let list = bank.gaps(level);
    if (list.length < 8) list = bank.gaps(1);
    const cand = list.filter((x) => !used.has("g" + x.ru));
    const gap = pickOne(cand.length ? cand : list);
    used.add("g" + gap.ru);
    const wrong: string[] = [];
    for (const x of shuffle(list)) {
      if (wrong.length >= 3) break;
      if (x.uz !== gap.uz && !wrong.includes(x.uz)) wrong.push(x.uz);
    }
    const options = shuffle([gap.uz, ...wrong]);
    const timeLimit = 13 + Math.min(6, step * 0.7);
    return { kind: "gap", prompt: gap.ru, options, correct: options.indexOf(gap.uz), timeLimit };
  }

  // ───────── Spawn ─────────
  function spawnRow(depth: number) {
    const g = gatesOk;
    const lanes = shuffle([-1, 0, 1]);
    const two = Math.random() < Math.min(0.55, 0.12 + g * 0.06) && g >= 1;
    const count = two ? 2 : 1;
    const wBlock = 0.28 + Math.min(0.12, g * 0.015);
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const type: ObsType = r < wBlock ? "block" : r < wBlock + (1 - wBlock) / 2 ? "low" : "high";
      obs.push({ lane: lanes[i], d: depth, type, hit: false });
    }
  }

  function spawnScenery(depth: number) {
    const side = Math.random() < 0.5 ? -1 : 1;
    scn.push({ side, d: depth, off: rnd(2.3, 5.5), kind: Math.floor(rnd(0, 4)), tone: Math.random() });
  }

  function baseSpeed() {
    return 9 + Math.min(9.5, gatesSeen * 0.85 + runTime * 0.03);
  }

  // ───────── Boshqaruv ─────────
  function input(cmd: "left" | "right" | "jump" | "slide") {
    if (phase !== "run" || paused) return;
    if (gate && (gate.state === "ask" || gate.state === "reveal")) return;
    if (cmd === "left") laneTarget = Math.max(-1, laneTarget - 1);
    else if (cmd === "right") laneTarget = Math.min(1, laneTarget + 1);
    else if (cmd === "jump") {
      if (!airborne) {
        airborne = true;
        jumpV = JUMP_V;
        slideT = 0;
      }
    } else if (cmd === "slide") {
      if (airborne) jumpV = Math.min(jumpV, -14); // tez tushish
      else slideT = SLIDE_TIME;
    }
  }

  function burst(x: number, y: number, colors: string[], n: number, power: number) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      const v = rnd(0.3, 1) * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.5, life: rnd(0.5, 1), color: pickOne(colors), size: rnd(3, 6) });
    }
  }

  function vibrate(ms: number) {
    try {
      navigator.vibrate?.(ms);
    } catch {
      // qo'llab-quvvatlanmaydi
    }
  }

  function loseLife(why: "obstacle" | "wrong") {
    lives = Math.max(0, lives - 1);
    shake = 0.35;
    flash = 0.45;
    flashColor = "255,60,60";
    vibrate(why === "obstacle" ? 90 : 60);
    if (why === "obstacle") {
      invT = 1.5;
      resumeT = 0.35;
      burst(W / 2 + px * laneW, playerY - laneW * 0.5, ["#ffd34d", "#ff7a59", "#ffffff"], 14, 160);
    }
    if (lives <= 0) die();
    emitHud(true);
  }

  function die() {
    if (phase === "over") return;
    phase = "over";
    overT = 0;
    if (curQ) {
      curQ = null;
      cb.onQuestion(null);
      cb.onReveal(null);
    }
    cb.onOver({ distance: Math.floor(distance), score: score(), gates: gatesOk, mistakes: [...mistakes] });
  }

  function score() {
    return Math.floor(distance) + gatesOk * 50;
  }

  function emitHud(force = false) {
    const h: Hud = { score: score(), lives, gates: gatesOk };
    const key = `${h.score}|${h.lives}|${h.gates}`;
    if (force || key !== lastHud) {
      lastHud = key;
      cb.onHud(h);
    }
  }

  function answer(index: number) {
    if (!gate || gate.state !== "ask" || !curQ) return;
    const q = curQ;
    const ok = index === q.correct;
    gate.state = "reveal";
    revealT = 0;
    if (ok) {
      gatesOk++;
      gate.result = "ok";
      flash = 0.35;
      flashColor = "80,220,120";
      burst(W / 2, Y(proj(gate.d)) - laneW * proj(gate.d) * 1.3, ["#ffd34d", "#5de08a", "#6ec1ff", "#ff8fd0"], 30, 220);
      vibrate(25);
    } else {
      gate.result = "bad";
      mistakes.push({ prompt: q.prompt, correct: q.options[q.correct] });
      cb.onReveal({ chosen: index, correct: q.correct });
      loseLife("wrong");
      emitHud(true);
      return;
    }
    cb.onReveal({ chosen: index, correct: q.correct });
    emitHud(true);
  }

  // ───────── Yangilash ─────────
  function update(dt: number) {
    time += dt;

    if (phase === "over") {
      overT += dt;
      shake = Math.max(0, shake - dt);
      flash = Math.max(0, flash - dt);
      updateParts(dt);
      return;
    }

    // Tezlik: eshikka yaqinlashganda sekinlashadi, savoldan keyin qayta tezlashadi
    let mult = 1;
    if (gate) {
      if (gate.state === "coming") {
        const dist = gate.d - STOP_D;
        mult = Math.min(1, Math.max(0.16, dist / BRAKE_D));
      } else if (gate.state === "ask" || gate.state === "reveal") {
        mult = 0;
      }
    }
    resumeT = Math.min(1, resumeT + dt / 0.9);
    const resumeEase = resumeT * resumeT * (3 - 2 * resumeT);
    const v = baseSpeed() * mult * (gate && gate.state === "coming" ? 1 : resumeEase);
    const dz = v * dt;

    if (mult > 0) {
      distance += dz;
      runTime += dt * (mult > 0.5 ? 1 : 0);
    }

    for (const o of obs) o.d -= dz;
    for (const s of scn) s.d -= dz;
    if (gate) gate.d -= dz;

    // O'yinchi
    px += (laneTarget - px) * Math.min(1, dt * 15);
    if (airborne) {
      jumpV -= GRAVITY * dt;
      jumpH += jumpV * dt;
      if (jumpH <= 0) {
        jumpH = 0;
        airborne = false;
        jumpV = 0;
      }
    }
    if (slideT > 0) slideT = Math.max(0, slideT - dt);
    if (invT > 0) invT -= dt;
    shake = Math.max(0, shake - dt);
    flash = Math.max(0, flash - dt);

    // To'qnashuv
    if (invT <= 0) {
      for (const o of obs) {
        // dz — shu kadrda bosib o'tilgan masofa (past FPS'da to'siq "sakrab" o'tib ketmasligi uchun)
        if (o.hit || o.d > 0.42 || o.d + dz < -0.42) continue;
        if (Math.abs(o.lane - px) > 0.62) continue;
        let hit = false;
        if (o.type === "block") hit = true;
        else if (o.type === "low") hit = jumpH < 0.4;
        else hit = slideT <= 0;
        if (hit) {
          o.hit = true;
          loseLife("obstacle");
          break;
        }
      }
    }

    // Tozalash
    if (obs.length && obs[0].d < -4) obs = obs.filter((o) => o.d > -4);
    if (scn.length && scn[0].d < -5) scn = scn.filter((s) => s.d > -5);

    // Sahna elementlari
    sinceScn += dz;
    while (sinceScn > 2.4) {
      sinceScn -= 2.4;
      spawnScenery(SPAWN_D + 2);
    }

    // To'siq qatorlari
    sinceRow += dz;
    if (sinceRow >= rowGap) {
      const depth = gate ? Math.max(SPAWN_D, gate.d + 13) : SPAWN_D;
      sinceRow = 0;
      spawnRow(depth);
      const gapTime = Math.max(0.78, 1.3 - gatesSeen * 0.04) + Math.random() * 0.55;
      rowGap = Math.max(5.5, baseSpeed() * gapTime);
    }

    // Eshik
    if (!gate) {
      if (mult > 0.5) gateTimer += dt;
      if (gateTimer >= GATE_AFTER) {
        gateTimer = 0;
        gatesSeen++;
        const d = Math.max(SPAWN_D, obs.reduce((m, o) => Math.max(m, o.d), 0) + 10);
        gate = { d, open: 0, state: "coming", result: "none", label: "?" };
        // eshikdan keyingi qator shu eshikdan kamida 13 birlik uzoqda paydo bo'ladi
        sinceRow = 0;
      }
    } else {
      if (gate.state === "coming" && gate.d - STOP_D < 0.06) {
        gate.d = STOP_D;
        gate.state = "ask";
        curQ = makeQuestion();
        gate.label = curQ.kind === "word" ? curQ.prompt : "🔒";
        askT = 0;
        cb.onReveal(null);
        cb.onQuestion(curQ);
      } else if (gate.state === "ask" && curQ) {
        askT += dt;
        cb.onAskBar(Math.max(0, 1 - askT / curQ.timeLimit));
        if (askT >= curQ.timeLimit) answer(-1);
      } else if (gate.state === "reveal") {
        revealT += dt;
        // ochilish animatsiyasi: javob ko'rsatilgach (0.9 s) eshik ochiladi
        if (revealT > 0.9) gate.open = Math.min(1, gate.open + dt * 2.2);
        if (revealT > 1.4 && curQ) {
          curQ = null;
          cb.onQuestion(null);
          cb.onReveal(null);
          resumeT = 0;
          gate.state = "passed";
        }
      }
      if (gate.state === "passed" || gate.state === "coming") {
        if (gate.state === "passed") gate.open = Math.min(1, gate.open + dt * 2.2);
        if (gate.d < -4) {
          gate = null;
          gateTimer = 0;
          sinceRow = 0;
        }
      }
    }
    if (!gate || gate.state === "coming") cb.onGateBar(gate ? 1 : Math.min(1, gateTimer / GATE_AFTER));

    updateParts(dt);
    emitHud();
  }

  function updateParts(dt: number) {
    for (const p of parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.life -= dt;
    }
    if (parts.length) parts = parts.filter((p) => p.life > 0);
  }

  // ───────── Chizish ─────────
  function quad(d0: number, d1: number, a: number, b: number, color: string) {
    const s0 = proj(d0);
    const s1 = proj(d1);
    const y0 = Y(s0);
    const y1 = Y(s1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(W / 2 + a * laneW * s0, y0);
    ctx.lineTo(W / 2 + b * laneW * s0, y0);
    ctx.lineTo(W / 2 + b * laneW * s1, y1);
    ctx.lineTo(W / 2 + a * laneW * s1, y1);
    ctx.closePath();
    ctx.fill();
  }

  function drawRoad() {
    const BAND = 3;
    const off = distance % (BAND * 2);
    // asosiy yo'l
    quad(-4, 400, -1.5, 1.5, "#3b4150");
    for (let i = -1; i < 22; i++) {
      const d0 = i * BAND * 2 - off;
      const d1 = d0 + BAND;
      if (d1 < -4) continue;
      quad(Math.max(d0, -4), d1, -1.5, 1.5, "#434a5b");
    }
    // chekka chiziqlar
    quad(-4, 400, -1.58, -1.5, "#e9edf5");
    quad(-4, 400, 1.5, 1.58, "#e9edf5");
    // yo'lak chiziqlari (uzuq)
    const DASH = 1.6;
    const o2 = distance % (DASH * 2);
    for (let i = -1; i < 20; i++) {
      const d0 = i * DASH * 2 - o2;
      const d1 = d0 + DASH;
      if (d1 < -4) continue;
      const a = Math.max(d0, -4);
      quad(a, d1, -0.52, -0.48, "rgba(255,255,255,.75)");
      quad(a, d1, 0.48, 0.52, "rgba(255,255,255,.75)");
    }
  }

  function shadow(x: number, y: number, rx: number, alpha = 0.28) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, rx * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawScenery(sc: Scn) {
    const s = proj(sc.d);
    if (s <= 0.03) return;
    const u = laneW * s;
    const x = W / 2 + sc.side * (1.6 + sc.off) * u;
    const y = Y(s);
    const fog = sc.d > 38 ? Math.max(0, (SPAWN_D + 2 - sc.d) / 20) : 1;
    ctx.globalAlpha = fog;
    shadow(x, y, u * 0.7, 0.18);
    if (sc.kind <= 1) {
      // daraxt
      ctx.fillStyle = "#7a5230";
      ctx.fillRect(x - u * 0.09, y - u * 0.9, u * 0.18, u * 0.9);
      ctx.fillStyle = sc.tone < 0.5 ? "#2f9e4f" : "#3fb35e";
      ctx.beginPath();
      ctx.arc(x, y - u * 1.35, u * 0.62, 0, Math.PI * 2);
      ctx.arc(x - u * 0.34, y - u * 1.05, u * 0.42, 0, Math.PI * 2);
      ctx.arc(x + u * 0.34, y - u * 1.05, u * 0.42, 0, Math.PI * 2);
      ctx.fill();
    } else if (sc.kind === 2) {
      // uycha
      const hh = u * (1.4 + sc.tone * 0.8);
      const ww = u * 1.5;
      ctx.fillStyle = ["#f2c879", "#e9a3a3", "#a9c7ee", "#bfe0a8"][Math.floor(sc.tone * 4) % 4];
      ctx.fillRect(x - ww / 2, y - hh, ww, hh);
      ctx.fillStyle = "#b8493a";
      ctx.beginPath();
      ctx.moveTo(x - ww * 0.62, y - hh);
      ctx.lineTo(x, y - hh - u * 0.6);
      ctx.lineTo(x + ww * 0.62, y - hh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.fillRect(x - ww * 0.3, y - hh * 0.75, ww * 0.22, hh * 0.22);
      ctx.fillRect(x + ww * 0.08, y - hh * 0.75, ww * 0.22, hh * 0.22);
    } else {
      // buta + gul
      ctx.fillStyle = "#2c8c45";
      ctx.beginPath();
      ctx.arc(x, y - u * 0.25, u * 0.4, 0, Math.PI * 2);
      ctx.arc(x + u * 0.35, y - u * 0.18, u * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ["#ff7a8a", "#ffd34d", "#ffffff"][Math.floor(sc.tone * 3) % 3];
      ctx.beginPath();
      ctx.arc(x - u * 0.1, y - u * 0.35, u * 0.07, 0, Math.PI * 2);
      ctx.arc(x + u * 0.32, y - u * 0.3, u * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawObs(o: Obs) {
    const s = proj(o.d);
    if (s <= 0.03) return;
    const u = laneW * s;
    const x = W / 2 + o.lane * u;
    const y = Y(s);
    ctx.globalAlpha = o.d > 38 ? Math.max(0, (SPAWN_D - o.d) / 18) : 1;
    shadow(x, y, u * 0.48);
    if (o.type === "low") {
      // past to'siq: sakrab o'tiladi
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(x - u * 0.4, y - u * 0.34, u * 0.08, u * 0.34);
      ctx.fillRect(x + u * 0.32, y - u * 0.34, u * 0.08, u * 0.34);
      const bw = u * 0.96;
      const bh = u * 0.2;
      const bx = x - bw / 2;
      const by = y - u * 0.38;
      ctx.fillStyle = "#fff";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#e5483b";
      for (let i = 0; i < 6; i += 2) ctx.fillRect(bx + (bw / 6) * i, by, bw / 6, bh);
      ctx.strokeStyle = "rgba(0,0,0,.25)";
      ctx.lineWidth = Math.max(1, u * 0.02);
      ctx.strokeRect(bx, by, bw, bh);
    } else if (o.type === "high") {
      // tepadagi to'siq: egilib o'tiladi
      ctx.fillStyle = "#5b6574";
      ctx.fillRect(x - u * 0.5, y - u * 1.3, u * 0.08, u * 1.3);
      ctx.fillRect(x + u * 0.42, y - u * 1.3, u * 0.08, u * 1.3);
      const bw = u * 1.0;
      const bh = u * 0.42;
      const bx = x - bw / 2;
      const by = y - u * 1.22;
      ctx.fillStyle = "#ffc933";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#1f2430";
      for (let i = 0; i < 8; i += 2) {
        ctx.beginPath();
        ctx.moveTo(bx + (bw / 8) * i, by + bh);
        ctx.lineTo(bx + (bw / 8) * (i + 1), by + bh);
        ctx.lineTo(bx + (bw / 8) * (i + 2), by);
        ctx.lineTo(bx + (bw / 8) * (i + 1), by);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(0,0,0,.3)";
      ctx.lineWidth = Math.max(1, u * 0.02);
      ctx.strokeRect(bx, by, bw, bh);
    } else {
      // yashik/devor: yo'lakni almashtirish kerak
      const bw = u * 0.94;
      const bh = u * 1.35;
      const bx = x - bw / 2;
      const by = y - bh;
      ctx.fillStyle = "#c9812e";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#e0a04e";
      ctx.fillRect(bx, by, bw, u * 0.14);
      ctx.strokeStyle = "#8a5517";
      ctx.lineWidth = Math.max(1.5, u * 0.05);
      ctx.strokeRect(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2, bw - ctx.lineWidth, bh - ctx.lineWidth);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + bw, by + bh);
      ctx.moveTo(bx + bw, by);
      ctx.lineTo(bx, by + bh);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawGate(g: Gate) {
    const s = proj(g.d);
    if (s <= 0.03) return;
    const u = laneW * s;
    const cx = W / 2;
    const y = Y(s);
    ctx.globalAlpha = g.d > 38 ? Math.max(0, (SPAWN_D + 10 - g.d) / 28) : 1;
    shadow(cx, y, u * 1.9, 0.22);

    const openW = u * 1.5;
    const doorH = u * 2.05;
    // eshik panellari (ostida)
    const pw = openW * (1 - g.open);
    const tone = g.result === "ok" ? "#4caf6a" : g.result === "bad" ? "#c9524a" : "#8b5e34";
    ctx.fillStyle = "#14181f";
    ctx.fillRect(cx - openW, y - doorH, openW * 2, doorH);
    if (pw > 1) {
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? cx - openW : cx + openW - pw;
        ctx.fillStyle = tone;
        ctx.fillRect(x0, y - doorH, pw, doorH);
        ctx.strokeStyle = "rgba(0,0,0,.28)";
        ctx.lineWidth = Math.max(1, u * 0.025);
        for (let i = 1; i < 4; i++) {
          const yy = y - doorH + (doorH / 4) * i;
          ctx.beginPath();
          ctx.moveTo(x0, yy);
          ctx.lineTo(x0 + pw, yy);
          ctx.stroke();
        }
        ctx.fillStyle = "#cfd6e2";
        const hx = side < 0 ? x0 + pw - u * 0.14 : x0 + u * 0.06;
        ctx.fillRect(hx, y - doorH * 0.5, u * 0.08, u * 0.3);
      }
      if (g.open < 0.3) {
        // qulf
        ctx.fillStyle = "#ffcf3d";
        ctx.fillRect(cx - u * 0.13, y - doorH * 0.5 - u * 0.05, u * 0.26, u * 0.22);
        ctx.strokeStyle = "#ffcf3d";
        ctx.lineWidth = u * 0.05;
        ctx.beginPath();
        ctx.arc(cx, y - doorH * 0.5 - u * 0.05, u * 0.09, Math.PI, 0);
        ctx.stroke();
      }
    }
    // ustunlar
    const pillarW = u * 0.34;
    ctx.fillStyle = "#e9eef7";
    ctx.fillRect(cx - openW - pillarW, y - u * 2.55, pillarW, u * 2.55);
    ctx.fillRect(cx + openW, y - u * 2.55, pillarW, u * 2.55);
    ctx.fillStyle = "#c3cbd9";
    ctx.fillRect(cx - openW - pillarW, y - u * 2.55, pillarW * 0.3, u * 2.55);
    ctx.fillRect(cx + openW, y - u * 2.55, pillarW * 0.3, u * 2.55);
    // to'sin + lavha
    const bx = cx - openW - pillarW * 1.2;
    const bw = (openW + pillarW * 1.2) * 2;
    ctx.fillStyle = "#2b3a67";
    ctx.fillRect(bx, y - u * 2.62, bw, u * 0.58);
    ctx.fillStyle = "#ffcf3d";
    ctx.fillRect(bx, y - u * 2.05, bw, u * 0.05);
    ctx.fillStyle = "#fff";
    ctx.font = `800 ${Math.max(8, u * 0.36)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(g.label, cx, y - u * 2.33, bw * 0.9);
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    if (invT > 0 && Math.floor(time * 14) % 2 === 0) return;
    const u = laneW;
    const x = W / 2 + px * laneW;
    const gy = playerY;
    shadow(x, gy + u * 0.02, u * (0.34 - Math.min(0.15, jumpH * 0.1)), 0.3);

    const sliding = slideT > 0 && !airborne;
    const run = distance * 1.7;
    const swing = Math.sin(run) * (airborne ? 0.15 : 0.7);
    const bob = airborne || sliding ? 0 : Math.abs(Math.sin(run)) * u * 0.05;
    const base = gy - jumpH * u - bob;

    ctx.save();
    ctx.translate(x, base);
    if (sliding) ctx.scale(1.12, 0.52);

    const legH = u * 0.36;
    const hipY = -legH;
    // oyoqlar
    for (const side of [-1, 1]) {
      const a = airborne ? 0.5 * side : swing * side;
      ctx.save();
      ctx.translate(side * u * 0.075, hipY);
      ctx.rotate(a * 0.9);
      ctx.fillStyle = "#2b3a67";
      ctx.fillRect(-u * 0.06, 0, u * 0.12, legH * 0.9);
      ctx.fillStyle = "#ff7a3d";
      ctx.fillRect(-u * 0.075, legH * 0.78, u * 0.15, legH * 0.22);
      ctx.restore();
    }
    // yelka xalta
    const torsoH = u * 0.38;
    const torsoY = hipY - torsoH;
    ctx.fillStyle = "#ffb938";
    ctx.beginPath();
    ctx.roundRect(-u * 0.2, torsoY + u * 0.02, u * 0.4, torsoH * 0.9, u * 0.07);
    ctx.fill();
    // ko'ylak
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(-u * 0.17, torsoY, u * 0.34, torsoH, u * 0.08);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.fillRect(-u * 0.17, torsoY + torsoH * 0.5, u * 0.34, u * 0.04);
    // qo'llar
    for (const side of [-1, 1]) {
      const a = airborne ? -2.6 * side * 0.5 - 0.5 * side : -swing * side * 1.1;
      ctx.save();
      ctx.translate(side * u * 0.19, torsoY + u * 0.07);
      ctx.rotate(a * 0.9);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-u * 0.05, 0, u * 0.1, u * 0.2);
      ctx.fillStyle = "#f2b48a";
      ctx.beginPath();
      ctx.arc(0, u * 0.22, u * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // bosh (orqadan: soch + kepka)
    const headR = u * 0.15;
    const headY = torsoY - headR * 0.85;
    ctx.fillStyle = "#f2b48a";
    ctx.fillRect(-u * 0.04, torsoY - u * 0.04, u * 0.08, u * 0.06);
    ctx.fillStyle = "#4a2f1d";
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5483b";
    ctx.beginPath();
    ctx.arc(0, headY - headR * 0.1, headR * 1.02, Math.PI * 1.02, Math.PI * 1.98);
    ctx.fill();
    ctx.fillRect(-headR * 1.02, headY - headR * 0.12, headR * 2.04, headR * 0.28);
    ctx.restore();
  }

  function drawClouds() {
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (const c of clouds) {
      const x = ((c.x + time * c.v) % 1.3) * W - W * 0.15;
      const y = c.y * H;
      const r = W * 0.045 * c.s;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.arc(x + r * 1.1, y + r * 0.2, r * 0.85, 0, Math.PI * 2);
      ctx.arc(x - r * 1.1, y + r * 0.25, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sx = shake > 0 ? rnd(-1, 1) * shake * 14 : 0;
    const sy = shake > 0 ? rnd(-1, 1) * shake * 10 : 0;
    ctx.save();
    ctx.translate(sx, sy);
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    drawClouds();
    drawRoad();
    if (hazeGrad) {
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, horizonY - 2, W, H * 0.16 + 2);
    }

    // Sahna (uzoqdan yaqinga)
    for (let i = scn.length - 1; i >= 0; i--) drawScenery(scn[i]);

    // To'siqlar va eshik: uzoqdan yaqinga; o'yinchidan keyin chiziladi qolganlari
    const far: Obs[] = [];
    const near: Obs[] = [];
    for (const o of obs) (o.d > 0 ? far : near).push(o);
    far.sort((a, b) => b.d - a.d);
    // eshikdan uzoqdagi to'siqlar eshik orqasida, yaqinlari uning oldida chiziladi
    let gateDrawn = !gate || gate.d <= 0;
    for (const o of far) {
      if (!gateDrawn && gate && o.d <= gate.d) {
        drawGate(gate);
        gateDrawn = true;
      }
      drawObs(o);
    }
    if (!gateDrawn && gate) drawGate(gate);
    drawPlayer();
    for (const o of near) drawObs(o);
    if (gate && gate.d <= 0) drawGate(gate);

    // Zarrachalar
    for (const p of parts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (flash > 0) {
      ctx.fillStyle = `rgba(${flashColor},${Math.min(0.4, flash * 0.9)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ───────── Tsikl ─────────
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (paused) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    if (phase === "over" && overT > 0.7) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  // ───────── Boshlash ─────────
  resize();
  for (let d = 4; d < SPAWN_D; d += 2.4) spawnScenery(d);
  rowGap = 14;
  sinceRow = 0;
  emitHud(true);
  cb.onGateBar(0);
  last = performance.now();
  raf = requestAnimationFrame(frame);

  return {
    answer,
    input,
    resize: () => {
      resize();
      if (phase === "over" || paused) draw();
    },
    setPaused: (p: boolean) => {
      paused = p;
    },
    destroy: () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
