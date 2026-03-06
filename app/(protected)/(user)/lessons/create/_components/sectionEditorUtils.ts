"use client";

import type {
  CalloutSectionContent,
  ComparisonSectionContent,
  DefinitionSectionContent,
  ExampleSectionContent,
  LessonSectionInput,
  SectionType,
  TextSectionContent,
} from "@/interfaces/interfaces";

export type SectionWithId = LessonSectionInput & { _id: string };

export function generateSectionId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function getDefaultSectionContent(
  type: SectionType,
): TextSectionContent | ExampleSectionContent | CalloutSectionContent | DefinitionSectionContent | ComparisonSectionContent {
  switch (type) {
    case "text":
      return { html: "" } as TextSectionContent;
    case "example":
      return { examples: [{ text: "", context: null }] } as ExampleSectionContent;
    case "callout":
      return { variant: "info", title: null, html: "" } as CalloutSectionContent;
    case "definition":
      return { term: "", pronunciation: null, definition: "" } as DefinitionSectionContent;
    case "comparison":
      return {
        items: [
          { label: "", description: "" },
          { label: "", description: "" },
        ],
      } as ComparisonSectionContent;
    default:
      return { html: "" } as TextSectionContent;
  }
}

export function withSectionIds(sections: LessonSectionInput[]): SectionWithId[] {
  return sections.map((section) => ({
    ...section,
    _id: (section as { _id?: string })._id || generateSectionId(),
  }));
}
