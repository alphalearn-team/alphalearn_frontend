"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  ComparisonSectionContent,
  Concept,
  DefinitionSectionContent,
  ExampleSectionContent,
  LessonSectionInput,
} from "@/interfaces/interfaces";
import { createLessonWithSections } from "@/lib/actions/lesson";

interface UseLessonCreationFormParams {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds: string[];
}

function isHTMLEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  return text.trim().length === 0;
}

type HighlightStyleKey = "borderColor" | "borderWidth" | "borderRadius";
type HighlightStyles = Partial<Record<HighlightStyleKey, string>>;

function highlightElement(
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

export function useLessonCreationForm({
  availableConcepts,
  concepts,
  initialConceptPublicIds,
}: UseLessonCreationFormParams) {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const conceptFieldRef = useRef<HTMLDivElement | null>(null);
  const sectionElementsRef = useRef<Array<HTMLElement | null>>([]);
  const [title, setTitle] = useState("");
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(
    initialConceptPublicIds,
  );
  const [sections, setSections] = useState<LessonSectionInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conceptList = availableConcepts || concepts || [];
  const conceptOptions = useMemo(
    () =>
      conceptList.map((concept) => ({
        value: concept.publicId,
        label: concept.title,
      })),
    [conceptList],
  );

  const validateTitle = (): string | null => {
    if (title.trim()) {
      return null;
    }

    const titleInput = titleInputRef.current;
    if (titleInput) {
      titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightElement(titleInput, {
        borderColor: "var(--color-error)",
        borderWidth: "2px",
      });
    }

    return "Please enter a lesson title to continue";
  };

  const validateConcepts = (): string | null => {
    if (selectedConceptIds.length > 0) {
      return null;
    }

    const conceptField = conceptFieldRef.current;
    if (conceptField) {
      conceptField.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightElement(conceptField, {
        borderColor: "var(--color-error)",
        borderWidth: "2px",
        borderRadius: "8px",
      });
    }

    return "Please select at least one concept for this lesson";
  };

  const validateSections = (): string | null => {
    if (sections.length > 0) {
      return null;
    }

    return "Please add at least one section to your lesson";
  };

  const getSectionValidationError = (section: LessonSectionInput): string => {
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
  };

  const validateSectionContent = (): string | null => {
    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const sectionError = getSectionValidationError(section);
      if (!sectionError) {
        continue;
      }

      const sectionElement = sectionElementsRef.current[index];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        highlightElement(sectionElement, {
          borderColor: "var(--color-error)",
          borderWidth: "3px",
        });
      }

      return `Section ${index + 1}: ${sectionError}`;
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const titleError = validateTitle();
    if (titleError) {
      setError(titleError);
      return;
    }

    const conceptError = validateConcepts();
    if (conceptError) {
      setError(conceptError);
      return;
    }

    const sectionError = validateSections();
    if (sectionError) {
      setError(sectionError);
      return;
    }

    const sectionContentError = validateSectionContent();
    if (sectionContentError) {
      setError(sectionContentError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        conceptPublicIds: selectedConceptIds,
        sections,
        content: {},
        submit: true,
      };

      const result = await createLessonWithSections(payload);

      if (result.success && result.data?.lessonPublicId) {
        router.push(`/lessons/${result.data.lessonPublicId}`);
        return;
      }

      if (result.success) {
        setError("Lesson created but could not navigate to it");
        return;
      }

      setError(result.message || "Failed to create lesson");
    } catch (submitError) {
      setError(
        `An unexpected error occurred: ${
          submitError instanceof Error ? submitError.message : String(submitError)
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const registerSectionElement = useCallback(
    (index: number, element: HTMLElement | null) => {
      sectionElementsRef.current[index] = element;
    },
    [],
  );

  return {
    conceptFieldRef,
    conceptOptions,
    error,
    handleCancel,
    handleSubmit,
    isSubmitting,
    registerSectionElement,
    sections,
    selectedConceptIds,
    setSections,
    setSelectedConceptIds,
    setTitle,
    title,
    titleInputRef,
  };
}
