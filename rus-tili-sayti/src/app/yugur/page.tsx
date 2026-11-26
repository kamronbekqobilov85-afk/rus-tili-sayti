import type { Metadata } from "next";
import Header from "../components/Header";
import RunnerGame from "../components/RunnerGame";
import { pageShell } from "../components/ui";

export const metadata: Metadata = {
  title: "Yugur va o'rgan — Rus tili",
  description: "Yuguring, to'siqlardan sakrab o'ting va eshiklarda ruscha so'z va gaplarning tarjimasini toping.",
};

export default function YugurPage() {
  return (
    <div className={pageShell}>
      <Header />
      <main className="mx-auto w-full flex-1 px-3 py-3 sm:py-6">
        <RunnerGame />
      </main>
    </div>
  );
}
