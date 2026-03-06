"use client";

import { useEditor, type Content } from "@tiptap/react";
import { RichTextEditor, Link } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import StarterKit from "@tiptap/starter-kit";
import type { LessonContent } from "@/interfaces/interfaces";
import { richTextContentStyles } from "./styles";

type GenAlphaStructuredContent = {
  summary?: string;
  keyTerms?: Array<{ term?: string; definition?: string }>;
  sections?: Array<{ heading?: string; paragraphs?: string[] }>;
};

function isProseMirrorDoc(v: unknown): v is { type: "doc"; content?: unknown[] } {
  return !!v && typeof v === "object" && (v as any).type === "doc";
}

function looksLikeStructuredLesson(v: unknown): v is GenAlphaStructuredContent {
  if (!v || typeof v !== "object") return false;
  const o = v as any;
  return (
    typeof o.summary === "string" ||
    Array.isArray(o.keyTerms) ||
    Array.isArray(o.sections)
  );
}

function structuredToDoc(v: GenAlphaStructuredContent): Content {
  const docContent: any[] = [];

  const pushParagraph = (text?: string) => {
    const t = (text ?? "").trim();
    if (!t) return;
    docContent.push({
      type: "paragraph",
      content: [{ type: "text", text: t }],
    });
  };

  const pushHeading = (text?: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2) => {
    const t = (text ?? "").trim();
    if (!t) return;
    docContent.push({
      type: "heading",
      attrs: { level },
      content: [{ type: "text", text: t }],
    });
  };

  // Summary
  if (v.summary) {
    pushParagraph(v.summary);
  }

  // Sections
  if (Array.isArray(v.sections)) {
    for (const s of v.sections) {
      pushHeading(s?.heading, 2);

      if (Array.isArray(s?.paragraphs)) {
        for (const p of s.paragraphs) {
          pushParagraph(p);
        }
      }
    }
  }

  // Key terms
  if (Array.isArray(v.keyTerms) && v.keyTerms.length > 0) {
    pushHeading("Key terms", 3);
    for (const kt of v.keyTerms) {
      const term = (kt?.term ?? "").trim();
      const def = (kt?.definition ?? "").trim();
      if (!term && !def) continue;
      pushParagraph(def ? `${term} — ${def}` : term);
    }
  }

  return { type: "doc", content: docContent };
}

function toEditorContent(content: LessonContent): Content {
  // 1) HTML string (or plain text)
  if (typeof content === "string") return content;

  // 2) Already a ProseMirror doc
  if (isProseMirrorDoc(content)) return content as Content;

  // 3) Your structured object format -> convert to ProseMirror doc
  if (looksLikeStructuredLesson(content)) {
    return structuredToDoc(content as GenAlphaStructuredContent);
  }

  // 4) Unknown object -> don't crash tiptap
  return "";
}

export function TextDisplayer({ content }: { content: LessonContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Superscript,
      Subscript,
    ],
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    content: toEditorContent(content),
    editable: false,
  });

  return (
    <>
      <style>{richTextContentStyles}</style>
      <RichTextEditor
        editor={editor}
        variant="subtle"
        className="lesson-rich-text"
        styles={{
          root: { border: "none", background: "transparent" },
          content: { background: "transparent" },
        }}
      >
        <RichTextEditor.Content />
      </RichTextEditor>
    </>
  );
}