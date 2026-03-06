"use client";

import type { CalloutSectionContent } from "@/interfaces/interfaces";
import SectionCalloutDisplay from "./SectionCalloutDisplay";
import SectionCalloutEditor from "./SectionCalloutEditor";

interface SectionCalloutBlockProps {
  content: CalloutSectionContent;
  isEditing?: boolean;
  onChange?: (content: CalloutSectionContent) => void;
}

export function SectionCalloutBlock({
  content,
  isEditing = false,
  onChange,
}: SectionCalloutBlockProps) {
  if (isEditing) {
    return <SectionCalloutEditor content={content} onChange={onChange} />;
  }

  return <SectionCalloutDisplay content={content} />;
}
