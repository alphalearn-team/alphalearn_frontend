"use client";

import { Alert, Card, Group, Stack, Text, Badge, SimpleGrid } from "@mantine/core";
import GlowButton from "@/components/GlowButton";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/utils/formatDate";

interface QuizListProps {
  lessonId: string;
  quizzes: LessonQuiz[];
  quizLoadError: string | null;
  isOwner: boolean;
  bestAttempts: Record<string, { summary: QuizAttemptSummary | null; error: string | null }>;
}

export default function QuizList({
  lessonId,
  quizzes,
  quizLoadError,
  isOwner,
  bestAttempts,
}: QuizListProps) {
  
  if (quizLoadError) {
    return (
      <Alert color="red" radius="md" title="Error loading quizzes">
        {quizLoadError}
      </Alert>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Alert color="blue" radius="md" title="No quizzes available">
        There are currently no quizzes associated with this lesson.
      </Alert>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {quizzes.map((quiz, idx) => {
        const best = bestAttempts[quiz.quizPublicId];
        const hasAttempted = !!best?.summary;
        const totalQuestions = quiz.questions?.length || 0;

        return (
          <Card
            key={quiz.quizPublicId}
            padding="xl"
            className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative"
            style={{ borderRadius: "1.25rem" }}
          >
            {hasAttempted && (
              <div className="absolute top-4 right-4 z-10">
                <Badge color="green" radius="sm">Attempted</Badge>
              </div>
            )}
            
            {isOwner && (
              <div className="absolute top-4 right-4 z-10">
                <Badge color="blue" radius="sm">Owner</Badge>
              </div>
            )}

            <Stack gap="lg">
              <div>
                 <Text size="lg" fw={700} style={{ color: "var(--color-text)" }}>
                   Quiz {idx + 1}
                 </Text>
                 <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
                   {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
                 </Text>
              </div>

              {/* Error displaying attempts if any */}
              {best?.error && !best?.summary && !isOwner && (
                  <Alert color="yellow" title="Could not load attempt data">{best.error}</Alert>
              )}

              <Group justify="flex-end" mt="md">
                {isOwner ? (
                  <Text size="xs" fw={600} className="text-[var(--color-text-muted)] italic">
                    Owners cannot attempt their own quizzes
                  </Text>
                ) : (
                  <GlowButton
                    href={`/quiz/${lessonId}/${quiz.quizPublicId}`}
                  >
                    View Quiz
                  </GlowButton>
                )}
              </Group>
            </Stack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
