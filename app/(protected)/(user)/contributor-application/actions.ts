"use server";

import type { ContributorApplication } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { fetchMyContributorApplications } from "./data";
import { revalidatePath } from "next/cache";

type SubmitContributorApplicationResult =
  | {
      success: true;
      data: ContributorApplication;
      applications: ContributorApplication[];
      message: string;
    }
  | {
      success: false;
      message: string;
      applications: ContributorApplication[];
    };

export async function submitContributorApplication(): Promise<SubmitContributorApplicationResult> {
  try {
    const data = await apiFetch<ContributorApplication>("/contributor-applications", {
      method: "POST",
    });
    const { data: applications } = await fetchMyContributorApplications();

    revalidatePath("/contributor-application");

    return {
      success: true,
      data,
      applications,
      message: "Contributor application submitted successfully.",
    };
  } catch (error) {
    const { data: applications } = await fetchMyContributorApplications();
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit contributor application";

    return {
      success: false,
      message: toFriendlyLearnerError(message),
      applications,
    };
  }
}

function toFriendlyLearnerError(message: string) {
  if (message.includes("400")) {
    return "Your request is invalid. Please try again.";
  }

  if (message.includes("403")) {
    return "You are not allowed to submit a contributor application.";
  }

  if (message.includes("404")) {
    return "Contributor application service is unavailable right now.";
  }

  if (message.includes("409")) {
    return "You already have a pending contributor application.";
  }

  return message;
}
