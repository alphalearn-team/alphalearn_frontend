"use client";

import { useState } from "react";
import { SimpleGrid, Stack, Group, Title, Text } from "@mantine/core";
import type { Concept } from "@/interfaces/interfaces";
import ConceptCard from "./ConceptCard";
import Pagination from "@/components/pagination/Pagination";
import SearchTrigger from "@/app/(protected)/(user)/lessons/_components/SearchTrigger";
import ConceptSpotlightSearch from "./ConceptSpotlightSearch";

interface ConceptsGridProps {
  concepts: Concept[];
}

const ITEMS_PER_PAGE = 6;

export default function ConceptsGrid({ concepts }: ConceptsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (concepts.length === 0) {
    return <EmptyState />;
  }

  const totalPages = Math.ceil(concepts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConcepts = concepts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Stack gap="lg">
        <ConceptsHeader count={concepts.length} />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {paginatedConcepts.map((concept) => (
            <ConceptCard key={concept.publicId} {...concept} />
          ))}
        </SimpleGrid>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={concepts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        )}
      </Stack>
      <ConceptSpotlightSearch concepts={concepts} />
    </>
  );
}

function ConceptsHeader({ count }: { count: number }) {
  return (
    <Group justify="space-between" align="center">
      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] px-3">
        {count} {count === 1 ? "concept" : "concepts"} available
      </span>

      <SearchTrigger />
    </Group>
  );
}

function EmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          lightbulb
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No concepts yet
      </Title>

      <Text className="text-[var(--color-text-muted)] text-sm">
        No concepts available yet. Check back soon!
      </Text>
    </Stack>
  );
}
