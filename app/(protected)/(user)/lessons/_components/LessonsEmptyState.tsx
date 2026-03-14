import { Stack, Text, Title } from "@mantine/core";

export default function LessonsEmptyState({
  isConceptFiltered = false,
}: {
  isConceptFiltered?: boolean;
}) {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          menu_book
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        {isConceptFiltered ? "No lessons for this concept yet" : "No lessons yet"}
      </Title>

      <Text className="text-[var(--color-text-muted)] text-sm">
        {isConceptFiltered
          ? "There are no learner-visible lessons for this concept yet."
          : "No lessons available yet. Be the first to create one!"}
      </Text>
    </Stack>
  );
}
