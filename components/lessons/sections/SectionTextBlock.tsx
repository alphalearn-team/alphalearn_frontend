"use client";

import { TextDisplayer } from "@/components/texteditor/TextDisplayer";
import { RichTextEditor } from "@/components/texteditor/TextEditor";
import type { TextSectionContent } from "@/interfaces/interfaces";

interface SectionTextBlockProps {
  content: TextSectionContent;
  isEditing?: boolean;
  onChange?: (content: TextSectionContent) => void;
}

export function SectionTextBlock({
  content,
  isEditing = false,
  onChange,
}: SectionTextBlockProps) {
  if (isEditing) {
    return (
      <div
        className="rounded-xl border border-[var(--color-border)]"
        style={{ backgroundColor: "var(--color-surface)", minHeight: "auto" }}
      >
        <RichTextEditor
          value={content.html}
          onChange={(html) => onChange?.({ html })}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-[var(--color-border)]"
      style={{ background: "var(--color-surface)", minHeight: "auto" }}
    >
      <TextDisplayer content={content.html} />
    </div>
  );
}
