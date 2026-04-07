/**
 * Friend-related utilities and API functions for profile squad management
 * and weekly quest challenge tagging.
 */

const PRIMARY_FRIENDS_API_PATH = "/friends";
const FALLBACK_FRIENDS_API_PATH = "/me/friends";
const LEARNERS_API_PATH = "/learners";
const FRIEND_REQUESTS_API_PATH = "/friend-requests";

export type FriendRequestDirection = "INCOMING" | "OUTGOING";
export type FriendRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Friend {
  publicId: string;
  username: string;
  profilePictureUrl: string | null;
}

export interface LearnerPublic {
  publicId: string;
  username: string;
  profilePictureUrl: string | null;
}

export interface FriendRequest {
  requestId: number;
  otherUserPublicId: string;
  otherUsername: string;
  otherUserProfilePictureUrl: string | null;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface CreateFriendRequestPayload {
  receiverPublicId: string;
}

export interface UpdateFriendRequestStatusPayload {
  status: Extract<FriendRequestStatus, "APPROVED" | "REJECTED">;
}

interface FriendList {
  friends: Friend[];
}

type FriendListResponse = Friend[] | FriendList;

interface FriendApiLikeError {
  status: number;
  message?: string;
}

export async function fetchFriends(accessToken: string): Promise<Friend[]> {
  const { apiClientFetch } = await import("../api/apiClient");

  try {
    const response = await apiClientFetch<FriendListResponse>(PRIMARY_FRIENDS_API_PATH, accessToken, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return normalizeFriendListResponse(response);
  } catch (error) {
    if (isFriendApiLikeError(error) && error.status === 404) {
      try {
        const fallbackResponse = await apiClientFetch<FriendListResponse>(
          FALLBACK_FRIENDS_API_PATH,
          accessToken,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        return normalizeFriendListResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error("Failed to fetch friends list from fallback endpoint:", fallbackError);
        throw fallbackError;
      }
    }

    throw error;
  }
}

export async function fetchFriendsList(accessToken: string): Promise<Friend[]> {
  return fetchFriends(accessToken);
}

export async function unfriend(accessToken: string, friendPublicId: string): Promise<void> {
  const { apiClientFetch } = await import("../api/apiClient");

  await apiClientFetch<null>(`${PRIMARY_FRIENDS_API_PATH}/${friendPublicId}`, accessToken, {
    method: "DELETE",
  });
}

export async function fetchLearners(accessToken: string): Promise<LearnerPublic[]> {
  const { apiClientFetch } = await import("../api/apiClient");

  return apiClientFetch<LearnerPublic[]>(LEARNERS_API_PATH, accessToken, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function sendFriendRequest(
  accessToken: string,
  payload: CreateFriendRequestPayload,
): Promise<FriendRequest> {
  const { apiClientFetch } = await import("../api/apiClient");

  return apiClientFetch<FriendRequest>(FRIEND_REQUESTS_API_PATH, accessToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchFriendRequests(
  accessToken: string,
  direction: FriendRequestDirection,
): Promise<FriendRequest[]> {
  const { apiClientFetch } = await import("../api/apiClient");

  return apiClientFetch<FriendRequest[]>(
    `${FRIEND_REQUESTS_API_PATH}?direction=${direction}`,
    accessToken,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export async function updateFriendRequestStatus(
  accessToken: string,
  requestId: number,
  payload: UpdateFriendRequestStatusPayload,
): Promise<void> {
  const { apiClientFetch } = await import("../api/apiClient");

  await apiClientFetch<null>(`${FRIEND_REQUESTS_API_PATH}/${requestId}`, accessToken, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function cancelFriendRequest(accessToken: string, requestId: number): Promise<void> {
  const { apiClientFetch } = await import("../api/apiClient");

  await apiClientFetch<null>(`${FRIEND_REQUESTS_API_PATH}/${requestId}`, accessToken, {
    method: "DELETE",
  });
}

function normalizeFriendListResponse(response: FriendListResponse): Friend[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.friends ?? [];
}

/**
 * Searches through a list of friends by username.
 */
export function searchFriends(friends: Friend[], query: string): Friend[] {
  if (!query.trim()) {
    return friends;
  }

  const lowerQuery = query.trim().toLowerCase();
  return friends.filter((friend) => friend.username.toLowerCase().includes(lowerQuery));
}

export function searchLearners(learners: LearnerPublic[], query: string): LearnerPublic[] {
  if (!query.trim()) {
    return learners;
  }

  const lowerQuery = query.trim().toLowerCase();
  return learners.filter((learner) => learner.username.toLowerCase().includes(lowerQuery));
}

export function getFriendsLoadErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status === 404) {
      return "We could not find your squad right now.";
    }

    if (error.status >= 500) {
      return "We could not load your squad right now. Please try again.";
    }

    return error.message || "We could not load your squad.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not load your squad.";
}

export function getLearnersLoadErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status >= 500) {
      return "We could not load learners right now. Please try again.";
    }

    return error.message || "We could not load learners.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not load learners.";
}

export function getUnfriendErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status === 404) {
      return "That friend could not be found.";
    }

    if (error.status >= 500) {
      return "We could not remove this friend right now. Please try again.";
    }

    return error.message || "We could not remove this friend.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not remove this friend.";
}

export function getAddFriendErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status === 400) {
      return error.message || "Choose a valid learner before sending a request.";
    }

    if (error.status === 409) {
      return error.message || "A friend request already exists for this learner.";
    }

    if (error.status >= 500) {
      return "We could not send that friend request right now. Please try again.";
    }

    return error.message || "We could not send that friend request.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not send that friend request.";
}

export function getFriendRequestsLoadErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status >= 500) {
      return "We could not load friend requests right now. Please try again.";
    }

    return error.message || "We could not load friend requests.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not load friend requests.";
}

export function getRespondToFriendRequestErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status === 403) {
      return "You are not allowed to respond to that friend request.";
    }

    if (error.status === 404) {
      return "That friend request could not be found.";
    }

    if (error.status === 409) {
      return error.message || "That friend request was already handled.";
    }

    if (error.status >= 500) {
      return "We could not update that friend request right now. Please try again.";
    }

    return error.message || "We could not update that friend request.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not update that friend request.";
}

export function getCancelFriendRequestErrorMessage(error: unknown): string {
  if (isFriendApiLikeError(error)) {
    if (error.status === 403) {
      return "You are not allowed to cancel that friend request.";
    }

    if (error.status === 404) {
      return "That friend request could not be found.";
    }

    if (error.status === 409) {
      return error.message || "Only pending requests can be cancelled.";
    }

    if (error.status >= 500) {
      return "We could not cancel that friend request right now. Please try again.";
    }

    return error.message || "We could not cancel that friend request.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not cancel that friend request.";
}

/**
 * Converts friendly error messages for friend-related backend validation errors.
 */
export function toFriendlyFriendTagError(error: unknown): string {
  const fallback = "There was an issue with your friend tags.";

  if (isFriendApiLikeError(error)) {
    if (error.status === 400) {
      if (error.message?.includes("self")) {
        return "You cannot tag yourself.";
      }
      if (error.message?.includes("friend")) {
        return "One or more tagged friends are not in your friend list.";
      }
      if (error.message?.includes("unknown")) {
        return "One or more friends could not be found.";
      }
      return error.message || "Invalid friend tags.";
    }

    if (error.status === 403) {
      return "You don't have permission to modify this submission.";
    }

    if (error.status === 404) {
      return "The submission or friends could not be found.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isFriendApiLikeError(error: unknown): error is FriendApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}
