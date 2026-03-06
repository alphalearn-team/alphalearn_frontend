"use client";

import { useState } from "react";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import type { LessonSummary } from "@/interfaces/interfaces";
import LessonCard from "@/components/lessons/lessonCard";
import SearchTrigger from "@/components/lessons/searchTrigger";
import Pagination from "@/components/concepts/pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

export default function LessonsGridSection({
  lessons,
  role,
}: {
  lessons: LessonSummary[];
  role?: string | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(lessons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLessons = lessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listSection = document.getElementById("lessons-list");
    if (listSection) {
      listSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Stack gap="lg">
      <LessonsHeader count={lessons.length} role={role} />

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
  );
}

function LessonsHeader({ count, role }: { count: number; role?: string | null }) {
  return (
    <Group justify="space-between" align="center">
      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] px-3">
        {count} {count === 1 ? "lesson" : "lessons"} available
      </span>

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
