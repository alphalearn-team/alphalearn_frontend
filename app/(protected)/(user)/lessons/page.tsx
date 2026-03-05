import { apiFetch } from "@/lib/api";
import type { LessonSummary } from "@/interfaces/interfaces";
import NotFound from "@/components/notFound";
import {
  Container,
  Text,
  Group,
  Stack,
  Title,
} from "@mantine/core";
import GradientButton from "@/components/common/gradientbutton";
import SpotlightSearch from "@/components/spotlightsearch";
import { getUserRole } from "@/lib/auth/rbac";
import LessonsGridSection from "@/components/lessons/lessonsGridSection";
import { normalizeLessonModerationStatus } from "@/lib/lessonModeration";

export default async function LessonsPage() {
  const [role, lessons] = await Promise.all([
    getUserRole(),
    fetchLessons(),
  ]);

  if (!lessons) return <NotFound />;

  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)]">
        <HeroSection role={role} />

        <Container id="lessons-list" size="lg" className="py-14 pb-32 scroll-mt-24">
          {lessons.length === 0 ? (
            <EmptyState />
          ) : (
            <LessonsGridSection lessons={lessons} role={role} />
          )}
        </Container>
      </div>

      <SpotlightSearch lessons={lessons} />
    </>
  );
}

async function fetchLessons(): Promise<LessonSummary[] | null> {
  try {
    const lessons = await apiFetch<LessonSummary[]>("/lessons");
    return lessons.filter(
      (lesson) => normalizeLessonModerationStatus(lesson.moderationStatus) === "APPROVED",
    );
  } catch {
    return null;
  }
}

function HeroSection({ role }: { role: string | null }) {
  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Big Brain Hub
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Level Up Your{" "}
              <span className="text-[var(--color-primary)]">Skills</span>
            </Title>

            <Text size="lg" className="max-w-xl font-light leading-relaxed">
              Farm XP with interactive lessons. Learn peak skills. Gain elite
              ball knowledge.
            </Text>
          </Stack>

          {role === "CONTRIBUTOR" || role === "LEARNER" ? (
            <Stack align="flex-end" gap="sm">
              <GradientButton href="#lessons-list">
                View All Lessons
              </GradientButton>
              <GradientButton href="/lessons/mine">
                View My Lessons
              </GradientButton>
            </Stack>
          ) : (
            <Group justify="flex-end">
              <GradientButton href="#lessons-list">
                View All Lessons
              </GradientButton>
            </Group>
          )}

        </Stack>
      </Container>
    </div>
  );
}

function EmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          menu_book
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No lessons yet
      </Title>

      <Text className="text-[var(--color-text-muted)] text-sm">
        No lessons available yet. Be the first to create one!
      </Text>
    </Stack>
  );
}
