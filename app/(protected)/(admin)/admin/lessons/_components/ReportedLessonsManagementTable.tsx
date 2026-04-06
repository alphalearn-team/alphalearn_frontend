"use client";

import { Badge, Card, Text } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";
import type { AdminReportedLessonQueueItem } from "@/interfaces/interfaces";
import SpotlightWrapper, { type SpotlightSearchItem } from "@/components/SpotlightWrapper";
import AdminEmptyState from "@/app/(protected)/(admin)/admin/_components/EmptyState";
import LessonModerationBadge from "@/app/(protected)/(user)/lessons/_components/LessonModerationBadge";
import { RelativeTime } from "./RelativeTime";

interface ReportedLessonsManagementTableProps {
  lessons: AdminReportedLessonQueueItem[];
}

export default function ReportedLessonsManagementTable({
  lessons,
}: ReportedLessonsManagementTableProps) {
  const sortedLessons = useMemo(
    () =>
      [...lessons].sort((a, b) => {
        const aTime = new Date(a.latestReportedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.latestReportedAt ?? b.createdAt ?? 0).getTime();
        return bTime - aTime;
      }),
    [lessons],
  );

  const totalPendingReports = useMemo(
    () => sortedLessons.reduce((sum, lesson) => sum + lesson.pendingReportCount, 0),
    [sortedLessons],
  );

  const searchData: SpotlightSearchItem[] = useMemo(
    () =>
      sortedLessons.map((lesson) => ({
        id: lesson.lessonPublicId,
        title: lesson.title,
        description: `By ${lesson.author.username || lesson.author.publicId}`,
        href: `/admin/lessons/reported/${lesson.lessonPublicId}`,
        iconName: "flag",
      })),
    [sortedLessons],
  );

  return (
    <Card className="admin-card">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Reported Lessons ({sortedLessons.length})
            </h2>
            <Badge color="red" variant="light" radius="xl">
              {totalPendingReports} pending reports
            </Badge>
          </div>

          <Text size="sm" className="text-[var(--color-text-secondary)]">
            Review learner reports and decide whether to dismiss reports or unpublish the lesson.
          </Text>
        </div>

        <SpotlightWrapper data={searchData} placeholder="Search" nothingFound="No reported lessons found" />
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th className="p-3 text-left font-semibold text-[var(--color-text)]">Lesson</th>
              <th className="p-3 text-left font-semibold text-[var(--color-text)]">Contributor</th>
              <th className="p-3 text-left font-semibold text-[var(--color-text)]">Reports</th>
              <th className="p-3 text-left font-semibold text-[var(--color-text)]">Last Reported</th>
              <th className="p-3 text-left font-semibold text-[var(--color-text)]">Status</th>
              <th className="p-3 text-right font-semibold text-[var(--color-text)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLessons.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <AdminEmptyState
                    icon="generic"
                    title="No reported lessons found"
                    description="There are no pending lesson reports right now."
                  />
                </td>
              </tr>
            ) : (
              sortedLessons.map((lesson) => (
                <tr
                  key={lesson.lessonPublicId}
                  className="border-b border-[var(--color-border)] bg-red-500/5 hover:bg-red-500/10"
                >
                  <td className="p-3">
                    <Link
                      href={`/admin/lessons/reported/${lesson.lessonPublicId}`}
                      className="transition-colors hover:text-[var(--color-primary)]"
                    >
                      <div className="flex flex-col gap-1">
                        <Text fw={500} className="text-[var(--color-text)]">
                          {lesson.title}
                        </Text>
                        {lesson.latestReportReason && (
                          <Text size="xs" className="line-clamp-1 text-[var(--color-text-secondary)]">
                            Latest reason: {lesson.latestReportReason}
                          </Text>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="p-3">
                    <Text size="sm" className="text-[var(--color-text-secondary)]">
                      {lesson.author.username || lesson.author.publicId}
                    </Text>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge color="red" variant="light">
                        {lesson.pendingReportCount} pending
                      </Badge>
                      <Text size="xs" className="text-[var(--color-text-muted)]">
                        {lesson.totalReportCount} total
                      </Text>
                    </div>
                  </td>
                  <td className="p-3">
                    {lesson.latestReportedAt ? (
                      <RelativeTime
                        date={lesson.latestReportedAt}
                        className="text-sm text-[var(--color-text-secondary)]"
                      />
                    ) : (
                      <Text size="sm" className="text-[var(--color-text-muted)]">
                        Unknown
                      </Text>
                    )}
                  </td>
                  <td className="p-3">
                    <LessonModerationBadge status={lesson.lessonModerationStatus} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/lessons/reported/${lesson.lessonPublicId}`}
                        className="inline-flex h-10 items-center rounded-md border border-red-500/30 bg-red-500/10 px-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        Review Reports
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
