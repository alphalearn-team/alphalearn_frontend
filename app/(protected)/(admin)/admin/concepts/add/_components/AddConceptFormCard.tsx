import type { FormEvent } from "react";
import { Button, Card, Text, Textarea, TextInput } from "@mantine/core";

interface AddConceptFormCardProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function AddConceptFormCard({
  isSubmitting,
  onCancel,
  onSubmit,
}: AddConceptFormCardProps) {
  return (
    <Card className="admin-card">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <TextInput
            name="title"
            label="Concept Title"
            placeholder="e.g., No Cap"
            required
            maxLength={100}
            classNames={{
              description: "text-[var(--color-text-secondary)] text-sm mt-1",
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
              label: "text-[var(--color-text)] font-semibold mb-2",
            }}
          />
        </div>

        <div>
          <Textarea
            name="description"
            label="Description"
            placeholder="Explain what this concept means and how it's used..."
            required
            maxLength={500}
            rows={6}
            classNames={{
              input:
                "bg-[var(--color-input)] border-[var(--color-border)] focus:border-[var(--color-border-focus)] text-[var(--color-text)]",
              label: "text-[var(--color-text)] font-semibold mb-2",
            }}
            styles={{
              input: {
                minHeight: "150px",
              },
            }}
          />

          <div className="text-right mt-1">
            <Text size="sm" c="dimmed">
              (max 500 characters)
            </Text>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-[var(--color-text)]"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={isSubmitting}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
            leftSection={
              <span className="material-symbols-outlined text-sm">add_circle</span>
            }
          >
            Add Concept
          </Button>
        </div>
      </form>
    </Card>
  );
}
