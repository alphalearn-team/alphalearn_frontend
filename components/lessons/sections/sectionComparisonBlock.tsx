"use client";

import { Button, TextInput, Textarea } from "@mantine/core";
import type { ComparisonSectionContent } from "@/interfaces/interfaces";

interface SectionComparisonBlockProps {
  content: ComparisonSectionContent;
  isEditing?: boolean;
  onChange?: (content: ComparisonSectionContent) => void;
}

export function SectionComparisonBlock({
  content,
  isEditing = false,
  onChange,
}: SectionComparisonBlockProps) {
  const handleAddItem = () => {
    onChange?.({
      items: [...content.items, { label: "", description: "" }],
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange?.({
      items: content.items.filter((_, i) => i !== index),
    });
  };

  const handleUpdateItem = (
    index: number,
    field: "label" | "description",
    value: string
  ) => {
    const updatedItems = [...content.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange?.({ items: updatedItems });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Comparison Items
          </label>
          <Button
            size="xs"
            variant="light"
            leftSection={
              <span className="material-symbols-outlined text-sm">add</span>
            }
            onClick={handleAddItem}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-surface)",
              },
            }}
          >
            Add Item
          </Button>
        </div>

        {content.items.length === 0 && (
          <div
            className="text-center py-8 rounded-xl border-2 border-dashed"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">
              compare_arrows
            </span>
            <p className="text-sm">No comparison items yet. Click &quot;Add Item&quot; to start.</p>
          </div>
        )}

        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border space-y-3"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Item {index + 1}
                </span>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemoveItem(index)}
                  styles={{
                    root: {
                      color: "var(--color-error)",
                    },
                  }}
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                </Button>
              </div>

              <TextInput
                placeholder="Label (e.g., &quot;Skibidi&quot; or &quot;Traditional way&quot;)"
                value={item.label}
                onChange={(e) =>
                  handleUpdateItem(index, "label", e.currentTarget.value)
                }
                required
                styles={{
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  },
                }}
              />

              <Textarea
                placeholder="Description or definition..."
                value={item.description}
                onChange={(e) =>
                  handleUpdateItem(index, "description", e.currentTarget.value)
                }
                required
                minRows={2}
                autosize
                styles={{
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  },
                }}
              />
            </div>
          ))}
        </div>

        {content.items.length > 0 && content.items.length < 4 && (
          <Button
            variant="light"
            fullWidth
            leftSection={
              <span className="material-symbols-outlined text-sm">add</span>
            }
            onClick={handleAddItem}
            styles={{
              root: {
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              },
            }}
          >
            Add Another Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-xl"
          style={{ color: "var(--color-primary)" }}
        >
          compare_arrows
        </span>
        <h3
          className="text-sm font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Comparison
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {content.items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-surface)",
                }}
              >
                {index + 1}
              </div>
              <h4
                className="font-bold text-base"
                style={{ color: "var(--color-text)" }}
              >
                {item.label}
              </h4>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
