"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Pagination from "@/components/pagination/Pagination";
import type { PublicLearner } from "@/interfaces/interfaces";
import LearnerCard from "./LearnerCard";

interface LearnersGridProps {
  learners: PublicLearner[];
}

const ITEMS_PER_PAGE = 6;

export default function LearnersGrid({ learners }: LearnersGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (learners.length === 0) {
    return <LearnersEmptyState />;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLearners = normalizedQuery
    ? learners.filter((learner) => learner.username.toLowerCase().includes(normalizedQuery))
    : learners;

  const totalPages = Math.ceil(filteredLearners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLearners = filteredLearners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Stack gap="lg">
      <LearnersHeader
        filteredCount={filteredLearners.length}
        searchQuery={searchQuery}
        totalCount={learners.length}
        onSearchChange={setSearchQuery}
      />

      {filteredLearners.length === 0 ? (
        <LearnersNoResultsState
          query={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {paginatedLearners.map((learner) => (
              <LearnerCard key={learner.publicId} {...learner} />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLearners.length}
              itemsPerPage={ITEMS_PER_PAGE}
              itemLabel="learners"
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </Stack>
  );
}

function LearnersHeader({
  filteredCount,
  searchQuery,
  totalCount,
  onSearchChange,
}: {
  filteredCount: number;
  searchQuery: string;
  totalCount: number;
  onSearchChange: (value: string) => void;
}) {
  const hasQuery = searchQuery.trim().length > 0;
  const countLabel = hasQuery
    ? `${filteredCount} of ${totalCount} ${totalCount === 1 ? "learner" : "learners"}`
    : `${totalCount} ${totalCount === 1 ? "learner" : "learners"} available`;

  return (
    <Group justify="space-between" align="center" className="gap-4">
      <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {countLabel}
      </span>

      <div className="w-full max-w-sm">
        <TextInput
          aria-label="Search learners by username"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search learners..."
          leftSection={
            <span className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)]">
              search
            </span>
          }
          styles={{
            input: {
              minHeight: "46px",
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
      </div>
    </Group>
  );
}

function LearnersEmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          groups
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No learners yet
      </Title>

      <Text className="text-sm text-[var(--color-text-muted)]">
        No learner profiles are available to browse right now.
      </Text>
    </Stack>
  );
}

function LearnersNoResultsState({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          person_search
        </span>
      </div>

      <Title order={3} className="text-center text-[var(--color-text-muted)]">
        No learners match your search
      </Title>

      <Text className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
        No usernames matched &quot;{query.trim()}&quot;. Try a different search or clear the filter.
      </Text>

      <Button
        variant="outline"
        radius="xl"
        onClick={onClearSearch}
        styles={{
          root: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          },
        }}
      >
        Clear Search
      </Button>
    </Stack>
  );
}
