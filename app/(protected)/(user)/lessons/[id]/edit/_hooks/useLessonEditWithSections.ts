"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LessonSection, LessonSectionInput } from "@/interfaces/interfaces";
import {
  saveLessonWithSections,
  deleteLesson,
  submitLesson,
  unpublishLesson,
} from "@/lib/actions/lesson";
import { showSuccess, showError } from "@/lib/actions/notifications";
import {
  getLessonModerationSubmitToast,
  normalizeLessonModerationStatus,
} from "@/lib/lessonModeration";
import { lessonSectionsToInputs } from "../../../_shared/sectionEditorUtils";
import {
  getSectionValidationError,
  highlightElement,
} from "../../../_shared/lessonValidationUtils";

interface UseLessonEditWithSectionsParams {
  lessonId: string;
  initialTitle: string;
  initialSections: LessonSection[];
  initialStatus: string;
}

export function useLessonEditWithSections({
  lessonId,
  initialTitle,
  initialSections,
  initialStatus,
}: UseLessonEditWithSectionsParams) {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const sectionElementsRef = useRef<Array<HTMLElement | null>>([]);

  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState<LessonSectionInput[]>(
    lessonSectionsToInputs(initialSections),
  );
  const [currentStatus, setCurrentStatus] = useState(
    normalizeLessonModerationStatus(initialStatus),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute if changes have been made
  const hasChanges = useMemo(() => {
    // Check if title changed
    if (title.trim() !== initialTitle.trim()) {
      return true;
    }

    // Check if sections changed
    const initialInputs = lessonSectionsToInputs(initialSections);
    if (sections.length !== initialInputs.length) {
      return true;
    }

    // Deep compare each section
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const initial = initialInputs[i];

      if (
        current.sectionType !== initial.sectionType ||
        JSON.stringify(current.content) !== JSON.stringify(initial.content)
      ) {
        return true;
      }
    }

    return false;
  }, [title, sections, initialTitle, initialSections]);

  // Clear errors when sections or title change
  useEffect(() => {
    if (error) {
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, title]);

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

  const handleSave = async () => {
    setError(null);

    const titleError = validateTitle();
    if (titleError) {
      setError(titleError);
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

    setIsSaving(true);

    try {
      const result = await saveLessonWithSections({
        id: lessonId,
        title: title.trim(),
        sections,
      });

      if (result.success) {
        const moderationStatus = result.data?.moderationStatus;
        if (moderationStatus) {
          setCurrentStatus(normalizeLessonModerationStatus(moderationStatus));
        }
        showSuccess(result.message || "Saved!");
        // Redirect to lesson detail page after successful save
        router.push(`/lessons/${lessonId}`);
      } else {
        setError(result.message || "Failed to save lesson");
        showError(result.message || "Failed to save lesson");
      }
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "An unexpected error occurred";
      setError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setError(null);

    const titleError = validateTitle();
    if (titleError) {
      setError(titleError);
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
      // Save changes only if there are any
      if (hasChanges) {
        const saveResult = await saveLessonWithSections({
          id: lessonId,
          title: title.trim(),
          sections,
        });

        if (!saveResult.success) {
          setError(saveResult.message || "Failed to save changes before submitting");
          showError(saveResult.message || "Failed to save changes");
          setIsSubmitting(false);
          return;
        }
      }

      // Submit for review
      const submitResult = await submitLesson(lessonId);

      if (submitResult.success) {
        showSuccess(getLessonModerationSubmitToast(submitResult.data?.moderationStatus));
        router.replace(`/lessons/${lessonId}`);
      } else {
        setError(submitResult.message || "Failed to submit for review");
        showError(submitResult.message || "Failed to submit for review");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "An unexpected error occurred";
      setError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);

    try {
      const result = await deleteLesson(lessonId);

      if (result.success) {
        showSuccess(result.message || "Lesson deleted");
        router.replace("/lessons/mine");
      } else {
        showError(result.message || "Failed to delete lesson");
      }
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "An unexpected error occurred";
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);

    try {
      const result = await unpublishLesson(lessonId);

      if (result.success) {
        setCurrentStatus(normalizeLessonModerationStatus(result.data?.moderationStatus));
        showSuccess(result.message || "Lesson unpublished");
        router.refresh();
      } else {
        showError(result.message || "Failed to unpublish lesson");
      }
    } catch (unpublishError) {
      const message = unpublishError instanceof Error ? unpublishError.message : "An unexpected error occurred";
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    router.back();
  };

  const registerSectionElement = useCallback(
    (index: number, element: HTMLElement | null) => {
      sectionElementsRef.current[index] = element;
    },
    [],
  );

  return {
    currentStatus,
    error,
    handleDelete,
    handleDiscard,
    handleSave,
    handleSubmitForReview,
    handleUnpublish,
    hasChanges,
    isSaving,
    isSubmitting,
    registerSectionElement,
    sections,
    setSections,
    setTitle,
    title,
    titleInputRef,
  };
}
