"use client";

import type {
  LessonSection,
  LessonSectionInput,
  TextSectionContent,
  ExampleSectionContent,
  CalloutSectionContent,
  DefinitionSectionContent,
  ComparisonSectionContent,
} from "@/interfaces/interfaces";
import { SectionTextBlock } from "./SectionTextBlock";
import { SectionExampleBlock } from "./SectionExampleBlock";
import { SectionCalloutBlock } from "./SectionCalloutBlock";
import { SectionDefinitionBlock } from "./SectionDefinitionBlock";
import { SectionComparisonBlock } from "./SectionComparisonBlock";

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
  const handleContentChange = (content: TextSectionContent | ExampleSectionContent | CalloutSectionContent | DefinitionSectionContent | ComparisonSectionContent) => {
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
          content={section.content as TextSectionContent}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "example" && (
        <SectionExampleBlock
          content={section.content as ExampleSectionContent}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "callout" && (
        <SectionCalloutBlock
          content={section.content as CalloutSectionContent}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "definition" && (
        <SectionDefinitionBlock
          content={section.content as DefinitionSectionContent}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}

      {section.sectionType === "comparison" && (
        <SectionComparisonBlock
          content={section.content as ComparisonSectionContent}
          isEditing={isEditing}
          onChange={handleContentChange}
        />
      )}
    </div>
  );
}
