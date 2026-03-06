"use client";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";

interface RejectApplicationModalProps {
  isRejecting: boolean;
  onClose: () => void;
  onReject: () => void;
  onReasonChange: (nextReason: string) => void;
  opened: boolean;
  reason: string;
  reasonError: string | null;
}

export default function RejectApplicationModal({
  isRejecting,
  onClose,
  onReject,
  onReasonChange,
  opened,
  reason,
  reasonError,
}: RejectApplicationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} centered title="Reject Contributor Application">
      <Stack gap="sm">
        <Text size="sm" className="text-[var(--color-text-secondary)]">
          Provide a reason for rejection. This will be shown to the learner.
        </Text>
        <Textarea
          label="Rejection reason"
          minRows={4}
          autosize
          value={reason}
          onChange={(event) => onReasonChange(event.currentTarget.value)}
          error={reasonError}
          disabled={isRejecting}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={isRejecting}>
            Cancel
          </Button>
          <Button color="red" onClick={onReject} loading={isRejecting}>
            Reject
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
