"use client";

import { useCallback, useState } from "react";
import type { Concept } from "@/interfaces/interfaces";
import type { Question } from "@/app/(protected)/(user)/quiz/_components/quizbuilder/types";
import LessonBasicsCard from "./LessonBasicsCard";
import LessonContentSection from "./LessonContentSection";
import LessonCreateActionBar from "./LessonCreateActionBar";
import LessonSubmissionError from "./LessonSubmissionError";
import LessonInlineQuizSection from "./LessonInlineQuizSection";
import { useLessonCreationForm } from "../_hooks/useLessonCreationForm";

interface LessonEditorWithSectionsProps {
  availableConcepts?: Concept[];
  concepts?: Concept[];
  initialConceptPublicIds?: string[];
}

export default function LessonEditorWithSections({
  availableConcepts,
  concepts,
  initialConceptPublicIds = [],
}: LessonEditorWithSectionsProps) {
  const [quizzes, setQuizzes] = useState<Question[][]>([[]]);

  const handleQuestionsChange = useCallback((index: number, questions: Question[]) => {
    setQuizzes(prev => prev.map((q, i) => (i === index ? questions : q)));
  }, []);

  const handleAddQuiz = useCallback(() => {
    setQuizzes(prev => [...prev, []]);
  }, []);

  const handleRemoveQuiz = useCallback((index: number) => {
    setQuizzes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const {
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
  } = useLessonCreationForm({
    availableConcepts,
    concepts,
    initialConceptPublicIds,
    quizzes,
  });

  return (
    <form className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <LessonBasicsCard
        conceptFieldRef={conceptFieldRef}
        conceptOptions={conceptOptions}
        onConceptChange={setSelectedConceptIds}
        onTitleChange={setTitle}
        selectedConceptIds={selectedConceptIds}
        title={title}
        titleInputRef={titleInputRef}
      />

      <LessonContentSection
        sections={sections}
        onSectionsChange={setSections}
        onRegisterSectionElement={registerSectionElement}
      />

      {quizzes.map((_, index) => (
        <LessonInlineQuizSection
          key={index}
          quizLabel={`Quiz ${index + 1}`}
          onQuestionsChange={(questions) => handleQuestionsChange(index, questions)}
          onRemove={quizzes.length > 1 ? () => handleRemoveQuiz(index) : undefined}
        />
      ))}

      <button
        type="button"
        onClick={handleAddQuiz}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          border: "1px dashed var(--color-border)",
          background: "transparent",
          color: "var(--color-primary)",
          cursor: "pointer",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <span className="material-symbols-outlined text-base">add</span>
        Add Another Quiz
      </button>

      <LessonSubmissionError error={error} />

      <LessonCreateActionBar
        hasSections={sections.length > 0}
        hasQuiz={quizzes.some(q => q.length > 0)}
        isSavingDraft={isSavingDraft}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
      />
    </form>
  );
}
