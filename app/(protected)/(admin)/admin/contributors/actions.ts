"use server";

import { apiFetch } from "@/lib/api/api";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Promote a learner to contributor
 */
export async function promoteUser(learnerPublicId: string) {
  try {
    await apiFetch(`/admin/contributors`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "PROMOTE", learnerPublicIds: [learnerPublicId] }),
    });

    revalidatePath("/admin/contributors");
    return { success: true, message: "User promoted to contributor successfully!" };
  } catch (error) {
    console.error("Error promoting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to promote user",
    };
  }
}

/**
 * Server Action: Demote a contributor to learner
 */
export async function demoteUser(contributorPublicId: string) {
  try {
    await apiFetch(`/admin/contributors`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "DEMOTE", contributorPublicIds: [contributorPublicId] }),
    });

    revalidatePath("/admin/contributors");
    return { success: true, message: "Contributor demoted to learner successfully!" };
  } catch (error) {
    console.error("Error demoting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to demote contributor",
    };
  }
}
