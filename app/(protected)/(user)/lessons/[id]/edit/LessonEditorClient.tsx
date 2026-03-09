"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import ConfirmModal from "@/components/common/ConfirmModal";
import { Concept, LessonContent } from "@/interfaces/interfaces";
import LessonConceptSelect from "./_components/LessonConceptSelect";
import LessonEditorActionBar from "./_components/LessonEditorActionBar";
import LessonTitleInput from "./_components/LessonTitleInput";
import { useLessonEditorActions } from "./_hooks/useLessonEditorActions";

const RichTextEditor = dynamic(
  () => import("@/components/texteditor/TextEditor").then((module) => module.RichTextEditor),
  { ssr: false },
);

export interface LessonEditorProps {
  id?: string;
  initialContent: LessonContent;
  initialConceptPublicIds?: string[];
  initialStatus?: string;
  initialTitle: string;
  availableConcepts?: Concept[];
}

export default function LessonEditorClient({
  id,
  initialContent,
  initialConceptPublicIds = [],
  initialStatus = "UNPUBLISHED",
  initialTitle,
  availableConcepts = [],
}: LessonEditorProps) {
  const {
    content,
    createLessonWithMode,
    currentStatus,
    deleteModalOpened,
    discardModalOpened,
    handleDiscard,
    handleDelete,
    handleSave,
    handleSubmitForReview,
    handleUnpublish,
    isCreateMode,
    loading,
    loadingAction,
    selectedConceptPublicIds,
    setContent,
    setDeleteModalOpened,
    setDiscardModalOpened,
    setSelectedConceptPublicIds,
    setTitle,
    title,
  } = useLessonEditorActions({
    id,
    initialTitle,
    initialContent,
    initialConceptPublicIds,
    initialStatus,
  });

  const conceptOptions = useMemo(
    () =>
      availableConcepts.map((concept) => ({
        value: concept.publicId,
        label: concept.title,
      })),
    [availableConcepts],
  );

  return (
    <div className="space-y-8">
      <LessonTitleInput title={title} onChange={setTitle} />

      {isCreateMode && (
        <LessonConceptSelect
          options={conceptOptions}
          selectedValues={selectedConceptPublicIds}
          onChange={setSelectedConceptPublicIds}
        />
      )}

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Content
        </label>
        <div
          className="rounded-xl border border-[var(--color-border)]
            focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)]
            transition-all duration-300"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <RichTextEditor value={content} onChange={setContent} isEditing />
        </div>
      </div>

      <LessonEditorActionBar
        currentStatus={currentStatus}
        isCreateMode={isCreateMode}
        loading={loading}
        loadingAction={loadingAction}
        onCreateSubmit={() => createLessonWithMode(true)}
        onOpenDelete={() => setDeleteModalOpened(true)}
        onOpenDiscard={() => setDiscardModalOpened(true)}
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
