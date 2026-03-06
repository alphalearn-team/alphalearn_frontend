"use client";

import { Button, Card, Group, Loader, Stack, Text, Title } from "@mantine/core";
import type { AdminContributorApplication } from "@/interfaces/interfaces";
import { getApplicantLabel } from "@/lib/adminContributorApplications";
import { formatDateTime } from "@/lib/formatDate";

interface ApplicationDetailPanelProps {
  detailError: string | null;
  isApproving: boolean;
  isLoadingDetail: boolean;
  isRejecting: boolean;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  selectedApplicationId: string | null;
  selectedDetail: AdminContributorApplication | null;
  selectedPendingApplication: AdminContributorApplication | null;
}

function StatusItem({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
      <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </Text>
      <Text className={`mt-1 text-sm ${monospace ? "font-mono" : ""}`}>{value}</Text>
    </div>
  );
}

export default function ApplicationDetailPanel({
  detailError,
  isApproving,
  isLoadingDetail,
  isRejecting,
  onOpenApproveModal,
  onOpenRejectModal,
  selectedApplicationId,
  selectedDetail,
  selectedPendingApplication,
}: ApplicationDetailPanelProps) {
  return (
    <Card className="admin-card">
      <Stack gap="md">
        <Title order={3}>Application Detail</Title>

        {!selectedApplicationId && (
          <Text className="text-[var(--color-text-secondary)]">
            Select an application from the queue to review.
          </Text>
        )}

        {isLoadingDetail && (
          <Group>
            <Loader size="sm" />
            <Text size="sm" className="text-[var(--color-text-secondary)]">
              Loading application detail...
            </Text>
          </Group>
        )}

        {detailError && <Text className="text-sm text-red-400">{detailError}</Text>}

        {!isLoadingDetail && selectedDetail && (
          <Stack gap="sm">
            <StatusItem label="Applicant" value={getApplicantLabel(selectedDetail)} />
            <StatusItem
              label="Learner Public ID"
              value={selectedDetail.learnerPublicId}
              monospace
            />
            <StatusItem label="Application ID" value={selectedDetail.publicId} monospace />
            <StatusItem label="Submitted At" value={formatDateTime(selectedDetail.submittedAt)} />
            <StatusItem
              label="Reviewed At"
              value={
                selectedDetail.reviewedAt
                  ? formatDateTime(selectedDetail.reviewedAt)
                  : "Not reviewed yet"
              }
            />
            <StatusItem label="Status" value={selectedDetail.status} />

            {selectedDetail.status === "REJECTED" && selectedDetail.rejectionReason && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <Text size="xs" fw={700} className="uppercase tracking-wide text-red-300">
                  Rejection Reason
                </Text>
                <Text className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {selectedDetail.rejectionReason}
                </Text>
              </div>
            )}

            <Group>
              <Button
                color="green"
                onClick={onOpenApproveModal}
                loading={isApproving}
                disabled={isRejecting || selectedDetail.status !== "PENDING"}
              >
                Approve
              </Button>
              <Button
                color="red"
                variant="light"
                onClick={onOpenRejectModal}
                disabled={isApproving || isRejecting || selectedDetail.status !== "PENDING"}
              >
                Reject
              </Button>
            </Group>

            {selectedPendingApplication === null && selectedDetail.status !== "PENDING" && (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                This application is no longer pending and was removed from the queue.
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
