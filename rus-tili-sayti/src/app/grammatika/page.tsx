import Link from "next/link";
import Header from "../components/Header";
import { grammarTopics } from "../data/grammar";

export default function GrammatikaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          Grammatika
        </h1>

        <div className="flex flex-col gap-4">
          {grammarTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/grammatika/${topic.slug}`}
              className="bg-white rounded-xl shadow p-6 hover:shadow-md transition block"
            >
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                {topic.title}
              </h2>
              <p className="text-gray-500 text-sm">{topic.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}