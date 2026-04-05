"use client";

import { formatShortDate } from "@/lib/utils/formatDate";

interface LessonProgressBarProps {
  passedQuizzes: number;
  totalQuizzes: number;
  completed: boolean;
  firstCompletedAt?: string | null;
  compact?: boolean;
}

export default function LessonProgressBar({
  passedQuizzes,
  totalQuizzes,
  completed,
  firstCompletedAt,
  compact = false,
}: LessonProgressBarProps) {
  const percent =
    totalQuizzes === 0
      ? completed ? 100 : 0
      : Math.round((passedQuizzes / totalQuizzes) * 100);

  if (compact) {
    return (
      <div className="space-y-1.5 pt-3">
        <div className="flex items-center justify-between">
          {completed ? (
            <span
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-success)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                check_circle
              </span>
              Completed
            </span>
          ) : (
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {totalQuizzes === 0 ? "Enrolled" : `${passedQuizzes}/${totalQuizzes} quizzes`}
            </span>
          )}
          {!completed && totalQuizzes > 0 && (
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {percent}%
            </span>
          )}
        </div>
        <div
          className="h-1 w-full rounded-full overflow-hidden"
          style={{ background: "var(--color-overlay)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: completed ? "var(--color-success)" : "var(--color-primary)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-3 rounded-xl border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Your Progress
        </span>
        {completed && (
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
              color: "var(--color-success)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
              check_circle
            </span>
            Completed{firstCompletedAt ? ` · ${formatShortDate(firstCompletedAt)}` : ""}
          </span>
        )}
      </div>

      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: "var(--color-input)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: completed
              ? "var(--color-success)"
              : "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, white))",
          }}
        />
      </div>

      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {totalQuizzes === 0
          ? "No quizzes in this lesson yet"
          : completed
          ? `All ${totalQuizzes} ${totalQuizzes === 1 ? "quiz" : "quizzes"} passed`
          : `${passedQuizzes} of ${totalQuizzes} ${totalQuizzes === 1 ? "quiz" : "quizzes"} passed at full marks`}
      </p>
    </div>
  );
}
