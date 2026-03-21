"use client";

import { Select, TextInput } from "@mantine/core";
import { RichTextEditor } from "@/components/texteditor/TextEditor";
import type { CalloutSectionContent, CalloutVariant } from "@/interfaces/interfaces";
import { createSectionFieldStyles, SectionDisplayCard } from "./SectionBlockPrimitives";
import { CALLOUT_VARIANTS } from "./SectionCalloutShared";

interface SectionCalloutEditorProps {
  content: CalloutSectionContent;
  onChange?: (content: CalloutSectionContent) => void;
}

export default function SectionCalloutEditor({
  content,
  onChange,
}: SectionCalloutEditorProps) {
  return (
    <div className="space-y-3">
      <Select
        label="Callout Type"
        data={CALLOUT_VARIANTS.map((variant) => ({
          value: variant.value,
          label: variant.label,
        }))}
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
        onChange={(event) => onChange?.({ ...content, title: event.currentTarget.value })}
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
