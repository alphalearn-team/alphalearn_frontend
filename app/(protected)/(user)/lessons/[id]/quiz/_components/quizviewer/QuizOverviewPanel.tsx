"use client";

import { Card, Center, Loader, Stack, Text, Group, Badge } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { formatDateTime } from "@/lib/utils/formatDate";
import type { LessonQuiz, QuizAttemptSummary } from "@/interfaces/interfaces";

interface QuizOverviewPanelProps {
  quiz: LessonQuiz;
  bestAttempt: QuizAttemptSummary | null;
  isLoadingBest: boolean;
  onStart: () => void;
  attemptHistory: QuizAttemptSummary[];
}

export default function QuizOverviewPanel({
  quiz,
  bestAttempt,
  isLoadingBest,
  onStart,
  attemptHistory,
}: QuizOverviewPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <Text size="sm" className="text-[var(--color-text-muted)] mt-1">
          {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'} • Created on {formatDateTime(quiz.createdAt)}
        </Text>
      </div>

      <Card padding="xl" className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md" style={{ borderRadius: "0.75rem" }}>
        {isLoadingBest ? (
          <Center p="xl"><Loader color="var(--color-primary)" /></Center>
        ) : bestAttempt ? (
          <Stack align="center">
            <div className="w-full rounded-lg bg-[var(--color-primary-light)] p-4 border border-[var(--color-primary)] opacity-90">
              <Text size="xs" fw={700} className="uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Best Attempt</Text>
              <Group justify="space-between">
                <Text fw={600} style={{ color: "var(--color-text)" }}>Score: {bestAttempt.score} / {bestAttempt.totalQuestions}</Text>
              </Group>
              <Text size="xs" className="text-[var(--color-text-muted)] mt-1">
                {new Date(bestAttempt.attemptedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </Text>
            </div>
            <CommonButton mt="md" size="md" onClick={onStart} className="w-fit">
              Retake Quiz
            </CommonButton>

            {attemptHistory.length > 0 && (
              <div className="w-full mt-2 space-y-2">
                <Text size="xs" fw={700} className="uppercase tracking-wider text-[var(--color-text-muted)]">
                  Attempt History · {attemptHistory.length}
                </Text>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {attemptHistory.map((attempt, i) => {
                    const isPerfect = attempt.score === attempt.totalQuestions;
                    return (
                      <div
                        key={attempt.attemptedAt}
                        className="flex items-center justify-between rounded-lg px-3 py-2 border border-[var(--color-border)]"
                        style={{ background: "var(--color-overlay)" }}
                      >
                        <Text size="sm" fw={500} style={{ color: "var(--color-text)" }}>
                          Attempt {attemptHistory.length - i}
                        </Text>
                        <Group gap="sm">
                          <Badge
                            size="sm"
                            variant="light"
                            color={isPerfect ? "green" : "gray"}
                          >
                            {attempt.score} / {attempt.totalQuestions}
                          </Badge>
                          <Text size="xs" className="text-[var(--color-text-muted)]">
                            {new Date(attempt.attemptedAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </Text>
                        </Group>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Stack>
        ) : (
          <Stack align="center" gap="md" py="lg">
            <Text size="lg" fw={500} className="text-[var(--color-text)]">Ready to begin?</Text>
            <CommonButton size="md" onClick={onStart}>
              Start Quiz
            </CommonButton>
          </Stack>
        )}
      </Card>
    </div>
  );
}
