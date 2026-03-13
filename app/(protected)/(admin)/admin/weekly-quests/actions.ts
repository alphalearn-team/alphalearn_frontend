"use server";

import type { SaveWeeklyQuestOfficialAssignmentRequest } from "@/interfaces/interfaces";
import { saveWeeklyQuestAssignmentAction as saveWeeklyQuestAssignment } from "@/lib/actions/adminWeeklyQuests";

export async function saveWeeklyQuestAssignmentAction(
  weekStartDate: string,
  payload: SaveWeeklyQuestOfficialAssignmentRequest,
) {
  return saveWeeklyQuestAssignment(weekStartDate, payload);
}
