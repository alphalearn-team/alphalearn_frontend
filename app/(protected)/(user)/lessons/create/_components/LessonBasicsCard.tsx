"use client";

import { MultiSelect, TextInput } from "@mantine/core";

interface LessonBasicsCardProps {
  conceptOptions: Array<{ value: string; label: string }>;
  onConceptChange: (values: string[]) => void;
  onTitleChange: (value: string) => void;
  selectedConceptIds: string[];
  title: string;
}

export default function LessonBasicsCard({
  conceptOptions,
  onConceptChange,
  onTitleChange,
  selectedConceptIds,
  title,
}: LessonBasicsCardProps) {
  return (
    <div
      className="space-y-6 p-4 sm:p-8 rounded-2xl border"
      style={{
        backgroundColor: "rgba(156, 163, 175, 0.03)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
        >
          <span className="material-symbols-outlined text-xl">info</span>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: "var(--color-text)" }}>
            Basic Information
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Set a clear title and related concepts
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <TextInput
          label="Lesson Title"
          placeholder="Enter lesson title..."
          value={title}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
          size="lg"
          styles={{
            label: {
              color: "var(--color-text)",
              marginBottom: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              fontSize: "1rem",
              padding: "12px 16px",
            },
          }}
        />

        <MultiSelect
          label="Related Concepts"
          placeholder="Select concepts this lesson teaches..."
          data={conceptOptions}
          value={selectedConceptIds}
          onChange={onConceptChange}
          searchable
          required
          size="lg"
          styles={{
            label: {
              color: "var(--color-text)",
              marginBottom: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
      </div>
    </div>
  );
}
