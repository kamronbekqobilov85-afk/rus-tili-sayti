// Sahifalar orasida o'tganda darhol ko'rinadigan yuklanish holati —
// server javobini kutib ekran "qotib" turmaydi.
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="h-[62px] border-b-2 border-gray-200 bg-white" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <div className="h-36 animate-pulse rounded-3xl bg-gradient-to-br from-emerald-200 to-sky-200" />
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
