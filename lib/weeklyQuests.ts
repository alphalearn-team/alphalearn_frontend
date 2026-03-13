import type {
  QuestTemplate,
  SaveWeeklyQuestOfficialAssignmentRequest,
  WeeklyQuestWeek,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

const WEEKLY_QUESTS_BASE_PATH = "/admin/weekly-quests";

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
  return weeks.map(normalizeWeek);
}

export async function fetchWeeklyQuestTemplates(): Promise<QuestTemplate[]> {
  return apiFetch<QuestTemplate[]>(`${WEEKLY_QUESTS_BASE_PATH}/templates`);
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
