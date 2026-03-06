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


function toEditorContent(content: LessonContent): Content {
  if (typeof content === "string") return content;
  if (content && typeof content === "object") return content as Content;
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
