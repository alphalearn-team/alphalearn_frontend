import type { LearnerWeeklyQuestFriendFeedResponse, TaggedFriend } from "@/interfaces/interfaces";

const WEEKLY_QUEST_HISTORY_PATH = "/me/weekly-quests/history";
const DEFAULT_PAGE_SIZE = 20;

interface WeeklyQuestHistoryApiLikeError {
  status: number;
  message?: string;
}

interface FetchWeeklyQuestHistoryParams {
  page?: number;
  size?: number;
  weekPublicIds?: string[];
  submittedFrom?: string;
  submittedTo?: string;
}

type RawFeedItem = LearnerWeeklyQuestFriendFeedResponse["items"][number] & {
  taggedFriends?: unknown;
};

type RawFeedResponse = Omit<LearnerWeeklyQuestFriendFeedResponse, "items"> & {
  items: RawFeedItem[];
};

export function getDefaultWeeklyQuestHistoryPageSize() {
  return DEFAULT_PAGE_SIZE;
}

export function toWeeklyQuestHistoryError(error: unknown) {
  const fallback = "Could not load your quest history.";

  if (isWeeklyQuestHistoryApiLikeError(error)) {
    if (error.status === 400) {
      return error.message || "Invalid request. Please try again.";
    }

    if (error.status === 403) {
      return "This page is only available to learner accounts.";
    }

    if (error.status >= 500) {
      return "The server could not load your history right now. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isWeeklyQuestHistoryApiLikeError(
  error: unknown,
): error is WeeklyQuestHistoryApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}

export async function fetchWeeklyQuestHistory(
  accessToken: string,
  params: FetchWeeklyQuestHistoryParams = {},
) {
  const { apiClientFetch } = await import("../api/apiClient");

  const page = Math.max(0, params.page ?? 0);
  const size = Math.min(50, Math.max(1, params.size ?? DEFAULT_PAGE_SIZE));

  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (params.weekPublicIds && params.weekPublicIds.length > 0) {
    params.weekPublicIds.forEach((weekPublicId) => {
      searchParams.append("weekPublicIds", weekPublicId);
    });
  }

  if (params.submittedFrom) {
    searchParams.append("submittedFrom", params.submittedFrom);
  }

  if (params.submittedTo) {
    searchParams.append("submittedTo", params.submittedTo);
  }

  const response = await apiClientFetch<RawFeedResponse>(
    `${WEEKLY_QUEST_HISTORY_PATH}?${searchParams.toString()}`,
    accessToken,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return {
    ...response,
    items: response.items.map((item) => ({
      ...item,
      taggedFriends: normalizeTaggedFriends(item.taggedFriends),
    })),
  } satisfies LearnerWeeklyQuestFriendFeedResponse;
}

function normalizeTaggedFriends(taggedFriends: unknown): TaggedFriend[] {
  if (!Array.isArray(taggedFriends)) {
    return [];
  }

  return taggedFriends.filter(
    (entry): entry is TaggedFriend =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.learnerPublicId === "string" &&
      typeof entry.learnerUsername === "string",
  );
}
