import { Group } from "@mantine/core";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";

export function LessonEditStatusMeta({ status }: { status: string }) {
  return (
    <Group gap="sm" align="center">
      <Group gap="xs" align="center">
        <div className="w-5 h-px bg-[var(--color-primary)]" />
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
          Status
        </span>
      </Group>
      <LessonModerationBadge status={status} />
    </Group>
  );
}

export function LessonConceptChips({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
