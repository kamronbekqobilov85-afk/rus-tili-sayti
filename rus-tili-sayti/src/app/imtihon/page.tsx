import type { Metadata } from "next";
import Header from "../components/Header";
import LevelExam from "../components/LevelExam";
import { pageShell } from "../components/ui";

export const metadata: Metadata = {
  title: "Daraja imtihoni — Rus tili",
  description: "Keling, rus tilida qanday darajada ekanligingizni sinaymiz! 30 ta savol, A1 dan C2 gacha, reytingda bellashing.",
};

export default function ImtihonPage() {
  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full flex-1 px-3 py-4 sm:py-6">
        <LevelExam />
      </main>
    </div>
  );
}
