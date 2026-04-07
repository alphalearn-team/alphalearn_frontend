/**
 * Friend-related utilities and API functions for weekly quest challenge tagging
 */

const PRIMARY_FRIENDS_API_PATH = "/friends";
const FALLBACK_FRIENDS_API_PATH = "/me/friends";

export interface Friend {
  publicId: string;
  username: string;
}

interface FriendList {
  friends: Friend[];
}

type FriendListResponse = Friend[] | FriendList;

interface FriendApiLikeError {
  status: number;
  message?: string;
}

/**
 * Fetches the list of friends for the current learner
 * @param accessToken - The user's access token
 * @returns Array of Friend objects
 */
export async function fetchFriendsList(accessToken: string): Promise<Friend[]> {
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
        return [];
      }
    }

    console.error("Failed to fetch friends list:", error);
    return [];
  }
}

function normalizeFriendListResponse(response: FriendListResponse): Friend[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.friends ?? [];
}

/**
 * Searches through a list of friends by username or publicId
 * @param friends - Array of Friend objects to search through
 * @param query - Search query string
 * @returns Filtered array of Friends matching the query
 */
export function searchFriends(friends: Friend[], query: string): Friend[] {
  if (!query.trim()) {
    return friends;
  }

  const lowerQuery = query.toLowerCase();
  return friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(lowerQuery) ||
      friend.publicId.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Converts friendly error messages for friend-related backend validation errors
 * @param error - Error object from the API
 * @returns User-friendly error message
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
