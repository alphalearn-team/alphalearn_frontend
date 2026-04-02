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
  lobbyCode: string;
  publicId?: string;
  isPrivate: boolean;
  conceptPoolMode: ImposterConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
}

interface NextGameConceptRequest {
  excludedConceptPublicIds: string[];
  lobbyCode?: string;
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
  lobbyCode?: string,
  lobbyPublicId?: string,
): Promise<AssignedGameConcept> {
  if (lobbyCode && lobbyPublicId && lobbyCode !== lobbyPublicId) {
    throw new Error("Lobby code mismatch. Please restart the match.");
  }

  const payload: NextGameConceptRequest = {
    excludedConceptPublicIds,
    ...(lobbyCode ? { lobbyCode } : {}),
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
      return error.message || "You are not allowed to create a private lobby.";
    }

    if (error.status === 404) {
      return "Lobby creation is currently unavailable. Please try again in a moment.";
    }

    if (error.status >= 500) {
      return "The server could not create a lobby right now. Please try again.";
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
