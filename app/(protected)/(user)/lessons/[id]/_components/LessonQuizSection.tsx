"use client";

import { Card, Group, Text, Button } from "@mantine/core";
import GlowButton from "@/components/GlowButton";

interface LessonQuizSectionProps {
  lessonId: string;
  isEnrolled: boolean;
  isOwner: boolean;
}

export default function LessonQuizSection({
  lessonId,
  isEnrolled,
  isOwner,
}: LessonQuizSectionProps) {
  if (!isEnrolled && !isOwner) {
    return null;
  }

  const quizSectionTitle = "Lesson Quizzes";
  const quizCountText = "Testing your knowledge? Check out the quizzes for this lesson!";

  return (
    <div className="space-y-4">
      <h2
        className="text-xl font-bold tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        {quizSectionTitle}
      </h2>

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
            <GlowButton
              href={`/lessons/${lessonId}/quiz`}
              className="w-full sm:w-auto"
            >
              View Quizzes
            </GlowButton>
        </Group>
      </Card>
    </div>
  );
}
