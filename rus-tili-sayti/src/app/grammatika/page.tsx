import Link from "next/link";
import Header from "../components/Header";
import { grammarTopics } from "../data/grammar";

export default function GrammatikaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">
          Grammatika
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Mavzuni tanlang, darsni o'qing va testdan o'ting
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {grammarTopics.map((topic, i) => (
            <Link
              key={topic.id}
              href={`/grammatika/${topic.slug}`}
              className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 hover:shadow-lg hover:ring-blue-200 hover:-translate-y-0.5 transition-all duration-200 block"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-blue-900 mb-1.5 leading-snug">
                    {topic.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                    {topic.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600">
                    <span>{topic.exercises.length} ta mashq</span>
                    <span className="text-gray-300">•</span>
                    <span className="group-hover:underline">Boshlash →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}