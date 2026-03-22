"use server";

import { apiFetch } from "@/lib/api/api";
import { revalidatePath } from "next/cache";

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
