import { Container, SimpleGrid, Title, Text, Card, Group, Badge } from "@mantine/core";
import { getMyEnrollments } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";
import Link from "next/link";

export default async function MyEnrollmentsPage() {
  const enrollments = await getMyEnrollments();

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-12 mb-8">
        <Container size="lg">
          <Title order={1} className="text-3xl font-bold mb-2">My Enrolled Lessons</Title>
          <Text className="text-[var(--color-text-secondary)]">
            Pick up where you left off in your learning journey.
          </Text>
        </Container>
      </div>

      <Container size="lg">
        {enrollments.length === 0 ? (
          <Card padding="xl" radius="md" withBorder className="text-center py-16 bg-[var(--color-surface)]">
            <Text size="lg" fw={500} mb="xs">No enrollments yet</Text>
            <Text size="sm" color="dimmed" mb="xl">
              Explore our lesson catalog and enroll in a topic that interests you!
            </Text>
            <Group justify="center">
              <Link href="/lessons" className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-light)] transition-colors">
                Browse Lessons
              </Link>
            </Group>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {enrollments.map((enrollment) => (
              <Link 
                key={enrollment.lessonPublicId} 
                href={`/lessons/${enrollment.lessonPublicId}`}
                className="no-underline"
              >
                <Card 
                  withBorder 
                  padding="lg" 
                  radius="md" 
                  className="h-full hover:border-[var(--color-primary)] transition-colors bg-[var(--color-surface)]"
                >
                  <Group justify="space-between" mb="xs">
                    <Title order={3} size="h4" className="line-clamp-2 text-[var(--color-text)]">
                      {enrollment.title}
                    </Title>
                  </Group>
                  <Group justify="space-between" mt="auto">
                    {enrollment.completed ? (
                      <Badge color="green" variant="light">Completed</Badge>
                    ) : (
                      <Badge color="blue" variant="light">In Progress</Badge>
                    )}
                  </Group>
                </Card>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </div>
  );
}
