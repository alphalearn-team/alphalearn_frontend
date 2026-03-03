import LessonEditor from "./lessoneditor";
import { apiFetch } from "@/lib/api";
import { Lesson, LessonSummary } from "@/interfaces/interfaces";
import NotFound from "@/components/notFound";
import { Group } from "@mantine/core";
import { getUserRole } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import ContributorLessonEditorShell from "@/components/lessons/contributorLessonEditorShell";
import LessonModerationBadge from "@/components/lessons/lessonModerationBadge";
import LessonModerationFeedbackPanel from "@/components/lessons/lessonModerationFeedbackPanel";
import {
  getLessonModerationMeta,
  normalizeLessonModerationStatus,
} from "@/lib/lessonModeration";

async function getOwnedLessons(): Promise<LessonSummary[] | null> {
  try {
    return await apiFetch<LessonSummary[]>("/lessons/mine");
  } catch {
    return null;
  }
}

async function getLessonForEdit(id: string): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch {
    return null;
  }
}

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

  const myLessons = await getOwnedLessons();
  if (!myLessons) {
    return <NotFound />;
  }

  const isOwnerLesson = myLessons.some((lesson) => lesson.lessonPublicId === id);
  if (!isOwnerLesson) {
    return <NotFound />;
  }

  const lesson = await getLessonForEdit(id);
  if (!lesson) {
    return <NotFound />;
  }

  const status = normalizeLessonModerationStatus(lesson.moderationStatus);
  const moderationMeta = getLessonModerationMeta(status);
  const lessonConceptLabels = (lesson.concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean) as string[];

  return (
    <ContributorLessonEditorShell
      headerMeta={(
        <Group gap="sm" align="center">
          <Group gap="xs" align="center">
            <div className="w-5 h-px bg-[var(--color-primary)]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
              Status
            </span>
          </Group>
          <LessonModerationBadge status={status} />
        </Group>
      )}
      title={(
        <>
          Edit <span className="text-[var(--color-primary)]">Lesson</span>
        </>
      )}
      description={moderationMeta.editorDescription}
      titleMeta={lessonConceptLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {lessonConceptLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    >
      <div className="space-y-6">
        <LessonModerationFeedbackPanel
          status={status}
          reasons={lesson.latestModerationReasons}
          eventType={lesson.latestModerationEventType}
          moderatedAt={lesson.latestModeratedAt}
        />
        <LessonEditor
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
