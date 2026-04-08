"use server";

import { apiFetch, ApiError } from "@/lib/api/api";

export async function createQuizAction(payload: unknown) {
  try {
    // console.log("general quiz structure:",payload);
    await apiFetch("/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to create quiz:", err);
    return {
      success: false,
      error:
        err instanceof ApiError ? err.message : "An unexpected error occurred",
    };
  }
}

export async function updateQuizAction(quizPublicId: string, payload: unknown) {
  try {
    await apiFetch(`/quizzes/${quizPublicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update quiz:", err);
    return {
      success: false,
      error:
        err instanceof ApiError ? err.message : "An unexpected error occurred",
    };
  }
}
