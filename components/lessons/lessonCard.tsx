"use client";

import { Group, Stack, Title, Text, Tooltip } from "@mantine/core";
import type { LessonSummary } from "@/interfaces/interfaces";
import ContentCardShell from "@/components/common/contentCardShell";
import { formatShortDate } from "@/lib/formatDate";
import LessonModerationBadge from "@/components/lessons/lessonModerationBadge";

type LessonCardProps = LessonSummary;
interface LessonCardOptions {
  showModerationBadge?: boolean;
}

export default function LessonCard({
  lessonPublicId,
  title,
  moderationStatus,
  author,
  createdAt,
  showModerationBadge = true,
  concepts,
}: LessonCardProps & LessonCardOptions) {
  const conceptLabels = (concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <ContentCardShell
      href={`/lessons/${lessonPublicId}`}
      background="#232338"
      borderColor="rgba(255,255,255,0.06)"
      glow="radial-gradient(circle at top right, rgba(99, 102, 241, 0.16) 0%, transparent 70%)"
    >
      <Stack gap="md" h="100%" justify="space-between" className="relative z-10">
        <Stack gap="xs">
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <Text
                size="xs"
                fw={800}
                className="uppercase tracking-[0.25em] text-blue-200/70"
              >
                Lesson
              </Text>

              <Group gap={8} className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                <span>{author?.username || "Anonymous"}</span>
              </Group>
            </div>

            <div className="flex items-start gap-2 shrink-0">
              {showModerationBadge && <LessonModerationBadge status={moderationStatus} />}

              <Tooltip label="Open lesson" position="top" withArrow>
                <span className="material-symbols-outlined text-white/20 group-hover:text-white/60 transition-colors text-lg">
                  arrow_outward
                </span>
              </Tooltip>
            </div>
          </div>

          <Title
            order={3}
            className="text-lg font-bold tracking-tight leading-snug text-white group-hover:text-blue-100 transition-colors"
          >
            {title}
          </Title>

          {conceptLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {conceptLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </Stack>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
            {createdAt ? formatShortDate(createdAt) : "Recent"}
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-blue-300 opacity-30" />
            <div className="w-1 h-1 rounded-full bg-blue-300 opacity-50" />
            <div className="w-1 h-1 rounded-full bg-blue-300" />
          </div>
        </div>
      </Stack>
    </ContentCardShell>
  );
}
