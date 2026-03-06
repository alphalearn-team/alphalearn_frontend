"use client";

import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { ContributorApplication } from "@/interfaces/interfaces";
import {
  getApplicationTimelineLabel,
  type ContributorApplicationRole,
} from "@/lib/contributorApplications";
import { formatDateTime } from "@/lib/formatDate";
import StatusDetail from "./StatusDetail";

interface ContributorApplicationSummaryProps {
  isSubmitting: boolean;
  latestApplication: ContributorApplication | null;
  onSubmit: () => void;
  role: ContributorApplicationRole;
  viewState: {
    badgeColor: string;
    canApply: boolean;
    description: string;
    showRejectionReason: boolean;
    statusLabel: string;
    title: string;
  };
}

export default function ContributorApplicationSummary({
  isSubmitting,
  latestApplication,
  onSubmit,
  role,
  viewState,
}: ContributorApplicationSummaryProps) {
  return (
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
              onClick={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              radius="xl"
              className="md:self-start"
            >
              Apply to Become a Contributor
            </Button>
          )}
        </div>

        <div className={`grid gap-4 ${role === "CONTRIBUTOR" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          <StatusDetail label="Current Status" value={viewState.statusLabel} />
          <StatusDetail
            label="Latest Submission"
            value={
              latestApplication
                ? formatDateTime(latestApplication.submittedAt)
                : "Not submitted yet"
            }
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
            Once you apply, your newest contributor application will appear here so you can track
            its review status.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
