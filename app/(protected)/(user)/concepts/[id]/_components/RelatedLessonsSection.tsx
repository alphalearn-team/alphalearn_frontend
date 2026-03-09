import type { LessonSummary } from "@/interfaces/interfaces";
import { SimpleGrid, Text, Title } from "@mantine/core";
import LessonCard from "@/components/lessons/LessonCard";

export default function RelatedLessonsSection({
  lessons,
}: {
  lessons: LessonSummary[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Title order={3} mb="xs">
          Related Lessons
        </Title>
        <Text c="dimmed" size="sm">
          Lessons connected to this concept.
        </Text>
      </div>

      {lessons.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--color-border)] p-6"
          style={{ background: "var(--color-surface)" }}
        >
          <Text c="dimmed">No related lessons found yet.</Text>
        </div>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonPublicId}
              {...lesson}
              showModerationBadge={false}
            />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
