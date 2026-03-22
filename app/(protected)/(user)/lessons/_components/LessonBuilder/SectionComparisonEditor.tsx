"use client";

import { Button, TextInput, Textarea } from "@mantine/core";
import type { ComparisonSectionContent } from "@/interfaces/interfaces";
import { createSectionFieldStyles, EditableItemCard } from "./SectionBlockPrimitives";

interface SectionComparisonEditorProps {
  content: ComparisonSectionContent;
  onChange?: (content: ComparisonSectionContent) => void;
}

export default function SectionComparisonEditor({
  content,
  onChange,
}: SectionComparisonEditorProps) {
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
    value: string,
  ) => {
    const updatedItems = [...content.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange?.({ items: updatedItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Comparison Items
        </label>
        <Button
          size="xs"
          variant="light"
          leftSection={<span className="material-symbols-outlined text-sm">add</span>}
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
          <p className="text-sm">
            No comparison items yet. Click &quot;Add Item&quot; to start.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {content.items.map((item, index) => (
          <EditableItemCard
            key={index}
            title={`Item ${index + 1}`}
            removeLabel="Remove item"
            onRemove={() => handleRemoveItem(index)}
          >
            <TextInput
              placeholder="Label (e.g., &quot;Skibidi&quot; or &quot;Traditional way&quot;)"
              value={item.label}
              onChange={(event) =>
                handleUpdateItem(index, "label", event.currentTarget.value)
              }
              required
              styles={createSectionFieldStyles()}
            />

            <Textarea
              placeholder="Description or definition..."
              value={item.description}
              onChange={(event) =>
                handleUpdateItem(index, "description", event.currentTarget.value)
              }
              required
              minRows={2}
              autosize
              styles={createSectionFieldStyles()}
            />
          </EditableItemCard>
        ))}
      </div>

      {content.items.length > 0 && content.items.length < 4 && (
        <Button
          variant="light"
          fullWidth
          leftSection={<span className="material-symbols-outlined text-sm">add</span>}
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
