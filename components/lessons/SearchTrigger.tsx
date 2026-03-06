"use client";

import { spotlight } from "@mantine/spotlight";

export default function SearchTrigger() {
    return (
        <button
            onClick={spotlight.open}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl
        bg-[var(--color-surface)] border border-[var(--color-border)]
        hover:border-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(124,92,255,0.15)]
        transition-all duration-300 cursor-pointer min-w-[200px]"
        >
            {/* Search icon */}
            <span
                className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
            >
                search
            </span>

            {/* Placeholder text */}
            <span className="text-lg font-bold text-[var(--color-text-muted)] flex-1 text-left">
                Search...
            </span>

            {/* Keyboard shortcut badge */}
            <kbd
                className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md
          bg-[var(--color-overlay)] text-[var(--color-text-muted)]
          border border-[var(--color-border)]
          group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)]
          transition-colors"
            >
                ⌘K
            </kbd>
        </button>
    );
}
