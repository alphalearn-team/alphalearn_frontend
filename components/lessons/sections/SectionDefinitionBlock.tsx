"use client";

import type { DefinitionSectionContent } from "@/interfaces/interfaces";
import SectionDefinitionDisplay from "./SectionDefinitionDisplay";
import SectionDefinitionEditor from "./SectionDefinitionEditor";

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
    return <SectionDefinitionEditor content={content} onChange={onChange} />;
  }

  return <SectionDefinitionDisplay content={content} />;
}
