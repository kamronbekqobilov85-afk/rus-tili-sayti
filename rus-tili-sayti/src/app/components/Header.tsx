export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="text-xl sm:text-2xl font-bold text-blue-900 whitespace-nowrap">
          Rus tili
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-600 whitespace-nowrap">Bosh sahifa</a>
          <a href="/sozlar" className="hover:text-blue-600 whitespace-nowrap">So'zlar</a>
          <a href="/grammatika" className="hover:text-blue-600 whitespace-nowrap">Grammatika</a>
          <a href="/video" className="hover:text-blue-600 whitespace-nowrap">Video</a>
          <a href="/yozish" className="hover:text-blue-600 whitespace-nowrap">Yozish</a>
          <a href="/tinglash" className="hover:text-blue-600 whitespace-nowrap">Tinglash</a>
        </div>
      </nav>
    </header>
  );
}
