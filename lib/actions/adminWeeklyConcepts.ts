"use server";

import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import type {
  WeeklyConceptPayload,
  WeeklyConceptUpsertRequest,
} from "@/interfaces/interfaces";

const headers = {
  "Content-Type": "application/json",
};

export type WeeklyConceptActionResult<T = void> = {
  success: boolean;
  status: number;
  message: string;
  data?: T;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request failed";
}

function toFailureResult<T = void>(error: unknown): WeeklyConceptActionResult<T> {
  if (error instanceof ApiError) {
    return {
      success: false,
      status: error.status,
      message: error.message,
    };
  }

  return {
    success: false,
    status: 500,
    message: getErrorMessage(error),
  };
}

export async function getWeeklyConcept(
  weekStartDate: string
): Promise<WeeklyConceptActionResult<WeeklyConceptPayload>> {
  try {
    const data = await apiFetch<WeeklyConceptPayload>(
      `/admin/weekly-concepts/${weekStartDate}`
    );

    return {
      success: true,
      status: 200,
      message: "Weekly concept loaded",
      data,
    };
  } catch (error) {
    return toFailureResult<WeeklyConceptPayload>(error);
  }
}

export async function upsertWeeklyConcept(
  weekStartDate: string,
  concept: string
): Promise<WeeklyConceptActionResult<WeeklyConceptPayload>> {
  try {
    const payload: WeeklyConceptUpsertRequest = { concept };
    const data = await apiFetch<WeeklyConceptPayload>(
      `/admin/weekly-concepts/${weekStartDate}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      }
    );

    revalidatePath("/admin/weekly-content");

    return {
      success: true,
      status: 200,
      message: "Weekly concept saved",
      data,
    };
  } catch (error) {
    return toFailureResult<WeeklyConceptPayload>(error);
  }
}
