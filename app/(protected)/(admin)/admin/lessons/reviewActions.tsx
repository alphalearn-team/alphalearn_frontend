"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Modal, Text, Textarea } from "@mantine/core";
import { showError, showSuccess } from "@/lib/actions/notifications";
import { approveLesson, rejectLesson } from "./actions";

interface ReviewActionsProps {
  lessonPublicId: string;
  lessonTitle: string;
}

export default function ReviewActions({
  lessonPublicId,
  lessonTitle,
}: ReviewActionsProps) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    const shouldApprove = window.confirm(
      `Approve "${lessonTitle}"?\n\nThis will make the lesson publicly available.`,
    );

    if (!shouldApprove) {
      return;
    }

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

      <Modal
        opened={rejectModalOpened}
        onClose={handleCloseRejectModal}
        centered
        title="Reject Lesson"
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 4,
        }}
        classNames={{
          content: "bg-[var(--color-surface)] border border-[var(--color-border)]",
          header: "bg-[var(--color-surface)] border-0",
          title: "text-[var(--color-text)]",
          body: "pt-4",
        }}
        styles={{
          content: {
            borderRadius: "12px",
          },
          header: {
            minHeight: "40px",
            padding: "12px 16px",
          },
        }}
      >
        <div className="space-y-4">
          <Text size="sm" className="text-[var(--color-text-secondary)]">
            Provide the admin rejection reason for <strong>{lessonTitle}</strong>. This is stored separately from automated moderation reasons.
          </Text>

          <Textarea
            label="Rejection reason"
            placeholder="Needs revision before publication"
            autosize
            minRows={4}
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.currentTarget.value);
              if (rejectError) {
                setRejectError(null);
              }
            }}
            error={rejectError}
            disabled={isRejecting}
          />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleCloseRejectModal}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleReject} loading={isRejecting}>
              Reject Lesson
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
