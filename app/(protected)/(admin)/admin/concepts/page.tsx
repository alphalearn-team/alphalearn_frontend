import { apiFetch } from "@/lib/api";
import { Card } from "@mantine/core";
import { Suspense } from "react";
import CardSkeleton from "@/components/common/CardSkeleton";
import ConceptsManagementTable from "./_components/ConceptsManagementTable";
import GlowIconButton from "@/components/common/GlowIconButton";
import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import AdminPageHeader from "@/components/admin/PageHeader";
import type { AdminConcept } from "@/interfaces/interfaces";

async function ConceptsData() {
    const concepts = await apiFetch<AdminConcept[]>("/admin/concepts");
    // const concepts: AdminConcept[] = []; //test no concepts
    return <ConceptsManagementTable concepts={concepts} />;
}

export default function ManageConceptsPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AdminBreadcrumb />

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

                <Suspense
                    fallback={
                        <div>
                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i} className="admin-card">
                                        <CardSkeleton count={1} cols={1} showBookmark={false} lines={1} />
                                    </Card>
                                ))}
                            </div>
                            {/* Table Skeleton */}
                            <Card className="admin-card">
                                <CardSkeleton count={6} cols={1} showBookmark={false} lines={2} />
                            </Card>
                        </div>
                    }
                >
                    <ConceptsData />
                </Suspense>
            </div>
        </div>
    );
}
