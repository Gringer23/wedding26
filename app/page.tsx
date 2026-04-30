import Link from 'next/link';

export default function HomePage() {
  return (
      <main className="min-h-screen bg-[#f8efe7] flex items-center justify-center px-4">
        <div className="max-w-xl text-center bg-white/70 backdrop-blur rounded-[32px] p-10 shadow-xl border border-white">
          <p className="text-sm tracking-[0.4em] uppercase text-stone-500 mb-6">
            Wedding invitation
          </p>

          <h1 className="text-5xl md:text-7xl font-serif text-stone-800 mb-6">
            Александр & Дарья
          </h1>

          <p className="text-xl text-stone-600 mb-4">
            28 августа 2026
          </p>

          <p className="text-stone-600 leading-7 mb-8">
            Мы будем рады разделить с вами один из самых важных дней нашей жизни.
          </p>

          <Link
              href="/i/ivan-petrov"
              className="inline-flex items-center justify-center rounded-full bg-stone-800 text-white px-8 py-4 hover:bg-stone-700 transition"
          >
            Посмотреть пример приглашения
          </Link>
        </div>
      </main>
  );
}