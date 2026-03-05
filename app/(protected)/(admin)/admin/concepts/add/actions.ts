"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action: Create a new concept
 */
export async function addConcept(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // Validation
  if (!title || title.trim().length === 0) {
    return { success: false, message: "Title is required" };
  }

  if (!description || description.trim().length === 0) {
    return { success: false, message: "Description is required" };
  }

  if (title.length > 50) {
    return { success: false, message: "Title must be 50 characters or less" };
  }

  if (description.length > 500) {
    return { success: false, message: "Description must be 500 characters or less" };
  }

  try {
    await apiFetch(`/admin/concepts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        title: title.trim(), 
        description: description.trim() 
      }),
    });

    revalidatePath("/admin/concepts");
    redirect("/admin/concepts");
  } catch (error) {
    // Re-throw redirect errors (they're not actual errors)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    console.error("Error adding concept:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to add concept" 
    };
  }
}
