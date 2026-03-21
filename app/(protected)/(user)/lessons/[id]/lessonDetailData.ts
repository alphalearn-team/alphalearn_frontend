import type { Lesson, LessonQuiz, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import type { UserRole } from "@/lib/auth/rbac";
import { normalizeLessonQuizzes } from "@/lib/utils/lessonQuiz";
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

export interface LessonQuizLoadResult {
  error: string | null;
  quizzes: LessonQuiz[];
}

export async function fetchLessonQuizzes(
  lessonPublicId: string,
): Promise<LessonQuizLoadResult> {
  try {
    // console.log(lessonPublicId);
    const quizzes = await apiFetch<LessonQuiz[]>(`/quizzes/${lessonPublicId}`);
    console.log(JSON.stringify(quizzes,null,2));
    return {
      error: null,
      quizzes: normalizeLessonQuizzes(quizzes),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load lesson quizzes right now.",
      quizzes: [],
    };
  }
}

export async function checkLessonOwnership(
  role: string,
  lessonPublicId: string,
): Promise<boolean> {

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
  return resolveLessonModerationStatus(lesson, "APPROVED");
}

export interface LessonDetailViewModel {
  canDelete: boolean;
  canEdit: boolean;
  isOwner: boolean;
  lesson: Lesson;
  lessonConceptLabels: string[];
  lessonId: string;
  moderationMeta: ReturnType<typeof getLessonModerationMeta>;
  quizLoadError: string | null;
  quizzes: LessonQuiz[];
  shouldShowModerationState: boolean;
  showBackToMine: boolean;
  status: string;
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

  const quizResult = await fetchLessonQuizzes(lessonId);

  return {
    canDelete: ownsLesson && isDeletableLessonStatus(status),
    canEdit: role === "CONTRIBUTOR" && ownsLesson,
    isOwner: ownsLesson,
    lesson,
    lessonConceptLabels: getLessonConceptLabels(lesson),
    lessonId,
    moderationMeta: getLessonModerationMeta(status),
    quizLoadError: quizResult.error,
    quizzes: quizResult.quizzes,
    shouldShowModerationState:
      ownsLesson || (role === "CONTRIBUTOR" && hasModerationFeedback(lesson)),
    showBackToMine: role === "CONTRIBUTOR" && ownsLesson,
    status,
  };
}
