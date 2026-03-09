"use client";

import type { ExampleSectionContent } from "@/interfaces/interfaces";
import SectionExampleDisplay from "./SectionExampleDisplay";
import SectionExampleEditor from "./SectionExampleEditor";

interface SectionExampleBlockProps {
  content: ExampleSectionContent;
  isEditing?: boolean;
  onChange?: (content: ExampleSectionContent) => void;
}

export function SectionExampleBlock({
  content,
  isEditing = false,
  onChange,
}: SectionExampleBlockProps) {
  if (isEditing) {
    return <SectionExampleEditor content={content} onChange={onChange} />;
  }

  return <SectionExampleDisplay content={content} />;
}
