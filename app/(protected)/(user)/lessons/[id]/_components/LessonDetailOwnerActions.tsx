"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Modal, Stack, Text, Textarea } from "@mantine/core";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import { deleteLesson } from "@/app/(protected)/(user)/lessons/_actions/lesson";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  createLessonReport,
  getLessonReportErrorMessage,
  isLessonReportReasonValid,
} from "@/lib/utils/lessonReport";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";

interface LessonDetailOwnerActionsProps {
  lessonId: string;
  canEdit: boolean;
  canDelete: boolean;
  canReport?: boolean;
  showBackToMine?: boolean;
}

export default function LessonDetailOwnerActions({
  lessonId,
  canEdit,
  canDelete,
  canReport = false,
  showBackToMine = false,
}: LessonDetailOwnerActionsProps) {
  const { session } = useAuth();
  const router = useRouter();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportModalOpened, setReportModalOpened] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportReasonError, setReportReasonError] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteLesson(lessonId);
      if (response.success) {
        showSuccess(response.message);
        router.replace("/lessons/mine");
      } else {
        showError(response.message);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete lesson");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpened(false);
    }
  };

  const closeReportModal = (forceClose = false) => {
    if (isSubmittingReport && !forceClose) {
      return;
    }

    setReportModalOpened(false);
    setReportReason("");
    setReportReasonError(null);
  };

  const handleSubmitReport = async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      showError("Your session is still loading. Please try again in a moment.");
      return;
    }

    if (!isLessonReportReasonValid(reportReason)) {
      setReportReasonError("Reason is required.");
      return;
    }

    setReportReasonError(null);
    setIsSubmittingReport(true);

    try {
      await createLessonReport(accessToken, {
        lessonId,
        reason: reportReason,
      });
      closeReportModal(true);
      showSuccess("Thanks. Your report has been submitted for review.");
    } catch (error) {
      showError(getLessonReportErrorMessage(error));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReasonChange = (value: string) => {
    setReportReason(value);

    if (reportReasonError && isLessonReportReasonValid(value)) {
      setReportReasonError(null);
    }
  };

  if (!canEdit && !canDelete && !showBackToMine && !canReport) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {showBackToMine && (
          <Link
            href="/lessons/mine"
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay)] hover:text-[var(--color-text)]"
          >
            Back to My Lessons
          </Link>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => setDeleteModalOpened(true)}
            className="inline-flex h-10 items-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            Delete
          </button>
        )}

        {canReport && (
          <button
            type="button"
            onClick={() => setReportModalOpened(true)}
            className="inline-flex h-10 items-center rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
          >
            Report Lesson
          </button>
        )}

        {canEdit && (
          <Link
            href={`/lessons/${lessonId}/edit`}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            Edit Lesson
          </Link>
        )}
      </div>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={() => !isDeleting && setDeleteModalOpened(false)}
        onConfirm={handleDelete}
        title="Delete Lesson?"
        message="You can delete unpublished, pending, rejected, or approved lessons. This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
        icon="delete_forever"
        loading={isDeleting}
      />

      <Modal
        opened={reportModalOpened}
        onClose={() => closeReportModal()}
        centered
        title="Report lesson for review"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Tell us what needs attention. Your reason is required and helps moderators review faster.
          </Text>

          <Textarea
            label="Reason"
            placeholder="Describe the issue with this lesson"
            value={reportReason}
            onChange={(event) => handleReasonChange(event.currentTarget.value)}
            minRows={4}
            maxLength={500}
            required
            error={reportReasonError}
          />

          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={() => closeReportModal()} disabled={isSubmittingReport}>
              Cancel
            </Button>
            <Button color="red" onClick={handleSubmitReport} loading={isSubmittingReport}>
              Submit report
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  );
}
