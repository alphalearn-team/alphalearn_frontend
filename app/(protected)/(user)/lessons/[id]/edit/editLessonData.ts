import type { Lesson, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { normalizeLessonModerationStatus } from "@/lib/lessonModeration";

export async function fetchOwnedLessons(): Promise<LessonSummary[] | null> {
  try {
    return await apiFetch<LessonSummary[]>("/lessons/mine");
  } catch {
    return null;
  }
}

export async function fetchLessonForEdit(id: string): Promise<Lesson | null> {
  try {
    return await apiFetch<Lesson>(`/lessons/${id}`);
  } catch {
    return null;
  }
}

export function getLessonConceptLabels(lesson: Lesson): string[] {
  return (lesson.concepts || [])
    .map((concept) => concept?.title)
    .filter(Boolean) as string[];
}

export function getLessonEditStatus(lesson: Lesson): string {
  return normalizeLessonModerationStatus(lesson.moderationStatus);
}
