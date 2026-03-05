"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import type { AdminContributorApplication } from "@/interfaces/interfaces";
import {
  getApplicantLabel,
  sortPendingContributorApplications,
  validateRejectionReason,
} from "@/lib/adminContributorApplications";
import { formatDateTime } from "@/lib/formatDate";
import AdminEmptyState from "@/components/admin/emptyState";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { useAuth } from "@/context/AuthContext";
import {
  approveContributorApplicationAction,
  fetchContributorApplicationDetailAction,
  fetchPendingContributorApplicationsAction,
  rejectContributorApplicationAction,
} from "./actions";

type ModerationPanelProps = {
  initialPending: AdminContributorApplication[];
  initialError: string | null;
};

function getStatusColor(status: AdminContributorApplication["status"]) {
  switch (status) {
    case "PENDING":
      return "blue";
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    default:
      return "gray";
  }
}

export default function ContributorApplicationsModerationPanel({
  initialPending,
  initialError,
}: ModerationPanelProps) {
  const router = useRouter();
  const { refreshUserRole } = useAuth();
  const [pendingApplications, setPendingApplications] = useState(
    sortPendingContributorApplications(initialPending),
  );
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null,
  );
  const [selectedDetail, setSelectedDetail] =
    useState<AdminContributorApplication | null>(null);
  const [loadError, setLoadError] = useState(initialError);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);

  const selectedPendingApplication = useMemo(
    () =>
      pendingApplications.find(
        (application) => application.publicId === selectedApplicationId,
      ) ?? null,
    [pendingApplications, selectedApplicationId],
  );

  const loadPendingApplications = async () => {
    setIsRefreshingList(true);
    const pendingResult = await fetchPendingContributorApplicationsAction();

    if (!pendingResult.success) {
      setLoadError(pendingResult.message);
      setIsRefreshingList(false);
      return;
    }

    setPendingApplications(sortPendingContributorApplications(pendingResult.data));
    setLoadError(null);
    setIsRefreshingList(false);
  };

  const loadDetail = async (applicationPublicId: string) => {
    setSelectedApplicationId(applicationPublicId);
    setIsLoadingDetail(true);
    setDetailError(null);

    const detailResult = await fetchContributorApplicationDetailAction(
      applicationPublicId,
    );

    if (!detailResult.success) {
      setDetailError(detailResult.message);
      setSelectedDetail(null);
      setIsLoadingDetail(false);
      return;
    }

    setSelectedDetail(detailResult.data);
    setIsLoadingDetail(false);
  };

  const handleApprove = async () => {
    if (!selectedDetail || isApproving || isRejecting) {
      return;
    }

    const shouldApprove = window.confirm(
      `Approve contributor application ${selectedDetail.publicId}?`,
    );
    if (!shouldApprove) {
      return;
    }

    setIsApproving(true);
    const result = await approveContributorApplicationAction(selectedDetail.publicId);

    if (!result.success) {
      showError(result.message);
      setIsApproving(false);
      return;
    }

    await refreshUserRole();
    showSuccess(result.message ?? "Contributor application approved.");
    await Promise.all([
      loadPendingApplications(),
      loadDetail(selectedDetail.publicId),
    ]);
    router.refresh();
    setIsApproving(false);
  };

  const handleOpenRejectModal = () => {
    setRejectReason("");
    setRejectReasonError(null);
    setRejectModalOpened(true);
  };

  const handleReject = async () => {
    if (!selectedDetail || isApproving || isRejecting) {
      return;
    }

    const validationError = validateRejectionReason(rejectReason);
    if (validationError) {
      setRejectReasonError(validationError);
      return;
    }

    setIsRejecting(true);
    setRejectReasonError(null);

    const result = await rejectContributorApplicationAction(
      selectedDetail.publicId,
      rejectReason,
    );

    if (!result.success) {
      showError(result.message);
      setIsRejecting(false);
      return;
    }

    await refreshUserRole();
    showSuccess(result.message ?? "Contributor application rejected.");
    setRejectModalOpened(false);
    await Promise.all([
      loadPendingApplications(),
      loadDetail(selectedDetail.publicId),
    ]);
    router.refresh();
    setIsRejecting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="admin-card">
        <Group justify="space-between" align="center" mb="md">
          <Title order={3}>Pending Contributor Applications</Title>
          <Button
            variant="light"
            size="xs"
            onClick={loadPendingApplications}
            loading={isRefreshingList}
            disabled={isLoadingDetail || isApproving || isRejecting}
          >
            Refresh
          </Button>
        </Group>

        {loadError && (
          <Text className="text-sm text-red-400">{loadError}</Text>
        )}

        {!loadError && pendingApplications.length === 0 && (
          <AdminEmptyState
            icon="generic"
            title="No pending contributor applications"
            description="New submissions will appear here when learners apply."
          />
        )}

        {!loadError && pendingApplications.length > 0 && (
          <Table className="admin-table" highlightOnHover>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Application ID</th>
              </tr>
            </thead>
            <tbody>
              {pendingApplications.map((application) => (
                <tr
                  key={application.publicId}
                  className="cursor-pointer"
                  onClick={() => loadDetail(application.publicId)}
                >
                  <td>
                    <Text fw={700}>{getApplicantLabel(application)}</Text>
                  </td>
                  <td>
                    <Text>{formatDateTime(application.submittedAt)}</Text>
                  </td>
                  <td>
                    <Badge
                      color={getStatusColor(application.status)}
                      variant="light"
                      radius="xl"
                    >
                      {application.status}
                    </Badge>
                  </td>
                  <td>
                    <Text className="font-mono text-xs">{application.publicId}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

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

          {detailError && (
            <Text className="text-sm text-red-400">{detailError}</Text>
          )}

          {!isLoadingDetail && selectedDetail && (
            <Stack gap="sm">
              <StatusItem
                label="Applicant"
                value={getApplicantLabel(selectedDetail)}
              />
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

              {selectedDetail.status === "REJECTED" &&
                selectedDetail.rejectionReason && (
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
                  onClick={handleApprove}
                  loading={isApproving}
                  disabled={isRejecting || selectedDetail.status !== "PENDING"}
                >
                  Approve
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={handleOpenRejectModal}
                  disabled={
                    isApproving ||
                    isRejecting ||
                    selectedDetail.status !== "PENDING"
                  }
                >
                  Reject
                </Button>
              </Group>

              {selectedPendingApplication === null &&
                selectedDetail.status !== "PENDING" && (
                  <Text size="sm" className="text-[var(--color-text-secondary)]">
                    This application is no longer pending and was removed from the queue.
                  </Text>
                )}
            </Stack>
          )}
        </Stack>
      </Card>

      <Modal
        opened={rejectModalOpened}
        onClose={() => {
          if (!isRejecting) {
            setRejectModalOpened(false);
            setRejectReasonError(null);
          }
        }}
        centered
        title="Reject Contributor Application"
      >
        <Stack gap="sm">
          <Text size="sm" className="text-[var(--color-text-secondary)]">
            Provide a reason for rejection. This will be shown to the learner.
          </Text>
          <Textarea
            label="Rejection reason"
            minRows={4}
            autosize
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.currentTarget.value);
              if (rejectReasonError) {
                setRejectReasonError(null);
              }
            }}
            error={rejectReasonError}
            disabled={isRejecting}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setRejectModalOpened(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleReject} loading={isRejecting}>
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
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
