import type { LearnerWeeklyQuestFriendFeedResponse, TaggedFriend } from "@/interfaces/interfaces";

const WEEKLY_QUEST_FRIENDS_FEED_PATH = "/me/weekly-quests/entries";
const DEFAULT_PAGE_SIZE = 20;

interface WeeklyQuestFriendsFeedApiLikeError {
  status: number;
  message?: string;
}

interface FetchWeeklyQuestFriendsFeedParams {
  page?: number;
  size?: number;
}

type RawFeedItem = LearnerWeeklyQuestFriendFeedResponse["items"][number] & {
  taggedFriends?: unknown;
};

type RawFeedResponse = Omit<LearnerWeeklyQuestFriendFeedResponse, "items"> & {
  items: RawFeedItem[];
};

export function getDefaultWeeklyQuestFeedPageSize() {
  return DEFAULT_PAGE_SIZE;
}

export function toWeeklyQuestFriendsFeedError(error: unknown) {
  const fallback = "Could not load the weekly quest friends feed.";

  if (isWeeklyQuestFriendsFeedApiLikeError(error)) {
    if (error.status === 400) {
      return error.message || "Invalid page request. Please try again.";
    }

    if (error.status === 403) {
      return "This page is only available to learner accounts.";
    }

    if (error.status >= 500) {
      return "The server could not load the friends feed right now. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isWeeklyQuestFriendsFeedApiLikeError(
  error: unknown,
): error is WeeklyQuestFriendsFeedApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}

export async function fetchWeeklyQuestFriendsFeed(
  accessToken: string,
  params: FetchWeeklyQuestFriendsFeedParams = {},
) {
  const { apiClientFetch } = await import("../api/apiClient");

  const page = Math.max(0, params.page ?? 0);
  const size = Math.min(50, Math.max(1, params.size ?? DEFAULT_PAGE_SIZE));

  const searchParams = new URLSearchParams({
    view: "FEED",
    page: String(page),
    size: String(size),
  });

  const response = await apiClientFetch<RawFeedResponse>(
    `${WEEKLY_QUEST_FRIENDS_FEED_PATH}?${searchParams.toString()}`,
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
