import { Container, SimpleGrid, Title, Text, Card, Group } from "@mantine/core";
import { getMyProgress } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";
import Link from "next/link";
import LessonProgressCard from "./_components/LessonProgressCard";
import CommonButton from "@/components/CommonButton";

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
              <Link href="/lessons">
                <CommonButton>Browse Lessons</CommonButton>
              </Link>
            </Group>
          </Card>
        ) : (
          (() => {
            const inProgress = lessons.filter((l) => !l.completed);
            const completed = lessons.filter((l) => l.completed);
            return (
              <div className="space-y-12">
                {inProgress.length > 0 && (
                  <section>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-6">
                      In Progress · {inProgress.length}
                    </p>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                      {inProgress.map((lesson) => (
                        <LessonProgressCard key={lesson.lessonPublicId} lesson={lesson} />
                      ))}
                    </SimpleGrid>
                  </section>
                )}
                {completed.length > 0 && (
                  <section>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-6">
                      Completed · {completed.length}
                    </p>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                      {completed.map((lesson) => (
                        <LessonProgressCard key={lesson.lessonPublicId} lesson={lesson} />
                      ))}
                    </SimpleGrid>
                  </section>
                )}
              </div>
            );
          })()
        )}
      </Container>
    </div>
  );
}
