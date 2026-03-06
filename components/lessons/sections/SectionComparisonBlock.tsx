"use client";

import { Button, TextInput, Textarea } from "@mantine/core";
import type { ComparisonSectionContent } from "@/interfaces/interfaces";
import {
  createSectionFieldStyles,
  EditableItemCard,
  SectionDisplayCard,
  SectionDisplayHeader,
  SectionNumberBadge,
} from "./SectionBlockPrimitives";

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
            <EditableItemCard
              key={index}
              title={`Item ${index + 1}`}
              removeLabel="Remove item"
              onRemove={() => handleRemoveItem(index)}
            >
              <TextInput
                placeholder="Label (e.g., &quot;Skibidi&quot; or &quot;Traditional way&quot;)"
                value={item.label}
                onChange={(e) =>
                  handleUpdateItem(index, "label", e.currentTarget.value)
                }
                required
                styles={createSectionFieldStyles()}
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
                styles={createSectionFieldStyles()}
              />
            </EditableItemCard>
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
    <SectionDisplayCard className="p-5">
      <SectionDisplayHeader
        icon="compare_arrows"
        title="Comparison"
        className="mb-4"
        iconClassName="text-xl"
        iconStyle={{ color: "var(--color-primary)" }}
        titleClassName="text-sm font-bold uppercase tracking-[0.2em]"
        titleStyle={{ color: "var(--color-text-muted)" }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {content.items.map((item, index) => (
          <SectionDisplayCard key={index} className="p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SectionNumberBadge number={index + 1} />
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
          </SectionDisplayCard>
        ))}
      </div>
    </SectionDisplayCard>
  );
}
