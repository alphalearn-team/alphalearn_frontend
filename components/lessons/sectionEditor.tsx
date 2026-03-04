"use client";

import { useState } from "react";
import { Button, TextInput, Textarea, ActionIcon, Modal } from "@mantine/core";
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

interface SectionEditorProps {
  sections: LessonSectionInput[];
  onChange: (sections: LessonSectionInput[]) => void;
}

function getDefaultContent(type: SectionType): any {
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

  const handleAddSection = (type: SectionType) => {
    const newSection: LessonSectionInput = {
      sectionType: type,
      title: null,
      content: getDefaultContent(type),
    };
    onChange([...sections, newSection]);
    setEditingIndex(sections.length);
  };

  const handleUpdateSection = (index: number, section: LessonSectionInput) => {
    const updated = [...sections];
    updated[index] = section;
    onChange(updated);
  };

  const handleUpdateSectionTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title: title || null };
    onChange(updated);
  };

  const handleRemoveSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);

    if (editingIndex === index) {
      setEditingIndex(newIndex);
    } else if (editingIndex === newIndex) {
      setEditingIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <div
          className="text-center py-12 rounded-xl border-2 border-dashed"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30" style={{ color: "var(--color-text-muted)" }}>
            add_circle
          </span>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            No sections yet. Start building your lesson!
          </p>
          <Button
            leftSection={<span className="material-symbols-outlined text-sm">add</span>}
            onClick={() => setPickerOpened(true)}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "white",
              },
            }}
          >
            Add First Section
          </Button>
        </div>
      )}

      {sections.map((section, index) => {
        const isEditing = editingIndex === index;

        return (
          <div
            key={index}
            className="rounded-xl border p-5 space-y-4"
            style={{
              backgroundColor: isEditing ? "var(--color-surface-elevated)" : "var(--color-surface)",
              borderColor: isEditing ? "var(--color-primary)" : "var(--color-border)",
              borderWidth: isEditing ? "2px" : "1px",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>
                  Section {index + 1} · {section.sectionType}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => handleMoveSection(index, "up")}
                  disabled={index === 0}
                  styles={{ root: { color: "var(--color-text-muted)" } }}
                >
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                </ActionIcon>

                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => handleMoveSection(index, "down")}
                  disabled={index === sections.length - 1}
                  styles={{ root: { color: "var(--color-text-muted)" } }}
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </ActionIcon>

                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setEditingIndex(isEditing ? null : index)}
                  styles={{ root: { color: "var(--color-primary)" } }}
                >
                  <span className="material-symbols-outlined text-base">
                    {isEditing ? "visibility" : "edit"}
                  </span>
                </ActionIcon>

                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemoveSection(index)}
                  styles={{ root: { color: "var(--color-error)" } }}
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </ActionIcon>
              </div>
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
          </div>
        );
      })}

      {sections.length > 0 && (
        <Button
          fullWidth
          variant="light"
          leftSection={<span className="material-symbols-outlined text-sm">add</span>}
          onClick={() => setPickerOpened(true)}
          styles={{
            root: {
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            },
          }}
        >
          Add Section
        </Button>
      )}

      <SectionPicker
        opened={pickerOpened}
        onClose={() => setPickerOpened(false)}
        onSelect={handleAddSection}
      />
    </div>
  );
}
