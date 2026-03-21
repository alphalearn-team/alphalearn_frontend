"use client";

import { Button } from "@mantine/core";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import type { LessonSectionInput } from "@/interfaces/interfaces";
import { SectionPicker } from "@/app/(protected)/(user)/lessons/_components/LessonBuilder";
import SectionEditorCard from "./SectionEditorCard";
import SectionEditorEmptyState from "./SectionEditorEmptyState";
import { useSectionEditorState } from "./useSectionEditorState";

interface SectionEditorProps {
  sections: LessonSectionInput[];
  onChange: (sections: LessonSectionInput[]) => void;
  registerSectionElement: (index: number, element: HTMLElement | null) => void;
}

export function SectionEditor({
  sections,
  onChange,
  registerSectionElement,
}: SectionEditorProps) {
  const {
    deleteConfirmIndex,
    editingIndex,
    handleAddSection,
    handleCancelEditing,
    handleDoubleClick,
    handleMoveSection,
    handleRemoveSection,
    handleSaveEditing,
    handleStartEditing,
    handleUpdateSection,
    handleUpdateSectionTitle,
    pickerOpened,
    sectionsWithIds,
    setDeleteConfirmIndex,
    setPickerOpened,
  } = useSectionEditorState({ sections, onChange });

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <SectionEditorEmptyState onAddFirstSection={() => setPickerOpened(true)} />
      )}

      {sectionsWithIds.map((section, index) => (
        <SectionEditorCard
          key={section._id}
          section={section}
          index={index}
          isEditing={editingIndex === index}
          isFirst={index === 0}
          isLast={index === sectionsWithIds.length - 1}
          onMove={(direction) => handleMoveSection(index, direction)}
          onStartEditing={() => handleStartEditing(index)}
          onDoubleClick={() => handleDoubleClick(index)}
          onDelete={() => setDeleteConfirmIndex(index)}
          onUpdateTitle={(title) => handleUpdateSectionTitle(index, title)}
          onUpdateSection={(updated) => handleUpdateSection(index, updated)}
          onCancelEditing={handleCancelEditing}
          onSaveEditing={handleSaveEditing}
          onRegisterElement={(element) => registerSectionElement(index, element)}
        />
      ))}

      {sections.length > 0 && (
        <Button
          fullWidth
          variant="default"
          size="md"
          leftSection={<span className="material-symbols-outlined text-base">add</span>}
          onClick={() => setPickerOpened(true)}
          styles={{
            root: {
              borderColor: "var(--color-border)",
              borderStyle: "dashed",
              borderWidth: "2px",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(156, 163, 175, 0.05)",
              },
            },
          }}
        >
          Add Another Section
        </Button>
      )}

      <SectionPicker
        opened={pickerOpened}
        onClose={() => setPickerOpened(false)}
        onSelect={handleAddSection}
      />

      <ConfirmModal
        opened={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={() =>
          deleteConfirmIndex !== null && handleRemoveSection(deleteConfirmIndex)
        }
        title="Delete Section"
        message={`Are you sure you want to delete Section ${deleteConfirmIndex !== null ? deleteConfirmIndex + 1 : ""}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        icon="delete"
      />
    </div>
  );
}
