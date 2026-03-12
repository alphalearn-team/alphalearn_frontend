"use client";

import { Card, Text } from "@mantine/core";
import { TextDisplayer } from "@/components/texteditor/TextDisplayer";
import { SectionBlock } from "@/components/lessons/sections";
import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/formatDate";
import ReviewActions from "../../_components/ReviewActions";

interface ReviewSummary {
  title: string;
  description: string;
  classes: string;
}

interface LessonReviewContentProps {
  automatedReasons: string[];
  lesson: AdminLessonReviewDetail;
  reviewSummary: ReviewSummary;
  submittedAt: string | null;
}

export default function LessonReviewContent({
  automatedReasons,
  lesson,
  reviewSummary,
  submittedAt,
}: LessonReviewContentProps) {
  return (
    <>
      <Card className="admin-card">
        <div className={`rounded-2xl border px-5 py-4 ${reviewSummary.classes}`}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <span className="material-symbols-outlined text-base">policy</span>
            {reviewSummary.title}
          </div>
          <p className="mt-3 text-sm leading-relaxed">{reviewSummary.description}</p>
        </div>
      </Card>

      {lesson.lessonModerationStatus === "PENDING" && (
        <Card className="admin-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Text size="sm" className="font-semibold text-[var(--color-text)]">
                Review decision
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                Approve the lesson for publication or reject it with an admin reason.
              </Text>
            </div>
            <ReviewActions lessonPublicId={lesson.lessonPublicId} lessonTitle={lesson.title} />
          </div>
        </Card>
      )}

      <Card className="admin-card">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              Lesson ID
            </Text>
            <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
              {lesson.lessonPublicId}
            </Text>
          </div>
          <div>
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              Contributor
            </Text>
            <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
              {lesson.author
                ? `${lesson.author.username || lesson.author.publicId} (${lesson.author.publicId})`
                : "Unknown"}
            </Text>
          </div>
          <div>
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              Submitted
            </Text>
            <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
              {submittedAt ? formatDateTime(submittedAt) : "Unknown"}
            </Text>
          </div>
          <div>
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              Concepts
            </Text>
            <Text size="sm" className="mt-1 break-words text-[var(--color-text-secondary)]">
              {lesson.conceptPublicIds?.length ? lesson.conceptPublicIds.join(", ") : "None"}
            </Text>
          </div>
        </div>
      </Card>

      {automatedReasons.length > 0 && (
        <Card className="admin-card">
          <div className="space-y-3">
            <div>
              <Text size="sm" className="font-semibold text-[var(--color-text)]">
                Automated Moderation Reasons
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                These reasons come from automated moderation and are separate from any manual
                rejection note.
              </Text>
            </div>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {automatedReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {lesson.adminRejectionReason && (
        <Card className="admin-card">
          <div className="space-y-3">
            <div>
              <Text size="sm" className="font-semibold text-[var(--color-text)]">
                Admin Rejection Reason
              </Text>
              <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                This note was provided by the admin reviewer and is intentionally separate from
                automated reasons.
              </Text>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {lesson.adminRejectionReason}
            </div>
          </div>
        </Card>
      )}

      {lesson.lessonModerationStatus === "REJECTED" && !lesson.adminRejectionReason && (
        <Card className="admin-card">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <Text size="sm" className="font-semibold text-red-100">
              Automatic rejection
            </Text>
            <Text size="sm" className="mt-1 text-red-100/80">
              No admin rejection reason is present for this lesson. Treat the automated moderation
              reasons as the rejection source.
            </Text>
          </div>
        </Card>
      )}

      {/* Lesson Content */}
      {lesson.sections && lesson.sections.length > 0 ? (
        <div className="space-y-4">
          {lesson.sections.map((section, index) => (
            <Card key={section.sectionPublicId || index} className="admin-card">
              <SectionBlock section={section} isEditing={false} showTitle={true} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="admin-card">
          {lesson.content ? (
            <TextDisplayer content={lesson.content} />
          ) : (
            <Text c="dimmed">No lesson content available.</Text>
          )}
        </Card>
      )}
    </>
  );
}
