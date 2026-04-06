"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dismissLessonReports, unpublishReportedLesson } from "@/app/(protected)/(admin)/admin/lessons/actions";
import { showError, showInfo, showSuccess } from "@/lib/utils/popUpNotifications";

interface UseReportedLessonActionsParams {
  lessonPublicId: string;
}

export function useReportedLessonActions({
  lessonPublicId,
}: UseReportedLessonActionsParams) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [unpublishModalOpened, setUnpublishModalOpened] = useState(false);

  const handleDismissReports = async () => {
    setIsDismissing(true);

    try {
      const result = await dismissLessonReports(lessonPublicId);
      if (!result.success) {
        showError(result.message ?? "Failed to dismiss reports.");
        return;
      }

      if (result.resolvedCount === 0) {
        showInfo("No pending reports to dismiss.");
      } else {
        showSuccess(`Dismissed ${result.resolvedCount} report${result.resolvedCount === 1 ? "" : "s"}.`);
      }

      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to dismiss reports.");
    } finally {
      setIsDismissing(false);
    }
  };

  const handleOpenUnpublishModal = () => {
    setUnpublishModalOpened(true);
  };

  const handleCloseUnpublishModal = () => {
    if (isUnpublishing) {
      return;
    }

    setUnpublishModalOpened(false);
  };

  const handleConfirmUnpublish = async () => {
    setIsUnpublishing(true);

    try {
      const result = await unpublishReportedLesson(lessonPublicId);
      if (!result.success) {
        showError(result.message ?? "Failed to unpublish lesson.");
        return;
      }

      if (result.resolvedCount === 0) {
        showInfo("Lesson already had no pending reports. It remains resolved.");
      } else {
        showSuccess(
          `Lesson unpublished and ${result.resolvedCount} report${result.resolvedCount === 1 ? "" : "s"} resolved.`,
        );
      }

      setUnpublishModalOpened(false);
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to unpublish lesson.");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return {
    handleCloseUnpublishModal,
    handleConfirmUnpublish,
    handleDismissReports,
    handleOpenUnpublishModal,
    isDismissing,
    isUnpublishing,
    unpublishModalOpened,
  };
}
