"use client";

import { Select, TextInput } from "@mantine/core";
import { RichTextEditor } from "@/components/texteditor/TextEditor";
import { TextDisplayer } from "@/components/texteditor/TextDisplayer";
import type { CalloutSectionContent, CalloutVariant } from "@/interfaces/interfaces";
import { createSectionFieldStyles, SectionDisplayCard } from "./SectionBlockPrimitives";

interface SectionCalloutBlockProps {
  content: CalloutSectionContent;
  isEditing?: boolean;
  onChange?: (content: CalloutSectionContent) => void;
}

const CALLOUT_VARIANTS: {
  value: CalloutVariant;
  label: string;
  icon: string;
  borderColor: string;
  background: string;
}[] = [
  {
    value: "info",
    label: "Info",
    icon: "info",
    borderColor: "var(--color-info)",
    background: "rgba(59, 130, 246, 0.08)",
  },
  {
    value: "warning",
    label: "Warning",
    icon: "warning",
    borderColor: "var(--color-warning)",
    background: "rgba(245, 158, 11, 0.08)",
  },
  {
    value: "tip",
    label: "Tip",
    icon: "lightbulb",
    borderColor: "var(--color-success)",
    background: "rgba(34, 197, 94, 0.08)",
  },
  {
    value: "note",
    label: "Note",
    icon: "edit_note",
    borderColor: "var(--color-primary)",
    background: "rgba(156, 163, 175, 0.08)",
  },
];

export function SectionCalloutBlock({
  content,
  isEditing = false,
  onChange,
}: SectionCalloutBlockProps) {
  const variantConfig =
    CALLOUT_VARIANTS.find((v) => v.value === content.variant) ||
    CALLOUT_VARIANTS[0];

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Select
          label="Callout Type"
          data={CALLOUT_VARIANTS.map((v) => ({ value: v.value, label: v.label }))}
          value={content.variant}
          onChange={(value) =>
            onChange?.({ ...content, variant: (value as CalloutVariant) || "info" })
          }
          styles={createSectionFieldStyles()}
        />

        <TextInput
          label="Title (Optional)"
          placeholder="Enter callout title..."
          value={content.title || ""}
          onChange={(e) =>
            onChange?.({ ...content, title: e.currentTarget.value })
          }
          styles={createSectionFieldStyles()}
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2">
            Content
          </label>
          <SectionDisplayCard style={{ minHeight: "auto" }}>
            <RichTextEditor
              value={content.html}
              onChange={(html) => onChange?.({ ...content, html })}
              isEditing={true}
            />
          </SectionDisplayCard>
        </div>
      </div>
    );
  }

  return (
    <SectionDisplayCard
      className="flex gap-3 p-5 border-l-4"
      style={{
        borderLeft: `4px solid ${variantConfig.borderColor}`,
        background: variantConfig.background,
      }}
    >
      <span
        className="material-symbols-outlined text-xl mt-0.5 flex-shrink-0"
        style={{ color: variantConfig.borderColor }}
      >
        {variantConfig.icon}
      </span>

      <div className="flex-1 min-w-0">
        {content.title && (
          <div
            className="text-sm font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {content.title}
          </div>
        )}

        <div className="callout-content">
          <TextDisplayer content={content.html} />
        </div>
      </div>
    </SectionDisplayCard>
  );
}
