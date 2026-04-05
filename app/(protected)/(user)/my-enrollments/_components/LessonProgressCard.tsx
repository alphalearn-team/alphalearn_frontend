"use client";

import { Card, Title } from "@mantine/core";
import Link from "next/link";
import LessonProgressBar from "@/components/LessonProgressBar";
import type { LessonProgressSummary } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";

interface LessonProgressCardProps {
  lesson: LessonProgressSummary;
}

export default function LessonProgressCard({ lesson }: LessonProgressCardProps) {
  return (
    <Link href={`/lessons/${lesson.lessonPublicId}`} className="no-underline">
      <Card
        withBorder
        padding="lg"
        radius="md"
        className="h-full hover:border-[var(--color-primary)] transition-colors bg-[var(--color-surface)]"
      >
        <Title order={3} size="h4" className="line-clamp-2 text-[var(--color-text)] mb-4">
          {lesson.title}
        </Title>

        <LessonProgressBar
          passedQuizzes={lesson.passedQuizzes}
          totalQuizzes={lesson.totalQuizzes}
          completed={lesson.completed}
          firstCompletedAt={lesson.firstCompletedAt}
        />
      </Card>
    </Link>
  );
}
