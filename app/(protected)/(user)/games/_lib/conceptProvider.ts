import { ApiError } from "@/lib/api/apiErrors";
import { apiClientFetch } from "@/lib/api/apiClient";

export interface AssignedGameConcept {
  conceptPublicId: string;
  word: string;
}

interface NextGameConceptRequest {
  excludedConceptPublicIds: string[];
}

export async function fetchNextGameConcept(
  accessToken: string,
  excludedConceptPublicIds: string[] = [],
): Promise<AssignedGameConcept> {
  return apiClientFetch<AssignedGameConcept>(
    "/api/games/imposter/concepts/next",
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        excludedConceptPublicIds,
      } satisfies NextGameConceptRequest),
    },
  );
}

export function isEmptyConceptBankError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
