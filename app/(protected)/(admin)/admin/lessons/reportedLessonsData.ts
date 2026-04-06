import type {
  AdminLessonReportEntry,
  AdminReportedLessonDetail,
  AdminReportedLessonQueueItem,
  LessonModerationStatus,
  PublicAuthor,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toNumberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeModerationStatus(value: unknown): LessonModerationStatus {
  if (value === "PENDING" || value === "APPROVED" || value === "REJECTED" || value === "UNPUBLISHED") {
    return value;
  }

  return "APPROVED";
}

function normalizeAuthor(value: unknown): PublicAuthor {
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const publicId = toStringOrNull(source.publicId ?? source.userPublicId ?? source.authorPublicId);
    const username = toStringOrNull(source.username ?? source.authorUsername);

    if (publicId) {
      return {
        publicId,
        username: username ?? publicId,
      };
    }
  }

  return {
    publicId: "unknown",
    username: "unknown",
  };
}

function normalizeReportEntry(report: unknown, index: number): AdminLessonReportEntry {
  if (!report || typeof report !== "object") {
    return {
      publicId: `unknown-${index}`,
      reason: "No reason provided",
      createdAt: null,
      reporterPublicId: null,
      reporterUsername: null,
      status: null,
    };
  }

  const source = report as Record<string, unknown>;
  return {
    publicId: toStringOrNull(source.publicId ?? source.reportPublicId) ?? `unknown-${index}`,
    reason: toStringOrNull(source.reason) ?? "No reason provided",
    createdAt: toStringOrNull(source.createdAt ?? source.reportedAt),
    reporterPublicId: toStringOrNull(source.reporterPublicId),
    reporterUsername: toStringOrNull(source.reporterUsername),
    status: toStringOrNull(source.status),
  };
}

export async function fetchReportedAdminLessons(): Promise<AdminReportedLessonQueueItem[]> {
  const response = await apiFetch<unknown[]>("/admin/lesson-reports/lessons");
  const list = Array.isArray(response) ? response : [];

  return list.map((item) => {
    const source = (item ?? {}) as Record<string, unknown>;
    return {
      lessonPublicId: toStringOrNull(source.lessonPublicId) ?? "unknown-lesson",
      title: toStringOrNull(source.title) ?? "Untitled lesson",
      author: normalizeAuthor(source.author),
      lessonModerationStatus: normalizeModerationStatus(
        source.lessonModerationStatus ?? source.moderationStatus,
      ),
      pendingReportCount: toNumberOrZero(source.pendingReportCount),
      totalReportCount: toNumberOrZero(source.totalReportCount ?? source.reportCount),
      latestReportReason: toStringOrNull(source.latestReportReason),
      latestReportedAt: toStringOrNull(source.latestReportedAt ?? source.lastReportedAt),
      createdAt: toStringOrNull(source.createdAt ?? source.submittedAt),
    };
  });
}

export async function fetchAdminReportedLessonDetail(
  lessonPublicId: string,
): Promise<AdminReportedLessonDetail | null> {
  try {
    const response = await apiFetch<unknown>(`/admin/lesson-reports/lessons/${lessonPublicId}`);
    const source = (response ?? {}) as Record<string, unknown>;
    const lessonSource =
      source.lesson && typeof source.lesson === "object"
        ? (source.lesson as Record<string, unknown>)
        : source;
    const pendingReportsSource = Array.isArray(source.pendingReports)
      ? source.pendingReports
      : (Array.isArray(source.reports) ? source.reports : []);
    const pendingReportCount = toNumberOrZero(source.pendingReportCount);
    const resolvedPendingReportCount =
      pendingReportCount > 0 ? pendingReportCount : pendingReportsSource.length;
    const totalReportCount = toNumberOrZero(source.totalReportCount ?? source.reportCount);
    const resolvedTotalReportCount =
      totalReportCount > 0 ? totalReportCount : resolvedPendingReportCount;

    return {
      lessonPublicId: toStringOrNull(lessonSource.lessonPublicId) ?? lessonPublicId,
      title: toStringOrNull(lessonSource.title) ?? "Untitled lesson",
      content: lessonSource.content ?? null,
      sections: Array.isArray(lessonSource.sections)
        ? (lessonSource.sections as AdminReportedLessonDetail["sections"])
        : [],
      conceptPublicIds: Array.isArray(lessonSource.conceptPublicIds)
        ? (lessonSource.conceptPublicIds as string[])
        : [],
      author: lessonSource.author ? normalizeAuthor(lessonSource.author) : null,
      lessonModerationStatus: normalizeModerationStatus(
        lessonSource.lessonModerationStatus ?? lessonSource.moderationStatus,
      ),
      createdAt: toStringOrNull(lessonSource.createdAt ?? source.createdAt),
      submittedAt: toStringOrNull(lessonSource.submittedAt ?? source.submittedAt),
      pendingReportCount: resolvedPendingReportCount,
      totalReportCount: resolvedTotalReportCount,
      resolutionAction:
        source.resolutionAction === "DISMISSED" || source.resolutionAction === "UNPUBLISHED"
          ? source.resolutionAction
          : null,
      resolvedAt: toStringOrNull(source.resolvedAt),
      reports: pendingReportsSource.map((report, index) => {
        if (report && typeof report === "object") {
          const pendingReport = report as Record<string, unknown>;
          return normalizeReportEntry(
            {
              publicId: pendingReport.reportId ?? pendingReport.publicId,
              reason: pendingReport.reason,
              createdAt: pendingReport.reportedAt ?? pendingReport.createdAt,
              reporterPublicId: pendingReport.reporterPublicId,
              reporterUsername: pendingReport.reporterUsername,
              status: pendingReport.status,
            },
            index,
          );
        }

        return normalizeReportEntry(report, index);
      }),
    };
  } catch {
    return null;
  }
}
