"use client";

import type {
  ComparisonSectionContent,
  DefinitionSectionContent,
  ExampleSectionContent,
  LessonSectionInput,
} from "@/interfaces/interfaces";

export function isHTMLEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  return text.trim().length === 0;
}

type HighlightStyleKey = "borderColor" | "borderWidth" | "borderRadius";
type HighlightStyles = Partial<Record<HighlightStyleKey, string>>;

export function highlightElement(
  element: HTMLElement,
  styles: HighlightStyles,
  timeoutMs = 3000,
) {
  const previousStyles: HighlightStyles = {};

  for (const [key, value] of Object.entries(styles)) {
    const styleKey = key as HighlightStyleKey;
    previousStyles[styleKey] = element.style[styleKey];
    element.style[styleKey] = value || "";
  }

  setTimeout(() => {
    for (const [key, value] of Object.entries(previousStyles)) {
      const styleKey = key as HighlightStyleKey;
      element.style[styleKey] = value || "";
    }
  }, timeoutMs);
}

export function getSectionValidationError(section: LessonSectionInput): string {
  if (section.sectionType === "text") {
    const content = section.content as { html: string };
    if (!content.html || isHTMLEmpty(content.html)) {
      return "Please add content to this text section";
    }
    return "";
  }

  if (section.sectionType === "example") {
    const examples = (section.content as ExampleSectionContent).examples || [];
    if (examples.length === 0 || !examples[0].text || examples[0].text.trim() === "") {
      return "Please add at least one example";
    }
    return "";
  }

  if (section.sectionType === "definition") {
    const content = section.content as DefinitionSectionContent;
    if (!content.term || content.term.trim() === "") {
      return "Please enter a term";
    }
    if (!content.definition || content.definition.trim() === "") {
      return "Please enter a definition";
    }
    return "";
  }

  if (section.sectionType === "comparison") {
    const items = (section.content as ComparisonSectionContent).items || [];
    if (items.length < 2) {
      return "Please add at least 2 items to compare";
    }
    for (let index = 0; index < items.length; index += 1) {
      if (!items[index].label || items[index].label.trim() === "") {
        return `Please add a label for item ${index + 1}`;
      }
      if (!items[index].description || items[index].description.trim() === "") {
        return `Please add a description for item ${index + 1}`;
      }
    }
    return "";
  }

  if (section.sectionType === "callout") {
    const content = section.content as { html: string };
    if (!content.html || isHTMLEmpty(content.html)) {
      return "Please add content to this callout";
    }
    return "";
  }

  return "";
}
