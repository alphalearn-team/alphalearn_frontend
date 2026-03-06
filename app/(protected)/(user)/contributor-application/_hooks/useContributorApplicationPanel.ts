"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContributorApplication } from "@/interfaces/interfaces";
import {
  getContributorApplicationViewState,
  isConflictMessage,
  resolveContributorApplicationsAfterConflict,
  shouldRefreshRoleAfterApproval,
  type ContributorApplicationRole,
} from "@/lib/contributorApplications";
import { submitContributorApplication } from "@/lib/actions/contributorApplication";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { useAuth } from "@/context/AuthContext";

interface UseContributorApplicationPanelParams {
  initialApplications: ContributorApplication[];
  initialLoadError: string | null;
  role: ContributorApplicationRole;
}

export function useContributorApplicationPanel({
  initialApplications,
  initialLoadError,
  role,
}: UseContributorApplicationPanelParams) {
  const router = useRouter();
  const { refreshUserRole } = useAuth();

  const [applications, setApplications] = useState(initialApplications);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequestedRoleRefresh, setHasRequestedRoleRefresh] = useState(false);

  const viewState = getContributorApplicationViewState(applications, role);
  const latestApplication = viewState.latestApplication;

  const handleSubmit = async () => {
    if (!viewState.canApply || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const result = await submitContributorApplication();

      if (result.success) {
        setApplications(result.applications);
        await refreshUserRole();
        router.refresh();
        setLoadError(null);
        setSuccessMessage(result.message);
        showSuccess(result.message);
        return;
      }

      setApplications((currentApplications) =>
        resolveContributorApplicationsAfterConflict(
          currentApplications,
          result.applications,
        ),
      );
      setSubmitError(result.message);

      if (isConflictMessage(result.message)) {
        setLoadError(null);
      }

      showError(result.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit contributor application";
      setSubmitError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      !shouldRefreshRoleAfterApproval(
        role,
        latestApplication,
        hasRequestedRoleRefresh,
      )
    ) {
      return;
    }

    setHasRequestedRoleRefresh(true);
    refreshUserRole()
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        setHasRequestedRoleRefresh(false);
      });
  }, [
    hasRequestedRoleRefresh,
    latestApplication,
    refreshUserRole,
    role,
    router,
  ]);

  return {
    handleSubmit,
    isSubmitting,
    latestApplication,
    loadError,
    role,
    submitError,
    successMessage,
    viewState,
  };
}
