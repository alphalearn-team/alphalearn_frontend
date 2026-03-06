"use client";

import { useMemo, useState } from "react";
import type { LessonSectionInput, SectionType } from "@/interfaces/interfaces";
import {
  getDefaultSectionContent,
  type SectionWithId,
  withSectionIds,
  generateSectionId,
} from "./sectionEditorUtils";

interface UseSectionEditorStateParams {
  sections: LessonSectionInput[];
  onChange: (sections: LessonSectionInput[]) => void;
}

export function useSectionEditorState({ sections, onChange }: UseSectionEditorStateParams) {
  const [pickerOpened, setPickerOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [originalSection, setOriginalSection] = useState<SectionWithId | null>(null);

  const sectionsWithIds = useMemo(() => withSectionIds(sections), [sections]);

  const handleAddSection = (type: SectionType) => {
    const newSection: SectionWithId = {
      sectionType: type,
      title: null,
      content: getDefaultSectionContent(type),
      _id: generateSectionId(),
    };

    onChange([...sectionsWithIds, newSection]);
    setEditingIndex(sectionsWithIds.length);
    setOriginalSection(JSON.parse(JSON.stringify(newSection)));
  };

  const handleUpdateSection = (index: number, section: LessonSectionInput) => {
    const updated = [...sectionsWithIds];
    updated[index] = { ...section, _id: updated[index]._id };
    onChange(updated);
  };

  const handleUpdateSectionTitle = (index: number, title: string) => {
    const updated = [...sectionsWithIds];
    updated[index] = { ...updated[index], title: title || null };
    onChange(updated);
  };

  const handleRemoveSection = (index: number) => {
    onChange(sectionsWithIds.filter((_, sectionIndex) => sectionIndex !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    setDeleteConfirmIndex(null);
  };

  const handleStartEditing = (index: number) => {
    setOriginalSection(JSON.parse(JSON.stringify(sectionsWithIds[index])));
    setEditingIndex(index);
  };

  const handleDoubleClick = (index: number) => {
    if (editingIndex === index) {
      return;
    }
    handleStartEditing(index);
  };

  const handleCancelEditing = () => {
    if (originalSection !== null && editingIndex !== null) {
      const updated = [...sectionsWithIds];
      updated[editingIndex] = originalSection;
      onChange(
        updated.map((section) => ({
          sectionType: section.sectionType,
          title: section.title ?? null,
          content: section.content,
        })),
      );
    }

    setEditingIndex(null);
    setOriginalSection(null);
  };

  const handleSaveEditing = () => {
    setEditingIndex(null);
    setOriginalSection(null);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const isInvalidMove =
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sectionsWithIds.length - 1);

    if (isInvalidMove) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sectionsWithIds];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    onChange(updated);
    setEditingIndex(null);
    setOriginalSection(null);
  };

  return {
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
  };
}
