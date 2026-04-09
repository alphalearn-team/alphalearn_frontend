import { SimpleGrid, Stack, Text, Title } from "@mantine/core";

const PERKS = [
  {
    icon: "menu_book",
    title: "Create Lessons",
    description:
      "Design and publish your own lessons to help learners master new concepts at their own pace.",
  },
  {
    icon: "quiz",
    title: "Create Quizzes",
    description:
      "Build interactive quizzes that test understanding and make learning more engaging.",
  },
  {
    icon: "groups",
    title: "Grow the Community",
    description:
      "Share your knowledge, earn recognition, and shape the AlphaLearn learning experience for everyone.",
  },
];

export default function ContributorPerksSection() {
  return (
    <Stack gap="lg">
      <div className="space-y-2">
        <Title order={2} className="text-[var(--color-text-primary)]">
          Why become a Contributor?
        </Title>
        <Text className="text-[var(--color-text-secondary)] max-w-2xl">
          Contributors unlock powerful tools to create content and give back to the community.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {PERKS.map((perk) => (
          <div
            key={perk.title}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 space-y-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)]/10">
              <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">{perk.icon}</span>
            </div>
            <div className="space-y-1">
              <Text fw={600} className="text-[var(--color-text-primary)]">
                {perk.title}
              </Text>
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                {perk.description}
              </Text>
            </div>
          </div>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
