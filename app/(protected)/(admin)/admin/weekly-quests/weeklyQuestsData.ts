import type { AdminConcept, QuestTemplate, WeeklyQuestWeek } from "@/interfaces/interfaces";
import { fetchAdminConcepts } from "../concepts/conceptsData";
import {
  fetchAdminWeeklyQuestWeeks,
  fetchWeeklyQuestTemplates,
} from "@/lib/utils/weeklyQuests";

export async function fetchWeeklyQuestWeeks(): Promise<WeeklyQuestWeek[]> {
  return fetchAdminWeeklyQuestWeeks();
}

export async function fetchWeeklyQuestConcepts(): Promise<AdminConcept[]> {
  const concepts = await fetchAdminConcepts();
  return Array.isArray(concepts) ? concepts : [];
}

export async function fetchWeeklyQuestTemplatesList(): Promise<QuestTemplate[]> {
  return fetchWeeklyQuestTemplates();
}
