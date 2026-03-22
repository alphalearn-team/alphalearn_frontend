import type { LessonSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";

export async function fetchMyLessons(): Promise<LessonSummary[] | null> {
  try {
    return await apiFetch<LessonSummary[]>("/lessons/mine");
  } catch {
    return null;
  }
}
