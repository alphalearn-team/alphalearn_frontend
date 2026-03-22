"use client";

import Link from "next/link";
import { Button, Text, Title } from "@mantine/core";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";
import type { LessonModerationStatus } from "@/interfaces/interfaces";

interface LessonReviewHeaderProps {
  moderationStatus: LessonModerationStatus;
  title: string;
}

export default function LessonReviewHeader({
  moderationStatus,
  title,
}: LessonReviewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Title order={1}>{title}</Title>
          <LessonModerationBadge status={moderationStatus} />
        </div>
        <Text size="sm" className="text-[var(--color-text-secondary)]">
          Review lesson content, automated moderation reasons, and any recorded admin rejection
          reason.
        </Text>
      </div>
      <Link href="/admin/lessons">
        <Button variant="light">Back to Queue</Button>
      </Link>
    </div>
  );
}
