import { Container, SimpleGrid } from "@mantine/core";
import NotFound from "@/components/NotFound";
import LessonCard from "@/app/(protected)/(user)/lessons/_components/LessonCard";
import { getUserRole } from "@/lib/auth/server/rbac";
import MyLessonsEmptyState from "./_components/MyLessonsEmptyState";
import MyLessonsHeader from "./_components/MyLessonsHeader";
import ContributorStatsRow from "./_components/MyLessonsStats";
import { fetchMyLessons } from "./_components/myLessonsData";

export default async function MyLessonsPage() {
  const role = await getUserRole();
  const canCreateLessons = role === "CONTRIBUTOR";
  const lessons = await fetchMyLessons();

  if (!lessons) {
    return <NotFound />;
  }

  const totalEnrolled = lessons.reduce((sum, l) => sum + (l.enrollmentCount ?? 0), 0);
  const totalCompleted = lessons.reduce((sum, l) => sum + (l.completionCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MyLessonsHeader canCreateLessons={canCreateLessons} />

      <Container size="lg" py="xl" className="pb-32">
        {lessons.length === 0 ? (
          <MyLessonsEmptyState canCreateLessons={canCreateLessons} />
        ) : (
          <div className="flex flex-col gap-10">
            <ContributorStatsRow
              totalLessons={lessons.length}
              totalEnrolled={totalEnrolled}
              totalCompleted={totalCompleted}
            />

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.lessonPublicId}
                  {...lesson}
                  enrollmentCount={lesson.enrollmentCount ?? 0}
                />
              ))}
            </SimpleGrid>
          </div>
        )}
      </Container>
    </div>
  );
}
