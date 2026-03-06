"use client";

import { Button } from "@mantine/core";

interface SectionEditorEmptyStateProps {
  onAddFirstSection: () => void;
}

export default function SectionEditorEmptyState({
  onAddFirstSection,
}: SectionEditorEmptyStateProps) {
  return (
    <div
      className="text-center py-16 rounded-xl border-2 border-dashed"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "rgba(156, 163, 175, 0.03)",
      }}
    >
      <span
        className="material-symbols-outlined text-6xl mb-4 block"
        style={{ color: "var(--color-text-muted)", opacity: 0.4 }}
      >
        note_stack_add
      </span>
      <p className="text-base font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
        No sections yet
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Start by adding your first section to build your lesson
      </p>
      <Button
        leftSection={<span className="material-symbols-outlined text-base">add</span>}
        onClick={onAddFirstSection}
        size="md"
        styles={{
          root: {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-surface)",
            fontWeight: 600,
          },
        }}
      >
        Add First Section
      </Button>
    </div>
  );
}
