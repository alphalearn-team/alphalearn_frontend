"use client";

import { TextInput, Textarea } from "@mantine/core";
import type { DefinitionSectionContent } from "@/interfaces/interfaces";
import { createSectionFieldStyles, SectionDisplayHeader } from "./SectionBlockPrimitives";

export default function SectionDefinitionEditor({
  content,
  onChange,
}: {
  content: DefinitionSectionContent;
  onChange?: (content: DefinitionSectionContent) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionDisplayHeader
        icon="book"
        title="Definition"
        className="mb-2"
        iconClassName="text-lg"
        iconStyle={{ color: "var(--color-primary)" }}
        titleClassName="text-xs font-bold uppercase tracking-[0.2em]"
        titleStyle={{ color: "var(--color-primary)" }}
      />
      <TextInput
        label="Term"
        placeholder="Enter the slang term..."
        value={content.term}
        onChange={(event) => onChange?.({ ...content, term: event.currentTarget.value })}
        required
        styles={createSectionFieldStyles({ fontSize: "1rem" })}
      />

      <TextInput
        label="Pronunciation (Optional)"
        placeholder="e.g., /ˈskɪb.ə.di/"
        value={content.pronunciation || ""}
        onChange={(event) =>
          onChange?.({
            ...content,
            pronunciation: event.currentTarget.value || null,
          })
        }
        styles={createSectionFieldStyles()}
      />

      <Textarea
        label="Definition"
        placeholder="Enter the definition..."
        value={content.definition}
        onChange={(event) => onChange?.({ ...content, definition: event.currentTarget.value })}
        required
        minRows={3}
        autosize
        styles={createSectionFieldStyles()}
      />
    </div>
  );
}
