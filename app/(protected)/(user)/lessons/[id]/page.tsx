import "@mantine/tiptap/styles.css";
import { TextDisplayer } from "@/components/texteditor/textDisplayer";
import { apiFetch } from "@/lib/api";
import type { Lesson, LessonSummary } from "@/interfaces/interfaces";
import { notFound } from "next/navigation";
import {
  Container,
  Title,
  Group,
} from "@mantine/core";
import { getUserRole } from "@/lib/auth/rbac";
import LessonDetailOwnerActions from "@/components/lessons/lessonDetailOwnerActions";
import LessonModerationBadge from "@/components/lessons/lessonModerationBadge";
import LessonModerationFeedbackPanel from "@/components/lessons/lessonModerationFeedbackPanel";
import {
  getLessonModerationMeta,
  normalizeLessonModerationStatus,
} from "@/lib/lessonModeration";

async function getLessonContent(id: string): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch {
    return null;
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [role, lessonContent] = await Promise.all([
    getUserRole(),
    getLessonContent(id),
  ]);

  if (!lessonContent) {
    return notFound();
  }

  const lessonPublicId = lessonContent.lessonPublicId || id;
  let ownsLesson = false;
  const normalizedStatus = normalizeLessonModerationStatus(lessonContent.moderationStatus);
  const moderationMeta = getLessonModerationMeta(normalizedStatus);
  const lessonConceptLabels = (lessonContent.concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean) as string[];

  if (role !== "ADMIN") {
    try {
      const myLessons = await apiFetch<LessonSummary[]>("/lessons/mine");
      ownsLesson = myLessons.some((lesson) => lesson.lessonPublicId === lessonPublicId);
    } catch {
      ownsLesson = false;
    }
  }

  const canEdit = role === "CONTRIBUTOR" && ownsLesson;
  const canDelete = ownsLesson && normalizedStatus === "UNPUBLISHED";

  return (
    <Container size="md" py="xl">
      <div className="flex flex-col gap-8">
        <Group justify="space-between" align="flex-start">
          <div className="flex-1">
            <Title order={1} mb="sm">
              {lessonContent.title}
            </Title>
            {lessonConceptLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lessonConceptLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {ownsLesson && (
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
                  <LessonModerationBadge status={normalizedStatus} />
                </div>

                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  {moderationMeta.description}
                </p>
              </div>
            )}
          </div>
          <LessonDetailOwnerActions
            lessonId={lessonPublicId}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </Group>

        {ownsLesson && (
          <LessonModerationFeedbackPanel
            status={normalizedStatus}
            reasons={lessonContent.latestModerationReasons}
            eventType={lessonContent.latestModerationEventType}
            moderatedAt={lessonContent.latestModeratedAt}
          />
        )}

        <div
          className="rounded-xl border border-[var(--color-border)] overflow-hidden"
          style={{ background: "var(--color-surface)" }}
        >
          <TextDisplayer content={lessonContent.content} />
        </div>
      </div>
    </Container>
  );
}
