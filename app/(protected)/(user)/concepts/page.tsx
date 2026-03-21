import { Suspense } from "react";
import { Container } from "@mantine/core";
import { apiFetch } from "@/lib/api";
import ConceptsHeroSection from "./_components/ConceptsHeroSection";
import ConceptsGrid from "./_components/ConceptsGrid";
import ConceptsSkeleton from "./_components/ConceptsSkeleton";
import type { Concept } from "@/interfaces/interfaces";

// Suspense Data Fetching Wrapper
async function ConceptsListRenderer() {
  const concepts: Concept[] = await apiFetch<Concept[]>("/concepts");
  return <ConceptsGrid concepts={concepts} />;
}

export default function ConceptsPage() {
  return (
    <>
      <ConceptsHeroSection />
      <Container
        id="concepts-list"
        size="lg"
        className="py-14 pb-32 scroll-mt-24"
      >
        <Suspense fallback={<ConceptsSkeleton />}>
          <ConceptsListRenderer />
        </Suspense>
      </Container>
    </>
  );
}
