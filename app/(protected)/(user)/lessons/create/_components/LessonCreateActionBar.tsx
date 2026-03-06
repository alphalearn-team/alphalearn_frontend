"use client";

import { Button } from "@mantine/core";

interface LessonCreateActionBarProps {
  hasSections: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function LessonCreateActionBar({
  hasSections,
  isSubmitting,
  onCancel,
}: LessonCreateActionBarProps) {
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
        disabled={isSubmitting}
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
        type="submit"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting || !hasSections}
        leftSection={!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
        className="w-full sm:flex-1"
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
        {isSubmitting ? "Creating Lesson..." : "Create & Submit for Review"}
      </Button>
    </div>
  );
}
