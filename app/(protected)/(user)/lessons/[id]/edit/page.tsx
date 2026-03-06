import { redirect } from "next/navigation";
import NotFound from "@/components/NotFound";
import ContributorLessonEditorShell from "@/components/lessons/ContributorLessonEditorShell";
import LessonModerationFeedbackPanel from "@/components/lessons/LessonModerationFeedbackPanel";
import { getUserRole } from "@/lib/auth/rbac";
import { getLessonModerationMeta } from "@/lib/lessonModeration";
import LessonEditorClient from "./LessonEditorClient";
import {
  LessonConceptChips,
  LessonEditStatusMeta,
} from "./_components/LessonEditHeaderMeta";
import {
  fetchLessonForEdit,
  fetchOwnedLessons,
  getLessonConceptLabels,
  getLessonEditStatus,
} from "./editLessonData";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect(`/admin/lessons/${id}`);
  }

  if (role === "LEARNER") {
    redirect("/lessons");
  }

  const myLessons = await fetchOwnedLessons();
  if (!myLessons) {
    return <NotFound />;
  }

  const isOwnerLesson = myLessons.some((lesson) => lesson.lessonPublicId === id);
  if (!isOwnerLesson) {
    return <NotFound />;
  }

  const lesson = await fetchLessonForEdit(id);
  if (!lesson) {
    return <NotFound />;
  }

  const status = getLessonEditStatus(lesson);
  const moderationMeta = getLessonModerationMeta(status);
  const lessonConceptLabels = getLessonConceptLabels(lesson);

  return (
    <ContributorLessonEditorShell
      headerMeta={<LessonEditStatusMeta status={status} />}
      title={
        <>
          Edit <span className="text-[var(--color-primary)]">Lesson</span>
        </>
      }
      description={moderationMeta.editorDescription}
      titleMeta={<LessonConceptChips labels={lessonConceptLabels} />}
    >
      <div className="space-y-6">
        <LessonModerationFeedbackPanel
          status={status}
          reasons={lesson.latestModerationReasons}
          adminRejectionReason={lesson.adminRejectionReason}
          eventType={lesson.latestModerationEventType}
          moderatedAt={lesson.latestModeratedAt}
        />
        <LessonEditorClient
          id={id}
          initialTitle={lesson.title}
          initialContent={lesson.content}
          initialConceptPublicIds={lesson.conceptPublicIds}
          initialStatus={status}
        />
      </div>
    </ContributorLessonEditorShell>
  );
}
