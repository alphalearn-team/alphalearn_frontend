"use client";

import { Modal, Button, Group } from "@mantine/core";

/**
 * REUSABLE COMPONENT - Confirmation Modal
 * 
 * Purpose: Themed confirmation dialog for destructive/important actions
 * Features:
 * - Light/dark mode compatible
 * - Responsive design
 * - Customizable colors (danger, warning, success)
 * - Loading states
 * - Icon support
 * 
 * Used for: Delete, Promote, Demote, and other confirmations
 */

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "red" | "orange" | "green" | "yellow" | "blue";
  loading?: boolean;
  icon?: string; // Material icon name
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
      withCloseButton={true}
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
          borderRadius: '12px',
        },
        header: {
          minHeight: '40px',
          padding: '12px 16px',
        },
      }}
    >
      {/* Header with Icon */}
      <div className="mb-6 pt-2">
        {icon && (
          <div className="flex justify-center mb-4">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full ${
              confirmColor === "red" ? "bg-red-500/10" :
              confirmColor === "green" ? "bg-green-500/10" :
              confirmColor === "yellow" ? "bg-yellow-500/10" :
              confirmColor === "blue" ? "bg-blue-500/10" :
              "bg-orange-500/10"
            }`}>
              <span 
                className={`material-symbols-outlined ${
                  confirmColor === "red" ? "text-red-500" :
                  confirmColor === "green" ? "text-green-500" :
                  confirmColor === "yellow" ? "text-yellow-500" :
                  confirmColor === "blue" ? "text-blue-500" :
                  "text-orange-500"
                }`}
                style={{ 
                  fontSize: '40px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                {icon}
              </span>
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-bold text-[var(--color-text)] text-center leading-tight">
          {title}
        </h3>
      </div>

      {/* Message */}
      <div className="text-sm text-[var(--color-text-secondary)] mb-6 text-center leading-relaxed whitespace-pre-line">
        {message}
      </div>

      {/* Action Buttons */}
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
          styles={{
            root: {
              backgroundColor: confirmColor === "red" ? "#ef4444" :
                              confirmColor === "green" ? "#22c55e" :
                              confirmColor === "yellow" ? "#eab308" :
                              confirmColor === "blue" ? "#2563eb" :
                              "var(--color-primary)",
              '&:hover': {
                backgroundColor: confirmColor === "red" ? "#dc2626" :
                                confirmColor === "green" ? "#16a34a" :
                                confirmColor === "yellow" ? "#ca8a04" :
                                confirmColor === "blue" ? "#1d4ed8" :
                                "var(--color-primary-hover)",
              },
            },
          }}
        >
          {confirmText}
        </Button>
      </Group>
    </Modal>
  );
}
