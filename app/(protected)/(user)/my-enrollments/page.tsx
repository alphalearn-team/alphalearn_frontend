import { Container, SimpleGrid, Title, Text, Card, Group } from "@mantine/core";
import { getMyProgress } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";
import Link from "next/link";
import LessonProgressCard from "./_components/LessonProgressCard";

export default async function MyEnrollmentsPage() {
  const lessons = await getMyProgress();

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-12 mb-8">
        <Container size="lg">
          <Title order={1} className="text-3xl font-bold mb-2">
            My Learning Progress
          </Title>
          <Text className="text-[var(--color-text-secondary)]">
            Track your quiz progress across all enrolled lessons.
          </Text>
        </Container>
      </div>

      <Container size="lg">
        {lessons.length === 0 ? (
          <Card padding="xl" radius="md" withBorder className="text-center py-16 bg-[var(--color-surface)]">
            <Text size="lg" fw={500} mb="xs">
              No enrollments yet
            </Text>
            <Text size="sm" color="dimmed" mb="xl">
              Explore our lesson catalog and enroll in a topic that interests you!
            </Text>
            <Group justify="center">
              <Link
                href="/lessons"
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Browse Lessons
              </Link>
            </Group>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {lessons.map((lesson) => (
              <LessonProgressCard key={lesson.lessonPublicId} lesson={lesson} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
