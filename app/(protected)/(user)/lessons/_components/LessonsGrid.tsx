"use client";

import { useState } from "react";
import { Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { LessonProgress, LessonSummary } from "@/interfaces/interfaces";
import LessonCard from "@/app/(protected)/(user)/lessons/_components/LessonCard";
import SpotlightWrapper, { type SpotlightSearchItem } from "@/components/SpotlightWrapper";
import Pagination from "@/components/pagination/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

export default function LessonsGrid({
  lessons,
  role,
  progressMap = {},
}: {
  lessons: LessonSummary[];
  role?: string | null;
  progressMap?: Record<string, LessonProgress>;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  if (lessons.length === 0) {
    return <LessonsEmptyState />;
  }

  const totalPages = Math.ceil(lessons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLessons = lessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const searchData: SpotlightSearchItem[] = lessons.map(lesson => ({
      id: lesson.lessonPublicId,
      title: lesson.title,
      description: `By ${lesson.author?.username?.split("-")[0] || "Anonymous"}`,
      href: `/lessons/${lesson.lessonPublicId}`,
      iconName: "auto_stories"
  }));

  return (
    <div>
      <Stack gap="lg">
        <LessonsHeader count={lessons.length} role={role} searchData={searchData} />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {paginatedLessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonPublicId}
              {...lesson}
              showModerationBadge={false}
              progress={progressMap[lesson.lessonPublicId]}
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

function LessonsHeader({ count, role, searchData }: { count: number; role?: string | null; searchData: SpotlightSearchItem[] }) {
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
        <SpotlightWrapper data={searchData} placeholder="Search lessons..." nothingFound="No lessons found..." />
      </div>
    </Group>
  );
}

function LessonsEmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          menu_book
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No lessons yet
      </Title>

      <Text className="text-[var(--color-text-muted)] text-sm">
        No lessons available yet. Be the first to create one!
      </Text>
    </Stack>
  );
}
