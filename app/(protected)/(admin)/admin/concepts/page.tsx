import { Suspense } from "react";
import AdminPageHeader from "@/app/(protected)/(admin)/admin/_components/PageHeader";
import GlowIconButton from "@/components/GlowIconButton";
import ConceptsManagementTable from "./_components/ConceptsManagementTable";
import ConceptsManagementFallback from "./_components/ConceptsManagementFallback";
import { fetchAdminConcepts } from "./conceptsData";

async function ConceptsData() {
  const concepts = await fetchAdminConcepts();
  return <ConceptsManagementTable concepts={concepts} />;
}

export default function ManageConceptsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <AdminPageHeader
          title="Manage Concepts"
          description="Review and manage all concepts"
          icon="library_books"
          action={
            <GlowIconButton
              href="/admin/concepts/add"
              icon="add_circle"
              ariaLabel="Add new concept"
              size="md"
            />
          }
        />

        <Suspense fallback={<ConceptsManagementFallback />}>
          <ConceptsData />
        </Suspense>
      </div>
    </div>
  );
}
