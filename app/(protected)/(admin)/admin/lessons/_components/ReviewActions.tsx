"use client";

import { Button } from "@mantine/core";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import RejectLessonModal from "./RejectLessonModal";
import { useLessonReviewActions } from "../_hooks/useLessonReviewActions";

interface ReviewActionsProps {
  lessonPublicId: string;
  lessonTitle: string;
}

export default function ReviewActions({
  lessonPublicId,
  lessonTitle,
}: ReviewActionsProps) {
  const {
    approveModalOpened,
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
  } = useLessonReviewActions({
    lessonPublicId,
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          color="green"
          onClick={handleOpenApproveModal}
          loading={isApproving}
          disabled={isRejecting}
        >
          Approve Lesson
        </Button>
        <Button
          color="red"
          variant="light"
          onClick={handleOpenRejectModal}
          disabled={isApproving || isRejecting}
        >
          Reject Lesson
        </Button>
      </div>

      <RejectLessonModal
        isRejecting={isRejecting}
        lessonTitle={lessonTitle}
        onClose={handleCloseRejectModal}
        onReject={handleReject}
        onReasonChange={handleRejectReasonChange}
        opened={rejectModalOpened}
        rejectError={rejectError}
        rejectReason={rejectReason}
      />

      <ConfirmModal
        opened={approveModalOpened}
        onClose={handleCloseApproveModal}
        onConfirm={handleConfirmApprove}
        title="Approve Lesson"
        message={`Approve "${lessonTitle}"?\n\nThis will make the lesson publicly available.`}
        confirmText="Approve"
        cancelText="Cancel"
        confirmColor="green"
        icon="check_circle"
        loading={isApproving}
      />
    </>
  );
}
