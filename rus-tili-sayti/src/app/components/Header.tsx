export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-blue-900">
          Rus tili
        </div>
        <div className="flex gap-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-600">
            Bosh sahifa
          </a>
          <a href="/sozlar" className="hover:text-blue-600">
            So'zlar
          </a>
          <a href="/grammatika" className="hover:text-blue-600">
            Grammatika
          </a>
          <a href="/video" className="hover:text-blue-600">
            Video
          </a>
        </div>
      </nav>
    </header>
  );
}