"use client";

import type { ContributorApplication } from "@/interfaces/interfaces";
import { type ContributorApplicationRole } from "../utils";
import ContributorApplicationAlerts from "./ContributorApplicationAlerts";
import ContributorApplicationSummary from "./ContributorApplicationSummary";
import { useContributorApplicationPanel } from "../_hooks/useContributorApplicationPanel";

type ContributorApplicationPanelProps = {
  initialApplications: ContributorApplication[];
  initialLoadError?: string | null;
  role: ContributorApplicationRole;
};

export default function ContributorApplicationPanel({
  initialApplications,
  initialLoadError = null,
  role,
}: ContributorApplicationPanelProps) {
  const {
    handleSubmit,
    isSubmitting,
    latestApplication,
    loadError,
    submitError,
    successMessage,
    viewState,
  } = useContributorApplicationPanel({
    initialApplications,
    initialLoadError,
    role,
  });

  return (
    <div id="contributor-access" className="space-y-6">
      <ContributorApplicationSummary
        isSubmitting={isSubmitting}
        latestApplication={latestApplication}
        onSubmit={handleSubmit}
        role={role}
        viewState={viewState}
      />

      <ContributorApplicationAlerts
        loadError={loadError}
        submitError={submitError}
        successMessage={successMessage}
      />
    </div>
  );
}
