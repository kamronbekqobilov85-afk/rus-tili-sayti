// Barcha sahifalarda bir xil ko'rinish uchun umumiy klasslar

export const pageShell = "flex min-h-screen flex-col bg-slate-50";

export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";

const btnBase =
  "rounded-xl border-b-4 px-6 py-3 text-center font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 disabled:active:border-b-4";

export const btnPrimary = `${btnBase} border-emerald-700 bg-emerald-500 text-white hover:bg-emerald-400`;

export const btnSecondary = `${btnBase} border border-b-4 border-slate-300 bg-white text-slate-600 hover:bg-slate-50`;

export const btnDanger = `${btnBase} border-rose-700 bg-rose-500 text-white hover:bg-rose-400`;
