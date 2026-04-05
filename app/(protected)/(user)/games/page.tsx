import Link from "next/link";

const buttonClassName =
  "block rounded-[22px] border border-cyan-400/20 bg-[linear-gradient(180deg,#2fd4ff,#22b4ef)] px-6 py-5 text-[color:#0a4e9f] shadow-[0_8px_0_0_rgba(15,90,200,0.24)] transition hover:translate-y-[-1px]";

export default function GamesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-[#d5d0ff] p-6 lg:p-8">
        <h1 className="text-center text-3xl font-semibold text-[#153b8e]">Choose Match Type</h1>
        <p className="mt-2 text-center text-sm text-[#3f4b80]">
          Queue for ranked, create private, or jump into online matchmaking.
        </p>

        <div className="mt-8 space-y-4">
          <Link href="/games/online" className={buttonClassName}>
            <span className="flex items-center gap-3 text-2xl font-semibold">
              <span>🌍</span>
              <span>Create Public Match</span>
            </span>
          </Link>

          <Link href="/games/online" className={buttonClassName}>
            <span className="flex items-center gap-3 text-2xl font-semibold">
              <span>🙂</span>
              <span>Create Private Match</span>
            </span>
          </Link>

          <Link href="/games/online" className={buttonClassName}>
            <span className="flex items-center gap-3 text-2xl font-semibold">
              <span>⚔️</span>
              <span>Find Match</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
