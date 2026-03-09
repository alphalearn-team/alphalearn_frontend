"use client";

import { Button, Group, Modal } from "@mantine/core";
import ConfirmModalHeader from "./ConfirmModalHeader";
import { getConfirmButtonStyles, type ConfirmColor } from "./confirmModalStyles";

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: ConfirmColor;
  loading?: boolean;
  icon?: string;
}

export default function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "orange",
  loading = false,
  icon,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton
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
      <ConfirmModalHeader confirmColor={confirmColor} icon={icon} title={title} />

      <div className="text-sm text-[var(--color-text-secondary)] mb-6 text-center leading-relaxed whitespace-pre-line">
        {message}
      </div>

      <Group justify="center" gap="md" className="mt-6">
        <Button
          variant="subtle"
          color="gray"
          onClick={onClose}
          disabled={loading}
          className="text-[var(--color-text)] hover:bg-[var(--color-background-hover)] min-w-[100px]"
        >
          {cancelText}
        </Button>

        <Button
          color={confirmColor}
          onClick={onConfirm}
          loading={loading}
          className="min-w-[100px]"
          styles={getConfirmButtonStyles(confirmColor)}
        >
          {confirmText}
        </Button>
      </Group>
    </Modal>
  );
}
