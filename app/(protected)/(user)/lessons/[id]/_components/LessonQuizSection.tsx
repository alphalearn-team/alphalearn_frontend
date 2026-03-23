"use client";

import { Alert, Button, Card, Group, Text } from "@mantine/core";
import Link from "next/link";
import type { LessonQuiz } from "@/interfaces/interfaces";

interface LessonQuizSectionProps {
  lessonId: string;
  quizLoadError: string | null;
  quizzes: LessonQuiz[];
}

export default function LessonQuizSection({
  lessonId,
  quizLoadError,
  quizzes,
}: LessonQuizSectionProps) {
  if (quizzes.length === 0 && !quizLoadError) {
    return null;
  }

  const quizSectionTitle = quizzes.length === 1 ? "Lesson Quiz" : "Lesson Quizzes";
  const quizCountText = `Testing your knowledge? Try the quizzes here (${quizzes.length} available)`

  return (
    <div className="space-y-4">
      <h2
        className="text-xl font-bold tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        {quizSectionTitle}
      </h2>

      {quizLoadError ? (
        <Alert color="yellow" radius="lg" title="Quiz unavailable">
          {quizLoadError}
        </Alert>
      ) : (
        <Card
          padding="xl"
          className="border border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ borderRadius: "0.75rem" }}
        >
          <Group justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
            <div>
              <Text size="sm" className="text-[var(--color-text)]">
                {quizCountText}
              </Text>
            </div>
            <Button
              component={Link}
              href={`/quiz/${lessonId}`}
              radius="xl"
              className="w-full sm:w-auto"
            >
              View Quizzes
            </Button>
          </Group>
        </Card>
      )}
    </div>
  );
}
