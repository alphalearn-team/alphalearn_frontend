"use client";

import { Button } from "@mantine/core";

interface LessonCreateActionBarProps {
  hasSections: boolean;
  hasQuiz: boolean;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
}

export default function LessonCreateActionBar({
  hasSections,
  hasQuiz,
  isSavingDraft,
  isSubmitting,
  onCancel,
  onSaveDraft,
  onSubmitForReview,
}: LessonCreateActionBarProps) {
  const isBusy = isSavingDraft || isSubmitting;

  return (
    <div
      className="flex flex-col gap-3 pt-6 sm:pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onCancel}
          disabled={isBusy}
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
          disabled={isBusy || !hasSections}
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

        <Button
          type="button"
          size="lg"
          loading={isSubmitting}
          disabled={isBusy || !hasSections || !hasQuiz}
          onClick={onSubmitForReview}
          leftSection={!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
          styles={{
            root: {
              backgroundColor: hasQuiz ? "var(--color-primary)" : "transparent",
              borderColor: "var(--color-primary)",
              border: "2px solid",
              color: hasQuiz ? "var(--color-background)" : "var(--color-text-muted)",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0 32px",
              opacity: (!hasSections || !hasQuiz) ? 0.5 : 1,
            },
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit for Review"}
        </Button>
      </div>

      {hasSections && !hasQuiz && (
        <p className="text-xs text-right" style={{ color: "var(--color-text-muted)" }}>
          <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
          Add a quiz above to enable submission.
        </p>
      )}
    </div>
  );
}
