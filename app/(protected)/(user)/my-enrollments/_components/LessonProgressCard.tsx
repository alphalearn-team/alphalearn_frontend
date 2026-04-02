"use client";

import { Badge, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import type { LessonProgressSummary } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";

interface LessonProgressCardProps {
  lesson: LessonProgressSummary;
}

export default function LessonProgressCard({ lesson }: LessonProgressCardProps) {
  const progressPercent =
    lesson.totalQuizzes > 0
      ? Math.round((lesson.passedQuizzes / lesson.totalQuizzes) * 100)
      : 0;

  const completedDate = lesson.firstCompletedAt
    ? new Date(lesson.firstCompletedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/lessons/${lesson.lessonPublicId}`} className="no-underline">
      <Card
        withBorder
        padding="lg"
        radius="md"
        className="h-full hover:border-[var(--color-primary)] transition-colors bg-[var(--color-surface)]"
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Title order={3} size="h4" className="line-clamp-2 text-[var(--color-text)] flex-1">
              {lesson.title}
            </Title>
            {lesson.completed ? (
              <Badge color="green" variant="light" style={{ flexShrink: 0 }}>
                Completed
              </Badge>
            ) : (
              <Badge color="blue" variant="light" style={{ flexShrink: 0 }}>
                In Progress
              </Badge>
            )}
          </Group>

          {lesson.totalQuizzes > 0 ? (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" className="text-[var(--color-text-secondary)]">
                  Quizzes passed
                </Text>
                <Text size="xs" fw={600} className="text-[var(--color-text)]">
                  {lesson.passedQuizzes} / {lesson.totalQuizzes}
                </Text>
              </Group>
              <Progress
                value={progressPercent}
                color={lesson.completed ? "green" : "blue"}
                size="sm"
                radius="xl"
              />
            </Stack>
          ) : (
            <Text size="xs" className="text-[var(--color-text-secondary)]">
              No quizzes in this lesson
            </Text>
          )}

          {completedDate && (
            <Text size="xs" className="text-[var(--color-text-secondary)]">
              Completed on {completedDate}
            </Text>
          )}
        </Stack>
      </Card>
    </Link>
  );
}
