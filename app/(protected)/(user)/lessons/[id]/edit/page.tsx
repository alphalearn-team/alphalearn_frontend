import { redirect } from "next/navigation";
import NotFound from "@/components/NotFound";
import ContributorLessonEditorShell from "@/components/lessons/ContributorLessonEditorShell";
import LessonModerationFeedbackPanel from "@/components/lessons/LessonModerationFeedbackPanel";
import { getUserRole } from "@/lib/auth/rbac";
import { getLessonModerationMeta } from "@/lib/utils/lessonModeration";
import LessonEditorWithSectionsClient from "./LessonEditorWithSectionsClient";
import {
  LessonConceptChips,
  LessonEditStatusMeta,
} from "./_components/LessonEditHeaderMeta";
import {
  getEditLessonViewModel,
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

  const viewModel = await getEditLessonViewModel(id);
  if (!viewModel) {
    return <NotFound />;
  }

  const { lesson, lessonConceptLabels, status } = viewModel;
  const moderationMeta = getLessonModerationMeta(status);

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
        <LessonEditorWithSectionsClient
          lessonId={id}
          initialTitle={lesson.title}
          initialSections={lesson.sections || []}
          initialStatus={status}
        />
      </div>
    </ContributorLessonEditorShell>
  );
}
