import { apiFetch } from "@/lib/api";
import type { LessonSummary } from "@/interfaces/interfaces";
import NotFound from "@/components/notFound";
import {
  SimpleGrid,
  Container,
  Text,
  Button,
  Group,
  Stack,
  Title,
} from "@mantine/core";
import Link from "next/link";
import LessonCard from "@/components/lessons/lessonCard";
import GradientButton from "@/components/common/gradientbutton";
import { getUserRole } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

export default async function MyLessonsPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/lessons");
  }
  const canCreateLessons = role === "CONTRIBUTOR";

  let lessons: LessonSummary[] = [];
  try {
    lessons = await apiFetch<LessonSummary[]>("/lessons/mine");
  } catch (err) {
    console.error(err);
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header Section */}
      <div className="pt-8 pb-8 bg-[var(--color-background)]">
        <Container size="lg">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4} align="flex-start">
                <Title order={1} className="text-4xl font-black tracking-tight text-[var(--color-text)]">
                  My <span className="text-[var(--color-primary)]">Lessons</span>
                </Title>
                <Text className="text-[var(--color-text-secondary)]">
                  Manage and track the lessons you&apos;ve created.
                </Text>
              </Stack>
              {canCreateLessons && (
                <GradientButton href="/lessons/create" icon="add" className="mt-1">
                  Create Lesson
                </GradientButton>
              )}
            </Group>
          </Stack>
        </Container>
      </div>

      <Container size="lg" py="xl" className="pb-32">
        {lessons.length === 0 ? (
          <Stack align="center" py={100} gap="md">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-overlay)]">
              <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">
                auto_stories
              </span>
            </div>
            <Title order={3} className="text-[var(--color-text-muted)]">No lessons yet</Title>
              <Text className="text-[var(--color-text-muted)]">
                {canCreateLessons
                  ? "Start your journey by creating your first lesson!"
                  : "You haven&apos;t authored any lessons yet."}
              </Text>
            {canCreateLessons && (
              <Link href="/lessons/create">
                <Button variant="outline" radius="xl">Create First Lesson</Button>
              </Link>
            )}
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.lessonPublicId} {...lesson} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
