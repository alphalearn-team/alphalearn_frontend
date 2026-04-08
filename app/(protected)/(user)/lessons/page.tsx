import { Suspense } from "react";
import { Container } from "@mantine/core";
import NotFound from "@/components/NotFound";
import { getUserRole } from "@/lib/auth/server/rbac";
import LessonsGrid from "./_components/LessonsGrid";
import LessonsHeroSection from "./_components/LessonsHeroSection";
import LessonsSkeleton from "./_components/LessonsSkeleton";
import { apiFetch } from "@/lib/api/api";
import type { LessonProgress, LessonSummary } from "@/interfaces/interfaces";

async function LessonsListRenderer({ role }: { role: string | null }) {
  const [lessons, progressList] = await Promise.all([
    apiFetch<LessonSummary[]>("/lessons").catch(() => null),
    apiFetch<LessonProgress[]>("/me/lesson-enrollments?view=PROGRESS").catch(() => [] as LessonProgress[]),
  ]);

  if (!lessons) return <NotFound />;

  const progressMap = Object.fromEntries(
    progressList.map((p) => [p.lessonPublicId, p])
  );

  return <LessonsGrid lessons={lessons} role={role} progressMap={progressMap} />;
}

export default async function LessonsPage() {
  const role = await getUserRole();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <LessonsHeroSection/>

      <Container id="lessons-list" size="lg" className="py-14 pb-32 scroll-mt-24">
        <Suspense fallback={<LessonsSkeleton />}>
          <LessonsListRenderer role={role} />
        </Suspense>
      </Container>
    </div>
  );
}
