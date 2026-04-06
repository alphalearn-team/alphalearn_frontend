import { Container } from "@mantine/core";
import Link from "next/link";
import LessonModerationFeedbackPanel from "@/app/(protected)/(user)/lessons/_components/LessonModerationFeedbackPanel";
import { getUserRole } from "@/lib/auth/server/rbac";
import ProgressBar from "@/components/ProgressBar";
import { formatShortDate } from "@/lib/utils/formatDate";
import EnrollmentGate from "./_components/EnrollmentGate";
import { LessonContentDisplay } from "./_components/LessonContentDisplay";
import LessonDetailHeader from "./_components/LessonDetailHeader";
import LessonQuizSection from "./_components/LessonQuizSection";
import { getLessonDetailViewModel } from "./_lib/lessonDetailData";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getUserRole();
  const viewModel = await getLessonDetailViewModel(id, role);
  if (!viewModel) {
    return (
      <Container size="md" py="xl">
        <div
          className="rounded-2xl border px-6 py-8"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Lesson Unavailable
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
            This lesson is no longer available
          </h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            It may have been unpublished during moderation review. You can continue from your other enrolled lessons.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/my-enrollments"
              className="inline-flex h-10 items-center rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
            >
              Back to My Enrollments
            </Link>
            <Link
              href="/lessons"
              className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay)]"
            >
              Browse Lessons
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const {
    canDelete,
    canEdit,
    canReport,
    lesson,
    lessonConceptLabels,
    lessonId,
    moderationMeta,
    shouldShowModerationState,
    showBackToMine,
    status,
    progress,
  } = viewModel;

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-8">
        <LessonDetailHeader
          title={lesson.title}
          conceptLabels={lessonConceptLabels}
          status={status}
          moderationMeta={moderationMeta}
          shouldShowModerationState={shouldShowModerationState}
          lessonId={lessonId}
          canEdit={canEdit}
          canDelete={canDelete}
          canReport={canReport}
          showBackToMine={showBackToMine}
        />

        {shouldShowModerationState && (
          <LessonModerationFeedbackPanel
            status={status}
            reasons={lesson.latestModerationReasons}
            adminRejectionReason={lesson.adminRejectionReason}
            eventType={lesson.latestModerationEventType}
            moderatedAt={lesson.latestModeratedAt}
          />
        )}

        {viewModel.isEnrolled || viewModel.isOwner ? (
          <LessonContentDisplay sections={lesson.sections || []} />
        ) : (
          <EnrollmentGate lessonId={lessonId} />
        )}
        
        {progress && (
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
              {progress.completed && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
                    color: "var(--color-success)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check_circle</span>
                  Completed{progress.firstCompletedAt ? ` · ${formatShortDate(progress.firstCompletedAt)}` : ""}
                </span>
              )}
            </div>
            <ProgressBar
              value={progress.passedQuizzes}
              max={progress.totalQuizzes}
              completed={progress.completed}
            />
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {progress.totalQuizzes === 0
                ? "No quizzes in this lesson yet"
                : progress.completed
                ? `All ${progress.totalQuizzes} ${progress.totalQuizzes === 1 ? "quiz" : "quizzes"} passed`
                : `${progress.passedQuizzes} of ${progress.totalQuizzes} ${progress.totalQuizzes === 1 ? "quiz" : "quizzes"} passed`}
            </p>
          </div>
        )}

        <LessonQuizSection
          lessonId={lessonId}
          isEnrolled={viewModel.isEnrolled}
          isOwner={viewModel.isOwner}
        />
      </div>
    </Container>
  );
}
