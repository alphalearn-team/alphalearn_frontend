"use client";

import { Badge, Card, Text } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import SearchBar from "@/components/concepts/SearchBar";
import AdminEmptyState from "@/components/admin/EmptyState";
import LessonModerationBadge from "@/components/lessons/LessonModerationBadge";
import { RelativeTime, getUrgencyLevel } from "./RelativeTime";
import type { AdminLessonQueueItem } from "@/interfaces/interfaces";

interface LessonsManagementTableProps {
  lessons: AdminLessonQueueItem[];
}

const urgencyConfig = {
  normal: { color: "gray", label: "" },
  warning: { color: "yellow", label: "24h+" },
  urgent: { color: "orange", label: "3d+" },
  critical: { color: "red", label: "7d+" },
};

export default function LessonsManagementTable({
  lessons,
}: LessonsManagementTableProps) {
  const router = useRouter();
  const getAutomatedReasons = (lesson: AdminLessonQueueItem) =>
    Array.isArray(lesson.automatedModerationReasons)
      ? lesson.automatedModerationReasons
      : [];

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [lessons],
  );

  const flaggedCount = useMemo(
    () => sortedLessons.filter((lesson) => getAutomatedReasons(lesson).length > 0).length,
    [sortedLessons],
  );

  const agingCount = useMemo(
    () =>
      sortedLessons.filter((lesson) => getUrgencyLevel(new Date(lesson.createdAt)) !== "normal").length,
    [sortedLessons],
  );

  const spotlightActions = useMemo(
    () =>
      sortedLessons.map((lesson) => ({
        id: lesson.lessonPublicId,
        label: lesson.title,
        description: `By ${lesson.author.username || lesson.author.publicId}`,
        onClick: () => {
          router.push(`/admin/lessons/${lesson.lessonPublicId}`);
        },
      })),
    [router, sortedLessons],
  );

  return (
    <>
      <Spotlight
        actions={spotlightActions}
        limit={7}
        nothingFound="No pending lessons found"
        highlightQuery
        searchProps={{
          placeholder: "Search pending lessons...",
        }}
        shortcut={["mod + K", "ctrl + k"]}
      />

      <Card className="admin-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Manual Review Queue ({sortedLessons.length})
              </h2>
              <Badge color="yellow" variant="light" radius="xl">
                Pending
              </Badge>
              {flaggedCount > 0 && (
                <Badge color="red" variant="light" radius="xl">
                  {flaggedCount} flagged
                </Badge>
              )}
              {agingCount > 0 && (
                <Badge color="orange" variant="light" radius="xl">
                  {agingCount} aging
                </Badge>
              )}
            </div>

            <Text size="sm" className="text-[var(--color-text-secondary)]">
              Lessons with automated moderation reasons are flagged and should be reviewed first.
            </Text>
          </div>

          <SearchBar onSearchClick={() => spotlight.open()} />
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold text-[var(--color-text)]">Lesson</th>
                <th className="p-3 text-left font-semibold text-[var(--color-text)]">Contributor</th>
                <th className="p-3 text-left font-semibold text-[var(--color-text)]">Submitted</th>
                <th className="p-3 text-left font-semibold text-[var(--color-text)]">Status</th>
                <th className="p-3 text-right font-semibold text-[var(--color-text)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <AdminEmptyState
                      icon="generic"
                      title="No pending lessons found"
                      description="The manual review queue is empty."
                    />
                  </td>
                </tr>
              ) : (
                sortedLessons.map((lesson) => {
                  const automatedReasons = getAutomatedReasons(lesson);
                  const isFlagged = automatedReasons.length > 0;
                  const urgency = getUrgencyLevel(new Date(lesson.createdAt));
                  const isUrgent = urgency !== "normal";

                  return (
                    <tr
                      key={lesson.lessonPublicId}
                      className={`border-b border-[var(--color-border)] hover:bg-[var(--color-background-hover)] ${
                        isFlagged ? "bg-red-500/5" : isUrgent ? "bg-orange-500/5" : ""
                      }`}
                    >
                      <td className="p-3">
                        <Link
                          href={`/admin/lessons/${lesson.lessonPublicId}`}
                          className="transition-colors hover:text-[var(--color-primary)]"
                        >
                          <div className="flex items-center gap-2">
                            <Text fw={500} className="text-[var(--color-text)]">
                              {lesson.title}
                            </Text>
                            {isFlagged && (
                              <Badge color="red" variant="light" size="xs">
                                Flagged
                              </Badge>
                            )}
                            {isUrgent && (
                              <Badge
                                size="xs"
                                color={urgencyConfig[urgency].color}
                                variant="light"
                              >
                                {urgencyConfig[urgency].label}
                              </Badge>
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
                        <RelativeTime
                          date={lesson.createdAt}
                          className={`text-sm ${
                            isUrgent
                              ? urgency === "critical"
                                ? "font-medium text-red-500"
                                : urgency === "urgent"
                                  ? "font-medium text-orange-500"
                                  : "text-yellow-600"
                              : "text-[var(--color-text-secondary)]"
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <LessonModerationBadge status={lesson.lessonModerationStatus} />
                          {isFlagged && (
                            <Text size="xs" className="text-red-400">
                              {automatedReasons.length} automated reason
                              {automatedReasons.length === 1 ? "" : "s"}
                            </Text>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/lessons/${lesson.lessonPublicId}`}
                            className="inline-flex h-10 items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-3 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500/20"
                            title="Review lesson"
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
