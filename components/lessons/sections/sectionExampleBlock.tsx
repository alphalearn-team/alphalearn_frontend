"use client";

import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import type { ExampleSectionContent } from "@/interfaces/interfaces";

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
          <div
            key={index}
            className="rounded-xl border border-[var(--color-border)] p-4"
            style={{ backgroundColor: "var(--color-surface-elevated)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Example {index + 1}
              </span>
              <button
                onClick={() => handleRemoveExample(index)}
                className="p-1 rounded-lg text-red-400 hover:text-red-300
                  hover:bg-red-500/10 transition-all duration-200"
                title="Remove example"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>

            <Stack gap="sm">
              <Textarea
                placeholder="Enter the example sentence or phrase..."
                value={example.text}
                onChange={(e) =>
                  handleUpdateExample(index, e.currentTarget.value, example.context || null)
                }
                minRows={2}
                autosize
                styles={{
                  input: {
                    backgroundColor: "var(--color-input)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    fontSize: "15px",
                    lineHeight: 1.6,
                  },
                }}
              />

              <TextInput
                placeholder="Optional context (e.g., 'Used in casual conversation')"
                value={example.context || ""}
                onChange={(e) =>
                  handleUpdateExample(index, example.text, e.currentTarget.value || null)
                }
                styles={{
                  input: {
                    backgroundColor: "var(--color-input)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-muted)",
                    fontSize: "13px",
                    fontStyle: "italic",
                  },
                }}
              />
            </Stack>
          </div>
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
    <div
      className="rounded-xl border border-[var(--color-border)] overflow-hidden"
      style={{ backgroundColor: "var(--color-surface-elevated)" }}
    >
      <div
        className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2"
        style={{ background: "var(--color-overlay)" }}
      >
        <span
          className="material-symbols-outlined text-lg"
          style={{ color: "var(--color-primary)" }}
        >
          forum
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-primary)" }}
        >
          Usage Examples
        </span>
      </div>

      <div className="p-5 space-y-4">
        {content.examples.map((example, index) => (
          <div
            key={index}
            className="pb-4 border-b border-[var(--color-border)] last:border-b-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
              >
                <span className="text-xs font-bold">{index + 1}</span>
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
    </div>
  );
}
