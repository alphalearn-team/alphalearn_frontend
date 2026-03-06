"use client";

import type { Concept } from "@/interfaces/interfaces";
import LessonBasicsCard from "./LessonBasicsCard";
import LessonContentSection from "./LessonContentSection";
import LessonCreateActionBar from "./LessonCreateActionBar";
import LessonSubmissionError from "./LessonSubmissionError";
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
  const {
    conceptOptions,
    error,
    handleCancel,
    handleSubmit,
    isSubmitting,
    sections,
    selectedConceptIds,
    setSections,
    setSelectedConceptIds,
    setTitle,
    title,
  } = useLessonCreationForm({
    availableConcepts,
    concepts,
    initialConceptPublicIds,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <LessonBasicsCard
        conceptOptions={conceptOptions}
        onConceptChange={setSelectedConceptIds}
        onTitleChange={setTitle}
        selectedConceptIds={selectedConceptIds}
        title={title}
      />

      <LessonContentSection sections={sections} onSectionsChange={setSections} />

      <LessonSubmissionError error={error} />

      <LessonCreateActionBar
        hasSections={sections.length > 0}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
      />
    </form>
  );
}
