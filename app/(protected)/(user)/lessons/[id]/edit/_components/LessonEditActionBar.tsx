"use client";

import { Button } from "@mantine/core";

interface LessonEditActionBarProps {
  currentStatus: string;
  hasChanges: boolean;
  hasSections: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onDelete: () => void;
  onSave: () => void;
  onSubmitForReview: () => void;
  onUnpublish: () => void;
}

export default function LessonEditActionBar({
  currentStatus,
  hasChanges,
  hasSections,
  isSubmitting,
  isSaving,
  onDiscard,
  onDelete,
  onSave,
  onSubmitForReview,
  onUnpublish,
}: LessonEditActionBarProps) {
  const isLoading = isSubmitting || isSaving;

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Left side actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onDiscard}
          disabled={isLoading}
          styles={{
            root: {
              borderColor: "var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              padding: "0 24px",
            },
          }}
        >
          Discard
        </Button>

        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onDelete}
          disabled={isLoading}
          leftSection={<span className="material-symbols-outlined text-lg">delete</span>}
          styles={{
            root: {
              borderColor: "rgba(239, 68, 68, 0.3)",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              color: "var(--color-error)",
              fontWeight: 500,
              padding: "0 20px",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            },
          }}
        >
          Delete
        </Button>
      </div>

      {/* Right side actions */}
      <div className="flex gap-3 sm:ml-auto">
        {/* Unpublish button - only for APPROVED status */}
        {currentStatus === "APPROVED" && (
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={onUnpublish}
            disabled={isLoading}
            leftSection={<span className="material-symbols-outlined text-lg">visibility_off</span>}
            styles={{
              root: {
                borderColor: "var(--color-primary)",
                backgroundColor: "transparent",
                color: "var(--color-primary)",
                fontWeight: 600,
                padding: "0 24px",
              },
            }}
          >
            Unpublish
          </Button>
        )}

        {/* Submit for Review button - only for UNPUBLISHED or REJECTED status */}
        {(currentStatus === "UNPUBLISHED" || currentStatus === "REJECTED") && (
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={onSubmitForReview}
            loading={isSubmitting}
            disabled={isLoading || !hasSections}
            leftSection={!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
            styles={{
              root: {
                borderColor: "var(--color-primary)",
                backgroundColor: "transparent",
                color: "var(--color-primary)",
                fontWeight: 600,
                padding: "0 24px",
              },
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        )}

        {/* Pending status indicator */}
        {currentStatus === "PENDING" && (
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled
            leftSection={<span className="material-symbols-outlined text-lg">hourglass_top</span>}
            styles={{
              root: {
                borderColor: "var(--color-border)",
                backgroundColor: "transparent",
                color: "var(--color-text-muted)",
                fontWeight: 500,
                padding: "0 24px",
                cursor: "not-allowed",
              },
            }}
          >
            Under Review
          </Button>
        )}

        {/* Save Changes button */}
        <Button
          type="button"
          size="lg"
          loading={isSaving}
          disabled={isLoading || !hasSections || !hasChanges}
          onClick={onSave}
          leftSection={!isSaving && <span className="material-symbols-outlined text-lg">save</span>}
          styles={{
            root: {
              backgroundColor: "var(--color-primary)",
              color: "var(--color-surface)",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0 32px",
              boxShadow: "0 4px 12px var(--color-shadow)",
            },
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
