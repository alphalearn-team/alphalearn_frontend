"use client";

import { Button, Group, Modal, Text, Textarea } from "@mantine/core";

interface RejectLessonModalProps {
  isRejecting: boolean;
  lessonTitle: string;
  onClose: () => void;
  onReject: () => void;
  onReasonChange: (value: string) => void;
  opened: boolean;
  rejectError: string | null;
  rejectReason: string;
}

export default function RejectLessonModal({
  isRejecting,
  lessonTitle,
  onClose,
  onReject,
  onReasonChange,
  opened,
  rejectError,
  rejectReason,
}: RejectLessonModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
          Provide the admin rejection reason for <strong>{lessonTitle}</strong>. This is stored
          separately from automated moderation reasons.
        </Text>

        <Textarea
          label="Rejection reason"
          placeholder="Needs revision before publication"
          autosize
          minRows={4}
          value={rejectReason}
          onChange={(event) => onReasonChange(event.currentTarget.value)}
          error={rejectError}
          disabled={isRejecting}
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={isRejecting}>
            Cancel
          </Button>
          <Button color="red" onClick={onReject} loading={isRejecting}>
            Reject Lesson
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
