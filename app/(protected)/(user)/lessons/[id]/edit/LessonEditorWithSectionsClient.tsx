"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { LessonSection } from "@/interfaces/interfaces";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import LessonEditTitleCard from "./_components/LessonEditTitleCard";
import LessonEditContentSection from "./_components/LessonEditContentSection";
import LessonEditSubmissionError from "./_components/LessonEditSubmissionError";
import LessonEditActionBar from "./_components/LessonEditActionBar";
import { useLessonEditWithSections } from "./_hooks/useLessonEditWithSections";

export interface LessonEditorWithSectionsProps {
  lessonId: string;
  initialTitle: string;
  initialSections: LessonSection[];
  initialStatus: string;
  quizSection?: ReactNode;
}

export default function LessonEditorWithSectionsClient({
  lessonId,
  initialTitle,
  initialSections,
  initialStatus,
  quizSection,
}: LessonEditorWithSectionsProps) {
  const {
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
  } = useLessonEditWithSections({
    lessonId,
    initialTitle,
    initialSections,
    initialStatus,
  });

  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <LessonEditTitleCard
        title={title}
        onTitleChange={setTitle}
        titleInputRef={titleInputRef}
      />

      <LessonEditContentSection
        sections={sections}
        onSectionsChange={setSections}
        onRegisterSectionElement={registerSectionElement}
      />

      <LessonEditSubmissionError error={error} />

      {quizSection}

      <LessonEditActionBar
        currentStatus={currentStatus}
        hasChanges={hasChanges}
        hasSections={sections.length > 0}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        onDiscard={() => setDiscardModalOpened(true)}
        onDelete={() => setDeleteModalOpened(true)}
        onSave={handleSave}
        onSubmitForReview={handleSubmitForReview}
        onUnpublish={handleUnpublish}
      />

      <ConfirmModal
        opened={discardModalOpened}
        onClose={() => setDiscardModalOpened(false)}
        onConfirm={handleDiscard}
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? This action cannot be undone."
        confirmText="Discard"
        confirmColor="red"
        icon="delete"
      />

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        onConfirm={handleDelete}
        title="Delete Lesson?"
        message="This action is permanent and cannot be undone. All content in this lesson will be lost."
        confirmText="Delete Permanently"
        confirmColor="red"
        icon="delete_forever"
      />
    </div>
  );
}
