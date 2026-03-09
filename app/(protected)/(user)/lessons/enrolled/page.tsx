import { apiFetch } from "@/lib/api";
import type { Lesson, LessonSummary, LessonModerationStatus } from "@/interfaces/interfaces";
import { Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import LessonCard from "@/components/lessons/lessonCard";
import { getUserRole } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

interface LessonEnrollment {
  enrollmentId: number;
  lessonPublicId: string;
  completed?: boolean;
  firstCompletedAt?: string | null;
}

function toLessonSummary(lesson: Lesson): LessonSummary {
  return {
    lessonPublicId: lesson.lessonPublicId,
    title: lesson.title,
    author: lesson.author,
    createdAt: lesson.createdAt,
    moderationStatus:
      (lesson.moderationStatus as LessonModerationStatus | undefined) ??
      ((lesson as Lesson & { lessonModerationStatus?: LessonModerationStatus }).lessonModerationStatus ??
        "UNPUBLISHED"),
    concepts: lesson.concepts,
    conceptPublicIds: lesson.conceptPublicIds,
    isEnrolled: true,
  };
}

async function fetchEnrolledLessons(): Promise<LessonSummary[]> {
  // 1) get enrollments for current user (no learnerPublicId needed)
  const enrollments = await apiFetch<LessonEnrollment[]>(
    "/lessonenrollments/me/enrollments",
  );

  const lessonIds = Array.from(
    new Set(
      enrollments
        .map((e) => e.lessonPublicId)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  // 2) fetch lesson details by lessonPublicId
  const lessonResults = await Promise.allSettled(
    lessonIds.map((lessonPublicId) => apiFetch<Lesson>(`/lessons/${lessonPublicId}/content`)),
  );

  return lessonResults
    .filter((r): r is PromiseFulfilledResult<Lesson> => r.status === "fulfilled")
    .map((r) => toLessonSummary(r.value));
}

export default async function EnrolledLessonsPage() {
  const role = await getUserRole();
  if (role === "ADMIN") redirect("/admin/lessons");

  const lessons = await fetchEnrolledLessons();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="pt-8 pb-8 bg-[var(--color-background)]">
        <Container size="lg">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4} align="flex-start">
                <Title order={1} className="text-4xl font-black tracking-tight text-[var(--color-text)]">
                  Enrolled <span className="text-[var(--color-primary)]">Lessons</span>
                </Title>
                <Text className="text-[var(--color-text-secondary)]">Lessons you enrolled in.</Text>
              </Stack>
            </Group>
          </Stack>
        </Container>
      </div>

      <Container size="lg" py="xl" className="pb-32">
        {lessons.length === 0 ? (
          <Stack align="center" py={100} gap="md">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-overlay)]">
              <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">school</span>
            </div>
            <Title order={3} className="text-[var(--color-text-muted)]">No enrolled lessons yet</Title>
            <Text className="text-[var(--color-text-muted)]">Enroll in a lesson to see it here.</Text>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.lessonPublicId} {...lesson} showModerationBadge={false} showEnrollButton={false} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
