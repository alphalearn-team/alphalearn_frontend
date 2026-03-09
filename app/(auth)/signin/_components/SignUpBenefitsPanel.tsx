"use client";

export default function SignUpBenefitsPanel() {
  return (
    <div className="hidden lg:flex w-[400px] border-l border-[var(--color-border)] flex-col p-10 justify-center relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-[var(--color-text)] mb-2">Why join?</h2>
        <p className="text-[var(--color-text-muted)] text-base mb-8">
          Unlock the ultimate internet culture database.
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-input)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
              <span className="material-symbols-outlined text-orange-400 text-2xl">
                local_fire_department
              </span>
            </div>
            <div>
              <h3 className="text-[var(--color-text)] font-bold text-lg leading-tight mb-1">
                Keep the Streak
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                Daily drops of internet culture direct to your brain.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-input)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
              <span className="material-symbols-outlined text-yellow-400 text-2xl">star</span>
            </div>
            <div>
              <h3 className="text-[var(--color-text)] font-bold text-lg leading-tight mb-1">
                Earn XP
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                Climb the leaderboards and flex on your friends.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-input)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
              <span className="material-symbols-outlined text-purple-400 text-2xl">
                military_tech
              </span>
            </div>
            <div>
              <h3 className="text-[var(--color-text)] font-bold text-lg leading-tight mb-1">
                Collect Badges
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                Show off your meme mastery to the squad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
