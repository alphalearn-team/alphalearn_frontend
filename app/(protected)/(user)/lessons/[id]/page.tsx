import "@mantine/tiptap/styles.css";
import { Container } from "@mantine/core";
import { notFound } from "next/navigation";
import type { Lesson } from "@/interfaces/interfaces";
import LessonModerationFeedbackPanel from "@/components/lessons/LessonModerationFeedbackPanel";
import { getUserRole } from "@/lib/auth/rbac";
import { getLessonModerationMeta } from "@/lib/lessonModeration";
import { LessonContentDisplay } from "./_components/LessonContentDisplay";
import LessonDetailHeader from "./_components/LessonDetailHeader";
import {
  checkLessonOwnership,
  fetchLessonContent,
  getLessonConceptLabels,
  hasModerationFeedback,
} from "./lessonDetailData";

function resolveLessonStatus(lesson: Lesson): string {
  return lesson.moderationStatus ?? "APPROVED";
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [role, lesson] = await Promise.all([getUserRole(), fetchLessonContent(id)]);

  if (!lesson) {
    return notFound();
  }

  const lessonId = lesson.lessonPublicId || id;
  const status = resolveLessonStatus(lesson);
  const ownsLesson = await checkLessonOwnership(role, lessonId);

  if (role !== "ADMIN" && !ownsLesson && status !== "APPROVED") {
    return notFound();
  }

  const moderationMeta = getLessonModerationMeta(status);
  const lessonConceptLabels = getLessonConceptLabels(lesson);
  const shouldShowModerationState =
    ownsLesson || (role === "CONTRIBUTOR" && hasModerationFeedback(lesson));

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
          canEdit={role === "CONTRIBUTOR" && ownsLesson}
          canDelete={ownsLesson && status === "UNPUBLISHED"}
          showBackToMine={role === "CONTRIBUTOR" && ownsLesson}
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
      </div>
    </Container>
  );
}
