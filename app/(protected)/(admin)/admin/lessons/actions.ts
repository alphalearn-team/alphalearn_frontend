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

async function resolveReportedLesson(
  lessonPublicId: string,
  action: "dismiss" | "unpublish",
) {
  try {
    const result = await apiFetch<AdminLessonReportResolutionResult>(
      `/admin/lesson-reports/lessons/${lessonPublicId}/${action}`,
      {
        method: "PUT",
        headers,
      },
    );

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/reported/${lessonPublicId}`);

    const resolvedCount =
      typeof result?.resolvedCount === "number" && Number.isFinite(result.resolvedCount)
        ? result.resolvedCount
        : 0;

    return {
      success: true,
      resolvedCount,
    };
  } catch (error) {
    console.error(`Error trying to ${action} reports:`, error);
    return {
      success: false,
      resolvedCount: 0,
      message: error instanceof Error ? error.message : `Failed to ${action} reports`,
    };
  }
}

export async function dismissLessonReports(lessonPublicId: string) {
  return resolveReportedLesson(lessonPublicId, "dismiss");
}

export async function unpublishReportedLesson(lessonPublicId: string) {
  return resolveReportedLesson(lessonPublicId, "unpublish");
}
