import type { LearnerWeeklyQuestFriendFeedResponse, TaggedFriend } from "@/interfaces/interfaces";

const WEEKLY_QUEST_TAGGED_HISTORY_PATH = "/me/weekly-quests/tagged/history";
const DEFAULT_PAGE_SIZE = 20;

interface WeeklyQuestTaggedHistoryApiLikeError {
  status: number;
  message?: string;
}

interface FetchWeeklyQuestTaggedHistoryParams {
  page?: number;
  size?: number;
  conceptPublicIds?: string[];
}

type RawFeedItem = LearnerWeeklyQuestFriendFeedResponse["items"][number] & {
  taggedFriends?: unknown;
};

type RawFeedResponse = Omit<LearnerWeeklyQuestFriendFeedResponse, "items"> & {
  items: RawFeedItem[];
};

export function getDefaultWeeklyQuestTaggedHistoryPageSize() {
  return DEFAULT_PAGE_SIZE;
}

export function toWeeklyQuestTaggedHistoryError(error: unknown) {
  const fallback = "Could not load tagged quest submissions.";

  if (isWeeklyQuestTaggedHistoryApiLikeError(error)) {
    if (error.status === 400) {
      return error.message || "Invalid request. Please try again.";
    }

    if (error.status === 403) {
      return "This page is only available to learner accounts.";
    }

    if (error.status >= 500) {
      return "The server could not load tagged submissions right now. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isWeeklyQuestTaggedHistoryApiLikeError(
  error: unknown,
): error is WeeklyQuestTaggedHistoryApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}

export async function fetchWeeklyQuestTaggedHistory(
  accessToken: string,
  params: FetchWeeklyQuestTaggedHistoryParams = {},
) {
  const { apiClientFetch } = await import("../api/apiClient");

  const page = Math.max(0, params.page ?? 0);
  const size = Math.min(50, Math.max(1, params.size ?? DEFAULT_PAGE_SIZE));

  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (params.conceptPublicIds && params.conceptPublicIds.length > 0) {
    params.conceptPublicIds.forEach((conceptPublicId) => {
      searchParams.append("conceptPublicIds", conceptPublicId);
    });
  }

  const response = await apiClientFetch<RawFeedResponse>(
    `${WEEKLY_QUEST_TAGGED_HISTORY_PATH}?${searchParams.toString()}`,
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
