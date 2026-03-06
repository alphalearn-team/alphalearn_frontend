import { apiFetch } from "@/lib/api";
import { Card } from "@mantine/core";
import { Suspense } from "react";
import CardSkeleton from "@/components/common/CardSkeleton";
import UsersManagementTable from "./usersTable";
import AdminBreadcrumb from "@/components/admin/Breadcrumb";
import AdminPageHeader from "@/components/admin/PageHeader";
import type { AdminContributor, AdminLearner, AdminUser } from "@/interfaces/interfaces";

async function UsersData() {
    // Fetch all users (learners) and contributor metadata
    const [learners, contributors] = await Promise.all([
        apiFetch<AdminLearner[]>("/admin/learners"),
        apiFetch<AdminContributor[]>("/admin/contributors")
    ]);

    // Create a map of contributor public IDs for quick lookup
    const contributorMap = new Map(
        contributors.map(c => [c.publicId, c])
    );

    // Merge: Check if each learner is also a contributor
    const users: AdminUser[] = learners.map(learner => {
        const contributorData = contributorMap.get(learner.publicId);

        if (contributorData) {
            // Check if contributor is currently active (not demoted)
            const isActiveContributor = contributorData.demotedAt === null;

            return {
                publicId: learner.publicId,
                username: learner.username,
                role: isActiveContributor ? "CONTRIBUTOR" as const : "LEARNER" as const,
                promotedAt: contributorData.promotedAt,
                demotedAt: contributorData.demotedAt
            };
        } else {
            // Regular learner (never been promoted)
            return {
                publicId: learner.publicId,
                username: learner.username,
                role: "LEARNER" as const
            };
        }
    });

    return <UsersManagementTable users={users} />;
}

export default function ManageUsersPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AdminBreadcrumb />

                <AdminPageHeader
                    title="Manage Users"
                    description="View and manage all contributors and learners"
                    icon="group"
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
                    <UsersData />
                </Suspense>
            </div>
        </div>
    );
}
