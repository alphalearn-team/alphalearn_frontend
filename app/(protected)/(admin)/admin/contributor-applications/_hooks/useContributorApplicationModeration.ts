"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { AdminContributorApplication } from "@/interfaces/interfaces";
import {
  sortPendingContributorApplications,
  validateRejectionReason,
} from "@/lib/utils/adminContributorApplications";
import {
  approveContributorApplicationAction,
  fetchContributorApplicationDetailAction,
  fetchPendingContributorApplicationsAction,
  rejectContributorApplicationAction,
} from "@/lib/actions/adminContributorApplications";
import { showError, showSuccess } from "@/lib/data/notifications";

interface UseContributorApplicationModerationParams {
  initialPending: AdminContributorApplication[];
  initialError: string | null;
}

export function useContributorApplicationModeration({
  initialPending,
  initialError,
}: UseContributorApplicationModerationParams) {
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
  const [approveModalOpened, setApproveModalOpened] = useState(false);
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

    setIsApproving(true);
    try {
      const result = await approveContributorApplicationAction(selectedDetail.publicId);

      if (!result.success) {
        showError(result.message);
        return;
      }

      await refreshUserRole();
      showSuccess(result.message ?? "Contributor application approved.");
      await Promise.all([
        loadPendingApplications(),
        loadDetail(selectedDetail.publicId),
      ]);
      router.refresh();
      setApproveModalOpened(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to approve contributor application.";
      showError(message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleOpenApproveModal = () => {
    setApproveModalOpened(true);
  };

  const handleCloseApproveModal = () => {
    if (isApproving) {
      return;
    }

    setApproveModalOpened(false);
  };

  const handleConfirmApprove = async () => {
    await handleApprove();
  };

  const handleOpenRejectModal = () => {
    setRejectReason("");
    setRejectReasonError(null);
    setRejectModalOpened(true);
  };

  const handleCloseRejectModal = () => {
    if (isRejecting) {
      return;
    }

    setRejectModalOpened(false);
    setRejectReasonError(null);
  };

  const handleRejectReasonChange = (nextReason: string) => {
    setRejectReason(nextReason);
    if (rejectReasonError) {
      setRejectReasonError(null);
    }
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

    try {
      const result = await rejectContributorApplicationAction(
        selectedDetail.publicId,
        rejectReason,
      );

      if (!result.success) {
        showError(result.message);
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reject contributor application.";
      showError(message);
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    approveModalOpened,
    detailError,
    handleApprove,
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
  };
}
