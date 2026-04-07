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
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const handleQuestionsChange = useCallback((questions: Question[]) => {
    setQuizQuestions(questions);
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
    quizQuestions,
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

      <LessonInlineQuizSection onQuestionsChange={handleQuestionsChange} />

      <LessonSubmissionError error={error} />

      <LessonCreateActionBar
        hasSections={sections.length > 0}
        hasQuiz={quizQuestions.length > 0}
        isSavingDraft={isSavingDraft}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
      />
    </form>
  );
}
