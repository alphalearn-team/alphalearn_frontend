import { LessonModerationStatus } from "@/interfaces/interfaces";

export type LessonModerationMeta = {
  status: LessonModerationStatus;
  label: string;
  badgeColor: "gray" | "yellow" | "green" | "red";
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
};

const moderationMeta: Record<LessonModerationStatus, LessonModerationMeta> = {
  UNPUBLISHED: {
    status: "UNPUBLISHED",
    label: "Draft",
    badgeColor: "gray",
    icon: "draft",
    color: "#cbd5e1",
    bg: "rgba(148, 163, 184, 0.10)",
    border: "rgba(148, 163, 184, 0.28)",
    description: "This lesson is still a draft and is not visible to learners.",
  },
  PENDING: {
    status: "PENDING",
    label: "Pending Review",
    badgeColor: "yellow",
    icon: "schedule",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.10)",
    border: "rgba(245, 158, 11, 0.30)",
    description: "This lesson is pending manual review before it can be published.",
  },
  APPROVED: {
    status: "APPROVED",
    label: "Approved",
    badgeColor: "green",
    icon: "check_circle",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.10)",
    border: "rgba(16, 185, 129, 0.30)",
    description: "This lesson is approved and visible to learners.",
  },
  REJECTED: {
    status: "REJECTED",
    label: "Rejected",
    badgeColor: "red",
    icon: "cancel",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.10)",
    border: "rgba(239, 68, 68, 0.30)",
    description: "This lesson was rejected. Review the moderation feedback, update the content, and submit again.",
  },
};

export function normalizeLessonModerationStatus(
  status?: string | null,
): LessonModerationStatus {
  const normalizedStatus = status?.toUpperCase();

  switch (normalizedStatus) {
    case "PENDING":
    case "APPROVED":
    case "REJECTED":
    case "UNPUBLISHED":
      return normalizedStatus;
    default:
      return "UNPUBLISHED";
  }
}

export function getLessonModerationMeta(
  status?: string | null,
): LessonModerationMeta {
  return moderationMeta[normalizeLessonModerationStatus(status)];
}

export function formatLessonModerationEventType(
  eventType?: string | null,
): string | null {
  if (!eventType) {
    return null;
  }

  return eventType
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
