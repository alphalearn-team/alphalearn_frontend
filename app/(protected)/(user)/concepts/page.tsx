import ConceptsPage from "./_components/ConceptsPage";
import type { Concept } from "@/interfaces/interfaces";
import { Suspense } from "react";
import ConceptsSkeleton from "./_components/ConceptsSkeleton";
import { apiFetch } from "@/lib/api";

async function ConceptsData() {

  const concepts: Concept[] = await apiFetch<Concept[]>("/concepts");

  return <ConceptsPage concepts={concepts} />;
}

export default async function ConceptsPageRoute() {
  return (
    <Suspense fallback={<ConceptsSkeleton />}>
      <ConceptsData />
    </Suspense>
  );
}
