import type { Concept, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { resolveLessonModerationStatus } from "@/lib/lessonModeration";

export async function fetchConcept(conceptId: string): Promise<Concept | null> {
  try {
    return await apiFetch<Concept>(`/concepts/${conceptId}`);
  } catch {
    return null;
  }
}

export async function fetchRelatedLessons(conceptId: string): Promise<LessonSummary[]> {
  const endpoints = [`/lessons?conceptPublicIds=${encodeURIComponent(conceptId)}`];

  for (const endpoint of endpoints) {
    try {
      const lessons = await apiFetch<LessonSummary[]>(endpoint);

      if (Array.isArray(lessons)) {
        return lessons.filter(
          (lesson) =>
            resolveLessonModerationStatus(lesson, "UNPUBLISHED") === "APPROVED",
        );
      }
    } catch {
      // Try the next common endpoint shape.
    }
  }

  return [];
}
