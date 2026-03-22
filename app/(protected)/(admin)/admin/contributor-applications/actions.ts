"use server";

import type {
  AdminContributorApplication,
  ContributorApplication,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import {
  toFriendlyAdminContributorApplicationError,
  validateRejectionReason,
} from "./utils";
import { revalidatePath } from "next/cache";

const jsonHeaders = {
  "Content-Type": "application/json",
};

type ContributorApplicationActionResult<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      message: string;
    };

export async function fetchPendingContributorApplicationsAction(): Promise<
  ContributorApplicationActionResult<AdminContributorApplication[]>
> {
  try {
    const data = await apiFetch<AdminContributorApplication[]>(
      "/admin/contributor-applications/pending",
    );
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load pending contributor applications";
    return {
      success: false,
      message: toFriendlyAdminContributorApplicationError(message),
    };
  }
}

export async function fetchContributorApplicationDetailAction(
  applicationPublicId: string,
): Promise<ContributorApplicationActionResult<AdminContributorApplication>> {
  try {
    const data = await apiFetch<AdminContributorApplication>(
      `/admin/contributor-applications/${applicationPublicId}`,
    );
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load contributor application detail";
    return {
      success: false,
      message: toFriendlyAdminContributorApplicationError(message),
    };
  }
}

export async function approveContributorApplicationAction(
  applicationPublicId: string,
): Promise<ContributorApplicationActionResult<ContributorApplication | null>> {
  try {
    const data = await apiFetch<ContributorApplication | null>(
      `/admin/contributor-applications/${applicationPublicId}/approve`,
      {
        method: "PUT",
        headers: jsonHeaders,
      },
    );

    revalidatePath("/admin/contributor-applications");
    revalidatePath("/contributor-application");

    return {
      success: true,
      data,
      message: "Contributor application approved successfully.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to approve contributor application";
    return {
      success: false,
      message: toFriendlyAdminContributorApplicationError(message),
    };
  }
}

export async function rejectContributorApplicationAction(
  applicationPublicId: string,
  reason: string,
): Promise<ContributorApplicationActionResult<ContributorApplication | null>> {
  const reasonError = validateRejectionReason(reason);
  if (reasonError) {
    return { success: false, message: reasonError };
  }

  try {
    const data = await apiFetch<ContributorApplication | null>(
      `/admin/contributor-applications/${applicationPublicId}/reject`,
      {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ reason: reason.trim() }),
      },
    );

    revalidatePath("/admin/contributor-applications");
    revalidatePath("/contributor-application");

    return {
      success: true,
      data,
      message: "Contributor application rejected successfully.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reject contributor application";
    return {
      success: false,
      message: toFriendlyAdminContributorApplicationError(message),
    };
  }
}
