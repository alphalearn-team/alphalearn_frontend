"use client";

import type { OfflineInitializedMatch } from "../_lib/gameSetup";

interface MatchProgressBadgeProps {
  match: OfflineInitializedMatch;
}

export default function MatchProgressBadge({
  match,
}: MatchProgressBadgeProps) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Concept {match.currentConceptNumber} of {match.totalConceptCount}
      </span>
    </div>
  );
}
