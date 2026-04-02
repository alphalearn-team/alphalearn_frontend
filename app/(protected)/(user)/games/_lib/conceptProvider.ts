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

export interface JoinPrivateImposterLobbyRequest {
  lobbyCode: string;
}

export interface PrivateImposterLobby {
  lobbyCode: string;
  publicId: string;
  isPrivate: boolean;
  conceptPoolMode: ImposterConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
}

export interface JoinedPrivateImposterLobby extends PrivateImposterLobby {
  joinedAt: string;
  alreadyMember: boolean;
}

export interface PrivateImposterLobbyActiveMember {
  learnerPublicId: string;
  username: string;
  joinedAt: string;
  host: boolean;
}

export interface PrivateImposterLobbyState {
  publicId: string;
  lobbyCode: string;
  conceptPoolMode: ImposterConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
  startedAt: string | null;
  activeMemberCount: number;
  activeMembers: PrivateImposterLobbyActiveMember[];
  viewerIsHost: boolean;
  viewerIsActiveMember: boolean;
  canLeave: boolean;
  canStart: boolean;
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

export async function joinPrivateImposterLobby(
  accessToken: string,
  lobbyCode: string,
): Promise<JoinedPrivateImposterLobby> {
  return apiClientFetch<JoinedPrivateImposterLobby>(
    "/me/imposter/lobbies/private/join",
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lobbyCode,
      } satisfies JoinPrivateImposterLobbyRequest),
    },
  );
}

export async function getPrivateImposterLobbyState(
  accessToken: string,
  lobbyPublicId: string,
): Promise<PrivateImposterLobbyState> {
  return apiClientFetch<PrivateImposterLobbyState>(
    `/me/imposter/lobbies/private/${lobbyPublicId}/state`,
    accessToken,
    {
      method: "GET",
    },
  );
}

export async function startPrivateImposterLobby(
  accessToken: string,
  lobbyPublicId: string,
): Promise<PrivateImposterLobbyState> {
  return apiClientFetch<PrivateImposterLobbyState>(
    `/me/imposter/lobbies/private/${lobbyPublicId}/start`,
    accessToken,
    {
      method: "POST",
    },
  );
}

export async function leavePrivateImposterLobby(
  accessToken: string,
  lobbyPublicId: string,
): Promise<void> {
  return apiClientFetch<void>(
    `/me/imposter/lobbies/private/${lobbyPublicId}/leave`,
    accessToken,
    {
      method: "POST",
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

export function toFriendlyLobbyStateError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "This lobby no longer exists. Start a new match to continue.";
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to view this lobby.";
    }

    if (error.status === 409) {
      return error.message || "This lobby is not ready yet. Refresh and try again.";
    }

    if (error.status >= 500) {
      return "The server could not load this lobby right now. Please try again.";
    }
  }

  return null;
}

export function toFriendlyStartLobbyError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "This lobby no longer exists. Start a new match to continue.";
    }

    if (error.status === 403) {
      return error.message || "Only active hosts can start this lobby.";
    }

    if (error.status === 409) {
      return error.message || "This lobby cannot be started yet. Make sure at least 3 active players joined.";
    }

    if (error.status >= 500) {
      return "The server could not start this lobby right now. Please try again.";
    }
  }

  return null;
}

export function toFriendlyLeaveLobbyError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "This lobby no longer exists.";
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to leave this lobby.";
    }

    if (error.status === 409) {
      return error.message || "You cannot leave this lobby in its current state.";
    }

    if (error.status >= 500) {
      return "The server could not leave this lobby right now. Please try again.";
    }
  }

  return null;
}

export function toFriendlyJoinLobbyError(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.message || "Enter a valid lobby code.";
    }

    if (error.status === 409) {
      return error.message || "You are already active in this lobby.";
    }

    if (error.status === 403) {
      return error.message || "You are not allowed to join this lobby.";
    }

    if (error.status === 404) {
      return "This lobby code was not found. Ask the host to verify and try again.";
    }

    if (error.status >= 500) {
      return "The server could not join the lobby right now. Please try again.";
    }
  }

  return null;
}
