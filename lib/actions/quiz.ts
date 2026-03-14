"use server";

import { apiFetch, ApiError } from "@/lib/api";

export async function createQuizAction(payload: unknown) {
  try {
    await apiFetch("/quizzes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to create quiz:", err);
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "An unexpected error occurred",
    };
  }
}
