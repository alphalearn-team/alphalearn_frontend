import Link from "next/link";
import { Stack, Text, Title } from "@mantine/core";
import CommonButton from "@/components/CommonButton";

export default function MyLessonsEmptyState({
  canCreateLessons,
}: {
  canCreateLessons: boolean;
}) {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-overlay)]">
        <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">
          auto_stories
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No lessons yet
      </Title>

      {canCreateLessons ? (
        <>
          <Text className="text-[var(--color-text-muted)]">
            Start your journey by creating your first lesson!
          </Text>
          <Link href="/lessons/create">
            <CommonButton>Create First Lesson</CommonButton>
          </Link>
        </>
      ) : (
        <>
          <Text className="text-[var(--color-text-muted)] text-center max-w-sm">
            Only contributors can create lessons. Apply for contributor access to start building and sharing your own lessons.
          </Text>
          <Link href="/contributor-application">
            <CommonButton>Become a Contributor</CommonButton>
          </Link>
        </>
      )}
    </Stack>
  );
}
