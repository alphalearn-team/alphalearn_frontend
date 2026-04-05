import Link from "next/link";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

const modeCardClassName =
  "group block rounded-[28px] border border-white/10 bg-black/20 p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:translate-y-0";

export default function GamesPage() {
  const isRankedVisible = resolveRankedVisibility();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      <section className={`rounded-[32px] p-6 lg:p-8 ${sectionCardClassName}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Choose game mode
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Play Imposter: Online or Offline
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Pick online multiplayer for real-time lobby gameplay, or offline mode for same-device
          pass-and-play.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Link
            href="/games/online"
            className={modeCardClassName}
            aria-label="Open online multiplayer lobby mode"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Online
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              Multiplayer Lobby
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Create or join a lobby and play in real-time with authoritative server state.
            </p>
            <p className="mt-5 text-sm font-semibold text-[var(--color-primary)] group-hover:underline">
              Go to online mode
            </p>
          </Link>

          <Link
            href="/games/offline"
            className={modeCardClassName}
            aria-label="Open offline pass-and-play mode"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Offline
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              Pass-and-Play
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Start a local match on one device with private reveals and shared drawing turns.
            </p>
            <p className="mt-5 text-sm font-semibold text-[var(--color-primary)] group-hover:underline">
              Go to offline mode
            </p>
          </Link>
        </div>

        {isRankedVisible ? (
          <div className="mt-5">
            <Link
              href="/games/online?ranked=1"
              className={modeCardClassName}
              aria-label="Open ranked matchmaking entry"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Ranked
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                Find Ranked Match
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Queue into monthly ranked matchmaking from the online lobby screen.
              </p>
              <p className="mt-5 text-sm font-semibold text-[var(--color-primary)] group-hover:underline">
                Open ranked queue
              </p>
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function resolveRankedVisibility(): boolean {
  const enabled = process.env.NEXT_PUBLIC_RANKED_ENABLED === "true";
  const forceDev = process.env.NEXT_PUBLIC_RANKED_FORCE_DEV === "true";
  const isProduction = process.env.NODE_ENV === "production";
  return enabled || (!isProduction && forceDev);
}
