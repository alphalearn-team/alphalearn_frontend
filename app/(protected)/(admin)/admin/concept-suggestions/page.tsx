import { apiFetch } from "@/lib/api";
import { Badge, Card, Stack, Table, Text, Title } from "@mantine/core";
import { Suspense } from "react";
import CardSkeleton from "@/components/common/cardSkeleton";
import AdminBreadcrumb from "@/components/admin/breadcrumb";
import AdminPageHeader from "@/components/admin/pageHeader";
import { formatDateTime } from "@/lib/formatDate";
import type { AdminConceptSuggestionQueueItem } from "@/interfaces/interfaces";

function getStatusColor(status: AdminConceptSuggestionQueueItem["status"]) {
  switch (status) {
    case "SUBMITTED":
      return "blue";
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    case "DRAFT":
    default:
      return "gray";
  }
}

async function ConceptSuggestionsQueue() {
  const suggestions = await apiFetch<AdminConceptSuggestionQueueItem[]>("/admin/concept-suggestions");

  if (suggestions.length === 0) {
    return (
      <Card className="admin-card">
        <Stack gap="sm" align="flex-start">
          <Title order={3}>No concept suggestions awaiting review</Title>
          <Text className="text-[var(--color-text-secondary)]">
            Submitted suggestions will appear here once learners send them for admin review.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className="admin-card overflow-hidden">
      <Table className="admin-table" highlightOnHover>
        <colgroup>
          <col style={{ width: "46%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Title</th>
            <th>Owner</th>
            <th>Submitted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((suggestion) => (
            <tr key={suggestion.publicId}>
              <td>
                <div className="space-y-1">
                  <Text fw={700} className="text-[var(--color-text)]">
                    {suggestion.title}
                  </Text>
                  <Text
                    size="sm"
                    className="line-clamp-2 max-w-3xl text-[var(--color-text-secondary)]"
                  >
                    {suggestion.description}
                  </Text>
                </div>
              </td>
              <td>
                <Text fw={600} className="text-[var(--color-text)]">
                  {suggestion.ownerUsername}
                </Text>
              </td>
              <td>
                <Text className="whitespace-nowrap text-[var(--color-text-secondary)]">
                  {formatDateTime(suggestion.submittedAt)}
                </Text>
              </td>
              <td>
                <Badge color={getStatusColor(suggestion.status)} variant="light" radius="xl">
                  {suggestion.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

export default function AdminConceptSuggestionsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />

        <AdminPageHeader
          title="Concept Suggestion Queue"
          description="Review concept suggestions that learners have submitted for admin review"
          icon="fact_check"
        />

        <Suspense
          fallback={
            <Card className="admin-card">
              <CardSkeleton count={6} cols={1} showBookmark={false} lines={2} />
            </Card>
          }
        >
          <ConceptSuggestionsQueue />
        </Suspense>
      </div>
    </div>
  );
}
