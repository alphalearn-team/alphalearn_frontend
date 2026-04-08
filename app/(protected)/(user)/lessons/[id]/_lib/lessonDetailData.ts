import type { Lesson, LessonProgress, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import type { UserRole } from "@/lib/auth/server/rbac";
import { getLessonModerationMeta, resolveLessonModerationStatus } from "@/lib/utils/lessonModeration";

function normalizeLessonDetail(lesson: Lesson): Lesson {
  return {
    ...lesson,
    moderationStatus: resolveLessonModerationStatus(lesson, "APPROVED"),
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

  try {
    const myLessons = await apiFetch<LessonSummary[]>("/me/lessons");
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

export function resolveLessonStatus(lesson: Lesson): string {
  return resolveLessonModerationStatus(lesson, "APPROVED");
}

export interface LessonDetailViewModel {
  canDelete: boolean;
  canEdit: boolean;
  canReport: boolean;
  isOwner: boolean;
  isEnrolled: boolean;
  lesson: Lesson;
  lessonConceptLabels: string[];
  lessonId: string;
  moderationMeta: ReturnType<typeof getLessonModerationMeta>;
  shouldShowModerationState: boolean;
  showBackToMine: boolean;
  status: string;
  progress: LessonProgress | null;
}



function isDeletableLessonStatus(status: string): boolean {
  return (
    status === "UNPUBLISHED"
    || status === "PENDING"
    || status === "REJECTED"
    || status === "APPROVED"
  );
}

export async function getLessonDetailViewModel(
  id: string,
  role: UserRole,
): Promise<LessonDetailViewModel | null> {
  const [lesson, progressList] = await Promise.all([
    fetchLessonContent(id),
    apiFetch<LessonProgress[]>("/me/lesson-enrollments?view=PROGRESS").catch(() => [] as LessonProgress[]),
  ]);

  if (!lesson) {
    return null;
  }

  const lessonId = lesson.lessonPublicId || id;
  const status = resolveLessonStatus(lesson);
  const ownsLesson = await checkLessonOwnership(role, lessonId);

  if (role !== "ADMIN" && !ownsLesson && status !== "APPROVED") {
    return null;
  }

  const isEnrolled = ownsLesson || Boolean(lesson.enrolled);
  const progress = isEnrolled && !ownsLesson
    ? (progressList.find((p) => p.lessonPublicId === lessonId) ?? null)
    : null;

  return {
    canDelete: ownsLesson && isDeletableLessonStatus(status),
    canEdit: role === "CONTRIBUTOR" && ownsLesson,
    canReport: (role === "LEARNER" || role === "CONTRIBUTOR") && !ownsLesson,
    isOwner: ownsLesson,
    isEnrolled,
    lesson,
    lessonConceptLabels: getLessonConceptLabels(lesson),
    lessonId,
    moderationMeta: getLessonModerationMeta(status),
    shouldShowModerationState:
      ownsLesson || (role === "CONTRIBUTOR" && hasModerationFeedback(lesson)),
    showBackToMine: role === "CONTRIBUTOR" && ownsLesson,
    status,
    progress,
  };
}

