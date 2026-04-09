import { Card, Group, Stack, Text, SimpleGrid } from "@mantine/core";
import GlowButton from "@/components/GlowButton";
import type { LessonQuiz } from "@/interfaces/interfaces";

interface LessonQuizManageSectionProps {
  lessonId: string;
  quizzes: LessonQuiz[];
}

export default function LessonQuizManageSection({ lessonId, quizzes }: LessonQuizManageSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
        Quizzes
      </h2>

      {quizzes.length === 0 ? (
        <Card
          padding="xl"
          className="border border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ borderRadius: "0.75rem" }}
        >
          <Stack align="center" gap="sm" py="md">
            <span className="material-symbols-outlined text-4xl" style={{ color: "var(--color-text-muted)" }}>
              quiz
            </span>
            <Text fw={600} style={{ color: "var(--color-text)" }}>No quizzes yet</Text>
            <Text size="sm" ta="center" style={{ color: "var(--color-text-muted)" }}>
              Add at least one quiz before submitting this lesson for review.
            </Text>
            <GlowButton href={`/quiz?lessonId=${lessonId}`} size="sm" icon="add">
              Create Quiz
            </GlowButton>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {quizzes.map((quiz, idx) => (
            <Card
              key={quiz.quizPublicId}
              padding="lg"
              className="border border-[var(--color-border)] bg-[var(--color-surface)]"
              style={{ borderRadius: "0.75rem" }}
            >
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={700} style={{ color: "var(--color-text)" }}>Quiz {idx + 1}</Text>
                  <Text size="xs" style={{ color: "var(--color-text-muted)" }}>
                    {quiz.questions?.length ?? 0} {quiz.questions?.length === 1 ? "question" : "questions"}
                  </Text>
                </div>
                <GlowButton
                  href={`/quiz?quizId=${quiz.quizPublicId}&lessonId=${lessonId}`}
                  size="sm"
                  icon="edit"
                >
                  Edit
                </GlowButton>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
