"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge, Button, Card, Text, Title } from "@mantine/core";
import type { AdminLessonReviewDetail, AdminReportedLessonDetail, LessonQuiz } from "@/interfaces/interfaces";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";
import { formatDateTime } from "@/lib/utils/formatDate";
import { SectionBlock } from "@/app/(protected)/(user)/lessons/_components/LessonBuilder";
import { TextDisplayer } from "@/components/texteditor/TextDisplayer";
import ReportedLessonFloatingReportsWindow from "./ReportedLessonFloatingReportsWindow";

interface ReportedLessonDetailViewProps {
  lesson: AdminReportedLessonDetail;
  lessonPreview: AdminLessonReviewDetail | null;
  quizzes: LessonQuiz[];
}

export default function ReportedLessonDetailView({
  lesson,
  lessonPreview,
  quizzes,
}: ReportedLessonDetailViewProps) {
  const normalizedReports = useMemo(
    () => (Array.isArray(lesson.reports) ? lesson.reports : []),
    [lesson.reports],
  );

  const displayTitle = lessonPreview?.title || lesson.title;
  const displayAuthor = lessonPreview?.author ?? lesson.author;
  const displaySections = lessonPreview?.sections ?? lesson.sections;
  const displayContent = lessonPreview?.content ?? lesson.content;
  const displayConcepts = lessonPreview?.conceptPublicIds ?? lesson.conceptPublicIds;

  return (
    <div className="space-y-6">
      <ReportedLessonFloatingReportsWindow
        pendingCount={lesson.pendingReportCount}
        reports={normalizedReports}
      />

      <div className="space-y-6">
        <Card className="admin-card">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Title order={1}>{displayTitle}</Title>
                <LessonModerationBadge status={lesson.lessonModerationStatus} />
                <Badge color="red" variant="light">
                  {lesson.pendingReportCount} pending
                </Badge>
              </div>
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Read-only preview of lesson details and quizzes for moderation review.
              </Text>
            </div>
            <Link href="/admin/lessons?tab=reported">
              <Button variant="light">Back to Reported Queue</Button>
            </Link>
          </div>
        </Card>
        <Card className="admin-card">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Lesson ID
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                {lesson.lessonPublicId}
              </Text>
            </div>
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Contributor
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                {displayAuthor
                  ? `${displayAuthor.username || displayAuthor.publicId} (${displayAuthor.publicId})`
                  : "Unknown"}
              </Text>
            </div>
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Concepts
              </Text>
              <Text size="sm" className="mt-1 break-words text-[var(--color-text-secondary)]">
                {displayConcepts?.length ? displayConcepts.join(", ") : "None"}
              </Text>
            </div>
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Quizzes
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                {quizzes.length}
              </Text>
            </div>
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Created
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                {lesson.createdAt ? formatDateTime(lesson.createdAt) : "Unknown"}
              </Text>
            </div>
            <div>
              <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Last Resolution
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                {lesson.resolutionAction
                  ? `${lesson.resolutionAction}${lesson.resolvedAt ? ` at ${formatDateTime(lesson.resolvedAt)}` : ""}`
                  : "Unresolved"}
              </Text>
            </div>
          </div>
        </Card>

        <Card className="admin-card">
          <div className="space-y-3">
            <Text size="sm" className="font-semibold text-[var(--color-text)]">
              Lesson Quizzes ({quizzes.length})
            </Text>
            {quizzes.length === 0 ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                No quizzes found for this lesson.
              </Text>
            ) : (
              <ul className="space-y-2">
                {quizzes.map((quiz, index) => (
                  <li
                    key={quiz.quizPublicId}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Quiz {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {displaySections && displaySections.length > 0 ? (
          <div className="space-y-4">
            {displaySections.map((section, index) => (
              <Card key={section.sectionPublicId || index} className="admin-card">
                <SectionBlock section={section} isEditing={false} showTitle={true} />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="admin-card">
            {displayContent ? (
              <TextDisplayer content={displayContent} />
            ) : (
              <Text c="dimmed">No lesson content available.</Text>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
