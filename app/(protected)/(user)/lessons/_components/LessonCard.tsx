"use client";

import { Group, Stack, Title, Text, Tooltip } from "@mantine/core";
import type { LessonProgress, LessonSummary } from "@/interfaces/interfaces";
import ContentCardShell from "@/components/CardShell";
import LessonProgressBar from "@/components/LessonProgressBar";
import { formatShortDate } from "@/lib/utils/formatDate";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";

type LessonCardProps = LessonSummary;
interface LessonCardOptions {
  showModerationBadge?: boolean;
  progress?: LessonProgress;
}

export default function LessonCard({
  lessonPublicId,
  title,
  moderationStatus,
  author,
  createdAt,
  showModerationBadge = true,
  concepts,
  progress,
}: LessonCardProps & LessonCardOptions) {
  const conceptLabels = (concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <ContentCardShell
      href={`/lessons/${lessonPublicId}`}
      background="var(--color-card-bg)"
      borderColor="var(--color-card-border)"
      glow="none"
      hoverBorderColor="var(--color-primary)"
    >
      <Stack gap="md" h="100%" justify="space-between" className="relative z-10">
        <Stack gap="xs">
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <Text
                size="xs"
                fw={800}
                className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70"
              >
                Lesson
              </Text>

              <Group gap={8} className="text-[11px] font-bold text-[var(--color-card-text-muted)] opacity-70 uppercase tracking-widest">
                <span>{author?.username || "Anonymous"}</span>
              </Group>
            </div>

            <div className="flex items-start gap-2 shrink-0">
              {showModerationBadge && <LessonModerationBadge status={moderationStatus} />}

              <Tooltip label="Open lesson" position="top" withArrow>
                <span className="material-symbols-outlined text-[var(--color-card-text-muted)] opacity-40 group-hover:opacity-80 transition-opacity text-lg">
                  arrow_outward
                </span>
              </Tooltip>
            </div>
          </div>

          <Title
            order={3}
            className="min-w-0 break-words line-clamp-2 text-lg font-bold tracking-tight leading-snug text-[var(--color-card-text)] group-hover:text-[var(--color-primary)] transition-colors"
          >
            {title}
          </Title>

          {conceptLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {conceptLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[var(--color-card-border)] bg-[var(--color-overlay)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-card-text-muted)]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </Stack>

        <div className="pt-4 border-t border-[var(--color-card-border)] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-card-text-muted)] opacity-70">
            {createdAt ? formatShortDate(createdAt) : "Recent"}
          </span>
          {!progress && (
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-30" />
              <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-50" />
              <div className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
            </div>
          )}
        </div>

        {progress && (
          <LessonProgressBar
            passedQuizzes={progress.passedQuizzes}
            totalQuizzes={progress.totalQuizzes}
            completed={progress.completed}
            compact
          />
        )}
      </Stack>
    </ContentCardShell>
  );
}
