"use client";

import { Button } from "@mantine/core";

interface LessonCreateActionBarProps {
  hasSections: boolean;
  isSavingDraft: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
}

export default function LessonCreateActionBar({
  hasSections,
  isSavingDraft,
  onCancel,
  onSaveDraft,
}: LessonCreateActionBarProps) {
  return (
    <div
      className="flex flex-col gap-3 pt-6 sm:pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
        After saving, go to the lesson editor to add a quiz before submitting for review.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onCancel}
          disabled={isSavingDraft}
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

        <Button
          type="button"
          size="lg"
          loading={isSavingDraft}
          disabled={isSavingDraft || !hasSections}
          onClick={onSaveDraft}
          leftSection={!isSavingDraft && <span className="material-symbols-outlined text-lg">save</span>}
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
      </div>
    </div>
  );
}
