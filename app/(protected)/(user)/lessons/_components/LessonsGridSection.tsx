"use client";

import { useState } from "react";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import type { LessonSummary } from "@/interfaces/interfaces";
import LessonCard from "@/components/lessons/LessonCard";
import SearchTrigger from "@/components/lessons/SearchTrigger";
import Pagination from "@/components/concepts/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

export default function LessonsGridSection({
  lessons,
  role,
  isConceptFiltered = false,
}: {
  lessons: LessonSummary[];
  role?: string | null;
  isConceptFiltered?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(lessons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLessons = lessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Stack gap="lg">
        <LessonsHeader
          count={lessons.length}
          role={role}
          isConceptFiltered={isConceptFiltered}
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {paginatedLessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonPublicId}
              {...lesson}
              showModerationBadge={false}
            />
          ))}
        </SimpleGrid>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={lessons.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemLabel="lessons"
          />
        )}
      </Stack>
    </div>
  );
}

function LessonsHeader({
  count,
  role,
  isConceptFiltered,
}: {
  count: number;
  role?: string | null;
  isConceptFiltered?: boolean;
}) {
  return (
    <Group justify="space-between" align="center" gap="md">
      <div className="flex flex-wrap items-center gap-3 px-3">
        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
          {count} {count === 1 ? "lesson" : "lessons"} available
        </span>

        {isConceptFiltered ? (
          <span className="inline-flex items-center rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Concept filter active
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {role === "CONTRIBUTOR" && (
          <Link
            href="/lessons/create"
            className="inline-flex h-[46px] items-center rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            Create Lesson
          </Link>
        )}
        <SearchTrigger />
      </div>
    </Group>
  );
}
