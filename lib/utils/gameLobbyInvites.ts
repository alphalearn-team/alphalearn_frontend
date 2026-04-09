import { apiClientFetch } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiErrors";

const PRIVATE_INVITES_BASE_PATH = "/me/game-lobbies/private-invites";

export type PrivateLobbyInviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export type PrivateLobbyInviteDirection = "incoming" | "outgoing";
export type PrivateLobbyInviteAction = "ACCEPT" | "REJECT";

export interface PrivateLobbyInvite {
  invitePublicId: string;
  lobbyPublicId: string;
  lobbyCode: string;
  senderPublicId: string;
  senderUsername: string;
  receiverPublicId: string;
  receiverUsername: string;
  status: PrivateLobbyInviteStatus;
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string | null;
}

export async function getPrivateInvites(
  accessToken: string,
  direction: PrivateLobbyInviteDirection,
  status?: string,
): Promise<PrivateLobbyInvite[]> {
  const query = new URLSearchParams({
    direction,
    ...(status ? { status } : {}),
  });

  try {
    return await apiClientFetch<PrivateLobbyInvite[]>(
      `${PRIVATE_INVITES_BASE_PATH}?${query.toString()}`,
      accessToken,
      { method: "GET" },
    );
  } catch {
    return [];
  }
}

export async function getIncomingPendingPrivateInvites(accessToken: string): Promise<PrivateLobbyInvite[]> {
  return getPrivateInvites(accessToken, "incoming", "pending");
}

export async function respondToPrivateInvite(
  accessToken: string,
  invitePublicId: string,
  action: PrivateLobbyInviteAction,
): Promise<PrivateLobbyInvite> {
  return apiClientFetch<PrivateLobbyInvite>(
    `${PRIVATE_INVITES_BASE_PATH}/${invitePublicId}`,
    accessToken,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    },
  );
}

export async function cancelPrivateInvite(
  accessToken: string,
  invitePublicId: string,
): Promise<void> {
  await apiClientFetch<void>(
    `${PRIVATE_INVITES_BASE_PATH}/${invitePublicId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}

export function toFriendlyPrivateInviteActionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "This invite is no longer joinable and may have expired.";
    }

    if (error.status === 404) {
      return "This invite no longer exists.";
    }

    if (error.status === 403) {
      return "You are not allowed to respond to this invite.";
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Could not update invite right now. Please try again.";
}
