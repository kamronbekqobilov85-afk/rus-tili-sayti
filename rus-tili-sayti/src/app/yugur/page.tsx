import type { Metadata } from "next";
import Header from "../components/Header";
import RunnerGame from "../components/RunnerGame";
import { pageShell } from "../components/ui";

export const metadata: Metadata = {
  title: "So'z Poygasi — Rus tili",
  description: "So'z Poygasi: yuguring, to'siqlardan o'ting, eshiklarda ruscha so'z va gaplarni tarjima qiling va reytingda hamma bilan bellashing.",
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
