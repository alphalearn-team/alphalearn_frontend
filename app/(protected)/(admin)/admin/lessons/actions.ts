"use server";

import { apiFetch } from "@/lib/api/api";
import { revalidatePath } from "next/cache";
import type { AdminLessonReportResolutionResult } from "@/interfaces/interfaces";

const headers = {
  "Content-Type": "application/json",
};

/**
 * Server Action: Approve a lesson
 */
export async function approveLesson(lessonPublicId: string) {
  try {
    await apiFetch(`/admin/lessons/${lessonPublicId}/approve`, {
      method: "PUT",
      headers,
    });

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${lessonPublicId}`);
    return { success: true, message: "Lesson approved successfully!" };
  } catch (error) {
    console.error("Error approving lesson:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve lesson",
    };
  }
}

/**
 * Server Action: Reject a lesson
 */
export async function rejectLesson(lessonPublicId: string, reason: string) {
  try {
    await apiFetch(`/admin/lessons/${lessonPublicId}/reject`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ reason }),
    });

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${lessonPublicId}`);
    return { success: true, message: "Lesson rejected successfully!" };
  } catch (error) {
    console.error("Error rejecting lesson:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject lesson",
    };
  }
}

export async function dismissSingleLessonReport(
  lessonPublicId: string,
  reportPublicId: string,
) {
  try {
    await apiFetch<null>(`/admin/lesson-reports/${reportPublicId}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/reported/${lessonPublicId}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error dismissing single report:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to dismiss report",
    };
  }
}

export async function dismissAllLessonReportsForLesson(lessonPublicId: string) {
  try {
    const result = await apiFetch<AdminLessonReportResolutionResult | null>(
      `/admin/lesson-reports/lessons/${lessonPublicId}/reports`,
      {
        method: "DELETE",
      },
    );

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/reported/${lessonPublicId}`);

    const resolvedCount =
      result && typeof result.resolvedCount === "number" && Number.isFinite(result.resolvedCount)
        ? result.resolvedCount
        : null;

    return {
      success: true,
      resolvedCount,
    };
  } catch (error) {
    console.error("Error dismissing all reports for lesson:", error);
    return {
      success: false,
      resolvedCount: null,
      message: error instanceof Error ? error.message : "Failed to dismiss all reports",
    };
  }
}
