"use client";

import { Card, Title } from "@mantine/core";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { formatShortDate } from "@/lib/utils/formatDate";
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Your Progress
            </span>
            {lesson.completed && (
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
                  color: "var(--color-success)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check_circle</span>
                Completed{lesson.firstCompletedAt ? ` · ${formatShortDate(lesson.firstCompletedAt)}` : ""}
              </span>
            )}
          </div>
          <ProgressBar
            value={lesson.passedQuizzes}
            max={lesson.totalQuizzes}
            completed={lesson.completed}
          />
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {lesson.totalQuizzes === 0
              ? "No quizzes in this lesson yet"
              : lesson.completed
              ? `All ${lesson.totalQuizzes} ${lesson.totalQuizzes === 1 ? "quiz" : "quizzes"} passed`
              : `${lesson.passedQuizzes} of ${lesson.totalQuizzes} ${lesson.totalQuizzes === 1 ? "quiz" : "quizzes"} passed`}
          </p>
        </div>
      </Card>
    </Link>
  );
}
