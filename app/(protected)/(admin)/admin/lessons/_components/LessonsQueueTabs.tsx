"use client";

import Link from "next/link";

export type LessonsQueueTab = "pending" | "reported";

interface LessonsQueueTabsProps {
  activeTab: LessonsQueueTab;
}

export default function LessonsQueueTabs({ activeTab }: LessonsQueueTabsProps) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        href="/admin/lessons?tab=pending"
        className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
          activeTab === "pending"
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-overlay)]"
        }`}
      >
        Pending
      </Link>
      <Link
        href="/admin/lessons?tab=reported"
        className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
          activeTab === "reported"
            ? "border-red-500/40 bg-red-500/15 text-red-300"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-overlay)]"
        }`}
      >
        Reported
      </Link>
    </div>
  );
}
