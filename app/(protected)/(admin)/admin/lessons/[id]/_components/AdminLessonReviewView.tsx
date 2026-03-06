"use client";

import { Container, Stack } from "@mantine/core";
import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";
import LessonReviewContent from "./LessonReviewContent";
import LessonReviewHeader from "./LessonReviewHeader";
import { useAdminLessonReview } from "../_hooks/useAdminLessonReview";

interface AdminLessonReviewViewProps {
  lesson: AdminLessonReviewDetail;
}

export default function AdminLessonReviewView({ lesson }: AdminLessonReviewViewProps) {
  const {
    automatedReasons,
    lesson: normalizedLesson,
    reviewSummary,
    submittedAt,
  } = useAdminLessonReview(lesson);

  return (
    <Container size="lg" px={0}>
      <Stack gap="lg">
        <LessonReviewHeader
          title={normalizedLesson.title}
          moderationStatus={normalizedLesson.lessonModerationStatus}
        />
        <LessonReviewContent
          lesson={normalizedLesson}
          automatedReasons={automatedReasons}
          reviewSummary={reviewSummary}
          submittedAt={submittedAt}
        />
      </Stack>
    </Container>
  );
}
