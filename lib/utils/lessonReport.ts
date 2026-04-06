import { apiClientFetch } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiErrors";

const LESSON_REPORT_PATH = "/lesson-reports";

export interface CreateLessonReportRequest {
  lessonId: string;
  reason: string;
}

export function normalizeLessonReportReason(reason: string): string {
  return reason.trim();
}

export function isLessonReportReasonValid(reason: string): boolean {
  return normalizeLessonReportReason(reason).length > 0;
}

export function getLessonReportErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "Please provide a valid report reason.";
      case 403:
        return "You cannot report your own lesson.";
      case 404:
        return "This lesson could not be found.";
      case 409:
        return "You have already reported this lesson.";
      default:
        return error.message || "Failed to submit your report. Please try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to submit your report. Please try again.";
}

export async function createLessonReport(
  accessToken: string,
  input: CreateLessonReportRequest,
): Promise<void> {
  const reason = normalizeLessonReportReason(input.reason);

  if (!reason) {
    throw new Error("Please tell us what needs review.");
  }

  await apiClientFetch(
    LESSON_REPORT_PATH,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId: input.lessonId,
        reason,
      }),
    },
  );
}
