import { Group, Title } from "@mantine/core";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";
import type { LessonModerationMeta } from "@/lib/utils/lessonModeration";
import LessonDetailOwnerActions from "./LessonDetailOwnerActions";

interface LessonDetailHeaderProps {
  canDelete: boolean;
  canEdit: boolean;
  conceptLabels: string[];
  lessonId: string;
  moderationMeta: LessonModerationMeta;
  showBackToMine: boolean;
  shouldShowModerationState: boolean;
  status: string;
  title: string;
}

export default function LessonDetailHeader({
  canDelete,
  canEdit,
  conceptLabels,
  lessonId,
  moderationMeta,
  showBackToMine,
  shouldShowModerationState,
  status,
  title,
}: LessonDetailHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start">
      <div className="flex-1">
        <Title order={1} mb="sm">
          {title}
        </Title>

        {conceptLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {conceptLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {shouldShowModerationState && (
          <div
            className="mt-5 rounded-2xl border px-5 py-4"
            style={{
              background: moderationMeta.bg,
              borderColor: moderationMeta.border,
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Moderation
              </span>
              <LessonModerationBadge status={status} />
            </div>

            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              {moderationMeta.description}
            </p>
          </div>
        )}
      </div>

      <LessonDetailOwnerActions
        lessonId={lessonId}
        canEdit={canEdit}
        canDelete={canDelete}
        showBackToMine={showBackToMine}
      />
    </Group>
  );
}
