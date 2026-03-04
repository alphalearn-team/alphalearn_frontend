"use server";

import type {
  ConceptSuggestionDraft,
  ConceptSuggestionDraftRequest,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export type ConceptSuggestionDraftResult = {
  success: boolean;
  message: string;
  data?: ConceptSuggestionDraft;
};

function normalizeDraft(
  draft: ConceptSuggestionDraft,
): ConceptSuggestionDraft {
  return {
    ...draft,
    status: "DRAFT",
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

function validateDraftInput(
  input: ConceptSuggestionDraftRequest,
): string | null {
  if (!input.title.trim()) {
    return "Title is required";
  }

  if (!input.description.trim()) {
    return "Description is required";
  }

  return null;
}

export async function createConceptSuggestionDraft(
  input: ConceptSuggestionDraftRequest,
): Promise<ConceptSuggestionDraftResult> {
  const validationError = validateDraftInput(input);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  try {
    const draft = await apiFetch<ConceptSuggestionDraft>("/concept-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title.trim(),
        description: input.description.trim(),
      }),
    });

    return {
      success: true,
      message: "Draft created",
      data: normalizeDraft(draft),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function saveConceptSuggestionDraft(
  conceptSuggestionPublicId: string,
  input: ConceptSuggestionDraftRequest,
): Promise<ConceptSuggestionDraftResult> {
  const validationError = validateDraftInput(input);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  try {
    const draft = await apiFetch<ConceptSuggestionDraft>(
      `/concept-suggestions/${conceptSuggestionPublicId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: input.title.trim(),
          description: input.description.trim(),
        }),
      },
    );

    return {
      success: true,
      message: "Draft saved",
      data: normalizeDraft(draft),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
