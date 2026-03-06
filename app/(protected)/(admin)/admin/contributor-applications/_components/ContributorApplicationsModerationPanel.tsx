"use client";

import type { AdminContributorApplication } from "@/interfaces/interfaces";
import ApplicationDetailPanel from "./ApplicationDetailPanel";
import ApplicationsTable from "./ApplicationsTable";
import RejectApplicationModal from "./RejectApplicationModal";
import { useContributorApplicationModeration } from "./useContributorApplicationModeration";

type ModerationPanelProps = {
  initialPending: AdminContributorApplication[];
  initialError: string | null;
};

export default function ContributorApplicationsModerationPanel({
  initialPending,
  initialError,
}: ModerationPanelProps) {
  const {
    detailError,
    handleApprove,
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
        onApprove={handleApprove}
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
    </div>
  );
}
