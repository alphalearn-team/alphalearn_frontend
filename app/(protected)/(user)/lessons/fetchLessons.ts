import type { LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export async function fetchLessons(): Promise<LessonSummary[] | null> {
  try {
    return await apiFetch<LessonSummary[]>("/lessons");
  } catch {
    return null;
  }
}
