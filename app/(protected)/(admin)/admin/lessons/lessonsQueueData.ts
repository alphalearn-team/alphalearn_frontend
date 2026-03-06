import type { AdminLessonQueueItem } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

function normalizeQueueLesson(
  lesson: AdminLessonQueueItem,
): AdminLessonQueueItem {
  return {
    ...lesson,
    automatedModerationReasons: Array.isArray(lesson.automatedModerationReasons)
      ? lesson.automatedModerationReasons
      : [],
    adminRejectionReason: lesson.adminRejectionReason ?? null,
  };
}

export async function fetchPendingAdminLessons(): Promise<AdminLessonQueueItem[]> {
  const lessonsResponse = await apiFetch<AdminLessonQueueItem[]>(
    "/admin/lessons?status=PENDING",
  );

  return lessonsResponse.map(normalizeQueueLesson);
}
