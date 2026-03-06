"use client";

import { TextInput, Textarea } from "@mantine/core";
import type { DefinitionSectionContent } from "@/interfaces/interfaces";
import {
  createSectionFieldStyles,
  SectionDisplayCard,
  SectionDisplayHeader,
} from "./SectionBlockPrimitives";

interface SectionDefinitionBlockProps {
  content: DefinitionSectionContent;
  isEditing?: boolean;
  onChange?: (content: DefinitionSectionContent) => void;
}

export function SectionDefinitionBlock({
  content,
  isEditing = false,
  onChange,
}: SectionDefinitionBlockProps) {
  if (isEditing) {
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
          onChange={(e) =>
            onChange?.({ ...content, term: e.currentTarget.value })
          }
          required
          styles={createSectionFieldStyles({ fontSize: "1rem" })}
        />

        <TextInput
          label="Pronunciation (Optional)"
          placeholder="e.g., /ˈskɪb.ə.di/"
          value={content.pronunciation || ""}
          onChange={(e) =>
            onChange?.({
              ...content,
              pronunciation: e.currentTarget.value || null,
            })
          }
          styles={createSectionFieldStyles()}
        />

        <Textarea
          label="Definition"
          placeholder="Enter the definition..."
          value={content.definition}
          onChange={(e) =>
            onChange?.({ ...content, definition: e.currentTarget.value })
          }
          required
          minRows={3}
          autosize
          styles={createSectionFieldStyles()}
        />
      </div>
    );
  }

  return (
    <SectionDisplayCard
      className="p-6 border-l-4"
      style={{
        borderLeftColor: "var(--color-primary)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-surface)",
          }}
        >
          <span className="material-symbols-outlined text-2xl">book</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h3
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {content.term}
            </h3>
            {content.pronunciation && (
              <span
                className="text-sm font-mono"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {content.pronunciation}
              </span>
            )}
          </div>

          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {content.definition}
          </p>
        </div>
      </div>
    </SectionDisplayCard>
  );
}
