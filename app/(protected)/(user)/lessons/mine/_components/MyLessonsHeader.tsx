import { Container, Group, Stack, Text, Title } from "@mantine/core";
import GlowButton from "@/components/GlowButton";

export default function MyLessonsHeader({
  canCreateLessons,
}: {
  canCreateLessons: boolean;
}) {
  return (
    <div className="pt-8 pb-8 bg-[var(--color-background)]">
      <Container size="lg">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} align="flex-start">
              <Title
                order={1}
                className="text-4xl font-black tracking-tight text-[var(--color-text)]"
              >
                My <span className="text-[var(--color-primary)]">Lessons</span>
              </Title>
              <Text className="text-[var(--color-text-secondary)]">
                {canCreateLessons
                  ? "Manage and track the lessons you've created."
                  : "Become a contributor to start creating and sharing lessons."}
              </Text>
            </Stack>

            {canCreateLessons && (
              <GlowButton href="/lessons/create" icon="add" className="mt-1">
                Create Lesson
              </GlowButton>
            )}
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
