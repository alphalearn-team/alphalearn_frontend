"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveLesson, rejectLesson } from "@/lib/actions/adminLessons";
import { showError, showSuccess } from "@/lib/data/notifications";

interface UseLessonReviewActionsParams {
  lessonPublicId: string;
}

export function useLessonReviewActions({
  lessonPublicId,
}: UseLessonReviewActionsParams) {
  const router = useRouter();
  const [approveModalOpened, setApproveModalOpened] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const result = await approveLesson(lessonPublicId);

      if (!result.success) {
        showError(result.message);
        return;
      }

      showSuccess(result.message);
      router.replace("/admin/lessons");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve lesson";
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
    setApproveModalOpened(false);
  };

  const handleOpenRejectModal = () => {
    setRejectReason("");
    setRejectError(null);
    setRejectModalOpened(true);
  };

  const handleCloseRejectModal = () => {
    if (isRejecting) {
      return;
    }

    setRejectModalOpened(false);
    setRejectError(null);
  };

  const handleRejectReasonChange = (value: string) => {
    setRejectReason(value);
    if (rejectError) {
      setRejectError(null);
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectError("A rejection reason is required.");
      return;
    }

    setIsRejecting(true);
    setRejectError(null);

    try {
      const result = await rejectLesson(lessonPublicId, trimmedReason);

      if (!result.success) {
        showError(result.message);
        return;
      }

      showSuccess(result.message);
      setRejectModalOpened(false);
      router.replace("/admin/lessons");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reject lesson";
      showError(message);
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    approveModalOpened,
    handleApprove,
    handleCloseApproveModal,
    handleConfirmApprove,
    handleOpenApproveModal,
    handleCloseRejectModal,
    handleOpenRejectModal,
    handleReject,
    handleRejectReasonChange,
    isApproving,
    isRejecting,
    rejectError,
    rejectModalOpened,
    rejectReason,
  };
}
