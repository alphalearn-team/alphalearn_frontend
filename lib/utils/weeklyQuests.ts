import type {
  LearnerCurrentWeeklyQuest,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import { ApiError } from "@/lib/api/apiErrors";

const LEARNER_WEEKLY_QUEST_PATH = "/me/weekly-quest/current";

export interface FetchCurrentWeeklyQuestResult {
  data: LearnerCurrentWeeklyQuest | null;
  status: "success" | "empty" | "error";
}

export async function fetchCurrentWeeklyQuest(): Promise<FetchCurrentWeeklyQuestResult> {
  try {
    const quest = await apiFetch<LearnerCurrentWeeklyQuest | null>(LEARNER_WEEKLY_QUEST_PATH);

    if (!quest) {
      return {
        data: null,
        status: "empty",
      };
    }

    return {
      data: quest,
      status: "success",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        data: null,
        status: "empty",
      };
    }

    return {
      data: null,
      status: "error",
    };
  }
}
