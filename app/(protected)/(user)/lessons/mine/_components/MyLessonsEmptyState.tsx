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

      <Text className="text-[var(--color-text-muted)]">
        {canCreateLessons
          ? "Start your journey by creating your first lesson!"
          : "You have not authored any lessons yet."}
      </Text>

      {canCreateLessons && (
        <Link href="/lessons/create">
          <CommonButton>Create First Lesson</CommonButton>
        </Link>
      )}
    </Stack>
  );
}
