"use client";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import { card, pageShell, btnPrimary, btnSecondary } from "../components/ui";
import { LEVELS } from "../data/gaplarMeta";
import { getLevelGaps } from "../data/gaplar";
import { XP_PER_VOICE } from "../data/achievements";

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

type Stage = "idle" | "recording" | "recorded" | "sending" | "sent" | "error" | "no-mic" | "no-storage";

export default function GapirishPage() {
  const [phrase, setPhrase] = useState(() => randomPhrase());
  const [stage, setStage] = useState<Stage>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setStage("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStage("recording");
    } catch {
      setStage("no-mic");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const retry = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStage("idle");
  };

  const submit = async () => {
    if (!audioUrl) return;
    setStage("sending");
    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());
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

  const nextPhrase = () => {
    retry();
    setPhrase(randomPhrase());
    setStage("idle");
  };

  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:py-8">
        <PageHero
          icon="🎙️"
          title="Gapirish mashqi"
          desc="Gapni tinglang va o'zingiz talaffuz qilib yozib oling. Yozuvingizni faqat admin eshitadi."
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
                ⏹️
              </button>
            )}

            {stage === "no-mic" && (
              <p className="text-sm font-bold text-rose-600">
                Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering va qayta urining.
              </p>
            )}

            {(stage === "recorded" || stage === "sending" || stage === "error" || stage === "no-storage") &&
              audioUrl && (
              <div className="space-y-3">
                <audio src={audioUrl} controls className="mx-auto w-full" />
                <div className="flex justify-center gap-2">
                  <button onClick={retry} className={`${btnSecondary} px-4 py-2 text-sm`}>
                    Qayta yozish
                  </button>
                  <button
                    onClick={submit}
                    disabled={stage === "sending"}
                    className={`${btnPrimary} px-4 py-2 text-sm`}
                  >
                    {stage === "sending" ? "Yuborilmoqda..." : "Yuborish"}
                  </button>
                </div>
                {stage === "error" && (
                  <p className="text-sm font-bold text-rose-600">Yuborilmadi, qayta urinib ko'ring.</p>
                )}
                {stage === "no-storage" && (
                  <p className="text-sm font-bold text-rose-600">
                    Ovozli mashq hali sozlanmagan, birozdan keyin qayta urinib ko'ring.
                  </p>
                )}
              </div>
            )}

            {stage === "sent" && (
              <div>
                <p className="text-4xl">✅</p>
                <p className="mt-2 font-extrabold text-slate-800">Yuborildi!</p>
                <p className="text-sm text-emerald-600 font-bold">+{XP_PER_VOICE} ball</p>
                <button onClick={nextPhrase} className={`${btnPrimary} mt-4 px-5 py-2.5 text-sm`}>
                  Keyingi gap →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
