"use client";

import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import type { ExampleSectionContent } from "@/interfaces/interfaces";
import {
  createSectionFieldStyles,
  EditableItemCard,
  SectionDisplayCard,
  SectionDisplayHeader,
  SectionNumberBadge,
} from "./SectionBlockPrimitives";

interface SectionExampleBlockProps {
  content: ExampleSectionContent;
  isEditing?: boolean;
  onChange?: (content: ExampleSectionContent) => void;
}

export function SectionExampleBlock({
  content,
  isEditing = false,
  onChange,
}: SectionExampleBlockProps) {
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

  if (isEditing) {
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
                onChange={(e) =>
                  handleUpdateExample(index, e.currentTarget.value, example.context || null)
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
                onChange={(e) =>
                  handleUpdateExample(index, example.text, e.currentTarget.value || null)
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

  return (
    <SectionDisplayCard className="overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]" style={{ background: "var(--color-overlay)" }}>
        <SectionDisplayHeader
          icon="forum"
          title="Usage Examples"
          iconClassName="text-lg"
          iconStyle={{ color: "var(--color-primary)" }}
          titleClassName="text-xs font-semibold uppercase tracking-wider"
          titleStyle={{ color: "var(--color-primary)" }}
        />
      </div>

      <div className="p-5 space-y-4">
        {content.examples.map((example, index) => (
          <div
            key={index}
            className="pb-4 border-b border-[var(--color-border)] last:border-b-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <SectionNumberBadge number={index + 1} />
              </div>

              <div className="flex-1">
                <p
                  className="text-base leading-relaxed mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  &quot;{example.text}&quot;
                </p>

                {example.context && (
                  <p
                    className="text-sm italic"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {example.context}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {content.examples.length === 0 && (
          <p
            className="text-sm text-center py-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            No examples added yet.
          </p>
        )}
      </div>
    </SectionDisplayCard>
  );
}
