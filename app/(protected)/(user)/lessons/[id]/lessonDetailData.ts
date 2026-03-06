import type { Lesson, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

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
