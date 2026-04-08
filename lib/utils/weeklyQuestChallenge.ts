import type {
  LearnerQuestChallengeSubmission,
  QuestChallengeUploadRequest,
  QuestChallengeUploadResponse,
  SaveQuestChallengeSubmissionRequest,
} from "@/interfaces/interfaces";

const QUEST_CHALLENGE_UPLOAD_PATH = "/me/weekly-quests/quest-challenge-uploads";
const QUEST_CHALLENGE_SUBMISSION_PATH = "/me/weekly-quests/quest-challenge-submissions?scope=CURRENT";

export type QuestChallengeMediaKind = "image" | "video" | "unknown";

interface QuestChallengeApiLikeError {
  status: number;
  message?: string;
}

export function isSupportedQuestChallengeFile(file: Pick<File, "type">) {
  return isSupportedQuestChallengeContentType(file.type);
}

export function isSupportedQuestChallengeContentType(contentType: string | null | undefined) {
  if (!contentType) {
    return false;
  }

  return /^(image|video)\//.test(contentType);
}

export function getQuestChallengeMediaKind(contentType: string | null | undefined): QuestChallengeMediaKind {
  if (!contentType) {
    return "unknown";
  }

  if (contentType.startsWith("image/")) {
    return "image";
  }

  if (contentType.startsWith("video/")) {
    return "video";
  }

  return "unknown";
}

export function toFriendlyQuestChallengeError(error: unknown) {
  const fallback = "Something went wrong while updating your quest challenge submission.";

  if (isQuestChallengeApiLikeError(error)) {
    if (error.status === 400) {
      const msg = error.message || "The selected file or submission data is invalid.";
      // Handle friend tag specific errors
      if (msg.toLowerCase().includes("self")) {
        return "You cannot tag yourself.";
      }
      if (msg.toLowerCase().includes("non-friend")) {
        return "One or more tagged friends are not in your friend list.";
      }
      if (msg.toLowerCase().includes("unknown learner")) {
        return "One or more friends could not be found.";
      }
      return msg;
    }

    if (error.status === 404) {
      return "There is no active quest challenge right now.";
    }

    if (error.status === 403) {
      return "This action is available to learner accounts only.";
    }

    if (error.status === 409) {
      return error.message || "This quest challenge is no longer accepting submissions.";
    }

    if (error.status >= 500) {
      return "The server could not process the quest challenge request. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isQuestChallengeApiLikeError(error: unknown): error is QuestChallengeApiLikeError {
  return typeof error === "object" && error !== null && "status" in error;
}

export async function createQuestChallengeUpload(
  accessToken: string,
  payload: QuestChallengeUploadRequest,
) {
  const { apiClientFetch } = await import("../api/apiClient");

  return apiClientFetch<QuestChallengeUploadResponse>(QUEST_CHALLENGE_UPLOAD_PATH, accessToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function saveQuestChallengeSubmission(
  accessToken: string,
  payload: SaveQuestChallengeSubmissionRequest,
) {
  const { apiClientFetch } = await import("../api/apiClient");

  return apiClientFetch<LearnerQuestChallengeSubmission>(
    QUEST_CHALLENGE_SUBMISSION_PATH,
    accessToken,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}
