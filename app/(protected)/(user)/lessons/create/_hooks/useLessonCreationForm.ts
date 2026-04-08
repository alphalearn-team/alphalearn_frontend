"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Concept,
  LessonSectionInput,
} from "@/interfaces/interfaces";
import { createLessonWithSections, submitLesson } from "@/app/(protected)/(user)/lessons/_actions/lesson";
import { createQuizAction } from "@/app/(protected)/(user)/quiz/_components/createQuizActions";
import type { Question } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/types";
import {
  getSectionValidationError,
  highlightElement,
} from "../../_shared/lessonValidationUtils";
import { showSuccess, showError } from "@/lib/utils/popUpNotifications";

interface UseLessonCreationFormParams {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds: string[];
  quizzes?: Question[][];
}

function mapQuestionsToPayload(questions: Question[]) {
  return questions.map((q) => {
    const base = { type: q.type, prompt: q.prompt || "Empty Question" };
    if (q.type === "multiple-choice") {
      return {
        ...base,
        properties: {
          options: q.options.map((o) => ({ id: o.id, text: o.text || "Empty Option" })),
          correctOptionIds: q.correctOptionIds.length > 0 ? q.correctOptionIds : [q.options[0]?.id],
        },
      };
    }
    if (q.type === "single-choice") {
      return {
        ...base,
        properties: {
          options: q.options.map((o) => ({ id: o.id, text: o.text || "Empty Option" })),
          correctOptionId: q.correctOptionId || q.options[0]?.id,
        },
      };
    }
    if (q.type === "true-false") {
      return { ...base, properties: { correctBoolean: q.correctBoolean } };
    }
    return base;
  });
}

function validateQuizQuestions(questions: Question[]): string | null {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const num = i + 1;
    if (!q.prompt?.trim()) return `Question ${num}: Prompt is required.`;
    if (q.type === "multiple-choice") {
      if (q.options.length < 2) return `Question ${num}: Requires at least 2 options.`;
      if (q.correctOptionIds.length === 0) return `Question ${num}: Select at least one correct answer.`;
      if (q.options.some((o) => !o.text?.trim())) return `Question ${num}: All options must have text.`;
    }
    if (q.type === "single-choice") {
      if (q.options.length < 2) return `Question ${num}: Requires at least 2 options.`;
      if (!q.correctOptionId) return `Question ${num}: Select a correct answer.`;
      if (q.options.some((o) => !o.text?.trim())) return `Question ${num}: All options must have text.`;
    }
  }
  return null;
}

export function useLessonCreationForm({
  availableConcepts,
  concepts,
  initialConceptPublicIds,
  quizzes = [[]],
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

    // Validate quiz questions if any were added
    const nonEmptyQuizzesForDraft = quizzes.filter(q => q.length > 0);
    for (let i = 0; i < nonEmptyQuizzesForDraft.length; i++) {
      const quizError = validateQuizQuestions(nonEmptyQuizzesForDraft[i]);
      if (quizError) {
        setError(`Quiz ${i + 1}: ${quizError}`);
        return;
      }
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

      if (!result.success) {
        setError(result.message || "Failed to save draft");
        return;
      }

      if (!result.data?.lessonPublicId) {
        setError("Lesson created but could not navigate to it");
        return;
      }

      const { lessonPublicId } = result.data;

      // Create quizzes if any questions were added
      const nonEmptyQuizzes = quizzes.filter(q => q.length > 0);
      for (const quizQuestions of nonEmptyQuizzes) {
        const quizResult = await createQuizAction({
          lessonPublicId,
          questions: mapQuestionsToPayload(quizQuestions),
        });
        if (!quizResult.success) {
          showError("Lesson saved but one or more quizzes could not be created. You can add them from the lesson editor.");
          router.push(`/lessons/${lessonPublicId}`);
          return;
        }
      }
      if (nonEmptyQuizzes.length > 0) {
        showSuccess(`Lesson and ${nonEmptyQuizzes.length === 1 ? "quiz" : `${nonEmptyQuizzes.length} quizzes`} saved!`);
      } else {
        showSuccess("Lesson saved! Add a quiz before submitting for review.");
      }

      router.push(`/lessons/${lessonPublicId}`);
    } catch (submitError) {
      showError(submitError instanceof Error ? submitError.message : "An unexpected error occurred");
      setError(submitError instanceof Error ? submitError.message : "An unexpected error occurred");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitForReview = async () => {
    setError(null);

    const titleError = validateTitle();
    if (titleError) { setError(titleError); return; }

    const conceptError = validateConcepts();
    if (conceptError) { setError(conceptError); return; }

    const sectionError = validateSections();
    if (sectionError) { setError(sectionError); return; }

    const sectionContentError = validateSectionContent();
    if (sectionContentError) { setError(sectionContentError); return; }

    const nonEmptyQuizzesForSubmit = quizzes.filter(q => q.length > 0);
    if (nonEmptyQuizzesForSubmit.length === 0) {
      setError("Please add at least one quiz question before submitting for review.");
      return;
    }

    for (let i = 0; i < nonEmptyQuizzesForSubmit.length; i++) {
      const quizError = validateQuizQuestions(nonEmptyQuizzesForSubmit[i]);
      if (quizError) { setError(`Quiz ${i + 1}: ${quizError}`); return; }
    }

    setIsSubmitting(true);

    try {
      // 1. Create lesson as draft
      const lessonResult = await createLessonWithSections({
        title: title.trim(),
        conceptPublicIds: selectedConceptIds,
        sections,
        content: {},
        submit: false,
      });

      if (!lessonResult.success || !lessonResult.data?.lessonPublicId) {
        setError(lessonResult.message || "Failed to create lesson");
        return;
      }

      const { lessonPublicId } = lessonResult.data;

      // 2. Create quizzes
      const nonEmptyQuizzes = quizzes.filter(q => q.length > 0);
      for (const quizQuestions of nonEmptyQuizzes) {
        const quizResult = await createQuizAction({
          lessonPublicId,
          questions: mapQuestionsToPayload(quizQuestions),
        });
        if (!quizResult.success) {
          showError("Lesson saved but one or more quizzes could not be created. You can submit from the lesson editor.");
          router.push(`/lessons/${lessonPublicId}`);
          return;
        }
      }

      // 3. Submit for review
      const submitResult = await submitLesson(lessonPublicId);

      if (!submitResult.success) {
        showError(submitResult.message || "Lesson and quiz saved but submission failed. Try submitting from the lesson editor.");
        router.push(`/lessons/${lessonPublicId}`);
        return;
      }

      showSuccess("Lesson submitted for review!");
      router.push(`/lessons/${lessonPublicId}`);
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
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
    handleSubmitForReview,
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
