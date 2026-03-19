import type { Concept, LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { resolveLessonModerationStatus } from "@/lib/utils/lessonModeration";

export async function fetchConcept(conceptId: string): Promise<Concept | null> {
  try {
    return await apiFetch<Concept>(`/concepts/${conceptId}`);
  } catch {
    return null;
  }
}

export async function fetchRelatedLessons(conceptId: string): Promise<LessonSummary[]> {
  const encodedConceptId = encodeURIComponent(conceptId);
  const endpoints = [
    `/lessons?conceptPublicIds=${encodedConceptId}`,
    `/lessons?conceptPublicId=${encodedConceptId}`,
    `/lessons?conceptIds=${encodedConceptId}`,
    `/lessons?conceptId=${encodedConceptId}`,
  ];

  const isRelatedLesson = (lesson: LessonSummary) => {
    const hasConceptPublicId = Array.isArray(lesson.conceptPublicIds)
      && lesson.conceptPublicIds.includes(conceptId);
    const hasConceptObject = Array.isArray(lesson.concepts)
      && lesson.concepts.some((concept) => concept?.publicId === conceptId);

    return hasConceptPublicId || hasConceptObject;
  };

  const isVisibleLesson = (lesson: LessonSummary) =>
    resolveLessonModerationStatus(lesson, "APPROVED") === "APPROVED";

  for (const endpoint of endpoints) {
    try {
      const lessons = await apiFetch<LessonSummary[]>(endpoint);

      if (Array.isArray(lessons)) {
        const relatedLessons = lessons.filter(
          (lesson) => isRelatedLesson(lesson) && isVisibleLesson(lesson),
        );

        if (relatedLessons.length > 0) {
          return relatedLessons;
        }
      }
    } catch {
      // Try the next common endpoint shape.
    }
  }

  // Fallback for backends that ignore or reject concept filter query params.
  try {
    const allLessons = await apiFetch<LessonSummary[]>("/lessons");
    if (Array.isArray(allLessons)) {
      return allLessons.filter(
        (lesson) => isRelatedLesson(lesson) && isVisibleLesson(lesson),
      );
    }
  } catch {
    // Keep empty fallback below.
  }

  return [];
}
