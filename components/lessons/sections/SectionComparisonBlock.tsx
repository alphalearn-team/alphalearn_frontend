"use client";

import type { ComparisonSectionContent } from "@/interfaces/interfaces";
import SectionComparisonDisplay from "./SectionComparisonDisplay";
import SectionComparisonEditor from "./SectionComparisonEditor";

interface SectionComparisonBlockProps {
  content: ComparisonSectionContent;
  isEditing?: boolean;
  onChange?: (content: ComparisonSectionContent) => void;
}

export function SectionComparisonBlock({
  content,
  isEditing = false,
  onChange,
}: SectionComparisonBlockProps) {
  if (isEditing) {
    return <SectionComparisonEditor content={content} onChange={onChange} />;
  }

  return <SectionComparisonDisplay content={content} />;
}
