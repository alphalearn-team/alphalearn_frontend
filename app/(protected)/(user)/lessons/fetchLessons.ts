import type { LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export async function fetchLessons(
  conceptPublicIds?: string | null,
): Promise<LessonSummary[] | null> {
  try {
    const searchParams = new URLSearchParams();

    if (conceptPublicIds) {
      searchParams.set("conceptPublicIds", conceptPublicIds);
    }

    const endpoint = searchParams.size > 0
      ? `/lessons?${searchParams.toString()}`
      : "/lessons";

    return await apiFetch<LessonSummary[]>(endpoint);
  } catch {
    return null;
  }
}
