import type { ContributorApplication } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

export type ContributorApplicationsResult = {
  data: ContributorApplication[];
  error: string | null;
};

export async function fetchMyContributorApplications(): Promise<ContributorApplicationsResult> {
  try {
    const data = await apiFetch<ContributorApplication[]>(
      "/contributor-applications/mine",
    );

    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load contributor applications",
    };
  }
}
