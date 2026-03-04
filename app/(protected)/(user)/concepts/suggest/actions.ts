"use server";

import type {
  ConceptSuggestion,
  ConceptSuggestionDraftRequest,
} from "@/interfaces/interfaces";
import { getServerSession } from "@/lib/auth/session";

export type ConceptSuggestionDraftResult = {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: ConceptSuggestion;
};

type RequestError = {
  message: string;
  statusCode?: number;
};

const headers = {
  "Content-Type": "application/json",
};

function getErrorDetails(error: unknown): RequestError {
  if (error && typeof error === "object" && "message" in error) {
    const message = typeof error.message === "string"
      ? error.message
      : "Something went wrong";
    const statusCode = (
      "statusCode" in error && typeof error.statusCode === "number"
    )
      ? error.statusCode
      : undefined;

    return { message, statusCode };
  }

  return { message: "Something went wrong" };
}

async function requestConceptSuggestion(
  endpoint: string,
  options: RequestInit,
): Promise<ConceptSuggestion> {
  const session = await getServerSession();

  if (!session) {
    throw { message: "user not authenticated", statusCode: 403 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawBody = await response.text();

    if (!rawBody) {
      throw {
        message: `Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ""})`,
        statusCode: response.status,
      };
    }

    let message = rawBody;

    try {
      const parsedBody = JSON.parse(rawBody) as { message?: string };
      message = parsedBody.message || rawBody;
    } catch {
      // Fall back to the raw response body when the backend does not return JSON.
    }

    throw {
      message,
      statusCode: response.status,
    };
  }

  return response.json();
}

export async function createConceptSuggestionDraft(
  input: ConceptSuggestionDraftRequest,
): Promise<ConceptSuggestionDraftResult> {
  try {
    const suggestion = await requestConceptSuggestion("/concept-suggestions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: input.title,
        description: input.description,
      }),
    });

    return {
      success: true,
      message: "Draft created",
      data: suggestion,
    };
  } catch (error) {
    const { message, statusCode } = getErrorDetails(error);

    return {
      success: false,
      message,
      statusCode,
    };
  }
}

export async function saveConceptSuggestionDraft(
  conceptSuggestionPublicId: string,
  input: ConceptSuggestionDraftRequest,
): Promise<ConceptSuggestionDraftResult> {
  try {
    const suggestion = await requestConceptSuggestion(
      `/concept-suggestions/${conceptSuggestionPublicId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: input.title,
          description: input.description,
        }),
      },
    );

    return {
      success: true,
      message: "Draft saved",
      data: suggestion,
    };
  } catch (error) {
    const { message, statusCode } = getErrorDetails(error);

    return {
      success: false,
      message,
      statusCode,
    };
  }
}

export async function submitConceptSuggestionDraft(
  conceptSuggestionPublicId: string,
): Promise<ConceptSuggestionDraftResult> {
  try {
    const suggestion = await requestConceptSuggestion(
      `/concept-suggestions/${conceptSuggestionPublicId}/submit`,
      {
        method: "POST",
      },
    );

    return {
      success: true,
      message: "Submitted for review",
      data: suggestion,
    };
  } catch (error) {
    const { message, statusCode } = getErrorDetails(error);

    return {
      success: false,
      message,
      statusCode,
    };
  }
}
