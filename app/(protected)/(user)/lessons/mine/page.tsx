import { Container, SimpleGrid } from "@mantine/core";
import { redirect } from "next/navigation";
import NotFound from "@/components/NotFound";
import LessonCard from "@/components/lessons/LessonCard";
import { getUserRole } from "@/lib/auth/rbac";
import MyLessonsEmptyState from "./_components/MyLessonsEmptyState";
import MyLessonsHeader from "./_components/MyLessonsHeader";
import { fetchMyLessons } from "./myLessonsData";

export default async function MyLessonsPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/lessons");
  }

  const canCreateLessons = role === "CONTRIBUTOR";
  const lessons = await fetchMyLessons();

  if (!lessons) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MyLessonsHeader canCreateLessons={canCreateLessons} />

      <Container size="lg" py="xl" className="pb-32">
        {lessons.length === 0 ? (
          <MyLessonsEmptyState canCreateLessons={canCreateLessons} />
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
