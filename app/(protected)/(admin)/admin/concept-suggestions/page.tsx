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
      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Owner</Table.Th>
            <Table.Th>Submitted</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {suggestions.map((suggestion) => (
            <Table.Tr key={suggestion.publicId}>
              <Table.Td>
                <div className="space-y-1">
                  <Text fw={600}>{suggestion.title}</Text>
                  <Text size="sm" className="text-[var(--color-text-secondary)]">
                    {suggestion.description}
                  </Text>
                </div>
              </Table.Td>
              <Table.Td>{suggestion.ownerUsername}</Table.Td>
              <Table.Td>{formatDateTime(suggestion.submittedAt)}</Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(suggestion.status)} variant="light" radius="xl">
                  {suggestion.status}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
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
