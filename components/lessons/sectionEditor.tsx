"use client";

import { useState } from "react";
import { Button, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import ConfirmModal from "@/components/common/confirmModal";
import type {
  LessonSectionInput,
  SectionType,
  TextSectionContent,
  ExampleSectionContent,
  CalloutSectionContent,
  DefinitionSectionContent,
  ComparisonSectionContent,
} from "@/interfaces/interfaces";
import { SectionBlock, SectionPicker } from "@/components/lessons/sections";

// Extended section type with unique ID
type SectionWithId = LessonSectionInput & { _id: string };

interface SectionEditorProps {
  sections: LessonSectionInput[];
  onChange: (sections: LessonSectionInput[]) => void;
}

// Generate unique ID
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultContent(type: SectionType): TextSectionContent | ExampleSectionContent | CalloutSectionContent | DefinitionSectionContent | ComparisonSectionContent {
  switch (type) {
    case "text":
      return { html: "" } as TextSectionContent;
    case "example":
      return { examples: [{ text: "", context: null }] } as ExampleSectionContent;
    case "callout":
      return { variant: "info", title: null, html: "" } as CalloutSectionContent;
    case "definition":
      return { term: "", pronunciation: null, definition: "" } as DefinitionSectionContent;
    case "comparison":
      return { items: [{ label: "", description: "" }, { label: "", description: "" }] } as ComparisonSectionContent;
    default:
      return { html: "" };
  }
}

export function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const [pickerOpened, setPickerOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [originalSection, setOriginalSection] = useState<SectionWithId | null>(null);
  
  // Add IDs to sections if they don't have them
  const sectionsWithIds: SectionWithId[] = sections.map((s) => ({
    ...s,
    _id: (s as unknown as { _id?: string })._id || generateId(),
  }));

  const handleAddSection = (type: SectionType) => {
    const newSection: SectionWithId = {
      sectionType: type,
      title: null,
      content: getDefaultContent(type),
      _id: generateId(),
    };
    onChange([...sectionsWithIds, newSection]);
    const newIndex = sectionsWithIds.length;
    setEditingIndex(newIndex);
    // Store original state for new section
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
    onChange(sectionsWithIds.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    setDeleteConfirmIndex(null);
  };

  const handleDoubleClick = (index: number) => {
    if (editingIndex !== index) {
      // Store original section state before editing
      setOriginalSection(JSON.parse(JSON.stringify(sectionsWithIds[index])));
      setEditingIndex(index);
    }
  };

  const handleStartEditing = (index: number) => {
    // Store original section state before editing
    setOriginalSection(JSON.parse(JSON.stringify(sectionsWithIds[index])));
    setEditingIndex(index);
  };

  const handleCancelEditing = () => {
    // Restore original section if it exists
    if (originalSection !== null && editingIndex !== null) {
      const updated = [...sectionsWithIds];
      updated[editingIndex] = originalSection;
      onChange(
        updated.map((s) => ({
          sectionType: s.sectionType,
          title: s.title ?? null,
          content: s.content,
        }))
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
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sectionsWithIds.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sectionsWithIds];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);

    // Close editing mode when reordering
    setEditingIndex(null);
    setOriginalSection(null);
  };

  return (
    <>
    <div className="space-y-4">
      {sections.length === 0 && (
        <div
          className="text-center py-16 rounded-xl border-2 border-dashed"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "rgba(156, 163, 175, 0.03)",
          }}
        >
          <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: "var(--color-text-muted)", opacity: 0.4 }}>
            note_stack_add
          </span>
          <p className="text-base font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
            No sections yet
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            Start by adding your first section to build your lesson
          </p>
          <Button
            leftSection={<span className="material-symbols-outlined text-base">add</span>}
            onClick={() => setPickerOpened(true)}
            size="md"
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-surface)",
                fontWeight: 600,
              },
            }}
          >
            Add First Section
          </Button>
        </div>
      )}

      {sectionsWithIds.map((section, index) => {
        const isEditing = editingIndex === index;

        return (
          <div
            key={section._id}
            id={`section-${index}`}
            className="group relative"
          >
            {/* Drag Handle - Right Side */}
            {!isEditing && (
              <div 
                className="absolute -right-10 sm:-right-12 top-0 bottom-0 flex flex-col items-center justify-center gap-3 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ width: "40px" }}
              >
                <Tooltip label="Move up" position="right" withArrow>
                  <button
                    onClick={() => handleMoveSection(index, "up")}
                    disabled={index === 0}
                    className="p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    style={{ 
                      color: index === 0 ? "var(--color-text-muted)" : "var(--color-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontWeight: "300" }}>keyboard_arrow_up</span>
                  </button>
                </Tooltip>

                <Tooltip label="Move down" position="right" withArrow>
                  <button
                    onClick={() => handleMoveSection(index, "down")}
                    disabled={index === sectionsWithIds.length - 1}
                    className="p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    style={{ 
                      color: index === sectionsWithIds.length - 1 ? "var(--color-text-muted)" : "var(--color-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontWeight: "300" }}>keyboard_arrow_down</span>
                  </button>
                </Tooltip>
              </div>
            )}

            <div
              className="rounded-xl border transition-all duration-200 px-3 sm:px-5 py-4 sm:py-5"
              style={{
                backgroundColor: isEditing ? "rgba(156, 163, 175, 0.08)" : "rgba(156, 163, 175, 0.05)",
                borderColor: isEditing ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: isEditing ? "2px" : "1px",
              }}
              onDoubleClick={() => !isEditing && handleDoubleClick(index)}
            >

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate" style={{ color: "var(--color-text-muted)" }}>
                    Section {index + 1} · {section.sectionType}
                  </span>
                </div>

                {!isEditing && (
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => handleStartEditing(index)}
                    className="flex-shrink-0"
                    styles={{ 
                      root: { 
                        color: "var(--color-primary)",
                        backgroundColor: "rgba(124, 92, 255, 0.1)",
                      } 
                    }}
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </ActionIcon>
                )}
              </div>

            {isEditing && (
              <TextInput
                label="Section Title (Optional)"
                placeholder="Enter a title for this section..."
                value={section.title || ""}
                onChange={(e) => handleUpdateSectionTitle(index, e.currentTarget.value)}
                styles={{
                  label: {
                    color: "var(--color-text-muted)",
                    marginBottom: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                  },
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  },
                }}
              />
            )}

              <SectionBlock
                section={section}
                isEditing={isEditing}
                onChange={(updated) => handleUpdateSection(index, updated)}
                showTitle={!isEditing}
              />

              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                  {/* Delete on Left */}
                  <Tooltip label="Delete section">
                    <ActionIcon
                      size="lg"
                      variant="default"
                      onClick={() => setDeleteConfirmIndex(index)}
                      className="w-full sm:w-auto"
                      styles={{
                        root: {
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          borderColor: "var(--color-error)",
                          color: "var(--color-error)",
                        },
                      }}
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </ActionIcon>
                  </Tooltip>

                  {/* Cancel and Save on Right */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Tooltip label="Cancel editing">
                      <ActionIcon
                        size="lg"
                        variant="default"
                        onClick={handleCancelEditing}
                        className="flex-1 sm:flex-initial"
                        styles={{
                          root: {
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                          },
                        }}
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Save changes">
                      <ActionIcon
                        size="lg"
                      variant="filled"
                      onClick={handleSaveEditing}
                      className="flex-1 sm:flex-initial"
                      styles={{
                        root: {
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-surface)",
                        },
                      }}
                    >
                      <span className="material-symbols-outlined text-xl">check</span>
                    </ActionIcon>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        );
      })}

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
              '&:hover': {
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={() => deleteConfirmIndex !== null && handleRemoveSection(deleteConfirmIndex)}
        title="Delete Section"
        message={`Are you sure you want to delete Section ${deleteConfirmIndex !== null ? deleteConfirmIndex + 1 : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        icon="delete"
      />
    </div>
    </>
  );
}
