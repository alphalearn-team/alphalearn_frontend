"use server";

import type { SaveWeeklyQuestOfficialAssignmentRequest } from "@/interfaces/interfaces";
import { saveWeeklyQuestOfficialAssignment } from "@/lib/weeklyQuests";
import { revalidatePath } from "next/cache";

export async function saveWeeklyQuestAssignmentAction(
  weekStartDate: string,
  payload: SaveWeeklyQuestOfficialAssignmentRequest,
) {
  try {
    const updatedWeek = await saveWeeklyQuestOfficialAssignment(weekStartDate, payload);
    revalidatePath("/admin/weekly-quests");

    return {
      success: true,
      week: updatedWeek,
      message: "Weekly quest saved successfully.",
    };
  } catch (error) {
    return {
      success: false,
      week: null,
      message: error instanceof Error ? error.message : "Failed to save weekly quest.",
    };
  }
}
