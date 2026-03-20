import { Container } from "@mantine/core";
import NotFound from "@/components/NotFound";
import { getUserRole } from "@/lib/auth/rbac";
import LessonsEmptyState from "./_components/LessonsEmptyState";
import LessonsGridSection from "./_components/LessonsGridSection";
import LessonsHeroSection from "./_components/LessonsHeroSection";
import SpotlightSearch from "./_components/SpotlightSearch";
import { fetchLessons } from "./_components/fetchLessons";

export default async function LessonsPage() {
  const [role, lessons] = await Promise.all([getUserRole(), fetchLessons()]);

  if (!lessons) {
    return <NotFound />;
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)]">
        <LessonsHeroSection role={role} />

        <Container id="lessons-list" size="lg" className="py-14 pb-32 scroll-mt-24">
          {lessons.length === 0 ? (
            <LessonsEmptyState />
          ) : (
            <LessonsGridSection lessons={lessons} role={role} />
          )}
        </Container>
      </div>

      <SpotlightSearch lessons={lessons} />
    </>
  );
}
