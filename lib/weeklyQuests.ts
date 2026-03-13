import type { WeeklyQuestWeek } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

const WEEKLY_QUESTS_BASE_PATH = "/admin/weekly-quests";

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
