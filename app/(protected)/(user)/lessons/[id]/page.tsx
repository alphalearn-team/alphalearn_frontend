import "@mantine/tiptap/styles.css";
import { Container } from "@mantine/core";
import { notFound } from "next/navigation";
import LessonModerationFeedbackPanel from "@/components/lessons/LessonModerationFeedbackPanel";
import { getUserRole } from "@/lib/auth/rbac";
import { LessonContentDisplay } from "./_components/LessonContentDisplay";
import LessonDetailHeader from "./_components/LessonDetailHeader";
import LessonQuizSection from "./_components/LessonQuizSection";
import { getLessonDetailViewModel } from "./lessonDetailData";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getUserRole();
  const viewModel = await getLessonDetailViewModel(id, role);
  if (!viewModel) {
    return notFound();
  }

  const {
    canDelete,
    canEdit,
    isOwner,
    lesson,
    lessonConceptLabels,
    lessonId,
    moderationMeta,
    quizLoadError,
    quizzes,
    shouldShowModerationState,
    showBackToMine,
    status,
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

        <LessonContentDisplay sections={lesson.sections || []} />
        <LessonQuizSection
          quizzes={quizzes}
          quizLoadError={quizLoadError}
          status={status}
          role={role}
          isOwner={isOwner}
        />
      </div>
    </Container>
  );
}
