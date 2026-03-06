"use client";

import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import type { ExampleSectionContent } from "@/interfaces/interfaces";
import { createSectionFieldStyles, EditableItemCard } from "./SectionBlockPrimitives";

interface SectionExampleEditorProps {
  content: ExampleSectionContent;
  onChange?: (content: ExampleSectionContent) => void;
}

export default function SectionExampleEditor({
  content,
  onChange,
}: SectionExampleEditorProps) {
  const handleAddExample = () => {
    onChange?.({
      examples: [...content.examples, { text: "", context: null }],
    });
  };

  const handleUpdateExample = (index: number, text: string, context: string | null) => {
    const newExamples = [...content.examples];
    newExamples[index] = { text, context };
    onChange?.({ examples: newExamples });
  };

  const handleRemoveExample = (index: number) => {
    onChange?.({
      examples: content.examples.filter((_, i) => i !== index),
    });
  };

  return (
    <Stack gap="md">
      {content.examples.map((example, index) => (
        <EditableItemCard
          key={index}
          title={`Example ${index + 1}`}
          removeLabel="Remove example"
          onRemove={() => handleRemoveExample(index)}
        >
          <Stack gap="sm">
            <Textarea
              placeholder="Enter the example sentence or phrase..."
              value={example.text}
              onChange={(event) =>
                handleUpdateExample(index, event.currentTarget.value, example.context || null)
              }
              minRows={2}
              autosize
              styles={createSectionFieldStyles({
                backgroundColor: "var(--color-input)",
                fontSize: "15px",
                lineHeight: 1.6,
              })}
            />

            <TextInput
              placeholder="Optional context (e.g., 'Used in casual conversation')"
              value={example.context || ""}
              onChange={(event) =>
                handleUpdateExample(index, example.text, event.currentTarget.value || null)
              }
              styles={createSectionFieldStyles({
                backgroundColor: "var(--color-input)",
                color: "var(--color-text-muted)",
                fontSize: "13px",
                fontStyle: "italic",
              })}
            />
          </Stack>
        </EditableItemCard>
      ))}

      <Button
        onClick={handleAddExample}
        variant="outline"
        leftSection={<span className="material-symbols-outlined text-base">add</span>}
        styles={{
          root: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            borderStyle: "dashed",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "var(--color-overlay)",
              borderColor: "var(--color-primary)",
            },
          },
        }}
      >
        Add Example
      </Button>
    </Stack>
  );
}
