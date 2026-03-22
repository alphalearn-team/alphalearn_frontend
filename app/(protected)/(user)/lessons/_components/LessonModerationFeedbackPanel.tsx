"use client";

import { formatDateTime } from "@/lib/utils/formatDate";
import {
  formatLessonModerationEventType,
  getLessonModerationMeta,
} from "@/lib/utils/lessonModeration";

interface LessonModerationFeedbackPanelProps {
  status?: string | null;
  reasons?: string[];
  adminRejectionReason?: string | null;
  eventType?: string | null;
  moderatedAt?: string | null;
}

export default function LessonModerationFeedbackPanel({
  status,
  reasons = [],
  adminRejectionReason,
  eventType,
  moderatedAt,
}: LessonModerationFeedbackPanelProps) {
  const meta = getLessonModerationMeta(status);
  const visibleReasons = reasons.filter(Boolean);
  const visibleAdminRejectionReason = adminRejectionReason?.trim() || null;
  const formattedEventType = formatLessonModerationEventType(eventType);
  const hasMetadata = Boolean(formattedEventType || moderatedAt);

  if (visibleReasons.length === 0 && !visibleAdminRejectionReason && !hasMetadata) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border px-5 py-4"
      style={{
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <div
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: meta.color }}
      >
        <span className="material-symbols-outlined text-base">{meta.icon}</span>
        Moderation Feedback
      </div>

      {visibleAdminRejectionReason && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Admin Rejection Reason
          </div>
          <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            {visibleAdminRejectionReason}
          </div>
        </div>
      )}

      {visibleReasons.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Moderation Reasons
          </div>
          <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">
            {visibleReasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: meta.color }}
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasMetadata && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          {formattedEventType && <span>Latest event: {formattedEventType}</span>}
          {moderatedAt && <span>Moderated: {formatDateTime(moderatedAt)}</span>}
        </div>
      )}
    </div>
  );
}
