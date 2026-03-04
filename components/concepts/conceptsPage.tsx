"use client";

import { useAuth } from "@/context/AuthContext";
import type { Concept } from "@/interfaces/interfaces";
import { useState } from "react";
import {
  SimpleGrid,
  Container,
  Text,
  Group,
  Stack,
  Title,
} from "@mantine/core";
import ConceptCard from "./conceptCard";
import Pagination from "./pagination";
import ConceptSpotlightSearch from "./conceptSpotlightSearch";
import SearchTrigger from "@/components/lessons/searchTrigger";
import GradientButton from "@/components/common/gradientbutton";

interface ConceptsPageProps {
  concepts: Concept[];
}

const ITEMS_PER_PAGE = 6;

export default function ConceptsPage({ concepts }: ConceptsPageProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(concepts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConcepts = concepts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listSection = document.getElementById("concepts-list");
    if (listSection) {
      listSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)]">
        <HeroSection />

        <Container id="concepts-list" size="lg" className="py-14 pb-32 scroll-mt-24">
          {concepts.length === 0 ? (
            <EmptyState />
          ) : (
            <ConceptsGrid
              concepts={paginatedConcepts}
              totalCount={concepts.length}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Container>
      </div>

      <ConceptSpotlightSearch concepts={concepts} />
    </>
  );
}

/* ── Hero: full-screen, matching lessons page ── */
function HeroSection() {
  const { userRole } = useAuth();
  const canSuggestConcept = userRole === "LEARNER" || userRole === "CONTRIBUTOR";

  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Core Concepts
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Build your{" "}
              <span className="text-[var(--color-primary)]">Foundations</span>
            </Title>

            <Text size="lg" className="max-w-xl font-light leading-relaxed">
              Explore the fundamental ideas and principles that lessons are built upon.
              Strengthen your understanding and gain mastery of the building blocks of knowledge.
            </Text>
          </Stack>

          <div className="flex flex-col items-end gap-3">
            <GradientButton href="#concepts-list" className="!w-[320px] justify-center">
              Browse Concepts
            </GradientButton>
            {canSuggestConcept && (
              <GradientButton href="/concepts/suggest" className="!w-[320px] justify-center">
                Suggest a Concept
              </GradientButton>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

/* ── Grid section with header + cards + pagination ── */
function ConceptsGrid({
  concepts,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
}: {
  concepts: Concept[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <Stack gap="lg">
      <ConceptsHeader count={totalCount} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {concepts.map((concept) => (
          <ConceptCard key={concept.publicId} {...concept} />
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={onPageChange}
        />
      )}
    </Stack>
  );
}

/* ── Header row: count label + search trigger (same as lessons) ── */
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

/* ── Empty state ── */
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
