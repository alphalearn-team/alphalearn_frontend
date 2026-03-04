"use client";

import { TextDisplayer } from "@/components/texteditor/textDisplayer";
import { RichTextEditor } from "@/components/texteditor/textEditor";
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
        style={{ backgroundColor: "var(--color-surface)" }}
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
      className="rounded-xl border border-[var(--color-border)] overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      <TextDisplayer content={content.html} />
    </div>
  );
}
