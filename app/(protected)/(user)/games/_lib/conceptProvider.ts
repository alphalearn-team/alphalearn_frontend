import { ApiError } from "@/lib/api/apiErrors";
import { apiClientFetch } from "@/lib/api/apiClient";
import type { ImposterConceptPoolMode } from "./gameSetup";

export interface AssignedGameConcept {
  conceptPublicId: string;
  word: string;
}

export interface CreatePrivateImposterLobbyRequest {
  conceptPoolMode: ImposterConceptPoolMode;
}

export interface PrivateImposterLobby {
  publicId: string;
}

interface NextGameConceptRequest {
  excludedConceptPublicIds: string[];
  lobbyPublicId?: string;
}

export async function createPrivateImposterLobby(
  accessToken: string,
  conceptPoolMode: ImposterConceptPoolMode,
): Promise<PrivateImposterLobby> {
  return apiClientFetch<PrivateImposterLobby>(
    "/me/imposter/lobbies/private",
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conceptPoolMode,
      } satisfies CreatePrivateImposterLobbyRequest),
    },
  );
}

export async function fetchNextGameConcept(
  accessToken: string,
  excludedConceptPublicIds: string[] = [],
  lobbyPublicId?: string,
): Promise<AssignedGameConcept> {
  const payload: NextGameConceptRequest = {
    excludedConceptPublicIds,
    ...(lobbyPublicId ? { lobbyPublicId } : {}),
  };

  return apiClientFetch<AssignedGameConcept>(
    "/games/imposter/concepts/next",
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export function isEmptyConceptBankError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

export function toFriendlyCreateLobbyError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "The current month pack is not available yet. Choose Full concept pool to start now.";
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to create this lobby.";
    }

    if (error.status === 404) {
      return "The lobby could not be found. Please start a new match.";
    }
  }

  return null;
}

export function toFriendlyLobbyAccessError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return error.message || "You do not have access to this lobby.";
    }

    if (error.status === 404) {
      return "This lobby no longer exists. Start a new match to continue.";
    }
  }

  return null;
}
