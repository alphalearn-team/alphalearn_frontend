import { apiClientFetch } from "@/lib/api/apiClient";
import type {
  CreatePrivateImposterLobbyRequest,
  InvitePrivateImposterLobbyFriendsRequest,
  JoinedPrivateImposterLobbyDto,
  JoinPrivateImposterLobbyRequest,
  KickPrivateImposterLobbyMemberRequest,
  LeavePrivateImposterLobbyResponse,
  PrivateImposterLobbyDto,
  PrivateImposterLobbyStateDto,
  UpdatePrivateImposterLobbySettingsRequest,
} from "./types";

const PRIVATE_LOBBY_BASE_PATH = "/me/game-lobbies/private-lobbies";

function toJsonRequest(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export function normalizeLobbyCode(input: string): string {
  return input.trim().toUpperCase();
}

export async function createPrivateLobby(
  accessToken: string,
  request: CreatePrivateImposterLobbyRequest,
): Promise<PrivateImposterLobbyDto> {
  return apiClientFetch<PrivateImposterLobbyDto>(
    PRIVATE_LOBBY_BASE_PATH,
    accessToken,
    toJsonRequest(request),
  );
}

export async function joinPrivateLobby(
  accessToken: string,
  request: JoinPrivateImposterLobbyRequest,
): Promise<JoinedPrivateImposterLobbyDto> {
  return apiClientFetch<JoinedPrivateImposterLobbyDto>(
    "/me/game-lobbies/private-memberships",
    accessToken,
    toJsonRequest({
      lobbyCode: normalizeLobbyCode(request.lobbyCode),
    }),
  );
}

export async function leavePrivateLobby(
  accessToken: string,
  lobbyPublicId: string,
): Promise<LeavePrivateImposterLobbyResponse> {
  return apiClientFetch<LeavePrivateImposterLobbyResponse>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}`,
    accessToken,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "LEAVE" }),
    },
  );
}

export async function startPrivateLobby(
  accessToken: string,
  lobbyPublicId: string,
): Promise<PrivateImposterLobbyStateDto> {
  return apiClientFetch<PrivateImposterLobbyStateDto>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}`,
    accessToken,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "START" }),
    },
  );
}

export async function updatePrivateLobbySettings(
  accessToken: string,
  lobbyPublicId: string,
  request: UpdatePrivateImposterLobbySettingsRequest,
): Promise<PrivateImposterLobbyStateDto> {
  return apiClientFetch<PrivateImposterLobbyStateDto>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}/settings`,
    accessToken,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}

export async function getPrivateLobbyState(
  accessToken: string,
  lobbyPublicId: string,
): Promise<PrivateImposterLobbyStateDto> {
  return apiClientFetch<PrivateImposterLobbyStateDto>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}`,
    accessToken,
    {
      method: "GET",
    },
  );
}

export async function sendPrivateLobbyInvites(
  accessToken: string,
  lobbyPublicId: string,
  request: InvitePrivateImposterLobbyFriendsRequest,
): Promise<void> {
  await apiClientFetch<void>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}/invites`,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}

export async function kickPrivateLobbyMember(
  accessToken: string,
  lobbyPublicId: string,
  request: KickPrivateImposterLobbyMemberRequest,
): Promise<void> {
  await apiClientFetch<void>(
    `${PRIVATE_LOBBY_BASE_PATH}/${lobbyPublicId}/members`,
    accessToken,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}
