import type { TaggedFriend } from "@/interfaces/interfaces";

const WEEKLY_QUEST_RECORDS_PATH = "/me/weekly-quests/friends";
const DEFAULT_PAGE_SIZE = 20;

interface WeeklyQuestRecordsApiLikeError {
  status: number;
  message?: string;
}

export interface FriendWeeklyQuestRecord {
  submissionPublicId: string;
  learnerPublicId: string;
  learnerUsername: string;
  assignmentPublicId: string;
  weekPublicId: string;
  weekStartAt: string;
  conceptPublicId: string;
  conceptTitle: string;
  mediaPublicUrl: string;
  mediaContentType: string;
  originalFilename: string;
  caption: string | null;
  submittedAt: string;
  visibility: string;
  taggedFriends: TaggedFriend[];
}

export interface FriendWeeklyQuestRecordsResponse {
  items: FriendWeeklyQuestRecord[];
  page: number;
  size: number;
  hasNext: boolean;
}

type RawFriendWeeklyQuestRecord = Omit<FriendWeeklyQuestRecord, "taggedFriends"> & {
  taggedFriends?: unknown;
};

type RawFriendWeeklyQuestRecordsResponse = Omit<FriendWeeklyQuestRecordsResponse, "items"> & {
  items: RawFriendWeeklyQuestRecord[];
};

interface FetchFriendWeeklyQuestRecordsParams {
  friendPublicId: string;
  page?: number;
  size?: number;
}

export function getDefaultWeeklyQuestRecordsPageSize() {
  return DEFAULT_PAGE_SIZE;
}

export function isWeeklyQuestRecordsForbidden(error: unknown) {
  return isWeeklyQuestRecordsApiLikeError(error) && error.status === 403;
}

export function getWeeklyQuestRecordsErrorMessage(
  error: unknown,
  options?: { viewerIsFriend?: boolean },
) {
  const fallback = "We could not load quest submissions right now.";

  if (isWeeklyQuestRecordsApiLikeError(error)) {
    if (error.status === 400) {
      return error.message || "That quest submissions request was invalid.";
    }

    if (error.status === 403) {
      return options?.viewerIsFriend === false
        ? "Quest submissions are only visible to friends."
        : "You do not have access to these quest submissions.";
    }

    if (error.status === 404) {
      return "We could not find quest submissions for this learner.";
    }

    if (error.status >= 500) {
      return "The server could not load quest submissions right now. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function fetchFriendWeeklyQuestRecords(
  accessToken: string,
  params: FetchFriendWeeklyQuestRecordsParams,
) {
  const { apiClientFetch } = await import("../api/apiClient");

  const page = Math.max(0, params.page ?? 0);
  const size = Math.min(50, Math.max(1, params.size ?? DEFAULT_PAGE_SIZE));
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await apiClientFetch<RawFriendWeeklyQuestRecordsResponse>(
    `${WEEKLY_QUEST_RECORDS_PATH}/${encodeURIComponent(params.friendPublicId)}/history?${searchParams.toString()}`,
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
  } satisfies FriendWeeklyQuestRecordsResponse;
}

function isWeeklyQuestRecordsApiLikeError(
  error: unknown,
): error is WeeklyQuestRecordsApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}

function normalizeTaggedFriends(taggedFriends: unknown): TaggedFriend[] {
  if (!Array.isArray(taggedFriends)) {
    return [];
  }

  return taggedFriends.filter(
    (entry): entry is TaggedFriend =>
      typeof entry === "object"
      && entry !== null
      && typeof entry.learnerPublicId === "string"
      && typeof entry.learnerUsername === "string",
  );
}
