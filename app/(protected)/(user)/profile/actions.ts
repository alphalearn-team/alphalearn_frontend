"use server";

import type { ContributorApplication } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";
import { fetchMyContributorApplications } from "@/lib/data/contributorApplications";
import { revalidatePath } from "next/cache";

type SubmitContributorApplicationResult =
  | {
      success: true;
      data: ContributorApplication;
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

    revalidatePath("/profile");

    return {
      success: true,
      data,
      message: "Contributor application submitted successfully.",
    };
  } catch (error) {
    const { data: applications } = await fetchMyContributorApplications();

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit contributor application",
      applications,
    };
  }
}
