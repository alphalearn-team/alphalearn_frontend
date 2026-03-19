"use client";

import type { AdminContributorApplication } from "@/interfaces/interfaces";
import ConfirmModal from "@/components/common/ConfirmModal";
import { getApplicantLabel } from "@/lib/utils/adminContributorApplications";
import ApplicationDetailPanel from "./ApplicationDetailPanel";
import ApplicationsTable from "./ApplicationsTable";
import RejectApplicationModal from "./RejectApplicationModal";
import { useContributorApplicationModeration } from "../_hooks/useContributorApplicationModeration";

type ModerationPanelProps = {
  initialPending: AdminContributorApplication[];
  initialError: string | null;
};

export default function ContributorApplicationsModerationPanel({
  initialPending,
  initialError,
}: ModerationPanelProps) {
  const {
    approveModalOpened,
    detailError,
    handleCloseApproveModal,
    handleConfirmApprove,
    handleOpenApproveModal,
    handleCloseRejectModal,
    handleOpenRejectModal,
    handleReject,
    handleRejectReasonChange,
    isApproving,
    isLoadingDetail,
    isRefreshingList,
    isRejecting,
    loadDetail,
    loadError,
    loadPendingApplications,
    pendingApplications,
    rejectModalOpened,
    rejectReason,
    rejectReasonError,
    selectedApplicationId,
    selectedDetail,
    selectedPendingApplication,
  } = useContributorApplicationModeration({
    initialPending,
    initialError,
  });

  return (
    <div className="space-y-6">
      <ApplicationsTable
        applications={pendingApplications}
        isApproving={isApproving}
        isLoadingDetail={isLoadingDetail}
        isRefreshingList={isRefreshingList}
        isRejecting={isRejecting}
        loadError={loadError}
        onRefresh={loadPendingApplications}
        onSelect={loadDetail}
      />

      <ApplicationDetailPanel
        detailError={detailError}
        isApproving={isApproving}
        isLoadingDetail={isLoadingDetail}
        isRejecting={isRejecting}
        onOpenApproveModal={handleOpenApproveModal}
        onOpenRejectModal={handleOpenRejectModal}
        selectedApplicationId={selectedApplicationId}
        selectedDetail={selectedDetail}
        selectedPendingApplication={selectedPendingApplication}
      />

      <RejectApplicationModal
        isRejecting={isRejecting}
        onClose={handleCloseRejectModal}
        onReject={handleReject}
        onReasonChange={handleRejectReasonChange}
        opened={rejectModalOpened}
        reason={rejectReason}
        reasonError={rejectReasonError}
      />

      <ConfirmModal
        opened={approveModalOpened}
        onClose={handleCloseApproveModal}
        onConfirm={handleConfirmApprove}
        title="Approve Contributor Application"
        message={
          selectedDetail
            ? `Approve contributor application for ${getApplicantLabel(selectedDetail)}?`
            : "Approve this contributor application?"
        }
        confirmText="Approve"
        cancelText="Cancel"
        confirmColor="green"
        icon="check_circle"
        loading={isApproving}
      />
    </div>
  );
}
