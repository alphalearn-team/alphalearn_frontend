import type { Lesson, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import type { UserRole } from "@/lib/auth/rbac";
import { getLessonModerationMeta, normalizeLessonModerationStatus } from "@/lib/lessonModeration";

function normalizeLessonDetail(lesson: Lesson): Lesson {
  return {
    ...lesson,
    latestModerationReasons: Array.isArray(lesson.latestModerationReasons)
      ? lesson.latestModerationReasons
      : [],
    adminRejectionReason: lesson.adminRejectionReason ?? null,
  };
}

export async function fetchLessonContent(id: string): Promise<Lesson | null> {
  try {
    const lesson = await apiFetch<Lesson>(`/lessons/${id}`);
    return normalizeLessonDetail(lesson);
  } catch {
    return null;
  }
}

export async function checkLessonOwnership(
  role: string,
  lessonPublicId: string,
): Promise<boolean> {
  if (role === "ADMIN") {
    return false;
  }

  try {
    const myLessons = await apiFetch<LessonSummary[]>("/lessons/mine");
    return myLessons.some((lesson) => lesson.lessonPublicId === lessonPublicId);
  } catch {
    return false;
  }
}

export function hasModerationFeedback(lesson: Lesson): boolean {
  const latestReasons = lesson.latestModerationReasons ?? [];

  return (
    latestReasons.length > 0 ||
    Boolean(lesson.adminRejectionReason) ||
    Boolean(lesson.latestModerationEventType) ||
    Boolean(lesson.latestModeratedAt)
  );
}

export function getLessonConceptLabels(lesson: Lesson): string[] {
  return (lesson.concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean) as string[];
}

function resolveLessonStatus(lesson: Lesson): string {
  return normalizeLessonModerationStatus(lesson.moderationStatus);
}

export interface LessonDetailViewModel {
  canDelete: boolean;
  canEdit: boolean;
  lesson: Lesson;
  lessonConceptLabels: string[];
  lessonId: string;
  moderationMeta: ReturnType<typeof getLessonModerationMeta>;
  shouldShowModerationState: boolean;
  showBackToMine: boolean;
  status: string;
}

export async function getLessonDetailViewModel(
  id: string,
  role: UserRole,
): Promise<LessonDetailViewModel | null> {
  const lesson = await fetchLessonContent(id);
  if (!lesson) {
    return null;
  }

  const lessonId = lesson.lessonPublicId || id;
  const status = resolveLessonStatus(lesson);
  const ownsLesson = await checkLessonOwnership(role, lessonId);

  if (role !== "ADMIN" && !ownsLesson && status !== "APPROVED") {
    return null;
  }

  return {
    canDelete: ownsLesson && status === "UNPUBLISHED",
    canEdit: role === "CONTRIBUTOR" && ownsLesson,
    lesson,
    lessonConceptLabels: getLessonConceptLabels(lesson),
    lessonId,
    moderationMeta: getLessonModerationMeta(status),
    shouldShowModerationState:
      ownsLesson || (role === "CONTRIBUTOR" && hasModerationFeedback(lesson)),
    showBackToMine: role === "CONTRIBUTOR" && ownsLesson,
    status,
  };
}
