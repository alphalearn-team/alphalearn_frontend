"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { ContributorApplication } from "@/interfaces/interfaces";
import {
  getApplicationTimelineLabel,
  getContributorApplicationViewState,
  isConflictMessage,
  resolveContributorApplicationsAfterConflict,
  shouldRefreshRoleAfterApproval,
  type ContributorApplicationRole,
} from "@/lib/contributorApplications";
import { formatDateTime } from "@/lib/formatDate";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { submitContributorApplication } from "@/app/(protected)/(user)/contributor-application/actions";
import { useAuth } from "@/context/AuthContext";

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

  return (
    <div id="contributor-access" className="space-y-6">
      <Card
        radius="xl"
        padding="xl"
        className="border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <Stack gap="lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Group gap="sm">
                <Badge color={viewState.badgeColor} variant="light" radius="xl">
                  {viewState.statusLabel}
                </Badge>
                {role === "CONTRIBUTOR" && (
                  <Badge color="green" variant="outline" radius="xl">
                    Contributor Access
                  </Badge>
                )}
              </Group>

              <div className="space-y-2">
                <Title order={2}>{viewState.title}</Title>
                <Text className="max-w-3xl text-[var(--color-text-secondary)]">
                  {viewState.description}
                </Text>
              </div>
            </div>

            {viewState.canApply && (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                radius="xl"
                className="md:self-start"
              >
                Apply to Become a Contributor
              </Button>
            )}
          </div>

          {loadError && (
            <Alert color="yellow" radius="lg" title="Couldn't load your application history">
              {loadError}
            </Alert>
          )}

          {submitError && (
            <Alert color="red" radius="lg" title="Application not submitted">
              {submitError}
            </Alert>
          )}

          {successMessage && (
            <Alert color="green" radius="lg" title="Application submitted">
              {successMessage}
            </Alert>
          )}

          <div className={`grid gap-4 ${role === "CONTRIBUTOR" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            <StatusDetail
              label="Current Status"
              value={viewState.statusLabel}
            />
            <StatusDetail
              label="Latest Submission"
              value={latestApplication ? formatDateTime(latestApplication.submittedAt) : "Not submitted yet"}
            />
            {role !== "CONTRIBUTOR" && (
              <StatusDetail
                label="Review Progress"
                value={
                  latestApplication
                    ? getApplicationTimelineLabel(latestApplication.status)
                    : "Ready to apply"
                }
              />
            )}
          </div>

          {latestApplication && (
            <div className="grid gap-4">
              <StatusDetail
                label="Application ID"
                value={latestApplication.publicId}
                monospace
              />
            </div>
          )}

          {viewState.showRejectionReason && latestApplication?.rejectionReason && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4">
              <Text size="xs" className="font-semibold uppercase tracking-wide text-red-300">
                Rejection Reason
              </Text>
              <Text className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {latestApplication.rejectionReason}
              </Text>
            </div>
          )}

          {!latestApplication && role === "LEARNER" && (
            <Text size="sm" className="text-[var(--color-text-secondary)]">
              Once you apply, your newest contributor application will appear here so you can track its review status.
            </Text>
          )}
        </Stack>
      </Card>
    </div>
  );
}

type StatusDetailProps = {
  label: string;
  value: string;
  monospace?: boolean;
};

function StatusDetail({
  label,
  value,
  monospace = false,
}: StatusDetailProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
      <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </Text>
      <Text
        size="sm"
        className={`mt-2 break-all text-[var(--color-text)] ${monospace ? "font-mono" : ""}`}
      >
        {value}
      </Text>
    </div>
  );
}
