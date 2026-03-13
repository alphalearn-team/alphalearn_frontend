import type { WeeklyQuestWeek } from "@/interfaces/interfaces";
import { fetchAdminWeeklyQuestWeeks } from "@/lib/weeklyQuests";

export async function fetchWeeklyQuestWeeks(): Promise<WeeklyQuestWeek[]> {
  return fetchAdminWeeklyQuestWeeks();
}
