"use server";

import { revalidatePath } from "next/cache";
import type { SaveAdminImposterMonthlyPackRequest } from "@/interfaces/interfaces";
import { saveAdminImposterMonthlyPack } from "@/lib/utils/imposterMonthlyPack";

export async function saveAdminImposterMonthlyPackAction(
  yearMonth: string,
  payload: SaveAdminImposterMonthlyPackRequest,
) {
  try {
    const pack = await saveAdminImposterMonthlyPack(yearMonth, payload);
    revalidatePath("/admin/imposter-monthly-pack");

    return {
      success: true,
      pack,
      message: "Monthly imposter pack saved successfully.",
    };
  } catch (error) {
    return {
      success: false,
      pack: null,
      message: error instanceof Error ? error.message : "Failed to save monthly imposter pack.",
    };
  }
}
