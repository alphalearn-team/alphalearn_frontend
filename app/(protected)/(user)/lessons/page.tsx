import { Suspense } from "react";
import { Container } from "@mantine/core";
import NotFound from "@/components/NotFound";
import { getUserRole } from "@/lib/auth/server/rbac";
import LessonsGrid from "./_components/LessonsGrid";
import LessonsHeroSection from "./_components/LessonsHeroSection";
import LessonsSkeleton from "./_components/LessonsSkeleton";
import { apiFetch } from "@/lib/api/api";
import type { LessonSummary } from "@/interfaces/interfaces";

async function LessonsListRenderer({ role }: { role: string | null }) {
  const lessons = await apiFetch<LessonSummary[]>("/lessons").catch(() => null);

  if (!lessons) return <NotFound />;

  return (
    <>
      <LessonsGrid lessons={lessons} role={role} />
    </>
  );
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
