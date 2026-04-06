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
    conceptFieldRef,
    conceptOptions,
    error,
    handleCancel,
    handleSaveDraft,
    isSavingDraft,
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

      <LessonSubmissionError error={error} />

      <LessonCreateActionBar
        hasSections={sections.length > 0}
        isSavingDraft={isSavingDraft}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
      />
    </form>
  );
}
