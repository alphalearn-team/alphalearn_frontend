"use client";

import { Button } from "@mantine/core";

interface LessonCreateActionBarProps {
  hasSections: boolean;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
}

export default function LessonCreateActionBar({
  hasSections,
  isSavingDraft,
  isSubmitting,
  onCancel,
  onSaveDraft,
}: LessonCreateActionBarProps) {
  const loading = isSubmitting || isSavingDraft;

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={onCancel}
        disabled={loading}
        className="w-full sm:w-auto"
        styles={{
          root: {
            borderColor: "var(--color-border)",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            fontWeight: 500,
            padding: "0 32px",
          },
        }}
      >
        Cancel
      </Button>

      <div className="flex gap-3 flex-1">
        <Button
          type="button"
          size="lg"
          loading={isSavingDraft}
          disabled={loading || !hasSections}
          onClick={onSaveDraft}
          leftSection={!isSavingDraft && <span className="material-symbols-outlined text-lg">save</span>}
          className="flex-1"
          styles={{
            root: {
              backgroundColor: "transparent",
              borderColor: "var(--color-primary)",
              border: "2px solid",
              color: "var(--color-primary)",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0 32px",
            },
          }}
        >
          {isSavingDraft ? "Saving Draft..." : "Save Draft"}
        </Button>

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          disabled={loading || !hasSections}
          leftSection={!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
          className="flex-1"
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              color: "var(--color-surface)",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0 40px",
              boxShadow: "0 4px 12px var(--color-shadow)",
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create & Submit"}
        </Button>
      </div>
    </div>
  );
}
