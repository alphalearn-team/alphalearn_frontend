import type { AdminConcept, QuestTemplate, WeeklyQuestWeek } from "@/interfaces/interfaces";
import { fetchAdminConcepts } from "../concepts/conceptsData";
import {
  fetchAdminWeeklyQuestWeeks,
  fetchWeeklyQuestTemplates,
} from "@/lib/weeklyQuests";

export async function fetchWeeklyQuestWeeks(): Promise<WeeklyQuestWeek[]> {
  return fetchAdminWeeklyQuestWeeks();
}

export async function fetchWeeklyQuestConcepts(): Promise<AdminConcept[]> {
  return fetchAdminConcepts();
}

export async function fetchWeeklyQuestTemplatesList(): Promise<QuestTemplate[]> {
  return fetchWeeklyQuestTemplates();
}
