"use client";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell, btnPrimary, btnSecondary } from "../components/ui";
import { LEVELS } from "../data/gaplarMeta";
import { getLevelGaps } from "../data/gaplar";

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // ovoz mavjud emas
  }
}

function randomPhrase(): { ru: string; uz: string } {
  const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
  const gaps = level ? getLevelGaps(level.level) : [];
  if (gaps.length === 0) return { ru: "Привет, как дела?", uz: "Salom, qalaysiz?" };
  const pick = gaps[Math.floor(Math.random() * gaps.length)];
  return { ru: pick.ru, uz: pick.uz };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// So'zlar mosligiga qarab o'xshashlik darajasi (0..1)
function similarity(said: string, target: string): number {
  const a = normalize(said).split(" ").filter(Boolean);
  const b = normalize(target).split(" ").filter(Boolean);
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const matched = a.filter((w) => setB.has(w)).length;
  return matched / Math.max(a.length, b.length);
}

const MATCH_THRESHOLD = 0.7;

type Stage = "idle" | "recording" | "checking" | "sending" | "sent" | "error" | "no-mic" | "no-storage";

export default function GapirishPage() {
  const [phrase, setPhrase] = useState(() => randomPhrase());
  const [stage, setStage] = useState<Stage>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [heard, setHeard] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef<string>("");
  const audioDoneRef = useRef(false);
  const speechDoneRef = useRef(false);

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    setSpeechSupported(!!SR);

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishRecording = () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    recordedBlobRef.current = blob;
    setAudioUrl(URL.createObjectURL(blob));

    const said = transcriptRef.current.trim();
    if (speechSupported) {
      setHeard(said);
      setCorrect(said ? similarity(said, phrase.ru) >= MATCH_THRESHOLD : false);
    }
    void uploadNow(blob);
  };

  const maybeFinish = () => {
    if (audioDoneRef.current && speechDoneRef.current && recordedBlobRef.current === null) {
      finishRecording();
    }
  };

  const uploadNow = async (blob: Blob) => {
    setStage("sending");
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      form.append("ru", phrase.ru);
      const res = await fetch("/api/voice", { method: "POST", body: form });
      if (res.status === 503) {
        setStage("no-storage");
        return;
      }
      if (!res.ok) throw new Error("fail");
      setStage("sent");
    } catch {
      setStage("error");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      recordedBlobRef.current = null;
      transcriptRef.current = "";
      audioDoneRef.current = false;
      speechDoneRef.current = !speechSupported;
      setHeard(null);
      setCorrect(null);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        audioDoneRef.current = true;
        setStage("checking");
        maybeFinish();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      const SR =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = "ru-RU";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (e) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          transcriptRef.current = text;
        };
        recognition.onerror = () => {
          speechDoneRef.current = true;
          maybeFinish();
        };
        recognition.onend = () => {
          speechDoneRef.current = true;
          maybeFinish();
        };
        recognitionRef.current = recognition;
        recognition.start();
      }

      setStage("recording");
    } catch {
      setStage("no-mic");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
  };

  const retrySend = () => {
    if (recordedBlobRef.current) void uploadNow(recordedBlobRef.current);
  };

  const recordAgain = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    recordedBlobRef.current = null;
    setHeard(null);
    setCorrect(null);
    setStage("idle");
  };

  const nextPhrase = () => {
    recordAgain();
    setPhrase(randomPhrase());
  };

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🎙️"
          title="Gapirish mashqi"
          desc="Gapni tinglang va o'zingiz talaffuz qilib ayting. Yozuvingizni faqat admin eshitadi."
        />

        <div className={`${card} mt-6 p-5`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => speak(phrase.ru)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-2xl text-white transition hover:bg-sky-400 active:translate-y-0.5 active:border-b-0"
              aria-label="Tinglash"
            >
              🔊
            </button>
            <div>
              <p className="text-xl font-extrabold text-slate-800 break-words">{phrase.ru}</p>
              <p className="text-sm text-slate-400">{phrase.uz}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            {stage === "idle" && (
              <button
                onClick={startRecording}
                className="flex h-20 w-20 items-center justify-center self-center rounded-full border-b-8 border-rose-700 bg-rose-500 text-4xl text-white shadow-lg transition active:translate-y-1 active:border-b-4"
                aria-label="Yozib olish"
              >
                🎙️
              </button>
            )}

            {stage === "recording" && (
              <button
                onClick={stopRecording}
                className="flex h-20 w-20 animate-pulse items-center justify-center self-center rounded-full border-b-8 border-rose-900 bg-rose-700 text-4xl text-white shadow-lg transition active:translate-y-1 active:border-b-4"
                aria-label="To'xtatish"
              >
                ⏸️
              </button>
            )}

            {stage === "checking" && (
              <p className="text-sm font-bold text-slate-400">Tekshirilmoqda...</p>
            )}

            {stage === "no-mic" && (
              <p className="text-sm font-bold text-rose-600">
                Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering va qayta urining.
              </p>
            )}

            {audioUrl && (stage === "sending" || stage === "sent" || stage === "error" || stage === "no-storage") && (
              <div className="space-y-3">
                {correct === true && (
                  <p className="rounded-xl bg-emerald-50 p-3 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                    ✅ To'g'ri talaffuz qildingiz!
                  </p>
                )}
                {correct === false && (
                  <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                    <p>❌ Talaffuzda xatolik bor.</p>
                    {heard && <p className="mt-1 font-normal">Siz aytdingiz: «{heard}»</p>}
                    <p className="mt-1 font-normal">
                      To'g'risi: <span className="font-bold">{phrase.ru}</span>
                    </p>
                  </div>
                )}

                <audio src={audioUrl} controls className="mx-auto w-full" />
                <p className="text-sm text-slate-500">
                  Gap: <span className="font-bold text-slate-700">{phrase.ru}</span> —{" "}
                  <span className="italic">{phrase.uz}</span>
                </p>

                {stage === "sending" && (
                  <p className="text-sm font-bold text-slate-400">Adminga yuborilmoqda...</p>
                )}

                {stage === "sent" && (
                  <div className="flex justify-center gap-2">
                    {correct === false && (
                      <button onClick={recordAgain} className={`${btnSecondary} px-4 py-2 text-sm`}>
                        Qayta urinish
                      </button>
                    )}
                    <button onClick={nextPhrase} className={`${btnPrimary} px-5 py-2.5 text-sm`}>
                      Keyingi gap →
                    </button>
                  </div>
                )}

                {stage === "error" && (
                  <div>
                    <p className="text-sm font-bold text-rose-600">Yuborilmadi, internetni tekshiring.</p>
                    <div className="mt-2 flex justify-center gap-2">
                      <button onClick={recordAgain} className={`${btnSecondary} px-4 py-2 text-sm`}>
                        Qayta yozish
                      </button>
                      <button onClick={retrySend} className={`${btnPrimary} px-4 py-2 text-sm`}>
                        Qayta yuborish
                      </button>
                    </div>
                  </div>
                )}

                {stage === "no-storage" && (
                  <p className="text-sm font-bold text-rose-600">
                    Ovozli mashq hali sozlanmagan, birozdan keyin qayta urinib ko'ring.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Brauzerning Web Speech API turi standart TS DOM kutubxonasida yo'q
type SpeechRecognitionResultLike = { 0: { transcript: string } };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
