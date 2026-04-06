"use client";

import { Button } from "@mantine/core";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import { useReportedLessonActions } from "../_hooks/useReportedLessonActions";

interface ReportedLessonResolutionActionsProps {
  lessonPublicId: string;
  lessonTitle: string;
}

export default function ReportedLessonResolutionActions({
  lessonPublicId,
  lessonTitle,
}: ReportedLessonResolutionActionsProps) {
  const {
    handleCloseUnpublishModal,
    handleConfirmUnpublish,
    handleDismissReports,
    handleOpenUnpublishModal,
    isDismissing,
    isUnpublishing,
    unpublishModalOpened,
  } = useReportedLessonActions({
    lessonPublicId,
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          color="blue"
          variant="light"
          onClick={handleDismissReports}
          loading={isDismissing}
          disabled={isUnpublishing}
        >
          Dismiss Reports
        </Button>
        <Button
          color="red"
          onClick={handleOpenUnpublishModal}
          disabled={isDismissing || isUnpublishing}
        >
          Unpublish Lesson
        </Button>
      </div>

      <ConfirmModal
        opened={unpublishModalOpened}
        onClose={handleCloseUnpublishModal}
        onConfirm={handleConfirmUnpublish}
        title="Unpublish Lesson"
        message={`Unpublish "${lessonTitle}" and resolve all pending reports?\n\nThis will remove the lesson from public view.`}
        confirmText="Unpublish"
        cancelText="Cancel"
        confirmColor="red"
        icon="warning"
        loading={isUnpublishing}
      />
    </>
  );
}
