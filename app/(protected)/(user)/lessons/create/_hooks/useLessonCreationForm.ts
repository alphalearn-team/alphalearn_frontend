"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Concept,
  LessonSectionInput,
} from "@/interfaces/interfaces";
import { createLessonWithSections } from "@/app/(protected)/(user)/lessons/_actions/lesson";
import {
  getSectionValidationError,
  highlightElement,
} from "../../_shared/lessonValidationUtils";
import { showSuccess, showError } from "@/lib/utils/popUpNotifications";

interface UseLessonCreationFormParams {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds: string[];
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
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear errors when sections, title, or concepts change
  useEffect(() => {
    if (error) {
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, title, selectedConceptIds]);

  const conceptList = useMemo(
    () => availableConcepts || concepts || [],
    [availableConcepts, concepts],
  );

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

  const handleSaveDraft = async () => {
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

    setIsSavingDraft(true);

    try {
      const payload = {
        title: title.trim(),
        conceptPublicIds: selectedConceptIds,
        sections,
        content: {},
        submit: false, // Save as draft
      };

      const result = await createLessonWithSections(payload);

      if (result.success && result.data?.lessonPublicId) {
        showSuccess("Lesson saved! Add a quiz before submitting for review.");
        router.push(`/lessons/${result.data.lessonPublicId}`);
        return;
      }

      if (result.success) {
        setError("Lesson created but could not navigate to it");
        return;
      }

      setError(result.message || "Failed to save draft");
    } catch (submitError) {
      showError(submitError instanceof Error ? submitError.message : "An unexpected error occurred");
      setError(submitError instanceof Error ? submitError.message : "An unexpected error occurred");
    } finally {
      setIsSavingDraft(false);
    }
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
    handleSaveDraft,
    handleSubmit,
    isSavingDraft,
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
