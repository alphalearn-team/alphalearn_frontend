"use client";

import type { LessonSection, LessonSectionInput } from "@/interfaces/interfaces";
import { SectionTextBlock } from "./sectionTextBlock";
import { SectionExampleBlock } from "./sectionExampleBlock";
import { SectionCalloutBlock } from "./sectionCalloutBlock";
import { SectionDefinitionBlock } from "./sectionDefinitionBlock";
import { SectionComparisonBlock } from "./sectionComparisonBlock";

interface SectionBlockProps {
  section: LessonSection | LessonSectionInput;
  isEditing?: boolean;
  onChange?: (section: LessonSectionInput) => void;
  showTitle?: boolean;
}

export function SectionBlock({
  section,
  isEditing = false,
  onChange,
  showTitle = true,
}: SectionBlockProps) {
  const handleContentChange = (content: any) => {
    if (onChange) {
      onChange({
        sectionType: section.sectionType,
        title: section.title || null,
        content,
      });
    }
  };

  return (
    <div className="space-y-3">
      {showTitle && section.title && (
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          {section.title}
        </h2>
      )}

      {section.sectionType === "text" && (
        <SectionTextBlock
          content={section.content as any}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "example" && (
        <SectionExampleBlock
          content={section.content as any}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "callout" && (
        <SectionCalloutBlock
          content={section.content as any}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "definition" && (
        <SectionDefinitionBlock
          content={section.content as any}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "comparison" && (
        <SectionComparisonBlock
          content={section.content as any}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}
    </div>
  );
}
