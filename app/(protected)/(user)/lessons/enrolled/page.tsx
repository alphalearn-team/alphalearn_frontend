import { apiFetch } from "@/lib/api";
import type { Lesson, LessonSummary, LessonModerationStatus } from "@/interfaces/interfaces";
import {
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import LessonCard from "@/components/lessons/lessonCard";
import { getUserRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface LessonEnrollment {
  enrollmentId: number;
  learnerPublicId: string;
  lessonPublicId: string;
  moderationStatus?: string;
  completed?: boolean;
  firstCompletedAt?: string | null;
}

function extractLearnerPublicIds(
  user: {
    id?: string;
    user_metadata?: Record<string, unknown>;
  } | null,
): string[] {
  const metadata = user?.user_metadata ?? {};
  const candidates = [metadata.learnerPublicId, metadata.publicId, user?.id];

  return Array.from(
    new Set(
      candidates.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      ),
    ),
  );
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
  };
}

async function fetchEnrolledLessons(): Promise<LessonSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const learnerPublicIds = extractLearnerPublicIds(user);

  if (learnerPublicIds.length === 0) {
    return [];
  }

  for (const learnerPublicId of learnerPublicIds) {
    try {
      const enrollments = await apiFetch<LessonEnrollment[]>(
        `/lessonenrollments/${learnerPublicId}/enrollments`,
      );

      const lessonIds = Array.from(
        new Set(
          enrollments
            .map((item) => item.lessonPublicId)
            .filter((id): id is string => typeof id === "string" && id.length > 0),
        ),
      );

      const lessonResults = await Promise.allSettled(
        lessonIds.map((lessonId) => apiFetch<Lesson>(`/lessons/${lessonId}/content`)),
      );

      return lessonResults
        .filter((result): result is PromiseFulfilledResult<Lesson> => result.status === "fulfilled")
        .map((result) => toLessonSummary(result.value));
    } catch {
      // Try the next candidate learner id.
    }
  }

  return [];
}

export default async function EnrolledLessonsPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/lessons");
  }

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
                <Text className="text-[var(--color-text-secondary)]">
                  Lessons you enrolled in.
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Container>
      </div>

      <Container size="lg" py="xl" className="pb-32">
        {lessons.length === 0 ? (
          <Stack align="center" py={100} gap="md">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-overlay)]">
              <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">
                school
              </span>
            </div>
            <Title order={3} className="text-[var(--color-text-muted)]">No enrolled lessons yet</Title>
            <Text className="text-[var(--color-text-muted)]">
              Enroll in a lesson to see it here.
            </Text>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonPublicId}
                {...lesson}
                showModerationBadge={false}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
