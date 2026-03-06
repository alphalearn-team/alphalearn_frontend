"use client";

import { useMemo } from "react";
import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";

interface ReviewSummary {
  title: string;
  description: string;
  classes: string;
}

function normalizeLesson(lesson: AdminLessonReviewDetail): AdminLessonReviewDetail {
  return {
    ...lesson,
    automatedModerationReasons: Array.isArray(lesson.automatedModerationReasons)
      ? lesson.automatedModerationReasons
      : [],
    adminRejectionReason: lesson.adminRejectionReason ?? null,
  };
}

function getReviewSummary(lesson: AdminLessonReviewDetail): ReviewSummary {
  const automatedReasonCount = lesson.automatedModerationReasons.filter(Boolean).length;

  if (lesson.lessonModerationStatus === "REJECTED" && lesson.adminRejectionReason) {
    return {
      title: "Manually rejected",
      description:
        "This lesson was rejected during admin review. Automated reasons and the admin rejection reason are shown separately below.",
      classes: "border-red-500/30 bg-red-500/10 text-red-100",
    };
  }

  if (lesson.lessonModerationStatus === "REJECTED") {
    return {
      title: "Automatically rejected",
      description:
        "This lesson was rejected by automated moderation. No manual rejection reason was recorded.",
      classes: "border-red-500/30 bg-red-500/10 text-red-100",
    };
  }

  if (lesson.lessonModerationStatus === "PENDING" && automatedReasonCount > 0) {
    return {
      title: "Flagged for manual review",
      description:
        "Automated moderation found issues that need an admin decision before this lesson can be published.",
      classes: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    };
  }

  if (lesson.lessonModerationStatus === "APPROVED") {
    return {
      title: "Approved",
      description: "This lesson has already passed moderation review.",
      classes: "border-green-500/30 bg-green-500/10 text-green-100",
    };
  }

  return {
    title:
      lesson.lessonModerationStatus === "PENDING"
        ? "Pending manual review"
        : "Moderation status recorded",
    description:
      lesson.lessonModerationStatus === "PENDING"
        ? "This lesson is waiting for an admin moderation decision."
        : "Review the moderation metadata below for the latest backend state.",
    classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
  };
}

export function useAdminLessonReview(lessonInput: AdminLessonReviewDetail) {
  const lesson = useMemo(() => normalizeLesson(lessonInput), [lessonInput]);

  const automatedReasons = useMemo(
    () => lesson.automatedModerationReasons.filter(Boolean),
    [lesson.automatedModerationReasons],
  );

  const reviewSummary = useMemo(() => getReviewSummary(lesson), [lesson]);

  const submittedAt = lesson.submittedAt ?? lesson.createdAt ?? null;

  return {
    automatedReasons,
    lesson,
    reviewSummary,
    submittedAt,
  };
}
