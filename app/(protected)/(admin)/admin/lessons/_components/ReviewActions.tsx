"use client";

import { Button } from "@mantine/core";
import RejectLessonModal from "./RejectLessonModal";
import { useLessonReviewActions } from "./useLessonReviewActions";

interface ReviewActionsProps {
  lessonPublicId: string;
  lessonTitle: string;
}

export default function ReviewActions({
  lessonPublicId,
  lessonTitle,
}: ReviewActionsProps) {
  const {
    handleApprove,
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
    lessonTitle,
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          color="green"
          onClick={handleApprove}
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
    </>
  );
}
