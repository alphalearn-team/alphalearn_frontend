"use client";

import { Badge } from "@mantine/core";
import { getLessonModerationMeta } from "@/lib/lessonModeration";

interface LessonModerationBadgeProps {
  status?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "light" | "filled" | "outline" | "dot";
}

export default function LessonModerationBadge({
  status,
  size = "sm",
  variant = "light",
}: LessonModerationBadgeProps) {
  const meta = getLessonModerationMeta(status);

  return (
    <Badge color={meta.badgeColor} size={size} variant={variant} radius="xl">
      {meta.label}
    </Badge>
  );
}
