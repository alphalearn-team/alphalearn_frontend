import type {
  LearnerCurrentWeeklyQuest,
  QuestTemplate,
  SaveWeeklyQuestOfficialAssignmentRequest,
  WeeklyQuestWeek,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { ApiError } from "@/lib/apiErrors";

const WEEKLY_QUESTS_BASE_PATH = "/admin/weekly-quests";
const LEARNER_WEEKLY_QUEST_PATH = "/me/weekly-quest/current";

export interface FetchCurrentWeeklyQuestResult {
  data: LearnerCurrentWeeklyQuest | null;
  status: "success" | "empty" | "error";
}

function encodeWeekStartDate(weekStartDate: string) {
  const normalizedWeekStartDate = weekStartDate.includes("T")
    ? weekStartDate.split("T")[0]
    : weekStartDate;

  return encodeURIComponent(normalizedWeekStartDate);
}

function normalizeWeek(week: WeeklyQuestWeek): WeeklyQuestWeek {
  return {
    ...week,
    publicId: week.publicId ?? null,
    activationSource: week.activationSource ?? null,
    activatedAt: week.activatedAt ?? null,
    createdAt: week.createdAt ?? null,
    officialAssignment: week.officialAssignment ?? null,
  };
}

export async function fetchAdminWeeklyQuestWeeks(): Promise<WeeklyQuestWeek[]> {
  const weeks = await apiFetch<WeeklyQuestWeek[]>(`${WEEKLY_QUESTS_BASE_PATH}/weeks`);
  return Array.isArray(weeks) ? weeks.map(normalizeWeek) : [];
}

export async function fetchWeeklyQuestTemplates(): Promise<QuestTemplate[]> {
  const templates = await apiFetch<QuestTemplate[]>(`${WEEKLY_QUESTS_BASE_PATH}/templates`);
  return Array.isArray(templates) ? templates : [];
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

export async function saveWeeklyQuestOfficialAssignment(
  weekStartDate: string,
  payload: SaveWeeklyQuestOfficialAssignmentRequest,
): Promise<WeeklyQuestWeek> {
  const week = await apiFetch<WeeklyQuestWeek>(
    `${WEEKLY_QUESTS_BASE_PATH}/weeks/${encodeWeekStartDate(weekStartDate)}/official`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return normalizeWeek(week);
}
